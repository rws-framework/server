import TheService from "./_service";
import { execSync } from 'child_process';
import { exec, spawn } from 'child_process';
import ConsoleService from "./ConsoleService";
import pm2 from 'pm2';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import os from 'os';

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
  interpreter: string 
  exec_mode: string
  instances: number
  max_memory_restart: string
  autorestart?: boolean
  env: {
    [key: string]: string
  }
}

interface ICommandOpts {
  exec_mode?: string
  index?: number 
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

class ProcessService extends TheService
{
  getParentPID(pid: number): number
  {
      const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
      return parseInt(execSync(command).toString().trim(), 10);
  }

  getAllProcessesIds(): number[]
  {
      const startingPID = process.pid;                

      return [startingPID, this.getParentPID(startingPID)];
  }       
  
  async calculateFileMD5(filePath: string): Promise<string> 
  {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('md5');
      const input = fs.createReadStream(filePath);
  
      input.on('readable', () => {
        const data = input.read();
        if (data) {
          hash.update(data);
        } else {
          resolve(hash.digest('hex'));
        }
      });
  
      input.on('error', reject);
    });
  }

  async generateCliHashes(fileNames: string[])
  {      
      const md5Pack: string[] = [];        

      for(const key in fileNames){
        const fileName = fileNames[key];
        const md5 = await this.calculateFileMD5(fileName);
        log(color().green('[RWS]') + ' Checking hashes for file:', fileName, md5);
        md5Pack.push(md5);
      }        

      return md5Pack;
  }

  async cliClientHasChanged(consoleClientHashFile: string, tsFilename: string): Promise<boolean>
  {    
      const generatedHash: string = fs.readFileSync(consoleClientHashFile, 'utf-8');                    

      log(color().green('[RWS]') + ' Comparing filesystem MD5 hashes to:', generatedHash);

      const cmdFiles = this.batchGenerateCommandFileMD5(path.resolve(process.cwd(), 'node_modules', '.rws'));       
      const currentSumHashes = (await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/');      

      if(generatedHash !== currentSumHashes){
          return true;
      }

      return false;
  }

  getAllFilesInFolder(folderPath: string, ignoreFilenames: string[] = [], recursive: boolean = false): string[] 
  {
    const files: string[] = [];
  
    function traverseDirectory(currentPath: string): void 
    {
      const entries = fs.readdirSync(currentPath, { withFileTypes: true });
  
      entries.forEach(entry => {
        const entryPath = path.join(currentPath, entry.name);
  
        if (entry.isFile()) {
          if(!ignoreFilenames.includes(entryPath)){
            files.push(entryPath);
          }            
        } else if (entry.isDirectory() && recursive) {
          traverseDirectory(entryPath);
        }
      });
    }
  
    traverseDirectory(folderPath);

    return files;
  }

  batchGenerateCommandFileMD5(moduleCfgDir: string): string[]
  {
      if(!fs.existsSync(moduleCfgDir)){
        fs.mkdirSync(moduleCfgDir);
      }

      if(!fs.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)){
        return [];
      }

      const cmdDirPath = fs.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8'); 
      return this.getAllFilesInFolder(path.resolve(process.cwd()) + '/' + cmdDirPath, [
        process.cwd() + '/' + cmdDirPath + '/index.ts'
      ]);
  }

  private generatePM2Name(filePath: string)
  {
    return 'RWS:' + path.basename(filePath);
  }  

  async PM2RunScript(scriptPath: string, commandOpts: ICommandOpts | null = null, ...args: string[]): Promise<string>
  {
    let theOpts: ICommandOpts = {
      index: 0,
      exec_mode: 'fork'
    }

    if(commandOpts){
      theOpts = Object.assign(theOpts, commandOpts);
    }

    const {index, exec_mode} = theOpts;

    const _self = this;
    return new Promise((resolve, reject) => {
        pm2.connect((err) => {
            if (err) {
              console.error(err);
              reject(err);

              process.exit(2)
            }

            const processName = _self.generatePM2Name(scriptPath);
          
            pm2.start({
                script: scriptPath,                
                name: processName,
                args: args,
                cwd: process.cwd(),
                exec_mode: exec_mode,
                autorestart: false,
                instances: 1,
                max_memory_restart: `${Math.round(totalMemoryGB * 0.75)}G`,
                env: {
                  'FORCE_COLOR': '1'  // Force colorized output
                } 
            }, function(err, apps) {
              if (err) {
                console.error(err)
                return pm2.disconnect()
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
              });

              const interval = setInterval(() => {
                pm2.describe(processName, (err, processDescription) => {
                  if (err) {
                    console.error(err);
                    clearInterval(interval);
                    reject(err);
                    pm2.disconnect();
                    return;
                  }
      
                  const procInfo = processDescription[0];
                  if (procInfo && procInfo.pm2_env && procInfo.pm2_env.status === 'stopped') {
                    clearInterval(interval);
                    resolve(processName);
                    pm2.disconnect();
                  }
                });
              }, 1000);              
            })
        })
    });
  }

  async PM2ExecCommand(command: string, commandOpts: ICommandOpts | null = null): Promise<string> {

    let theOpts: ICommandOpts = {
      index: 0,
      exec_mode: 'fork'
    }

    if(commandOpts){
      theOpts = Object.assign(theOpts, commandOpts);
    }

    const {index, exec_mode} = theOpts;

    return new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          console.error(err);
          reject(err);
          process.exit(2);
        }
  
        const totalMemoryBytes = os.totalmem();
        const totalMemoryGB = totalMemoryBytes / (1024 * 1024 * 1024);
        const [cmd, ...args] = command.split(' ');

        const processName = `RWS:Command_${index}_${command.replace('.','_')}`;

        const proc: PM2CommandParams = {
          script: cmd,
          name: processName,
          args: args,
          cwd: process.cwd(),
          interpreter: 'none',
          autorestart: false,
          exec_mode: exec_mode,
          instances: 1,
          max_memory_restart: `${Math.round(totalMemoryGB * 0.75)}G`,
          env: {
            'FORCE_COLOR': '1'  // Force colorized output
          }
        };
  
        pm2.start(proc, (err) => {
          if (err) {
            console.error(err);
            reject(err);
            process.exit(2);
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
          });
          
          const interval = setInterval(() => {
            pm2.describe(processName, (err, processDescription) => {
              if (err) {
                console.error(err);
                clearInterval(interval);
                reject(err);
                pm2.disconnect();
                return;
              }
  
              const procInfo = processDescription[0];
              if (procInfo && procInfo.pm2_env && procInfo.pm2_env.status === 'stopped') {
                clearInterval(interval);
                resolve(processName);
                pm2.disconnect();
              }
            });
          }, 1000);
        });
      });
    });
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

  async runShellCommand(command: string): Promise<void> 
  {
    return new Promise((resolve, reject) => {
      const [cmd, ...args] = command.split(' ');
      const spawned = spawn(cmd, args, { stdio: 'inherit' });  // stdio: 'inherit' allows you to see real-time output

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

  setRWSVar(fileName: string, value: string)
  {
    const executionDir = process.cwd();    
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;

    fs.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
  }

  getRWSVar(fileName: string): string | null
  {
    const executionDir = process.cwd();    
    const moduleCfgDir = `${executionDir}/node_modules/.rws`;

    try{
      return fs.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
    } catch (e: any){
      return null;
    }
  }

  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ProcessService.getSingleton();

export {IExecCmdOpts}