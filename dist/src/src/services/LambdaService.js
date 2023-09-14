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
const UtilsService_1 = __importDefault(require("./UtilsService"));
const ProcessService_1 = __importDefault(require("./ProcessService"));
const client_lambda_1 = require("@aws-sdk/client-lambda");
const { log, warn, error, color, AWSProgressBar, rwsLog } = ConsoleService_1.default;
const MIN = 60; // 1MIN = 60s
class LambdaService extends _service_1.default {
    constructor() {
        super();
    }
    async archiveLambda(lambdaDirPath, moduleCfgDir, fullZip = false) {
        const lambdaDirName = lambdaDirPath.split("/").filter(Boolean).pop();
        const lambdaPath = path_1.default.join(moduleCfgDir, "lambda", `RWS-${lambdaDirName}-app.zip`);
        if (!fs_1.default.existsSync(path_1.default.join(moduleCfgDir, "lambda"))) {
            fs_1.default.mkdirSync(path_1.default.join(moduleCfgDir, "lambda"));
        }
        // Create archives
        const tasks = [];
        if (fs_1.default.existsSync(lambdaPath)) {
            fs_1.default.unlinkSync(lambdaPath);
        }
        const toolsFile = `${path_1.default.resolve(lambdaDirPath, "..")}/tools.js`;
        const targetToolsFile = `${lambdaDirPath}/tools.js`;
        fs_1.default.copyFileSync(toolsFile, targetToolsFile);
        log(`${color().green("[RWS Lambda Service]")} archiving ${color().yellowBright(lambdaDirPath)} to:\n ${color().yellowBright(lambdaPath)}`);
        tasks.push(ZipService_1.default.createArchive(lambdaPath, lambdaDirPath, fullZip ? null : {
            ignore: ["node_modules/**/*"],
        }));
        await Promise.all(tasks);
        fs_1.default.unlinkSync(targetToolsFile);
        log(`${color().green("[RWS Lambda Service]")} ${color().yellowBright("ZIP package complete.")}`);
        return lambdaPath;
    }
    determineLambdaPackagePaths(lambdaDirName, moduleCfgDir) {
        const modulesPath = path_1.default.join(moduleCfgDir, "lambda", `RWS-modules.zip`);
        const lambdaPath = path_1.default.join(moduleCfgDir, "lambda", `lambda-${lambdaDirName}-app.zip`);
        return [lambdaPath, modulesPath];
    }
    setRegion(region) {
        this.region = region;
    }
    async deployLambda(functionDirName, zipPath, vpcId, subnetId, noEFS = false) {
        this.region = (0, AppConfigService_1.default)().get("aws_lambda_region");
        const zipFile = fs_1.default.readFileSync(zipPath);
        try {
            const s3BucketName = (0, AppConfigService_1.default)().get("aws_lambda_bucket");
            await S3Service_1.default.bucketExists(s3BucketName);
            const [efsId, accessPointArn, efsExisted] = await EFSService_1.default.getOrCreateEFS("RWS_EFS", vpcId, subnetId);
            log(`${color().green("[RWS Lambda Service]")} ${color().yellowBright("deploying lambda on " + this.region)} using ${color().red(`S3://${s3BucketName}/${functionDirName}.zip`)}`);
            log(`${color().green("[RWS Lambda Service]")} uploading ${color().yellowBright(zipPath)}...`);
            const s3params = {
                Bucket: s3BucketName,
                Key: "RWS-" + functionDirName + ".zip",
                Body: zipFile,
            };
            await S3Service_1.default.upload(s3params, true);
            log(`${color().green("[RWS Lambda Service]")} uploaded ${color().yellowBright(zipPath)} to ${color().red(`S3://${s3BucketName}/RWS-${functionDirName}.zip`)}`);
            const s3Path = s3params.Key; // Use the Key from s3params instead of s3Data.Key
            const Code = {
                S3Bucket: s3BucketName,
                S3Key: s3Path,
            };
            let data = null;
            const lambdaFunctionName = "RWS-" + functionDirName;
            const _HANDLER = "index.handler";
            const functionDidExist = await this.functionExists(lambdaFunctionName);
            if (functionDidExist) {
                data = await AWSService_1.default.getLambda().send(new client_lambda_1.UpdateFunctionCodeCommand({
                    FunctionName: lambdaFunctionName,
                    ...Code,
                }));
            }
            else {
                const createParams = {
                    FunctionName: lambdaFunctionName,
                    Runtime: "nodejs18.x",
                    Role: (0, AppConfigService_1.default)().get("aws_lambda_role"),
                    Handler: _HANDLER,
                    Code,
                    VpcConfig: {
                        SubnetIds: [subnetId],
                        SecurityGroupIds: await AWSService_1.default.listSecurityGroups(), // Add your security group ID
                    },
                    FileSystemConfigs: [
                        {
                            Arn: accessPointArn,
                            LocalMountPath: "/mnt/efs", // The path in your Lambda function environment where the EFS will be mounted
                        },
                    ],
                    MemorySize: 2048,
                    Timeout: 15 * MIN,
                };
                log(color().green("[RWS Lambda Service]") +
                    " is creating Lambda function named: " +
                    color().yellowBright(lambdaFunctionName));
                data = await AWSService_1.default.getLambda().send(new client_lambda_1.CreateFunctionCommand(createParams));
            }
            await this.waitForLambda(functionDirName, functionDidExist ? "creation" : "update");
            if (functionDidExist) {
                const functionInfo = await AWSService_1.default.getLambda().send(new client_lambda_1.GetFunctionCommand({
                    FunctionName: lambdaFunctionName,
                }));
                if (functionInfo.Configuration.Handler !== _HANDLER) {
                    log(color().green("[RWS Lambda Service]") +
                        " is changing handler for Lambda function named: " +
                        color().yellowBright(lambdaFunctionName));
                    await AWSService_1.default.getLambda().send(new client_lambda_1.UpdateFunctionConfigurationCommand({
                        FunctionName: lambdaFunctionName,
                        Handler: _HANDLER,
                    }));
                }
                log(color().green("[RWS Lambda Service]") +
                    " has successfully updated code for Lambda function named: " +
                    color().yellowBright(lambdaFunctionName));
            }
            return data;
        }
        catch (e) {
            if (e && e.message && e.message.indexOf("No updates are to be performed") > -1) {
                log(color().green("[RWS Lambda Service]") +
                    " had no updates for Lambda function named: " +
                    color().yellowBright("RWS-" + functionDirName));
            }
            else {
                warn(color().green("[RWS Lambda Service]") + " encountered an error while deploying: ");
                throw e;
            }
        }
    }
    async deployModules(functionName, efsId, vpcId, subnetId, force = false) {
        const _RWS_MODULES_UPLOADED = '_rws_efs_modules_uploaded';
        const savedKey = !force ? UtilsService_1.default.getRWSVar(_RWS_MODULES_UPLOADED) : null;
        const S3Bucket = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
        const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist/', '');
        if (!this.region) {
            this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        }
        if (savedKey) {
            log(`${color().green('[RWS Lambda Service]')} key saved. Deploying by cache.`);
            await EFSService_1.default.uploadToEFS(functionName, efsId, savedKey, S3Bucket, vpcId, subnetId);
            return;
        }
        log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda modules on ' + this.region)}`);
        if (!savedKey) {
            const oldDir = process.cwd();
            process.chdir(`${moduleDir}/lambda-functions/${functionName}`);
            rwsLog(`installing ${functionName} modules...`);
            await ProcessService_1.default.runShellCommand(`npm install`, true);
            rwsLog(color().green(`${functionName} modules have been installed.`));
            process.chdir(oldDir);
            const packagePath = `${moduleDir}/lambda-functions/${functionName}/node_modules`;
            const zipPath = await ZipService_1.default.createArchive(`${process.cwd()}/node_modules/.rws/lambda/RWS-${functionName}-modules.zip`, packagePath);
            const s3params = {
                Bucket: S3Bucket,
                Key: `RWS-${functionName}-modules.zip`,
                Body: fs_1.default.readFileSync(zipPath)
            };
            log(`${color().green('[RWS Lambda Service]')} package file uploading ${zipPath} to S3Bucket`);
            await S3Service_1.default.upload(s3params);
            const s3Path = s3params.Key;
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('NPM package file is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);
            UtilsService_1.default.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);
            await EFSService_1.default.uploadToEFS(functionName, efsId, s3Path, S3Bucket, vpcId, subnetId);
        }
    }
    async functionExists(lambdaFunctionName) {
        try {
            await AWSService_1.default.getLambda().send(new client_lambda_1.GetFunctionCommand({ FunctionName: lambdaFunctionName }));
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
        const lambdaFunctionName = 'RWS-' + functionName;
        const startTime = Date.now();
        log(`${color().yellowBright('[Lambda Listener] awaiting Lambda ' + (waitFor !== null ? ' (' + waitFor + ')' : '') + ' state change')}`);
        while (Date.now() - startTime < timeoutMs) {
            log(`${color().yellowBright('[Lambda Listener] .')}`);
            const { Configuration } = await AWSService_1.default.getLambda().send(new client_lambda_1.GetFunctionCommand({ FunctionName: lambdaFunctionName }));
            if (Configuration.State === 'Active') {
                return; // Lambda is active and ready
            }
            // If the state is 'Failed', you can either throw an error or handle it differently based on your use case
            if (Configuration.State === 'Failed') {
                throw new Error(`Lambda function ${lambdaFunctionName} failed to be ready. Reason: ${Configuration.StateReason}`);
            }
            // Wait for the specified interval
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }
        throw new Error(`Lambda function ${lambdaFunctionName} did not become ready within ${timeoutMs}ms.`);
    }
    async deleteLambda(functionName) {
        try {
            const lambdaClient = new client_lambda_1.LambdaClient({ region: 'your-region' }); // Replace 'your-region' with your AWS region
            await lambdaClient.send(new client_lambda_1.DeleteFunctionCommand({ FunctionName: functionName }));
        }
        catch (e) {
            // Handle delete error
            throw e;
        }
    }
    async invokeLambda(functionName, payload, invocationType = 'RequestResponse') {
        var _a, _b, _c;
        const lambdaClient = new client_lambda_1.LambdaClient({ region: 'your-region' }); // Replace 'your-region' with your AWS region
        const params = {
            FunctionName: 'RWS-' + functionName,
            InvocationType: invocationType,
            Payload: JSON.stringify(payload),
        };
        try {
            const response = await lambdaClient.send(new client_lambda_1.InvokeCommand(params));
            return {
                StatusCode: (_a = response.StatusCode) !== null && _a !== void 0 ? _a : 200,
                Response: JSON.parse((_c = (_b = response.Payload) === null || _b === void 0 ? void 0 : _b.toString()) !== null && _c !== void 0 ? _c : '{}'), // Parse the response payload
            };
        }
        catch (e) {
            // Handle invocation error
            throw e;
        }
    }
    findPayload(lambdaArg) {
        const executionDir = process.cwd();
        const filePath = module.id;
        const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist/', '');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        let payloadPath = `${executionDir}/payloads/${lambdaArg}.json`;
        if (!fs_1.default.existsSync(payloadPath)) {
            rwsLog(color().yellowBright(`No payload file in "${payloadPath}"`));
            const rwsPayloadPath = `${moduleDir}/payloads/${lambdaArg}.json`;
            if (!fs_1.default.existsSync(rwsPayloadPath)) {
                rwsLog(color().red(`Found the payload file in "${rwsPayloadPath}"`));
                throw new Error(`No payload`);
            }
            else {
                rwsLog(color().green(`No payload file in "${payloadPath}"`));
                payloadPath = rwsPayloadPath;
            }
        }
        return payloadPath;
    }
}
exports.default = LambdaService.getSingleton();
//# sourceMappingURL=LambdaService.js.map