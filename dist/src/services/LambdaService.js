"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const archiver_1 = __importDefault(require("archiver"));
const { log, warn, error, color, AWSProgressBar } = ConsoleService_1.default;
class LambdaService extends _service_1.default {
    constructor() {
        super();
        this.efs = aws_sdk_1.default.EFS;
    }
    async archiveLambda(lambdaDirPath, moduleCfgDir) {
        log(color().green('[RWS Lambda Service]') + ' initiating archiving of: ', lambdaDirPath);
        const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
        const [zipPathWithNodeModules, zipPathWithoutNodeModules] = this.determineLambdaPackagePaths(lambdaDirName, moduleCfgDir);
        // Create lambda directory if it doesn't exist
        if (!fs_1.default.existsSync(path_1.default.join(moduleCfgDir, 'lambda'))) {
            fs_1.default.mkdirSync(path_1.default.join(moduleCfgDir, 'lambda'));
        }
        // Create archives
        const tasks = [];
        if (!fs_1.default.existsSync(zipPathWithNodeModules)) {
            tasks.push(this.createArchive(zipPathWithNodeModules, lambdaDirPath));
        }
        if (!fs_1.default.existsSync(zipPathWithoutNodeModules)) {
            tasks.push(this.createArchive(zipPathWithoutNodeModules, lambdaDirPath, true));
        }
        await Promise.all(tasks);
        log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('ZIP package complete.')}`);
        return [zipPathWithNodeModules, zipPathWithoutNodeModules];
    }
    determineLambdaPackagePaths(lambdaDirName, moduleCfgDir) {
        const zipPathWithNodeModules = path_1.default.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-modules.zip`);
        const zipPathWithoutNodeModules = path_1.default.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-app.zip`);
        return [zipPathWithoutNodeModules, zipPathWithNodeModules];
    }
    async createArchive(outputPath, sourcePath, onlyNodeModules = false) {
        const archive = (0, archiver_1.default)('zip');
        const output = fs_1.default.createWriteStream(outputPath);
        archive.pipe(output);
        if (onlyNodeModules) {
            archive.directory(`${sourcePath}/node_modules`, 'node_modules');
        }
        else {
            archive.glob('**', {
                cwd: sourcePath,
                dot: true,
                ignore: ['node_modules/**']
            });
        }
        archive.finalize();
        return new Promise((resolve, reject) => {
            output.on('close', () => resolve(outputPath));
            output.on('error', reject);
        });
    }
    async createLambdaLayer(zipPath, functionName) {
        const s3BucketName = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
        const zipFile = fs_1.default.readFileSync(zipPath);
        log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda layer on ' + this.region + ' using ' + functionName)}`);
        const s3params = {
            Bucket: s3BucketName,
            Key: functionName + '-modules.zip',
            Body: zipFile
        };
        const uplPromise = this.s3.upload(s3params);
        try {
            log(`${color().green('[RWS Lambda Service]')} layer uploading ${zipPath} to S3Bucket`);
            const s3Data = await uplPromise.promise();
            const s3Path = s3Data.Key;
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('lambda layer is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);
            const Code = {
                S3Bucket: s3BucketName,
                S3Key: s3Path
            };
            const params = {
                Content: {
                    ...Code
                },
                LayerName: functionName + '-layer',
                CompatibleRuntimes: ["nodejs18.x"],
                Description: "RWS Lambda Node Modules Layer"
            };
            try {
                const response = await this.lambda.publishLayerVersion(params).promise();
                log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('lambda layer is configured in' + this.region + ' with ARN:  ' + response.LayerVersionArn)}`);
                return response.LayerVersionArn;
            }
            catch (error) {
                console.error("Error creating layer:", error);
            }
        }
        catch (e) {
            throw e;
        }
    }
    ;
    async deployLambda(functionName, appPaths, subnetId) {
        const [zipPath, layerPath] = appPaths;
        console.log(appPaths);
        this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        this.lambda = new aws_sdk_1.default.Lambda({
            region: this.region,
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            }
        });
        const zipFile = fs_1.default.readFileSync(zipPath);
        try {
            const s3BucketName = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
            await this.S3BucketExists(s3BucketName);
            // const layerARN = await this.createLambdaLayer(layerPath, functionName);
            const efsId = await this.createEFS(functionName, subnetId);
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region + ' using ' + s3BucketName)}`);
            const s3params = {
                Bucket: s3BucketName,
                Key: functionName + '.zip',
                Body: zipFile
            };
            try {
                const uplPromise = this.s3.upload(s3params);
                // AWSProgressBar(uplPromise);
                const s3Data = await uplPromise.promise();
                log(`${color().green('[RWS Lambda Service]')} uploading ${zipPath} to S3Bucket`);
                const s3Path = s3Data.Key;
                const Code = {
                    S3Bucket: s3BucketName,
                    S3Key: s3Path
                };
                let data = null;
                if (await this.functionExists(functionName)) {
                    data = await this.lambda.updateFunctionCode({
                        FunctionName: functionName,
                        ...Code
                    }).promise();
                }
                else {
                    const createParams = {
                        FunctionName: functionName,
                        Runtime: 'nodejs18.x',
                        Role: (0, AppConfigService_1.default)().get('aws_lambda_role'),
                        Handler: 'index.js',
                        Code,
                        VpcConfig: {
                            SubnetIds: [subnetId],
                            SecurityGroupIds: await this.listSecurityGroups(), // Add your security group ID
                        }
                    };
                    console.log(createParams);
                    data = await this.lambda.createFunction(createParams).promise();
                }
                // try{
                //   await this.waitForLambda(functionName);
                //   await this.lambda.updateFunctionConfiguration({
                //     FunctionName: functionName,
                //     Layers: [layerARN]
                //   }).promise();
                //   log(`${color().green(`[RWS Lambda Service] lambda layer for "${functionName}" is configured`)}`);  
                // } catch(e: Error | any) {
                //   throw e;
                // }
                fs_1.default.unlinkSync(zipPath);
                fs_1.default.unlinkSync(layerPath);
                log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright(`${zipPath} has been deleted after successful deployment`)}`);
                log(`${color().green(`[RWS Lambda Service] lambda function "${functionName}" deployed`)}`);
            }
            catch (e) {
                throw e;
            }
        }
        catch (err) {
            error(err.message);
            log(err.stack);
        }
    }
    async functionExists(functionName) {
        try {
            await this.lambda.getFunction({ FunctionName: functionName }).promise();
        }
        catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                return false;
            }
        }
        return true;
    }
    async S3BucketExists(bucketName) {
        this.s3 = new aws_sdk_1.default.S3({
            region: this.region,
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            }
        });
        try {
            log('WTF0', this.region);
            await this.s3.headBucket({ Bucket: bucketName }).promise();
            return bucketName;
        }
        catch (err) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };
                log('WTF', bucketName);
                await this.s3.createBucket(params).promise();
                log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
                return bucketName;
            }
            else {
                // Handle other errors
                error(`Error checking bucket ${bucketName}:`, err);
            }
        }
    }
    async waitForLambda(functionName, timeoutMs = 300000, intervalMs = 5000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            const { Configuration } = await this.lambda.getFunction({ FunctionName: functionName }).promise();
            if (Configuration.State === 'Active') {
                return; // Lambda is active and ready
            }
            // If the state is 'Failed', you can either throw an error or handle it differently based on your use case
            if (Configuration.State === 'Failed') {
                throw new Error(`Lambda function ${functionName} failed to be ready. Reason: ${Configuration.StateReason}`);
            }
            // Wait for the specified interval
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        throw new Error(`Lambda function ${functionName} did not become ready within ${timeoutMs}ms.`);
    }
    async createEFS(functionName, subnetId) {
        this.efs = new aws_sdk_1.default.EFS({
            region: this.region,
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            }
        });
        const response = await this.efs.describeFileSystems({ CreationToken: functionName }).promise();
        if (response.FileSystems && response.FileSystems.length > 0) {
            return response.FileSystemId;
        }
        else {
            const params = {
                CreationToken: functionName,
                PerformanceMode: 'generalPurpose',
            };
            try {
                const response = await this.efs.createFileSystem(params).promise();
                await this.createMountTarget(response.FileSystemId, subnetId);
                console.log('EFS Created:', response);
                return response.FileSystemId;
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
            const response = await this.efs.createMountTarget(params).promise();
            console.log('Mount Target Created:', response);
        }
        catch (error) {
            console.error('Error creating Mount Target:', error);
        }
    }
    async findDefaultVPC() {
        const ec2 = new aws_sdk_1.default.EC2({
            region: (0, AppConfigService_1.default)().get('aws_lambda_region'),
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            }
        });
        try {
            const response = await ec2.describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
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
        const ec2 = new aws_sdk_1.default.EC2({
            region: (0, AppConfigService_1.default)().get('aws_lambda_region'),
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key')
            }
        });
        const params = {
            Filters: [{
                    Name: 'vpc-id',
                    Values: [vpcId]
                }]
        };
        const result = await ec2.describeSubnets(params).promise();
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId)[0];
        }
        else {
            return null;
        }
    }
    async listSecurityGroups() {
        const ec2 = new aws_sdk_1.default.EC2({
            region: this.region,
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            }
        });
        try {
            const result = await ec2.describeSecurityGroups().promise();
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
}
exports.default = LambdaService.getSingleton();
//# sourceMappingURL=LambdaService.js.map