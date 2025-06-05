import fs from 'fs';
import path from 'path';
import 'reflect-metadata';

import {ProcessService} from './services/ProcessService';
import {UtilsService} from './services/UtilsService';

import { DBService, DbHelper, IDbConfigHandler } from '@rws-framework/db';
import { rwsPath } from '@rws-framework/console';
import { RWSConfigService } from './services/RWSConfigService';

const workspaceRoot = rwsPath.findRootWorkspacePath();
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
    
    return;
}

export async function pushDbModels(leaveFile = false, services: {
    dbService: DBService,    
    processService: ProcessService,
    configService: RWSConfigService
} = { dbService: null, processService: null, configService: null})
{       
    
    await DbHelper.pushDBModels(services.configService as IDbConfigHandler, services.dbService, leaveFile);
    return;
}

export async function migrateDbModels(leaveFile = false, services: {
    dbService: DBService,    
    processService: ProcessService,
    configService: RWSConfigService
} = { dbService: null, processService: null, configService: null})
{       
    
    await DbHelper.migrateDBModels(services.configService as IDbConfigHandler, services.dbService, leaveFile);
    return;
}

const nodeModulesDir = path.resolve(`${workspaceRoot}`, 'node_modules');

const isInstalled = {
    rws: (): boolean => UtilsService.getRWSVar('_rws_installed') === _RWS_INSTALED_TXT,
    prisma: (): boolean => fs.existsSync(path.resolve(`${nodeModulesDir}`, '.prisma', 'client', 'schema.prisma'))
};

const runShellCommand = ProcessService.runShellCommand;

export {setupPrisma, setupRWS, isInstalled, runShellCommand, _RWS_INSTALED_TXT};