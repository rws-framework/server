// import Command, { ICmdParams } from './_command';
// import { setupRWS, setupPrisma } from '../install';
// import {ConsoleService} from '../services/ConsoleService';
// import {UtilsService} from '../services/UtilsService';
// import { rwsPath } from '@rws-framework/console';

// import path from 'path';
// import fs from 'fs';

// const executionDir = process.cwd();

// class InitCommand extends Command 
// {
//     packageRootDir: string;
//     moduleDir: string;
//     public static cmdDescription: string | null = 'Command that builds RWS config files along with Prisma client.\nThis CMD creates schema files for Prisma from RWS model files passed to configuration.\nUsed in postinstall scripts.';

//     constructor(private utilsService: UtilsService, private consoleService: ConsoleService){
//         super('init');

//         this.packageRootDir = this.utilsService.findRootWorkspacePath(executionDir);
//         this.moduleDir = path.resolve(path.dirname(module.id), '..', '..');  
//     }

//     async execute(params?: ICmdParams): Promise<void>
//     {
//         this.consoleService.log(this.consoleService.color().green('[RWS]') + ' starting systems...');              
    
//         const configPath: string = params.config || params._default || 'config/config'; 
//         const generateProjectFiles = true;

//         if(!configPath){
//             this.consoleService.error('[RWS] No config path provided! Use "npx rws init path/to/config/file (from ./src)"');
//             return;
//         }

//         try{                     
//             const cfgData = params._rws_config;

//             try {                              
//                 await setupRWS(cfgData);

//                 await setupPrisma(cfgData);
                
//                 this.consoleService.log(this.consoleService.color().green('[RWS]') + ' systems initialized.'); 
//             } catch (error) {
//                 this.consoleService.error('Error while initiating RWS server installation:', error);
//             }            
//         } catch(e: Error | any){    
//             this.consoleService.log(this.consoleService.color().red('[RWS]') + ' wrong config file path...');         
//             throw new Error(e);            
//         }
//     }

    
// }

// export default InitCommand.createCommand();
