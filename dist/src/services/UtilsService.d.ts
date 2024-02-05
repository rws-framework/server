import TheService from "./_service";
declare class UtilsService extends TheService {
    private _startTime;
    startExecTimeRecord(): void;
    endExecTimeRecord(): number;
    filterNonEmpty<T>(arr: T[]): T[];
    isInterface<T>(func: any): func is T;
    getRWSVar(fileName: string): string | null;
    setRWSVar(fileName: string, value: string): void;
    findRootWorkspacePath(currentPath: string): string;
    getCurrentLineNumber(error?: Error): Promise<number>;
}
declare const _default: UtilsService;
export default _default;
