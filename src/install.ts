import fs from 'fs';
import path from 'path';
import 'reflect-metadata';

import {ProcessService} from './services/ProcessService';
import {UtilsService} from './services/UtilsService';

import { DBService, DbHelper, IDbConfigHandler } from '@rws-framework/db';
import { rwsPath } from '@rws-framework/console';
import chalk from 'chalk';
import { RWSConfigService } from './services/RWSConfigService';

const { log } = console;

const executionDir = path.resolve(process.cwd());
const workspaceRoot = rwsPath.findRootWorkspacePath();
const moduleDir = path.resolve(workspaceRoot, 'node_modules', '@rws-framework', 'db');
const _RWS_INSTALED_TXT: string = 'OK';


async function setupPrisma(leaveFile = false, services: {
    dbService: DBService,    
    processService: ProcessService,
    configService: RWSConfigService
} = { dbService: null, processService: null, configService: null})
{       
    
    await DbHelper.installPrisma(services.configService as IDbConfigHandler, services.dbService, leaveFile);
    UtilsService.setRWSVar('_rws_installed', _RWS_INSTALED_TXT); 

    return;
}

async function setupRWS(generateProjectFiles: boolean = true): Promise<void>
{
    const packageRootDir: string = rwsPath.findRootWorkspacePath(process.cwd());
    const endPrismaFilePath = packageRootDir + 'node_modules/.prisma/client/schema.prisma';

    if(fs.existsSync(endPrismaFilePath)){
        fs.unlinkSync(endPrismaFilePath);
    }                

 
    let workspaced = false;
    
    if(workspaceRoot !== executionDir){
        workspaced = true;
    }
    
    if(generateProjectFiles){              
        if(workspaced){
            if(!fs.existsSync(`${workspaceRoot}/.eslintrc.json`)){
                const rcjs: string = fs.readFileSync(`${moduleDir}/.setup/_base.eslintrc.json`, 'utf-8');
                fs.writeFileSync(`${workspaceRoot}/.eslintrc.json`, rcjs.replace('{{backend_dir}}', executionDir));
                log(chalk.green('RWS CLI'), 'Installed eslint base workspace config file.');
            }
        
            if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
                const rcjs: string = fs.readFileSync(`${moduleDir}/.setup/_base.eslintrc.json`, 'utf-8');
                fs.writeFileSync(`${executionDir}/.eslintrc.json`, rcjs.replace('{{backend_dir}}', executionDir));                            
                log(chalk.green('RWS CLI'), 'Installed eslint backend workspace config file.');
            }    
        }else{
            if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
                fs.copyFileSync(`${moduleDir}/.eslintrc.json`, `${executionDir}/.eslintrc.json`);
                log(chalk.green('RWS CLI'), 'Installed eslint config file.');
            }  
        } 
    
        if(!fs.existsSync(`${executionDir}/tsconfig.json`)){
            fs.copyFileSync(`${moduleDir}/.setup/tsconfig.json`, `${executionDir}/tsconfig.json`);
            log(chalk.green('RWS CLI'), 'Installed tsconfig.');
        }
    }
    return;
}

const nodeModulesDir = path.resolve(`${workspaceRoot}`, 'node_modules');

const isInstalled = {
    rws: (): boolean => UtilsService.getRWSVar('_rws_installed') === _RWS_INSTALED_TXT,
    prisma: (): boolean => fs.existsSync(path.resolve(`${nodeModulesDir}`, '.prisma', 'client', 'schema.prisma'))
}

const runShellCommand = ProcessService.runShellCommand;

export {setupPrisma, setupRWS, isInstalled, runShellCommand, _RWS_INSTALED_TXT};