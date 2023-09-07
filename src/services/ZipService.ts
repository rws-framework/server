import TheService from "./_service";
import ConsoleService from "./ConsoleService";

import path from 'path';
import fs from 'fs';
import archiver, {Format as ArchiveFormat} from 'archiver';


const { log, warn, error, color, AWSProgressBar } = ConsoleService;

interface IZipParams {
    recursive?: boolean
    format?: ArchiveFormat
    destpath?: string;
    ignore?: string[]
}

const defaultZipParams: IZipParams = {
    recursive: true,
    format: 'zip',
    ignore: []
}

class ZipService extends TheService {

    constructor() {
        super();        
    }   

    async createArchive(outputPath: string, sourcePath: string, params: IZipParams = null): Promise<string> {
        if (params){
            params = Object.assign(defaultZipParams, params);
        }else{
            params = defaultZipParams;
        }

        const archive = archiver(params.format);
        const output = fs.createWriteStream(outputPath);
        archive.pipe(output);      
    
        // archive.directory(sourcePath, params.recursive ? false : params.destpath);

        archive.glob('**/*', {
            cwd: sourcePath,
            dot: true, //include .dotpaths
            ignore: params.ignore
        });

        log(`${color().green('[RWS Lambda Service]')} ZIP params:`);
        log(params);
    
        return new Promise((resolve, reject) => {
            archive.on('error', reject);
            output.on('close', () => {
                log(`Files in archive: ${archive.pointer()} bytes`);
                resolve(outputPath);
            });
            output.on('error', reject);
            archive.finalize();
        });
    }    

    listFilesInDirectory(directoryPath: string): string[] {
        const files = fs.readdirSync(directoryPath);

        const filePaths: string[] = [];
    
        files.forEach(file => {
            const fullPath = path.join(directoryPath, file);
            const stats = fs.statSync(fullPath);
    
            if (stats.isFile()) {
                filePaths.push(fullPath);
            }
        });

        return filePaths;
    }
}

export default ZipService.getSingleton();
export { IZipParams }