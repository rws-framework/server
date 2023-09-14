
import Command, { ICmdParams } from "./_command";
import ConsoleService from '../services/ConsoleService';
import AWSService from '../services/AWSService';
import fs from 'fs';
import path from 'path';
import UtilsService from "../services/UtilsService";
import EFSService from "../services/EFSService";
import LambdaService from "../services/LambdaService";


const { log, warn, error, color, rwsLog } = ConsoleService;

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
            
            rwsLog('RWS Lambda CLI | artillery | preDeploy', ' copying artillery config.');

            fs.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);
        },
        postDeploy: async (params: ILambdaParams): Promise<void> => {        
            const targetArtilleryCfg = `${moduleDir}/lambda-functions/artillery/artillery-config.yml`;

            if (fs.existsSync(targetArtilleryCfg)) {
                fs.unlinkSync(targetArtilleryCfg);
                rwsLog('RWS Lambda CLI | artillery | postDeploy', 'artillery config cleaned up');
            }
        }
    }
}

type ILambdaSubCommand = 'deploy' | 'delete' | string;

interface ILambdaParamsReturn {
    lambdaCmd: ILambdaSubCommand
    lambdaDirName: string
    subnetId: string
    vpcId: string
    lambdaArg: string
    extraParams: {
        [key: string]: any
    }
}

class LambdaCommand extends Command 
{
    constructor(){
        super('lambda', module);
    }

    async execute(params?: ICmdParams): Promise<void>
    {
        const { lambdaCmd, extraParams, subnetId, vpcId } = await this.getLambdaParameters(params);

        const PermissionCheck = await AWSService.checkForRolePermissions(params._rws_config.aws_lambda_role, [
            'lambda:CreateFunction',
            'lambda:UpdateFunctionCode',
            'lambda:UpdateFunctionConfiguration',
            'lambda:InvokeFunction',
            'lambda:ListFunctions',
            
            's3:GetObject',
            's3:PutObject',

            'elasticfilesystem:CreateFileSystem',
            'elasticfilesystem:DeleteFileSystem',
            "elasticfilesystem:DescribeFileSystems",

            'elasticfilesystem:CreateAccessPoint',
            'elasticfilesystem:DeleteAccessPoint',
            "elasticfilesystem:DescribeAccessPoints",

            'elasticfilesystem:CreateMountTarget',            
            "elasticfilesystem:DeleteMountTarget",
            'elasticfilesystem:DescribeMountTargets',

            "ec2:CreateSecurityGroup",    
            "ec2:DescribeSecurityGroups",
            "ec2:DescribeSubnets",

            "ec2:DescribeVpcs",   
            
            "ec2:CreateVpcEndpoint",
            "ec2:DescribeVpcEndpoints",
            "ec2:ModifyVpcEndpoint",
            "ec2:DeleteVpcEndpoint",

            'cloudwatch:PutMetricData',
            'cloudwatch:GetMetricData'
        ]);

        if(!PermissionCheck.OK){
            error('Lambda role has not enough permissions. Add following actions to your IAM role permissions policies:');
            log(PermissionCheck.policies);
            return;
        }else{
            rwsLog(color().green('AWS IAM Role is eligible for operations.'));
        }

        if(!!extraParams && !!extraParams.redeploy_loader){            
            const zipPath = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir, true);
            await LambdaService.deployLambda('efs-loader', zipPath, vpcId, subnetId, true);
        }
        
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
            case 'list':
                await this.list(params);
                return;    
            default:
                error(`[RWS Lambda CLI] "${lambdaCmd}" command is not supported in RWS Lambda CLI`);
                log(`Try: "deploy:${lambdaCmd}", "delete:${lambdaCmd}", invoke:${lambdaCmd} or "list:${lambdaCmd}"`)
                return;    
        }    
    }   

    public executeLambdaLifeCycle = async (lifeCycleEventName: keyof ILambdaLifeCycleEvents, lambdaDirName: keyof ILambdasLifeCycleConfig, params: ILambdaParams): Promise<void> => {
        if (!lambdasCfg[lambdaDirName] || !lambdasCfg[lambdaDirName][lifeCycleEventName]) {
            return;
        }
    
        const theAction = lambdasCfg[lambdaDirName][lifeCycleEventName];
    
        if (theAction && UtilsService.isInterface<ILambdasLifeCycleConfig>(theAction)) {            
            await theAction(params);
        }
    }

    public async getLambdaParameters(params: ICmdParams): Promise<ILambdaParamsReturn>
    {
        const lambdaString: string = params.lambdaString || params._default;           
        const [subnetId, vpcId] = params.subnetId || await AWSService.findDefaultSubnetForVPC();
        const lambdaStringArr: string[] = lambdaString.split(':');        
        const lambdaCmd: ILambdaSubCommand = lambdaStringArr[0];
        const lambdaDirName = lambdaStringArr[1];    
        const lambdaArg = lambdaStringArr.length > 2 ? lambdaStringArr[2] : null;    
        const extraParams = params._extra_args.deploy_loader;

        return {
            lambdaCmd,
            lambdaDirName,
            subnetId,
            vpcId,
            lambdaArg,
            extraParams
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
    
        const response = await LambdaService.invokeLambda(lambdaDirName, payload, lambdaDirName === 'efs-loader' ? 'Event': 'RequestResponse');
        rwsLog('RWS Lambda Service', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response (Code: ${response.Response.StatusCode}):`));            

        const responseData = JSON.parse(response.Response.Payload.toString());
                
        log(responseData);

        if(!responseData.success){
            log(responseData.errorMessage);
        }
    }

    public async list(params: ICmdParams)
    {
        const listFunctionsParams: AWS.Lambda.ListFunctionsRequest = {
            MaxItems: 100,
          };
        
        const rwsLambdaFunctions: AWS.Lambda.FunctionConfiguration[] = [];

        try {
            const functionsResponse = await AWSService.getLambda().listFunctions(listFunctionsParams).promise();
        
            if (functionsResponse.Functions) {
              for (const functionConfig of functionsResponse.Functions) {
                if (functionConfig.FunctionName && functionConfig.FunctionName.startsWith('RWS-')) {
                  rwsLambdaFunctions.push(functionConfig);
                }
              }
            }
        } catch (error) {
            throw new Error(`Error listing Lambda functions: ${(error as AWS.AWSError).message}`);
        }

        rwsLog('RWS Lambda Service', color().yellowBright(`RWS lambda functions list:`));    
        rwsLog('RWS Lambda Service', color().yellowBright(`ARN  |  NAME`));  

        rwsLambdaFunctions.map((funct: AWS.Lambda.FunctionConfiguration) => funct.FunctionArn + '  |  ' +funct.FunctionName).forEach((msg) => {
            log(msg);
        })
    }

    public async deploy(params: ICmdParams)
    {
        const {lambdaDirName, vpcId, subnetId, lambdaArg} = await this.getLambdaParameters(params);        

        if (lambdaDirName === 'modules') {        
            const [efsId] = await EFSService.getOrCreateEFS('RWS_EFS', vpcId, subnetId);
            LambdaService.setRegion(params._rws_config.aws_lambda_region);
            await LambdaService.deployModules(lambdaArg, efsId, vpcId,subnetId, true);        
            return;
        }

        const lambdaParams: ILambdaParams = {
            rwsConfig: params._rws_config,
            subnetId: subnetId
        };

        log(color().green('[RWS Lambda CLI]') + ' preparing artillery lambda function...');

        await this.executeLambdaLifeCycle('preArchive', lambdaDirName, lambdaParams);

        const zipPath = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/${lambdaDirName}`, moduleCfgDir, lambdaDirName === 'efs-loader');

        await this.executeLambdaLifeCycle('postArchive', lambdaDirName, lambdaParams);

        await this.executeLambdaLifeCycle('preDeploy', lambdaDirName, lambdaParams);

        try {
            await LambdaService.deployLambda(lambdaDirName, zipPath, vpcId, subnetId);
            await this.executeLambdaLifeCycle('postDeploy', lambdaDirName, lambdaParams);

            let payload = {};

            if(lambdaArg){                       
                const payloadPath = `${executionDir}/payloads/${lambdaArg}.json`
    
                if(!fs.existsSync(payloadPath)){
                    throw new Error(`No payload file in "${payloadPath}"`);
                }
    
                payload = JSON.parse(fs.readFileSync(payloadPath, 'utf-8'));
                
                const response = await LambdaService.invokeLambda(lambdaDirName, payload);

                rwsLog('RWS Lambda Service', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response (Code: ${response.Response.StatusCode}):`));    

                const responseData = JSON.parse(response.Response.Payload.toString());
                
                log(responseData);

                if(!responseData.success){
                    log(responseData.errorMessage);
                }
            }
        } catch (e: Error | any) {
            error(e.message);
            log(e.stack);
        }

        log(color().green(`[RWS Lambda CLI] "${moduleDir}/lambda-functions/${lambdaDirName}" function directory has been deployed to "RWS-${lambdaDirName}" named AWS Lambda function.`));
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