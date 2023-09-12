import TheService from "./_service";
import crypto from 'crypto';

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";


import path from 'path';
import fs from 'fs';
import TraversalService from "./TraversalService";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;


class MD5Service extends TheService {
    async calculateFileMD5(filePath: string): Promise<string> 
    {
    

        return new Promise((resolve, reject) => {
            const hash = crypto.createHash('md5');
            const input = fs.createReadStream(filePath);

            input.on('readable', () => {
                const data = input.read();
                if (data) {
                    hash.update(data);
                } else {
                    resolve(hash.digest('hex'));
                }
            });

            input.on('error', reject);
        });
    }

    async generateCliHashes(fileNames: string[]) : Promise<string[]>
    {
        const md5Pack: string[] = [];

        for (const key in fileNames) {
            const fileName: string = fileNames[key];          
            const md5 = await this.calculateFileMD5(fileName);
            log(color().green('[RWS]') + ' Checking hashes for file:', fileName, md5);
            md5Pack.push(md5);
        }

        return md5Pack;
    }

    async cliClientHasChanged(consoleClientHashFile: string, tsFilename: string): Promise<boolean> 
    {
        const generatedHash: string = fs.readFileSync(consoleClientHashFile, 'utf-8');

        log(color().green('[RWS]') + ' Comparing filesystem MD5 hashes to:', generatedHash);
   
        const cmdFiles = this.batchGenerateCommandFileMD5(path.resolve(process.cwd(), 'node_modules', '.rws'));

        const currentSumHashes: string = (await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/');            

        if (generatedHash !== currentSumHashes) {
            return true;
        }

        return false;
    }

    batchGenerateCommandFileMD5(moduleCfgDir: string): string[] 
    {
        if (!fs.existsSync(moduleCfgDir)) {
            fs.mkdirSync(moduleCfgDir);
        }

        if (!fs.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)) {
            return [];
        }        

        const cmdDirPath = fs.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8');
    
        return TraversalService.getAllFilesInFolder(path.resolve(process.cwd()) + '/' + cmdDirPath, [
            process.cwd() + '/' + cmdDirPath + '/index.ts'
        ]);;
    }
}

export default MD5Service.getSingleton();