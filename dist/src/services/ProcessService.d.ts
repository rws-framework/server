import TheService from "./_service";
interface IExecCmdOpts {
    verbose?: boolean;
    _default: any | null;
}
declare class ProcessService extends TheService {
    getParentPID(pid: number): number;
    getAllProcessesIds(): number[];
    runShellCommand(command: string, cwd?: string, silent?: boolean): Promise<void>;
    sleep(ms: number): Promise<void>;
    getInput(prompt: string): Promise<string>;
}
declare const _default_1: ProcessService;
export default _default_1;
export { IExecCmdOpts };
