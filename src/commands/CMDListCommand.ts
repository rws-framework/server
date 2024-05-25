import Command, { ICmdParams } from './_command';
import { setupRWS, setupPrisma } from '../install';
import {ConsoleService} from '../services/ConsoleService';
import {UtilsService} from '../services/UtilsService';
import path from 'path';
import fs from 'fs';
import { rwsPath } from '@rws-framework/console';

const executionDir = process.cwd();

class CMDListCommand extends Command 
{
    packageRootDir: string;
    moduleDir: string;
    public static cmdDescription: string | null = 'List of available rws commands.';

    constructor(private utilsService: UtilsService, private consoleService: ConsoleService){
        super('help:cmd:list');
        this.packageRootDir = this.utilsService.findRootWorkspacePath(executionDir);
        this.moduleDir = path.resolve(path.dirname(module.id), '..', '..');    
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        this.consoleService.rwsLog(this.consoleService.color().green('RWS'), 'Commands list:');
        const cfgData = params._rws_config;

        cfgData.commands.forEach((cmd: Command) => {
            const description: string | null = (cmd.constructor as any).cmdDescription;
            this.consoleService.log(`${this.consoleService.color().yellow('rws ' + cmd.getName())}${description ? (this.consoleService.color().blue(' ' + description)) : ''}`);
        });
    }

    
}

export default CMDListCommand.createCommand();
