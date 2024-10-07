import TheService from './_service';
import crypto from 'crypto';


import path from 'path';
import fs from 'fs';
import TraversalService from './TraversalService';
import UtilsService from './UtilsService';
import { rwsPath } from '@rws-framework/console';

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

    async generateCliHashes(fileNames: string[]): Promise<string[]>
    {
        const md5Pack: string[] = [];

        for (const key in fileNames) {
            const fileName: string = fileNames[key];          
            const md5 = await this.calculateFileMD5(fileName);        
            md5Pack.push(md5);
        }

        return md5Pack;
    }

    async cliClientHasChanged(consoleClientHashFile: string, tsFilename: string): Promise<boolean> 
    {
        const moduleCfgDir = path.resolve(rwsPath.findRootWorkspacePath(process.cwd()), 'node_modules', '.rws');
        const generatedHash: string = fs.readFileSync(consoleClientHashFile, 'utf-8');
           

        const cmdFiles = this.batchGenerateCommandFileMD5(moduleCfgDir);    
        const currentSumHashes = this.md5((await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/'));        

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

        if (!fs.existsSync(`${moduleCfgDir}/_rws_installed`) || !fs.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)) {            
            return [];
        }        

        const cmdDirPaths: string[] = fs.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8').split('\n');        
        let cmdFilesList: { [key: string]: string } = {};                  

        cmdDirPaths.forEach((dirPath) => {            
            const cmdFiles = TraversalService.getAllFilesInFolder(dirPath, [
                /.*\/index\.ts/g,
                /.*\/_command\.ts/g
            ]);

            cmdFiles.forEach((cmdFile: string) => {
                const fileNameSplit: string[] = cmdFile.split('/');
                const fileName: string = fileNameSplit[fileNameSplit.length - 1];                
                if(!Object.keys(cmdFilesList).includes(fileName)){
                    cmdFilesList[fileName] = cmdFile;
                }
            });
        });    
        
        return Object.keys(cmdFilesList).map((key) => cmdFilesList[key]);
    }

    md5(input: string): string
    {
        return crypto.createHash('md5').update(input).digest('hex');
    }
}

export default MD5Service.getSingleton();
export {MD5Service};