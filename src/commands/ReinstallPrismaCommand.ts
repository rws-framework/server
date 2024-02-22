import Command, { ICmdParams } from './_command';
import ConsoleService from '../services/ConsoleService';
import ProcessService from '../services/ProcessService';
import UtilsService from '../services/UtilsService';
import path from 'path';
import fs from 'fs';
import InitCommand from './InitCommand';
import { isInstalled, setupPrisma } from '../install';

const { color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = UtilsService.findRootWorkspacePath(executionDir);
const moduleDir = path.resolve(path.dirname(module.id), '../..');


class ReinstallPrismaCommand extends Command 
{
    constructor(){
        super('prisma:reinstall', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' reloading Prisma DB client...');                      

        const cfgData = params._rws_config;

        try {                                          
            if(!isInstalled.rws()){                
                await InitCommand.execute();
                return;
            }

            await setupPrisma(cfgData);

        } catch (error) {
            ConsoleService.error('Error while initiating RWS server installation:', error);
        }
    }

    
}

export default ReinstallPrismaCommand.createCommand();
