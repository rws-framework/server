import IAppConfig from './types/IAppConfig';
import Model, { IMetaOpts } from './models/_model';
import fs from 'fs';
import path from 'path';
import 'reflect-metadata';

import {DBService} from './services/DBService';
import {ProcessService} from './services/ProcessService';
import {ConsoleService} from './services/ConsoleService';
import {UtilsService} from './services/UtilsService';

import TimeSeriesModel from './models/types/TimeSeriesModel';
import { rwsPath } from '@rws-framework/console';
import { ConfigService } from '@nestjs/config';
import chalk from 'chalk';

const { log } = console;



const executionDir = path.resolve(process.cwd());
const workspaceRoot = rwsPath.findRootWorkspacePath();
const moduleDir = path.resolve(workspaceRoot, 'node_modules', '@rws-framework', 'server');
const _RWS_INSTALED_TXT: string = 'OK';

function generateModelSections<T extends Model<T>>(constructor: new () => T): string {
    let section = '';
    const modelMetadatas: Record<string, {annotationType: string, metadata: any}> = Model.getModelAnnotations(constructor);
    const modelName: string = (constructor as any)._collection;
    
    section += `model ${modelName} {\n`;
    section += '\tid String @map("_id") @id @default(auto()) @db.ObjectId\n';
    
    for (const key in modelMetadatas) {
        const modelMetadata: IMetaOpts = modelMetadatas[key].metadata;            
        const requiredString = modelMetadata.required ? '' : '?';  
        const annotationType: string = modelMetadatas[key].annotationType;
        
        if(annotationType === 'Relation'){
            // Handle direct relation (many-to-one or one-to-one)
            section += `\t${key} ${modelMetadata.relatedTo}${requiredString} @relation("${modelName}_${modelMetadata.relatedTo}", fields: [${modelMetadata.relationField}], references: [${modelMetadata.relatedToField}])\n`;      
            section += `\t${modelMetadata.relationField} String${requiredString} @db.ObjectId\n`;
        } else if (annotationType === 'InverseRelation'){        
            // Handle inverse relation (one-to-many or one-to-one)
            section += `\t${key} ${modelMetadata.inversionModel._collection}[] @relation("${modelMetadata.inversionModel._collection}_${modelName}")\n`;
        } else if (annotationType === 'InverseTimeSeries'){        
            section += `\t${key} String[] @db.ObjectId\n`;      
        } else if (annotationType === 'TrackType'){        
            const tags: string[] = modelMetadata.tags.map((item: string) => '@' + item);          
            section += `\t${key} ${toConfigCase(modelMetadata)}${requiredString} ${tags.join(' ')}\n`;
        }
    }
    
    section += '}\n';
    return section;
}

function toConfigCase(modelType: any): string {
    const type = modelType.type;
    const input = type.name;  

    if(input == 'Number'){
        return 'Int';
    }

    if(input == 'Object'){
        return 'Json';
    }

    if(input == 'Date'){
        return 'DateTime';
    }


    const firstChar = input.charAt(0).toUpperCase();
    const restOfString = input.slice(1);
    return firstChar + restOfString;
}

async function setupPrisma(leaveFile = false, services: {
    dbService: DBService,    
    processService: ProcessService,
    configService: ConfigService
} = { dbService: null, processService: null, configService: null})
{       
    const dbUrl = await services.configService.get('mongo_url');      
    const dbType = 'mongodb';

    let template: string = `generator client {\n
    provider = "prisma-client-js"\n
  }\n\n`;

    template += `\ndatasource db {\n
    provider = "${dbType}"\n
    url = env("DATABASE_URL")\n    
  }\n\n`;

    const usermodels = await services.configService.get('user_models');

    usermodels.forEach((model: any) => {    
        const modelSection = generateModelSections(model);

        template += '\n\n' + modelSection;  

        log('RWS SCHEMA BUILD', chalk.blue('Building DB Model'), model.name);
    
        if(Model.isSubclass(model, TimeSeriesModel)){      
     
            services.dbService.collectionExists(model._collection).then((exists: boolean) => {
                if (exists){
                    return;
                }

                log(chalk.green('[RWS Init]') + ` creating TimeSeries type collection from ${model} model`);

                services.dbService.createTimeSeriesCollection(model._collection);    
            });
        }
    });

    const schemaPath = path.join(moduleDir, 'prisma', 'schema.prisma');
    fs.writeFileSync(schemaPath, template);  
    process.env.DB_URL = dbUrl;
    // Define the command you want to run
    await ProcessService.runShellCommand('npx prisma generate --schema='+schemaPath);  

    log(chalk.green('[RWS Init]') + ' prisma schema generated from ', schemaPath);

    UtilsService.setRWSVar('_rws_installed', _RWS_INSTALED_TXT);

    if(!leaveFile){
        fs.unlinkSync(schemaPath);
    }    

    return;
}

async function setupRWS(generateProjectFiles: boolean = true): Promise<void>
{
    const packageRootDir: string = rwsPath.findRootWorkspacePath(process.cwd());
    const endPrismaFilePath = packageRootDir + 'node_modules/.prisma/client/schema.prisma';

    console.log(packageRootDir);
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