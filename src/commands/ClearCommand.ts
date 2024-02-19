import Command, { ICmdParams } from './_command';
import ConsoleService from '../services/ConsoleService';

import { rmdir } from 'fs/promises';
import UtilsService from '../services/UtilsService';
const { color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = UtilsService.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;

class ClearCommand extends Command 
{
    constructor(){
        super('clear', module);
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
        ConsoleService.log('clearing systems...');              
    
        await this.removeDirRecursively(moduleCfgDir);

        ConsoleService.log(color().green('[RWS]') + ' systems cleared. Use npx rws init to reinitialize.');              
    }

    
}

export default ClearCommand.createCommand();
