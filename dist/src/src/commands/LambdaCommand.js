"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _command_1 = __importDefault(require("./_command"));
const ConsoleService_1 = __importDefault(require("../services/ConsoleService"));
const AWSService_1 = __importDefault(require("../services/AWSService"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const UtilsService_1 = __importDefault(require("../services/UtilsService"));
const EFSService_1 = __importDefault(require("../services/EFSService"));
const LambdaService_1 = __importDefault(require("../services/LambdaService"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const executionDir = process.cwd();
const moduleCfgDir = `${executionDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
const lambdasCfg = {
    artillery: {
        preArchive: async (params) => {
            const sourceArtilleryCfg = `${path_1.default.resolve(process.cwd())}/artillery-config.yml`;
            const targetArtilleryCfg = `${moduleDir}/lambda-functions/artillery/artillery-config.yml`;
            if (fs_1.default.existsSync(targetArtilleryCfg)) {
                fs_1.default.unlinkSync(targetArtilleryCfg);
            }
            if (!fs_1.default.existsSync(sourceArtilleryCfg)) {
                throw `Create "artillery-config.yml" in your project root directory.`;
            }
            log(color().green('[RWS Lambda CLI]') + ' copying artillery config.');
            fs_1.default.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);
        }
    }
};
class LambdaCommand extends _command_1.default {
    constructor() {
        super('lambda', module);
        this.executeLambdaLifeCycle = async (lifeCycleEventName, lambdaDirName, params) => {
            if (!lambdasCfg[lambdaDirName] || !lambdasCfg[lambdaDirName][lifeCycleEventName]) {
                return;
            }
            const theAction = lambdasCfg[lambdaDirName][lifeCycleEventName];
            if (theAction && UtilsService_1.default.isInterface(theAction)) {
                log('executing action');
                await theAction(params);
            }
        };
    }
    async execute(params) {
        const { lambdaCmd, extraParams, subnetId, vpcId } = await this.getLambdaParameters(params);
        const PermissionCheck = await AWSService_1.default.checkForRolePermissions(params._rws_config.aws_lambda_role, [
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
        if (!PermissionCheck.OK) {
            error('Lambda role has not enough permissions. Add following actions to your IAM role permissions policies:');
            log(PermissionCheck.policies);
            return;
        }
        else {
            rwsLog(color().green('AWS IAM Role is eligible for operations.'));
        }
        if (!!extraParams) {
            const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir);
            await LambdaService_1.default.deployLambda('RWS-efs-loader', zipPath, vpcId, subnetId, true);
        }
        switch (lambdaCmd) {
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
                log(`Try: "deploy:${lambdaCmd}", "kill:${lambdaCmd}", invoke:${lambdaCmd} or "list:${lambdaCmd}"`);
                return;
        }
    }
    async getLambdaParameters(params) {
        const lambdaString = params.lambdaString || params._default;
        const [subnetId, vpcId] = params.subnetId || await AWSService_1.default.findDefaultSubnetForVPC();
        const lambdaStringArr = lambdaString.split(':');
        const lambdaCmd = lambdaStringArr[0];
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
        };
    }
    async invoke(params) {
        const { lambdaDirName, lambdaArg } = await this.getLambdaParameters(params);
        let payload = {};
        if (lambdaArg) {
            const payloadPath = `${executionDir}/payloads/${lambdaArg}.json`;
            if (!fs_1.default.existsSync(payloadPath)) {
                throw new Error(`No payload file in "${payloadPath}"`);
            }
            payload = JSON.parse(fs_1.default.readFileSync(payloadPath, 'utf-8'));
        }
        const response = await LambdaService_1.default.invokeLambda(lambdaDirName, payload);
        rwsLog('RWS Lambda Service', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response:`));
        log(response);
    }
    async deploy(params) {
        const { lambdaDirName, vpcId, subnetId, lambdaArg } = await this.getLambdaParameters(params);
        if (lambdaDirName === 'modules') {
            const modulesPath = path_1.default.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
            const [efsId] = await EFSService_1.default.getOrCreateEFS('RWS_EFS', vpcId, subnetId);
            LambdaService_1.default.setRegion(params._rws_config.aws_lambda_region);
            await LambdaService_1.default.deployModules(lambdaArg, efsId, vpcId, subnetId, true);
            return;
        }
        const lambdaParams = {
            rwsConfig: params._rws_config,
            subnetId: subnetId
        };
        log(color().green('[RWS Lambda CLI]') + ' preparing artillery lambda function...');
        await this.executeLambdaLifeCycle('preArchive', lambdaDirName, lambdaParams);
        const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/${lambdaDirName}`, moduleCfgDir);
        await this.executeLambdaLifeCycle('postArchive', lambdaDirName, lambdaParams);
        await this.executeLambdaLifeCycle('preDeploy', lambdaDirName, lambdaParams);
        try {
            await LambdaService_1.default.deployLambda('RWS-' + lambdaDirName, zipPath, vpcId, subnetId);
            await this.executeLambdaLifeCycle('postDeploy', lambdaDirName, lambdaParams);
            if (lambdaArg) {
                const response = await this.invoke(params);
                log(response);
            }
        }
        catch (e) {
            error(e.message);
            log(e.stack);
        }
        log(color().green(`[RWS Lambda CLI] ${lambdaDirName} lambda function is deployed`));
    }
    async delete(params) {
        const { lambdaDirName } = await this.getLambdaParameters(params);
        await LambdaService_1.default.deleteLambda('RWS-' + lambdaDirName);
        log(color().green(`[RWS Lambda CLI] ${lambdaDirName} lambda function has been ${color().red('deleted')}.`));
    }
}
exports.default = LambdaCommand.createCommand();
//# sourceMappingURL=LambdaCommand.js.map