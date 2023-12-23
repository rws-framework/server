import TheService from "./_service";
declare class UtilsService extends TheService {
    filterNonEmpty<T>(arr: T[]): T[];
    isInterface<T>(func: any): func is T;
    getRWSVar(fileName: string): string | null;
    setRWSVar(fileName: string, value: string): void;
    findRootWorkspacePath(currentPath: string): string;
}
declare const _default: UtilsService;
export default _default;
