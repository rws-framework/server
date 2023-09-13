"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const EFSService_1 = __importDefault(require("./EFSService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const AWSService_1 = __importDefault(require("./AWSService"));
const ZipService_1 = __importDefault(require("./ZipService"));
const S3Service_1 = __importDefault(require("./S3Service"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const UtilsService_1 = __importDefault(require("./UtilsService"));
const { log, warn, error, color, AWSProgressBar } = ConsoleService_1.default;
const MIN = 60; // 1MIN = 60s
class LambdaService extends _service_1.default {
    constructor() {
        super();
    }
    async archiveLambda(lambdaDirPath, moduleCfgDir) {
        const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
        const [lambdaPath] = this.determineLambdaPackagePaths(lambdaDirName, moduleCfgDir);
        if (!fs_1.default.existsSync(path_1.default.join(moduleCfgDir, 'lambda'))) {
            fs_1.default.mkdirSync(path_1.default.join(moduleCfgDir, 'lambda'));
        }
        // Create archives
        const tasks = [];
        if (fs_1.default.existsSync(lambdaPath)) {
            fs_1.default.unlinkSync(lambdaPath);
        }
        // if(fs.existsSync(lambdaPath + '/package.json')){
        //   await ProcessService.runShellCommand(`cd ${lambdaPath} && npm install`);
        // }
        log(`${color().green('[RWS Lambda Service]')} archiving ${color().yellowBright(lambdaDirPath)} to:\n ${color().yellowBright(lambdaPath)}`);
        tasks.push(ZipService_1.default.createArchive(lambdaPath, lambdaDirPath));
        await Promise.all(tasks);
        log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('ZIP package complete.')}`);
        return lambdaPath;
    }
    determineLambdaPackagePaths(lambdaDirName, moduleCfgDir) {
        const modulesPath = path_1.default.join(moduleCfgDir, 'lambda', `RWS-modules.zip`);
        const lambdaPath = path_1.default.join(moduleCfgDir, 'lambda', `lambda-${lambdaDirName}-app.zip`);
        return [lambdaPath, modulesPath];
    }
    setRegion(region) {
        this.region = region;
    }
    async deployLambda(functionName, zipPath, subnetId, noEFS = false) {
        this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        const zipFile = fs_1.default.readFileSync(zipPath);
        try {
            const s3BucketName = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
            await S3Service_1.default.bucketExists(s3BucketName);
            const [efsId, accessPointArn, efsExisted] = await EFSService_1.default.getOrCreateEFS('RWS_EFS', subnetId);
            if (!noEFS && !efsExisted) {
                await this.deployModules(functionName, efsId, subnetId);
            }
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region)} using ${color().red(`S3://${s3BucketName}/${functionName}.zip`)}`);
            log(`${color().green('[RWS Lambda Service]')} uploading ${color().yellowBright(zipPath)}...`);
            const s3params = {
                Bucket: s3BucketName,
                Key: functionName + '.zip',
                Body: zipFile
            };
            const s3Data = await S3Service_1.default.upload(s3params, true);
            log(`${color().green('[RWS Lambda Service]')} uploaded ${color().yellowBright(zipPath)} to ${color().red(`S3://${s3BucketName}/${functionName}.zip`)}`);
            const s3Path = s3Data.Key;
            const Code = {
                S3Bucket: s3BucketName,
                S3Key: s3Path
            };
            let data = null;
            const _HANDLER = 'index.handler';
            const functionDidExist = await this.functionExists(functionName);
            if (functionDidExist) {
                data = await AWSService_1.default.getLambda().updateFunctionCode({
                    FunctionName: functionName,
                    ...Code
                }).promise();
            }
            else {
                const createParams = {
                    FunctionName: functionName,
                    Runtime: 'nodejs18.x',
                    Role: (0, AppConfigService_1.default)().get('aws_lambda_role'),
                    Handler: _HANDLER,
                    Code,
                    VpcConfig: {
                        SubnetIds: [subnetId],
                        SecurityGroupIds: await AWSService_1.default.listSecurityGroups(), // Add your security group ID
                    },
                    FileSystemConfigs: [
                        {
                            Arn: accessPointArn,
                            LocalMountPath: '/mnt/efs' // The path in your Lambda function environment where the EFS will be mounted
                        }
                    ],
                    MemorySize: 2048,
                    Timeout: 15 * MIN
                };
                log(color().green('[RWS Lambda Service] is creating Lambda function named: ') + color().yellowBright(functionName));
                data = await AWSService_1.default.getLambda().createFunction(createParams).promise();
            }
            await this.waitForLambda(functionName, functionDidExist ? 'creation' : 'update');
            if (functionDidExist) {
                const functionInfo = await AWSService_1.default.getLambda().getFunction({
                    FunctionName: functionName
                }).promise();
                if (functionInfo.Configuration.Handler !== _HANDLER) {
                    log(color().green('[RWS Lambda Service]') + ' is changing handler for Lambda function named: ' + color().yellowBright(functionName));
                    await AWSService_1.default.getLambda().updateFunctionConfiguration({
                        FunctionName: functionName,
                        Handler: _HANDLER
                    }, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        }
                        else {
                            console.log(data);
                        }
                    }).promise();
                    await this.waitForLambda(functionName, 'handler update');
                }
            }
            log(`${color().green(`[RWS Lambda Service] lambda function "${functionName}" deployed`)}`);
        }
        catch (err) {
            error(err.message);
            log(err.stack);
            throw err;
        }
    }
    async deployModules(functionName, efsId, subnetId, force = false) {
        const _RWS_MODULES_UPLOADED = '_rws_efs_modules_uploaded';
        const savedKey = !force ? UtilsService_1.default.getRWSVar(_RWS_MODULES_UPLOADED) : null;
        const S3Bucket = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
        const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist', '');
        if (!this.region) {
            this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        }
        if (savedKey) {
            log(`${color().green('[RWS Lambda Service]')} key saved. Deploying by cache.`);
            await AWSService_1.default.uploadToEFS(functionName, efsId, savedKey, S3Bucket, subnetId);
            return;
        }
        log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda modules on ' + this.region)}`);
        if (!savedKey) {
            const packagePath = `${moduleDir}/lambda-functions/${functionName}/package.json`;
            const s3params = {
                Bucket: S3Bucket,
                Key: `RWS-${functionName}-modules.json`,
                Body: fs_1.default.readFileSync(packagePath)
            };
            log(`${color().green('[RWS Lambda Service]')} package file uploading ${packagePath} to S3Bucket`);
            const s3Data = await S3Service_1.default.upload(s3params);
            const s3Path = s3Data.Key;
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('NPM package file is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);
            UtilsService_1.default.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);
            await AWSService_1.default.uploadToEFS(functionName, efsId, s3Path, S3Bucket, subnetId);
        }
    }
    async functionExists(functionName) {
        try {
            await AWSService_1.default.getLambda().getFunction({ FunctionName: functionName }).promise();
        }
        catch (e) {
            if (e.code === 'ResourceNotFoundException') {
                log(e.message);
                return false;
            }
        }
        return true;
    }
    async waitForLambda(functionName, waitFor = null, timeoutMs = 300000, intervalMs = 5000) {
        const startTime = Date.now();
        log(`${color().yellowBright('[Lambda Listener] awaiting Lambda ' + (waitFor !== null ? ' (' + waitFor + ')' : '') + ' state change')}`);
        while (Date.now() - startTime < timeoutMs) {
            log(`${color().yellowBright('[Lambda Listener] .')}`);
            const { Configuration } = await AWSService_1.default.getLambda().getFunction({ FunctionName: functionName }).promise();
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
    async deleteLambda(functionName) {
        await AWSService_1.default.getLambda().deleteFunction({
            FunctionName: functionName
        }).promise();
    }
    async invokeLambda(functionName, payload) {
        const params = {
            FunctionName: 'RWS-' + functionName,
            InvocationType: 'Event',
            Payload: JSON.stringify(payload),
        };
        log(color().green('[RWS Lambda Service]') + color().yellowBright(` invoking RWS-${functionName} with payload: `));
        log(payload);
        try {
            const response = await AWSService_1.default.getLambda()
                .invoke(params)
                .promise();
            // Restore the original console.log function
            // console.log = originalConsoleLog;
            // Assuming you want to return specific properties from the response
            return {
                StatusCode: response.StatusCode,
                Response: response
            };
        }
        catch (e) {
            error(e.message);
            throw new Error(e);
        }
    }
    async retrieveCloudWatchLogs(logResult, functionName) {
        const cloudWatchLogs = new aws_sdk_1.default.CloudWatchLogs();
        const params = {
            logGroupName: `/aws/lambda/${functionName}`,
            logStreamName: logResult,
        };
        const logs = [];
        const getLogs = async (nextToken = undefined) => {
            if (nextToken) {
                params.nextToken = nextToken;
            }
            const response = await cloudWatchLogs.getLogEvents(params).promise();
            if (response.events) {
                for (const event of response.events) {
                    logs.push(event.message || '');
                }
            }
            // if (response.nextToken) {
            //   await getLogs(response.nextToken);
            // }
        };
        await getLogs();
        return logs;
    }
}
exports.default = LambdaService.getSingleton();
//# sourceMappingURL=LambdaService.js.map