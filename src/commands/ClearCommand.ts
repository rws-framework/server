import Command, { ICmdParams } from './_command';
import ConsoleService from '../services/ConsoleService';

import { rmdir } from 'fs/promises';
import UtilsService from '../services/UtilsService';
import { rwsPath } from '@rws-framework/console';

const { color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = rwsPath.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;

class ClearCommand extends Command 
{
    constructor(){
        super('clear');
    }

    

    async removeDirRecursively(path: string) {
        try {
            await rmdir(path, { recursive: true });
            ConsoleService.log(`Directory at ${path} removed successfully`);
        } catch (error) {
            ConsoleService.error(`Error while removing directory: ${error}`);
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
