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
const fs_1 = __importDefault(require("fs"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const archiver_1 = __importDefault(require("archiver"));
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
    async createArchive(outputPath, sourcePath, onlyNodeModules = false, fullzip = false) {
        const archive = (0, archiver_1.default)('zip');
        const output = fs_1.default.createWriteStream(outputPath);
        archive.pipe(output);
        log(fullzip, outputPath);
        if (fullzip) {
            archive.glob('**', {
                cwd: sourcePath,
                dot: true
            });
        }
        else {
            if (onlyNodeModules) {
                archive.glob('**', {
                    cwd: `${process.cwd()}/node_modules`,
                    dot: true,
                    ignore: ['.rws/**'],
                }, { prefix: 'node_modules' });
            }
            else {
                archive.glob('**', {
                    cwd: sourcePath,
                    dot: true,
                    ignore: ['node_modules/**']
                });
            }
        }
        return new Promise((resolve, reject) => {
            archive.on('error', reject);
            output.on('close', () => {
                log(`Files in archive: ${archive.pointer()} bytes`);
                resolve(outputPath);
            });
            output.on('error', reject);
            archive.finalize();
        });
    }
    async S3BucketExists(bucketName) {
        try {
            log('WTF0', this.getRegion());
            await this.getS3().headBucket({ Bucket: bucketName }).promise();
            return bucketName;
        }
        catch (err) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };
                log('WTF', bucketName);
                await this.getS3().createBucket(params).promise();
                log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
                return bucketName;
            }
            else {
                // Handle other errors
                error(`Error checking bucket ${bucketName}:`, err);
            }
        }
    }
    async createEFS(functionName, subnetId) {
        const response = await this.getEFS().describeFileSystems({ CreationToken: functionName }).promise();
        if (response.FileSystems && response.FileSystems.length > 0) {
            return [response.FileSystems[0].FileSystemId, true];
        }
        else {
            const params = {
                CreationToken: functionName,
                PerformanceMode: 'generalPurpose',
            };
            try {
                const response = await this.getEFS().createFileSystem(params).promise();
                await this.createMountTarget(response.FileSystemId, subnetId);
                console.log('EFS Created:', response);
                return [response.FileSystemId, false];
            }
            catch (error) {
                console.log('Error creating EFS:', error);
            }
        }
    }
    async createMountTarget(fileSystemId, subnetId) {
        const params = {
            FileSystemId: fileSystemId,
            SubnetId: subnetId,
        };
        try {
            const response = await this.getEFS().createMountTarget(params).promise();
            console.log('Mount Target Created:', response);
        }
        catch (error) {
            console.error('Error creating Mount Target:', error);
        }
    }
    async findDefaultVPC() {
        try {
            const response = await this.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
            if (response.Vpcs && response.Vpcs.length > 0) {
                console.log('Default VPC ID:', response.Vpcs[0].VpcId);
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
            console.log('Security Group IDs:', securityGroupIds);
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
            const response = await this.getLambda().invoke(params).promise();
            return JSON.parse(response.Payload);
        }
        catch (error) {
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }
    async processEFSLoader(subnetId) {
        const executionDir = process.cwd();
        const filePath = module.id;
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path_1.default.resolve(cmdDir, '..', '..');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        const _UNZIP_FUNCTION_NAME = 'RWS_EFS_LOADER';
        if (!(await LambdaService_1.default.functionExists(_UNZIP_FUNCTION_NAME))) {
            log(`${color().green(`[RWS Lambda Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`);
            const lambdaPaths = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs_loader`, moduleCfgDir, true);
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
//# sourceMappingURL=AWSService%20copy.js.map