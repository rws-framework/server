import TheService from "./_service";
declare class MD5Service extends TheService {
    calculateFileMD5(filePath: string): Promise<string>;
    generateCliHashes(fileNames: string[]): Promise<string[]>;
    cliClientHasChanged(consoleClientHashFile: string, tsFilename: string): Promise<boolean>;
    batchGenerateCommandFileMD5(moduleCfgDir: string): string[];
}
declare const _default: MD5Service;
export default _default;
