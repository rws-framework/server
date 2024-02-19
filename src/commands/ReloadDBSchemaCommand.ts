import Command, { ICmdParams } from './_command';
import { SetupRWS } from '../install';
import ConsoleService from '../services/ConsoleService';
import UtilsService from '../services/UtilsService';
import path from 'path';
import fs from 'fs';

const { log, warn, error, color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = UtilsService.findRootWorkspacePath(executionDir);
const moduleDir = path.resolve(path.dirname(module.id), '../..');


class ReloadDBSchemaCommand extends Command 
{
    constructor(){
        super('reload:db:schema', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' reloading Prisma DB schema...');                      

        const cfgData = params._rws_config;

        try {                              
            const endPrismaFilePath = packageRootDir + 'node_modules/.prisma/client/schema.prisma';

            if(fs.existsSync(endPrismaFilePath)){
                fs.unlinkSync(endPrismaFilePath);
            }                

            await SetupRWS(cfgData);
            const prismaCfgPath = moduleDir + '/prisma/schema.prisma';        
            fs.unlinkSync(prismaCfgPath);
            ConsoleService.log(color().green('[RWS]') + ' systems initialized.'); 
        } catch (error) {
            ConsoleService.error('Error while initiating RWS server installation:', error);
        }
    }

    
}

export default ReloadDBSchemaCommand.createCommand();
