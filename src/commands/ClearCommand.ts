import Command, { ICmdParams } from './_command';
import { rmdir } from 'fs/promises';
import {ConsoleService} from '../services/ConsoleService';
import {UtilsService} from '../services/UtilsService';
import path from 'path';

const executionDir = process.cwd();

class ClearCommand extends Command 
{
    packageRootDir: string;
    moduleCfgDir: string;

    constructor(private utilsService: UtilsService, private consoleService: ConsoleService){
        super('clear', module);

        this.packageRootDir = this.utilsService.findRootWorkspacePath(executionDir);
        this.moduleCfgDir = `${this.packageRootDir}/node_modules/.rws`;    
    }

    async removeDirRecursively(path: string) {
        try {
            await rmdir(path, { recursive: true });
            console.log(`Directory at ${path} removed successfully`);
        } catch (error) {
            console.error(`Error while removing directory: ${error}`);
        }
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        this.consoleService.log('clearing systems...');              
    
        await this.removeDirRecursively(this.moduleCfgDir);

        this.consoleService.log(this.consoleService.color().green('[RWS]') + ' systems cleared. Use npx rws init to reinitialize.');              
    }

    
}

export default ClearCommand.createCommand();
