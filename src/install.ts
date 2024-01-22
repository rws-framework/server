import getConfigService, { IAppConfig } from "./services/AppConfigService";
import Model, { IMetaOpts } from './models/_model';
import fs from 'fs';
import path from 'path';
import 'reflect-metadata';
import DBService from "./services/DBService";
import TimeSeriesModel from "./models/types/TimeSeriesModel";
import ProcessService from "./services/ProcessService";
import ConsoleService from "./services/ConsoleService";
const { log, warn, error, color } = ConsoleService;

const {runShellCommand} = ProcessService;

function generateModelSections<T extends Model<T>>(constructor: new () => T): string {
    let section = '';
  
    // Get the prototype of the model instance
    const modelMetadatas: Record<string, {annotationType: string, metadata: any}> = Model.getModelAnnotations(constructor); // Pass the class constructor   
    let embed = false;   
    let modelName: string = (constructor as any)._collection;

 

    // if(Model.isSubclass(constructor, EmbedModel)){
    //   modelName = constructor.name;
    //   embed = true;
    //   throw new Error('Embed models are not supported');
    // }

    
    section += `model ${modelName} {\n`;

    section += `\tid String @map("_id") @id @default(auto()) @db.ObjectId\n`;     
    
    for (const key in modelMetadatas) {
      const modelMetadata: IMetaOpts = modelMetadatas[key].metadata            
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

    section += `\n}`;
  
  
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

async function main(cfg: IAppConfig)
{   
  const AppConfigService = getConfigService(cfg);
  const dbUrl = await AppConfigService.get('mongo_url');
  const moduleDir = path.resolve(__dirname, '..', '..').replace('dist', '');
  
  const executionDir = path.resolve(process.cwd());

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
      })
    }
  });

  const schemaPath = path.join(moduleDir, 'prisma', 'schema.prisma');
  fs.writeFileSync(schemaPath, template);  
  process.env.DB_URL = dbUrl;
  // Define the command you want to run
  await ProcessService.runShellCommand('npx prisma generate --schema='+schemaPath);  

  log(color().green('[RWS Init]') + ' prisma schema generated from ', schemaPath);

  return;
}

const SetupRWS = main;

export {SetupRWS, runShellCommand};

