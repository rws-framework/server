import Command, { ICmdParams } from './_command';
import { SetupRWS } from '../install';
import ConsoleService from '../services/ConsoleService';
import UtilsService from '../services/UtilsService';
import path from 'path';
import fs from 'fs';

const { rwsLog, color } = ConsoleService;

const executionDir = process.cwd();

const packageRootDir = UtilsService.findRootWorkspacePath(executionDir);


class InitCommand extends Command 
{
    constructor(){
        super('init', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        ConsoleService.log(color().green('[RWS]') + ' starting systems...');              
    
        const configPath: string = params.config || params._default || 'config/config'; 
        const generateProjectFiles = true;

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

                const moduleDir = path.resolve(path.dirname(module.id), '..', '..');
                const executionDir = path.resolve(process.cwd());
                let workspaced = false;
                const workspaceRoot = UtilsService.findRootWorkspacePath(executionDir);
              
                if(workspaceRoot !== executionDir){
                    workspaced = true;
                }
                
                if(generateProjectFiles){              
                    if(workspaced){
                        if(!fs.existsSync(`${workspaceRoot}/.eslintrc.json`)){
                            const rcjs: string = fs.readFileSync(`${moduleDir}/.setup/_base.eslintrc.json`, 'utf-8');
                            fs.writeFileSync(`${workspaceRoot}/.eslintrc.json`, rcjs.replace('{{backend_dir}}', executionDir));
                            rwsLog(color().green('RWS CLI'), 'Installed eslint base workspace config file.');
                        }
                    
                        if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
                            const rcjs: string = fs.readFileSync(`${executionDir}/.setup/_base.eslintrc.json`, 'utf-8');
                            fs.writeFileSync(`${executionDir}/.eslintrc.json`, rcjs.replace('{{backend_dir}}', executionDir));                            
                            rwsLog(color().green('RWS CLI'), 'Installed eslint backend workspace config file.');
                        }    
                    }else{
                        if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
                            fs.copyFileSync(`${moduleDir}/.eslintrc.json`, `${executionDir}/.eslintrc.json`);
                            rwsLog(color().green('RWS CLI'), 'Installed eslint config file.');
                        }  
                    } 
                
                    if(!fs.existsSync(`${executionDir}/tsconfig.json`)){
                        fs.copyFileSync(`${moduleDir}/.setup/tsconfig.json`, `${executionDir}/tsconfig.json`);
                        rwsLog(color().green('RWS CLI'), 'Installed tsconfig.');
                    }
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
            throw new Error(e);            
        }
    }

    
}

export default InitCommand.createCommand();
