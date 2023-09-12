import { ConsoleService, IAppConfig, LambdaService, AWSService, EFSService } from 'rws-js-server';
import path from 'path';
import fs from 'fs';

const { log, warn, error, color } = ConsoleService;


const executionDir = process.cwd();
const filePath: string = module.id;
const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
const moduleDir = path.resolve(cmdDir, '..', '..', '..');
const moduleCfgDir = `${executionDir}/node_modules/.rws`;


interface ILambdaParams {
    rwsConfig?: IAppConfig
    subnetId?: string
}

type ILifeCycleEventType = 'preArchive' | 'postArchive' | 'preDeploy' | 'postDeploy';

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

            fs.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);
        }
    }
}

function isInterface<T>(func: any): func is T {
    return typeof func === 'function';
}

const executeLambdaLifeCycle = async (lifeCycleEventName: keyof ILambdaLifeCycleEvents, lambdaDirName: keyof ILambdasLifeCycleConfig, params: ILambdaParams): Promise<void> => {
    if (!lambdasCfg[lambdaDirName] || !lambdasCfg[lambdaDirName][lifeCycleEventName]) {
        return;
    }

    const theAction = lambdasCfg[lambdaDirName][lifeCycleEventName];

    if (theAction && isInterface<ILambdasLifeCycleConfig>(theAction)) {
        log('executing action')
        await theAction(params);
    }
}


const lambdaAction = async (lambdaDirName: string, params: ILambdaParams) => {
    const vpcId = params.subnetId || await AWSService.findDefaultVPC();

    if (lambdaDirName === 'deploy-modules') {
        const modulesPath = path.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
        const [efsId] = await EFSService.getOrCreateEFS('RWS_EFS', vpcId);

        await LambdaService.deployModules(modulesPath, efsId, vpcId, true);

        return;
    }

    log(color().green('[RWS Lambda CLI]') + ' preparing artillery lambda function...');

    log(color().green('[RWS Lambda CLI]') + ' Progress: ');

    await executeLambdaLifeCycle('preArchive', lambdaDirName, params);

    const lambdaPaths = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/${lambdaDirName}`, moduleCfgDir);

    await executeLambdaLifeCycle('postArchive', lambdaDirName, params);

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