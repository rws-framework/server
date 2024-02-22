import getConfigService, { IAppConfig } from './services/AppConfigService';
import Model, { IMetaOpts } from './models/_model';
import fs from 'fs';
import path from 'path';
import 'reflect-metadata';
import DBService from './services/DBService';
import TimeSeriesModel from './models/types/TimeSeriesModel';
import ProcessService from './services/ProcessService';
import ConsoleService from './services/ConsoleService';
import UtilsService from './services/UtilsService';

const { log, color, rwsLog } = ConsoleService;

const {runShellCommand} = ProcessService;

const moduleDir = path.resolve(path.dirname(module.id), '..');
const executionDir = path.resolve(process.cwd());
const workspaceRoot = UtilsService.findRootWorkspacePath(executionDir);

const _RWS_INSTALED_TXT: string = 'OK';

function generateModelSections<T extends Model<T>>(constructor: new () => T): string {
    let section = '';

    const modelMetadatas: Record<string, {annotationType: string, metadata: any}> = Model.getModelAnnotations(constructor); // Pass the class constructor   
    const modelName: string = (constructor as any)._collection;
    
    section += `model ${modelName} {\n`;

    section += '\tid String @map("_id") @id @default(auto()) @db.ObjectId\n';     
    
    for (const key in modelMetadatas) {
        const modelMetadata: IMetaOpts = modelMetadatas[key].metadata;            
        const requiredString = modelMetadata.required ? '' : '?';  
      
        const annotationType: string = modelMetadatas[key].annotationType;
      
        if(annotationType === 'Relation'){
            section += `\t${key} ${modelMetadata.relatedTo}${requiredString} @relation(fields: [${modelMetadata.relationField}], references: [${modelMetadata.relatedToField}])\n`;      
            section += `\t${modelMetadata.relationField} String${requiredString} @db.ObjectId\n`;
        }else if (annotationType === 'InverseRelation'){        
            section += `\t${key} ${modelMetadata.inversionModel}[]`;
        }else if (annotationType === 'InverseTimeSeries'){        
            section += `\t${key} String[] @db.ObjectId`;      
        }else if (annotationType === 'TrackType'){        
            const tags: string[] = modelMetadata.tags.map((item: string) => '@' + item);          
            section += `\t${key} ${toConfigCase(modelMetadata)}${requiredString} ${tags.join(' ')}\n`;
        }
    }

    section += '\n}';
  
  
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

async function setupPrisma(cfg: IAppConfig, leaveFile = false)
{   
    const AppConfigService = getConfigService(cfg);
    const dbUrl = await AppConfigService.get('mongo_url');    

    const dbType = 'mongodb';

    let template: string = `generator client {\n
    provider = "prisma-client-js"\n
  }\n\n`;

    template += `\ndatasource db {\n
    provider = "${dbType}"\n
    url = env("DATABASE_URL")\n    
  }\n\n`;

    const usermodels = await AppConfigService.get('user_models');

    usermodels.forEach((model: any) => {    
        const modelSection = generateModelSections(model);

        template += '\n\n' + modelSection;  
    
        if(Model.isSubclass(model, TimeSeriesModel)){      
     
            DBService.collectionExists(model._collection).then((exists: boolean) => {
                if (exists){
                    return;
                }

                log(color().green('[RWS Init]') + ` creating TimeSeries type collection from ${model} model`);

                DBService.createTimeSeriesCollection(model._collection);    
            });
        }
    });

    const schemaPath = path.join(moduleDir, 'prisma', 'schema.prisma');
    fs.writeFileSync(schemaPath, template);  
    process.env.DB_URL = dbUrl;
    // Define the command you want to run
    await ProcessService.runShellCommand('npx prisma generate --schema='+schemaPath);  

    log(color().green('[RWS Init]') + ' prisma schema generated from ', schemaPath);

    UtilsService.setRWSVar('_rws_installed', _RWS_INSTALED_TXT);

    if(!leaveFile){
        fs.unlinkSync(schemaPath);
    }    

    return;
}

async function setupRWS(cfg: IAppConfig, generateProjectFiles: boolean = true): Promise<void>
{
    const packageRootDir: string = UtilsService.findRootWorkspacePath(process.cwd());
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
                rwsLog(color().green('RWS CLI'), 'Installed eslint base workspace config file.');
            }
        
            if(!fs.existsSync(`${executionDir}/.eslintrc.json`)){
                const rcjs: string = fs.readFileSync(`${moduleDir}/.setup/_base.eslintrc.json`, 'utf-8');
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
    return;
}

const nodeModulesDir = path.resolve(`${workspaceRoot}`, 'node_modules');

const isInstalled = {
    rws: (): boolean => UtilsService.getRWSVar('_rws_installed') === _RWS_INSTALED_TXT,
    prisma: (): boolean => fs.existsSync(path.resolve(`${nodeModulesDir}`, '.prisma', 'client', 'schema.prisma'))
}

export {setupPrisma, setupRWS, isInstalled, runShellCommand, _RWS_INSTALED_TXT};

