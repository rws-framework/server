import Command, { ICmdParams } from './_command';
import { SetupRWS } from '../install';
import ConsoleService from '../services/ConsoleService';
import UtilsService from '../services/UtilsService';
import path from 'path';
import fs from 'fs';

const { log, warn, error, color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = UtilsService.findRootWorkspacePath(executionDir)
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const moduleDir = path.resolve(path.dirname(module.id), '../..');


class InitCommand extends Command 
{
    constructor(){
        super('init', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' starting systems...');              
    
        const configPath: string = params.config || params._default || 'config/config'; 

        if(!configPath){
            ConsoleService.error('[RWS] No config path provided! Use "npx rws init path/to/config/file (from ./src)"');
            return;
        }

       try{                     
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
        } catch(e: Error | any){    
            ConsoleService.log(color().red('[RWS]') + ' wrong config file path...');         
            throw new Error(e)            
        }
    }

    
}

export default InitCommand.createCommand();
