import Command, { ICmdParams } from './_command';
import { setupRWS, setupPrisma } from '../install';
import ConsoleService from '../services/ConsoleService';
import UtilsService from '../services/UtilsService';
import path from 'path';
import fs from 'fs';
import CMDListCommand from './CMDListCommand';

const { rwsLog, color, log } = ConsoleService;

const executionDir = process.cwd();
const packageRootDir = UtilsService.findRootWorkspacePath(executionDir);
const moduleDir = path.resolve(path.dirname(module.id), '..', '..');    

class HelpCommand extends Command
{
    public static cmdDescription: string | null = 'List of available rws commands.';

    constructor(){
        super('help', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        rwsLog(color().green('RWS'), 'RWS CLI help manual\n\n');
        
        await CMDListCommand.execute(params);
    }

    
}

export default HelpCommand.createCommand();
