import TheService from './_service';
import { execSync } from 'child_process';
import { spawn } from 'child_process';
import ConsoleService from './ConsoleService';

import readline from 'readline';

const { color } = ConsoleService;

interface IExecCmdOpts {
  verbose?: boolean
  _default: any | null
}

// interface PM2CommandParams {
//   script: string
//   name: string // Generate a unique name for each command
//   args: string[]
//   cwd: string
//   interpreter?: string
//   exec_mode: string
//   instances: number
//   max_memory_restart: string
//   autorestart?: boolean
//   env: {
//     [key: string]: string
//   }
// }

type InterpreterType = 'node' | 'none';

interface ICommandOpts {
  exec_mode?: string
  index?: number,
  cwd?: string,
  interpreter?: InterpreterType
  env: {
    [key: string]: string
  }
}

// interface PM2LogPacket {
//   process: {
//     name: string;
//     pm_id: number;
//     [key: string]: any; // Additional fields
//   };
//   data: string;
//   at: Date;
//   [key: string]: any; // Additional fields
// }

// const totalMemoryBytes = os.totalmem();
// const totalMemoryKB = totalMemoryBytes / 1024;
// const totalMemoryMB = totalMemoryKB / 1024;
// const totalMemoryGB = totalMemoryMB / 1024;


class ProcessService extends TheService {

    getParentPID(pid: number): number {
        const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
        return parseInt(execSync(command).toString().trim(), 10);
    }

    getAllProcessesIds(): number[] {
        const startingPID = process.pid;

        return [startingPID, this.getParentPID(startingPID)];
    }

    async runShellCommand(command: string, cwd: string = null,silent: boolean = false): Promise<void> {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
      
            if(!cwd){
                cwd = process.cwd();
            }

            const spawned = spawn(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });

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

    async getInput(prompt: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(color().red('[RWS CLI Input Prompt] ' + prompt), (answer) => {
                resolve(answer);
                rl.close();
            });
        });
    }
}

export default ProcessService.getSingleton();

export { IExecCmdOpts, ICommandOpts };