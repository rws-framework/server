import TheService from "./_service";
import { execSync } from 'child_process';
import { exec, spawn } from 'child_process';
import ConsoleService from "./ConsoleService";
import pm2 from 'pm2';
import fs from 'fs';
import path from 'path';
import os from 'os';
import UtilsService from "./UtilsService";

const { log, warn, error, color } = ConsoleService;

interface IExecCmdOpts {
  verbose?: boolean
  _default: any | null
}

interface PM2CommandParams {
  script: string
  name: string // Generate a unique name for each command
  args: string[]
  cwd: string
  interpreter?: string
  exec_mode: string
  instances: number
  max_memory_restart: string
  autorestart?: boolean
  env: {
    [key: string]: string
  }
}

type InterpreterType = 'node' | 'none';

interface ICommandOpts {
  exec_mode?: string
  index?: number,
  interpreter?: InterpreterType
  env: {
    [key: string]: string
  }
}

interface PM2LogPacket {
  process: {
    name: string;
    pm_id: number;
    [key: string]: any; // Additional fields
  };
  data: string;
  at: Date;
  [key: string]: any; // Additional fields
}

const totalMemoryBytes = os.totalmem();
const totalMemoryKB = totalMemoryBytes / 1024;
const totalMemoryMB = totalMemoryKB / 1024;
const totalMemoryGB = totalMemoryMB / 1024;


class ProcessService extends TheService {

  getParentPID(pid: number): number {
    const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
    return parseInt(execSync(command).toString().trim(), 10);
  }

  getAllProcessesIds(): number[] {
    const startingPID = process.pid;

    return [startingPID, this.getParentPID(startingPID)];
  }

  private generatePM2Name(filePath: string) {
    return 'RWS:' + path.basename(filePath);
  }    

  async PM2ExecCommand(command: string, commandOpts?: { options?: ICommandOpts, args?: string[] }): Promise<string> {

    let theOpts: ICommandOpts = {
      index: 0,
      interpreter: 'none',
      exec_mode: 'fork',      
      env: {
        FORCE_COLOR: '1'
      }
    }

    if (commandOpts?.options) {
      theOpts = Object.assign(theOpts, commandOpts.options);
    }

    const { index, exec_mode } = theOpts;

    const _self = this;

    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error(err);
          reject(err);
          _self._PM2KillSelf();
        }

        const totalMemoryBytes = os.totalmem();
        const totalMemoryGB = totalMemoryBytes / (1024 * 1024 * 1024);

        let cmd;
        let args;        

        if (commandOpts?.args) {
          cmd = command;
          args = UtilsService.filterNonEmpty(commandOpts.args);
        } else {
          [cmd, ...args] = UtilsService.filterNonEmpty(command.split(' '));
        }

        if(cmd.indexOf('.js') > -1){
          theOpts.interpreter = 'node';
        }

        let envVars = {
          FORCE_COLOR: '1'
        }

        const processName = `RWS:Command_${index}_${command.replace('.', '_')}`;

        const proc: PM2CommandParams = {
          script: cmd,
          name: processName,
          args: args,
          cwd: process.cwd(),
          interpreter: theOpts.interpreter,
          autorestart: false,
          exec_mode: exec_mode,
          instances: 1,
          max_memory_restart: `${Math.round(totalMemoryGB * 0.75)}G`, 
          env: envVars 
        };

        pm2.start(proc, (err) => {          
          if (err) {
            console.error(err);            
            reject(err);
            _self._PM2KillSelf();
          }

          pm2.launchBus((err, bus) => {
            bus.on('log:out', function (packet: PM2LogPacket) {
              if (packet.process.name === processName) {
                console.log(packet.data);
              }
            });

            bus.on('log:err', function (packet: PM2LogPacket) {
              if (packet.process.name === processName) {      
                console.error(packet.data);                          
              }
            });

            bus.on('log:warn', function (packet: PM2LogPacket) {
              if (packet.process.name === processName) {      
                warn(packet.data);                          
              }
            });
          });

          _self.isProcessDead(processName).then((isDead: boolean) => {
            if (isDead) {
              resolve(processName);
            }
          }).catch((e) => {
            reject(e);
            // _self._PM2KillSelf();
          });
        });
      });
    });
  }

  async isProcessDead(processName: string, _interval = 800): Promise<boolean> {
    const _self = this;

    return new Promise((resolve, reject) => {
      const interval = setInterval(() => {
        pm2.describe(processName, (err, processDescription) => {
          if (err) {
            console.error(err);
            clearInterval(interval);
            reject(err);
            _self._PM2KillSelf();
            return;
          }

          const procInfo = processDescription[0];
          if (procInfo && procInfo.pm2_env && procInfo.pm2_env.status === 'stopped') {
            clearInterval(interval);
            resolve(true);
            pm2.disconnect();
          }
        });
      }, _interval);
    });
  }

  private _PM2KillSelf(): void {
    error(`[RWS PM2] R.I.P. ERROR: because of your bad programming pm2 killed itself...`);
    pm2.disconnect();
    process.exit(2);
  }

  async PM2RunCommandsInParallel(commands: string[]): Promise<void> {
    const _self = this;

    return new Promise(async (resolve, reject) => {
      try {
        const startPromises = commands.map((command) => _self.PM2ExecCommand(command));
        await Promise.all(startPromises);
        resolve();
      } catch (err) {
        console.error(err);
        reject(err);
        process.exit(2);
      }
    });
  }

  async killProcess(scriptPath: string): Promise<void> {
    const _self = this;
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error(err);
          reject(err);
          process.exit(2);
        }

        pm2.delete(_self.generatePM2Name(scriptPath), (err) => {
          if (err) {
            console.error(err);
            reject(err);
            process.exit(2);
          }
          resolve();
        });
      });
    });
  }

  async killRWS(): Promise<void> {
    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error(err);
          reject(err);
          process.exit(2);
        }

        pm2.list((err, processDescriptionList) => {
          if (err) {
            console.error(err);
            reject(err);
            process.exit(2);
          }

          const targetProcesses = processDescriptionList.filter((proc) =>
            proc.name.startsWith("RWS:")
          );

          const deletePromises = targetProcesses.map((proc) =>
            new Promise<void>((res, rej) => {
              pm2.delete(proc.name, (err) => {
                if (err) {
                  console.error(err);
                  rej(err);
                }
                res();
              });
            })
          );

          Promise.all(deletePromises)
            .then(() => resolve())
            .catch((err) => {
              console.error(err);
              reject(err);
              process.exit(2);
            });
        });
      });
    });
  }

  async runShellCommand(command: string, silent: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      
      const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit' });

      spawned.on('exit', (code) => {
        if (code !== 0) {
          return reject(new Error(`Command failed with exit code ${code}`));
        }
        resolve();
      });

      spawned.on('error', (error) => {
        reject(error);
      });
    });
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ProcessService.getSingleton();

export { IExecCmdOpts }