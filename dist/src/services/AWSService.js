"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const LambdaService_1 = __importDefault(require("./LambdaService"));
const path_1 = __importDefault(require("path"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const { log, warn, error, color, AWSProgressBar } = ConsoleService_1.default;
class AWSService extends _service_1.default {
    constructor() {
        super();
    }
    _initApis() {
        if (!this.region) {
            this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        }
        if (!this.s3) {
            this.s3 = new aws_sdk_1.default.S3({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.efs) {
            this.efs = new aws_sdk_1.default.EFS({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.ec2) {
            this.ec2 = new aws_sdk_1.default.EC2({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.lambda) {
            this.lambda = new aws_sdk_1.default.Lambda({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
    }
    async findDefaultVPC() {
        try {
            const response = await this.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
            if (response.Vpcs && response.Vpcs.length > 0) {
                return await this.getSubnetIdForVpc(response.Vpcs[0].VpcId);
            }
            else {
                console.log('No default VPC found.');
            }
        }
        catch (error) {
            console.error('Error fetching default VPC:', error);
        }
    }
    async getSubnetIdForVpc(vpcId) {
        const params = {
            Filters: [{
                    Name: 'vpc-id',
                    Values: [vpcId]
                }]
        };
        const result = await this.getEC2().describeSubnets(params).promise();
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId)[0];
        }
        else {
            return null;
        }
    }
    async listSecurityGroups() {
        try {
            const result = await this.getEC2().describeSecurityGroups().promise();
            const securityGroups = result.SecurityGroups || [];
            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
            return securityGroupIds;
        }
        catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }
    async uploadToEFS(efsId, modulesS3Key, s3Bucket, subnetId) {
        const efsLoaderFunctionName = await this.processEFSLoader(subnetId);
        const params = {
            FunctionName: efsLoaderFunctionName,
            InvocationType: 'RequestResponse',
            Payload: JSON.stringify({
                efsId,
                modulesS3Key,
                s3Bucket
            }),
        };
        try {
            log(`${color().green(`[RWS Lambda Service]`)} invoking EFS Loader as "${efsLoaderFunctionName}" lambda function with ${modulesS3Key} in ${s3Bucket} bucket.`);
            const response = await this.getLambda().invoke(params).promise();
            return JSON.parse(response.Payload);
        }
        catch (error) {
            // await EFSService.deleteEFS(efsId);
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }
    async processEFSLoader(subnetId) {
        const executionDir = process.cwd();
        const filePath = module.id;
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path_1.default.resolve(cmdDir, '..', '..', '..', '..');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        const _UNZIP_FUNCTION_NAME = 'RWS_EFS_LOADER';
        log(`${color().green(`[RWS Clud FS Service]`)} processing EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`);
        if (!(await LambdaService_1.default.functionExists(_UNZIP_FUNCTION_NAME))) {
            log(`${color().green(`[RWS Clud FS Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`, moduleDir);
            const lambdaPaths = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir);
            await LambdaService_1.default.deployLambda(_UNZIP_FUNCTION_NAME, lambdaPaths, subnetId, true);
        }
        return _UNZIP_FUNCTION_NAME;
    }
    getS3() {
        this._initApis();
        return this.s3;
    }
    getEC2() {
        this._initApis();
        return this.ec2;
    }
    getEFS() {
        this._initApis();
        return this.efs;
    }
    getLambda() {
        this._initApis();
        return this.lambda;
    }
    getRegion() {
        this._initApis();
        return this.region;
    }
}
exports.default = AWSService.getSingleton();
//# sourceMappingURL=AWSService.js.map