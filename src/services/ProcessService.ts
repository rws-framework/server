import { execSync } from 'child_process';
import {ConsoleService} from './ConsoleService';
import { Injectable } from '../../nest';  
import readline from 'readline';
import { rwsShell } from '@rws-framework/console';

interface IExecCmdOpts {
  verbose?: boolean
  _default: any | null
}

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

@Injectable()
class ProcessService {

    constructor(private consoleService: ConsoleService){}

    getParentPID(pid: number): number {
        const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
        return parseInt(execSync(command).toString().trim(), 10);
    }

    getAllProcessesIds(): number[] {
        const startingPID = process.pid;

        return [startingPID, this.getParentPID(startingPID)];
    }

    runShellCommand: (command: string, cwd?: string | null, silent?: boolean) => Promise<void> = rwsShell.runCommand;
    static runShellCommand: (command: string, cwd?: string | null, silent?: boolean) => Promise<void> = rwsShell.runCommand;

    sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async getInput(prompt: string): Promise<string> {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            rl.question(this.consoleService.color().red('[RWS CLI Input Prompt] ' + prompt), (answer) => {
                resolve(answer);
                rl.close();
            });
        });
    }
}

export { IExecCmdOpts, ICommandOpts, ProcessService };