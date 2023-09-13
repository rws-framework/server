import Command, { ICmdParams } from './_command';
import ConsoleService from '../services/ConsoleService';
import ProcessService from '../services/ProcessService';

import path from 'path';
import fs from 'fs';

const { log, warn, error, color } = ConsoleService;

const executionDir = process.cwd();
const moduleCfgDir = `${executionDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  

const moduleDir = path.resolve(path.dirname(module.id), '..', '..').replace('dist', '');


class KillCommand extends Command 
{
    constructor(){
        super('kill', module);
    }

    async execute(params: ICmdParams): Promise<void>
    {
        const scriptKillPath: string | null = params.path || params._default || null;

        if(scriptKillPath){
            await ProcessService.killProcess(scriptKillPath);
            return;
        }

        await ProcessService.killRWS();   
        return; 
    }

    
}

export default new KillCommand();