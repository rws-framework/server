import { ConsoleService, IAppConfig, LambdaService } from 'rws-js-server';
import path from 'path';

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

   const vpcId = params.subnetId || await LambdaService.findDefaultVPC(); 

   warn(`${moduleDir}/artillery`);
 
   log(color().green('[RWS Lambda CLI]') + ' Progress: ');
   const lambdaPaths = await LambdaService.archiveLambda(`${moduleDir}/artillery`, moduleCfgDir);

   try {
    await LambdaService.deployLambda('junction-artillery', lambdaPaths, vpcId);
   } catch (e: Error | any) {
    error(e.message);
    log(e.stack);
   }
   
   log(color().green('[RWS Lambda CLI] artillery lambda function is deployed'));
}

export default lambdaAction;

export { ILambdaParams }