import TheService from "./_service";
interface IExecCmdOpts {
    verbose?: boolean;
    _default: any | null;
}
type InterpreterType = 'node' | 'none';
interface ICommandOpts {
    exec_mode?: string;
    index?: number;
    interpreter?: InterpreterType;
    env: {
        [key: string]: string;
    };
}
declare class ProcessService extends TheService {
    getParentPID(pid: number): number;
    getAllProcessesIds(): number[];
    private generatePM2Name;
    PM2ExecCommand(command: string, commandOpts?: {
        options?: ICommandOpts;
        args?: string[];
    }): Promise<string>;
    isProcessDead(processName: string, _interval?: number): Promise<boolean>;
    private _PM2KillSelf;
    PM2RunCommandsInParallel(commands: string[]): Promise<void>;
    killProcess(scriptPath: string): Promise<void>;
    killRWS(): Promise<void>;
    runShellCommand(command: string): Promise<void>;
    sleep(ms: number): Promise<void>;
}
declare const _default_1: ProcessService;
export default _default_1;
export { IExecCmdOpts };
