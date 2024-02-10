import TheService from "./_service";
import ConsoleService from "./ConsoleService";

import path from 'path';
import fs from 'fs';

import { BlobWriter, TextReader, ZipWriter } from '@zip.js/zip.js';import { Error500 } from "../errors";

const { log, warn, error, color } = ConsoleService;

interface IZipParams {
    recursive?: boolean
    format?: string
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
        const writer = new BlobWriter();
        const zipWriter = new ZipWriter(writer);

        // Add files to zip here
        await zipWriter.add('hello.txt', new TextReader('Hello World!'));
        await zipWriter.close();

        // Handle the zipped content, for example, save it
        const blob = await writer.getData();

        log(`${color().green('[RWS Lambda Service]')} ZIP params:`);
        log(params);
    
        try {
            return outputPath;
        } catch(e: Error | any){
            throw new Error500('ZIP process error');
        }
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