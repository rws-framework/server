import Command, { ICmdParams } from './_command';
import { setupPrisma, isInstalled } from '../install';
import ConsoleService from '../services/ConsoleService';
import UtilsService from '../services/UtilsService';
import path from 'path';
import fs from 'fs';
import { rwsPath } from '@rws-framework/console';

const { color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = rwsPath.findRootWorkspacePath(executionDir);


class ReloadDBSchemaCommand extends Command 
{
    constructor(){
        super('db:schema:reload');
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' reloading Prisma DB schema...');                      

        const cfgData = params._rws_config;

        try {                                          
            if(isInstalled.prisma()){
                const endPrismaFilePath = packageRootDir + '/node_modules/.prisma/client/schema.prisma';
                fs.unlinkSync(endPrismaFilePath);
            }                

            await setupPrisma(cfgData);             
            
            ConsoleService.log(color().green('[RWS]') + ' systems initialized.'); 
        } catch (error) {
            ConsoleService.error('Error while initiating RWS server installation:', error);
        }
    }

    
}

export default ReloadDBSchemaCommand.createCommand();
