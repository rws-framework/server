import TheService from "./_service";
interface IExecCmdOpts {
    verbose?: boolean;
    _default: any | null;
}
interface ICommandOpts {
    exec_mode?: string;
    index?: number;
}
declare class ProcessService extends TheService {
    getParentPID(pid: number): number;
    getAllProcessesIds(): number[];
    calculateFileMD5(filePath: string): Promise<string>;
    generateCliHashes(fileNames: string[]): Promise<string[]>;
    cliClientHasChanged(consoleClientHashFile: string, tsFilename: string): Promise<boolean>;
    getAllFilesInFolder(folderPath: string, ignoreFilenames?: string[], recursive?: boolean): string[];
    batchGenerateCommandFileMD5(moduleCfgDir: string): string[];
    private generatePM2Name;
    PM2RunScript(scriptPath: string, commandOpts?: ICommandOpts | null, ...args: string[]): Promise<string>;
    PM2ExecCommand(command: string, commandOpts?: ICommandOpts | null): Promise<string>;
    PM2RunCommandsInParallel(commands: string[]): Promise<void>;
    killProcess(scriptPath: string): Promise<void>;
    killRWS(): Promise<void>;
    runShellCommand(command: string): Promise<void>;
    setRWSVar(fileName: string, value: string): void;
    getRWSVar(fileName: string): string | null;
    sleep(ms: number): Promise<void>;
}
declare const _default_1: ProcessService;
export default _default_1;
export { IExecCmdOpts };
