import Command, { ICmdParams } from './_command';
import { setupPrisma, isInstalled } from '../install';
import {ConsoleService} from '../services/ConsoleService';
import {UtilsService} from '../services/UtilsService';
import path from 'path';
import fs from 'fs';
import { rwsPath } from '@rws-framework/console';

const { color } = ConsoleService;

const executionDir = process.cwd();

class ReloadDBSchemaCommand extends Command 
{
    packageRootDir: string;
    moduleDir: string;
    public static cmdDescription: string | null = 'Command that builds RWS config files along with Prisma client.\nThis CMD creates schema files for Prisma from RWS model files passed to configuration.\nUsed in postinstall scripts.';

    constructor(private utilsService: UtilsService, private consoleService: ConsoleService){
        super('db:schema:reload');

        this.packageRootDir = this.utilsService.findRootWorkspacePath(executionDir);
        this.moduleDir = path.resolve(path.dirname(module.id), '..', '..');  
    }
    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' reloading Prisma DB schema...');                      

        const cfgData = params._rws_config;

        try {                                          
            if(isInstalled.prisma()){
                const endPrismaFilePath = this.packageRootDir + '/node_modules/.prisma/client/schema.prisma';
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
