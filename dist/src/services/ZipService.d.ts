import TheService from "./_service";
import { Format as ArchiveFormat } from 'archiver';
interface IZipParams {
    recursive?: boolean;
    format?: ArchiveFormat;
    destpath?: string;
    ignore?: string[];
}
declare class ZipService extends TheService {
    constructor();
    createArchive(outputPath: string, sourcePath: string, params?: IZipParams): Promise<string>;
    listFilesInDirectory(directoryPath: string): string[];
}
declare const _default: ZipService;
export default _default;
export { IZipParams };
