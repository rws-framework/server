import Command, { ICmdParams } from './_command';
import { SetupRWS } from '../install';
import ConsoleService from '../services/ConsoleService';

import path from 'path';
import fs from 'fs';

const { log, warn, error, color } = ConsoleService;

const executionDir = process.cwd();
const moduleCfgDir = `${executionDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  

const moduleDir = path.resolve(path.dirname(module.id), '..', '..').replace('dist', '');


class InitCommand extends Command 
{
    constructor(){
        super('init', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' starting systems...');              
    
        const configPath: string = params.config || params._default 

        if(!configPath){
            ConsoleService.error('[RWS] No config path provided! Use "npx rws init path/to/config/file"');
            return;
        }

       try{                     
            const cfgData = params._rws_config;

            try {                              
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

export default new InitCommand();