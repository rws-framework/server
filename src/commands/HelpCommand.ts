import Command, { ICmdParams } from './_command';
import { setupRWS, setupPrisma } from '../install';
import {ConsoleService} from '../services/ConsoleService';
import {UtilsService} from '../services/UtilsService';
import path from 'path';
import fs from 'fs';
import CMDListCommand from './CMDListCommand';
import { rwsPath } from '@rws-framework/console';

const executionDir = process.cwd();

class HelpCommand extends Command
{
    packageRootDir: string;
    moduleDir: string;
    public static cmdDescription: string | null = 'List of available rws commands.';

    constructor(private utilsService: UtilsService, private consoleService: ConsoleService){
        super('help');

        this.packageRootDir = this.utilsService.findRootWorkspacePath(executionDir);
        this.moduleDir = path.resolve(path.dirname(module.id), '..', '..');  
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        this.consoleService.rwsLog(this.consoleService.color().green('RWS'), 'RWS CLI help manual\n\n');
        
        await CMDListCommand.execute(params);
    }

    
}

export default HelpCommand.createCommand();
