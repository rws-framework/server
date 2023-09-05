import { ConsoleService, IAppConfig, LambdaService, AWSService } from 'rws-js-server';
import path from 'path';
import fs from 'fs';

const { log, warn, error, color } = ConsoleService;


const executionDir = process.cwd();
const filePath:string = module.id;        
const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
const moduleDir = path.resolve(cmdDir, '..', '..', '..');
const moduleCfgDir = `${executionDir}/node_modules/.rws`;


interface ILambdaParams {
    rwsConfig?: IAppConfig
    subnetId?: string
}

    
const lambdaAction = async (params: ILambdaParams) => {
   log(color().green('[RWS Lambda CLI]') + ' preparing artillery lambda function...');

   const vpcId = params.subnetId || await AWSService.findDefaultVPC(); 
 
   log(color().green('[RWS Lambda CLI]') + ' Progress: ');

   const sourceArtilleryCfg = `${path.resolve(process.cwd())}/artillery-config.yml`;
   const targetArtilleryCfg = `${moduleDir}/lambda-functions/artillery/artillery-config.yml`;

   if(fs.existsSync(targetArtilleryCfg)){
    fs.unlinkSync(targetArtilleryCfg);
   }

   if(!fs.existsSync(sourceArtilleryCfg)){
    throw `Create "artillery-config.yml" in your project root directory.`;
   }

   fs.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);   
   
   const lambdaPaths = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/artillery`, moduleCfgDir);

   try {
        await LambdaService.deployLambda('RWS-artillery', lambdaPaths, vpcId);    
   } catch (e: Error | any) {
    error(e.message);
    log(e.stack);
   }
   
   log(color().green('[RWS Lambda CLI] artillery lambda function is deployed'));
}

export default lambdaAction;

export { ILambdaParams }