import TheService from './_service';
import { ConsoleService } from './ConsoleService';
import { Injectable } from '../../nest';  

import path from 'path';
import fs from 'fs';

import { BlobReader, BlobWriter, ZipWriter } from '@zip.js/zip.js';import { Error500 } from '../errors';

interface IZipParams {
    recursive?: boolean
    format?: string
    destpath?: string;
    ignore?: string[]
}

@Injectable()
class ZipService {
    constructor(private consoleService: ConsoleService){}

    async addFileToZip(zipWriter: ZipWriter<Blob>, filePath: string, zipPath: string, params: IZipParams){
        const data = new Uint8Array(fs.readFileSync(filePath));
        const blob = new Blob([data]);
        const reader = new BlobReader(blob);
        await zipWriter.add(zipPath, reader);
    }

    async addDirectoryToZip(zipWriter: ZipWriter<Blob>, dirPath: string, zipPath: string, params: IZipParams){
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const fullPath = path.join(dirPath, item);
            const stat = fs.statSync(fullPath);
            if (stat.isDirectory() && params.recursive) {
                await this.addDirectoryToZip(zipWriter, fullPath, `${zipPath}/${item}`, params);
            } else if (stat.isFile()) {
                await this.addFileToZip(zipWriter, fullPath, `${zipPath}/${item}`, params);
            }
        }
    }

    async createArchive(outputPath: string, sourcePath: string, params: IZipParams = { recursive: true }): Promise<string> {
        const writer = new BlobWriter();
        const zipWriter = new ZipWriter(writer);

        try {
            await this.addDirectoryToZip(zipWriter, sourcePath, outputPath, params);
            await zipWriter.close();
    
            // Assuming you want to save the Blob to a file
            const blob = await writer.getData();
            fs.writeFileSync(outputPath, Buffer.from(await blob.arrayBuffer()));
    
            this.consoleService.log(`${this.consoleService.color().green('[RWS Lambda Service]')} ZIP created at: ${outputPath}`);
            return outputPath;
        } catch (e: Error | any) {
            throw new Error500('ZIP process error: ' + e.message);
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

export { IZipParams, ZipService };