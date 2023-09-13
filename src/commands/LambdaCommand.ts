
import Command, { ICmdParams } from "./_command";
import ConsoleService from '../services/ConsoleService';
import AWSService from '../services/AWSService';
import fs from 'fs';
import path from 'path';
import UtilsService from "../services/UtilsService";
import EFSService from "../services/EFSService";
import LambdaService from "../services/LambdaService";


const { log, warn, error, color } = ConsoleService;

const executionDir = process.cwd();
const moduleCfgDir = `${executionDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;  

const moduleDir = path.resolve(path.dirname(module.id), '..', '..').replace('dist', '');

interface ILambdaParams {
    rwsConfig?: any
    subnetId?: string
}

type ILifeCycleMethod = (params: ILambdaParams) => Promise<void> | null;


type ILambdaLifeCycleEvents = {
    preArchive?: ILifeCycleMethod;
    postArchive?: ILifeCycleMethod;
    preDeploy?: ILifeCycleMethod;
    postDeploy?: ILifeCycleMethod;
};

interface ILambdasLifeCycleConfig {
    [key: string]: ILambdaLifeCycleEvents
}


const lambdasCfg: ILambdasLifeCycleConfig = {
    artillery: {
        preArchive: async (params: ILambdaParams): Promise<void> => {
            const sourceArtilleryCfg = `${path.resolve(process.cwd())}/artillery-config.yml`;
            const targetArtilleryCfg = `${moduleDir}/lambda-functions/artillery/artillery-config.yml`;

            if (fs.existsSync(targetArtilleryCfg)) {
                fs.unlinkSync(targetArtilleryCfg);
            }

            if (!fs.existsSync(sourceArtilleryCfg)) {
                throw `Create "artillery-config.yml" in your project root directory.`;
            }

            log(color().green('[RWS Lambda CLI]') + ' copying artillery config.');
            fs.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);
        }
    }
}

type ILambdaSubCommand = 'deploy' | 'delete' | string;

interface ILambdaParamsReturn {
    lambdaCmd: ILambdaSubCommand
    lambdaDirName: string
    vpcId: string
    lambdaArg: string
}

class LambdaCommand extends Command 
{
    constructor(){
        super('lambda', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        const { lambdaCmd } = await this.getLambdaParameters(params);
        
        switch(lambdaCmd){
            case 'deploy':
                await this.deploy(params);            
                return;
            case 'invoke':
                await this.invoke(params);            
                return;
            case 'delete':
                await this.delete(params);
                return;    
            default:
                error(`[RWS Lambda CLI] "${lambdaCmd}" command is not supported in RWS Lambda CLI`);
                log(`Try: "deploy:${lambdaCmd}", "kill:${lambdaCmd}", invoke:${lambdaCmd} or "list:${lambdaCmd}"`)
                return;    
        }    
    }   

    public executeLambdaLifeCycle = async (lifeCycleEventName: keyof ILambdaLifeCycleEvents, lambdaDirName: keyof ILambdasLifeCycleConfig, params: ILambdaParams): Promise<void> => {
        if (!lambdasCfg[lambdaDirName] || !lambdasCfg[lambdaDirName][lifeCycleEventName]) {
            return;
        }
    
        const theAction = lambdasCfg[lambdaDirName][lifeCycleEventName];
    
        if (theAction && UtilsService.isInterface<ILambdasLifeCycleConfig>(theAction)) {
            log('executing action')
            await theAction(params);
        }
    }

    public async getLambdaParameters(params: ICmdParams): Promise<ILambdaParamsReturn>
    {
        const lambdaString: string = params.lambdaString || params._default;           
        const vpcId = params.subnetId || await AWSService.findDefaultVPC();
        const lambdaStringArr: string[] = lambdaString.split(':');        
        const lambdaCmd: ILambdaSubCommand = lambdaStringArr[0];
        const lambdaDirName = lambdaStringArr[1];    
        const lambdaArg = lambdaStringArr.length > 2 ? lambdaStringArr[2] : null;         

        return {
            lambdaCmd,
            lambdaDirName,
            vpcId,
            lambdaArg
        }
    }
    
    public async invoke(params: ICmdParams)
    {
        const {lambdaDirName, lambdaArg} = await this.getLambdaParameters(params);

        let payload = {};

        if(lambdaArg){
            const payloadPath = `${executionDir}/payloads/${lambdaArg}.json`

            if(!fs.existsSync(payloadPath)){
                throw new Error(`No payload file in "${payloadPath}"`);
            }

            payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
        }
      
        const response = await LambdaService.invokeLambda('RWS-'+lambdaDirName, payload);
        log(response);
    }

    public async deploy(params: ICmdParams)
    {
        const {lambdaDirName, vpcId, lambdaArg} = await this.getLambdaParameters(params);

        if (lambdaDirName === 'modules') {
            const modulesPath = path.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
            const [efsId] = await EFSService.getOrCreateEFS('RWS_EFS', vpcId);
    
            await LambdaService.deployModules(modulesPath, efsId, vpcId, true);        
            return;
        }

        const lambdaParams: ILambdaParams = {
            rwsConfig: params._rws_config,
            subnetId: vpcId
        };

        log(color().green('[RWS Lambda CLI]') + ' preparing artillery lambda function...');

        await this.executeLambdaLifeCycle('preArchive', lambdaDirName, lambdaParams);

        const lambdaPaths = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/${lambdaDirName}`, moduleCfgDir);

        await this.executeLambdaLifeCycle('postArchive', lambdaDirName, lambdaParams);

        await this.executeLambdaLifeCycle('preDeploy', lambdaDirName, lambdaParams);

        try {
            await LambdaService.deployLambda('RWS-' + lambdaDirName, lambdaPaths, vpcId);
            await this.executeLambdaLifeCycle('postDeploy', lambdaDirName, lambdaParams);
            if(lambdaArg){
                await this.invoke(params);
            }
        } catch (e: Error | any) {
            error(e.message);
            log(e.stack);
        }

        log(color().green(`[RWS Lambda CLI] ${lambdaDirName} lambda function is deployed`));
    }

    public async delete(params: ICmdParams)
    {
        const {lambdaDirName} = await this.getLambdaParameters(params);
        await LambdaService.deleteLambda('RWS-' + lambdaDirName);
        log(color().green(`[RWS Lambda CLI] ${lambdaDirName} lambda function has been ${color().red('deleted')}.`));
    }

    
}

export default LambdaCommand.createCommand();
export {ILambdaParams, ILambdaParamsReturn}