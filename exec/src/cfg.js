/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/cfg.js":
/*!********************!*\
  !*** ./src/cfg.js ***!
  \********************/
/***/ ((__unused_webpack_module, __unused_webpack_exports, __webpack_require__) => {

/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "../src/services sync recursive":
/*!*****************************!*\
  !*** ../src/services/ sync ***!
  \*****************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "../src/services sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "../src/commands/ClearCommand.ts":
/*!***************************************!*\
  !*** ../src/commands/ClearCommand.ts ***!
  \***************************************/
/***/ (function(module, exports, __nested_webpack_require_785__) {

"use strict";
/* module decorator */ module = __nested_webpack_require_785__.nmd(module);

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _command_1 = __importDefault(__nested_webpack_require_785__(/*! ./_command */ "../src/commands/_command.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_785__(/*! ../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const promises_1 = __nested_webpack_require_785__(/*! fs/promises */ "fs/promises");
const path_1 = __importDefault(__nested_webpack_require_785__(/*! path */ "path"));
const UtilsService_1 = __importDefault(__nested_webpack_require_785__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
const { log, warn, error, color } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
class ClearCommand extends _command_1.default {
    constructor() {
        super('clear', module);
    }
    async removeDirRecursively(path) {
        try {
            await (0, promises_1.rmdir)(path, { recursive: true });
            console.log(`Directory at ${path} removed successfully`);
        }
        catch (error) {
            console.error(`Error while removing directory: ${error}`);
        }
    }
    async execute(params) {
        ConsoleService_1.default.log('clearing systems...');
        await this.removeDirRecursively(moduleCfgDir);
        ConsoleService_1.default.log(color().green('[RWS]') + ' systems cleared. Use npx rws init to reinitialize.');
    }
}
exports["default"] = ClearCommand.createCommand();


/***/ }),

/***/ "../src/commands/InitCommand.ts":
/*!**************************************!*\
  !*** ../src/commands/InitCommand.ts ***!
  \**************************************/
/***/ (function(module, exports, __nested_webpack_require_2963__) {

"use strict";
/* module decorator */ module = __nested_webpack_require_2963__.nmd(module);

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _command_1 = __importDefault(__nested_webpack_require_2963__(/*! ./_command */ "../src/commands/_command.ts"));
const install_1 = __nested_webpack_require_2963__(/*! ../install */ "../src/install.ts");
const ConsoleService_1 = __importDefault(__nested_webpack_require_2963__(/*! ../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__nested_webpack_require_2963__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
const path_1 = __importDefault(__nested_webpack_require_2963__(/*! path */ "path"));
const fs_1 = __importDefault(__nested_webpack_require_2963__(/*! fs */ "fs"));
const { log, warn, error, color } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
class InitCommand extends _command_1.default {
    constructor() {
        super('init', module);
    }
    async execute(params) {
        ConsoleService_1.default.log(color().green('[RWS]') + ' starting systems...');
        const configPath = params.config || params._default || 'config/config';
        if (!configPath) {
            ConsoleService_1.default.error('[RWS] No config path provided! Use "npx rws init path/to/config/file (from ./src)"');
            return;
        }
        try {
            const cfgData = params._rws_config;
            try {
                await (0, install_1.SetupRWS)(cfgData);
                const prismaCfgPath = moduleDir + '/prisma/schema.prisma';
                fs_1.default.unlinkSync(prismaCfgPath);
                ConsoleService_1.default.log(color().green('[RWS]') + ' systems initialized.');
            }
            catch (error) {
                ConsoleService_1.default.error('Error while initiating RWS server installation:', error);
            }
        }
        catch (e) {
            ConsoleService_1.default.log(color().red('[RWS]') + ' wrong config file path...');
            throw new Error(e);
        }
    }
}
exports["default"] = InitCommand.createCommand();


/***/ }),

/***/ "../src/commands/LambdaCommand.ts":
/*!****************************************!*\
  !*** ../src/commands/LambdaCommand.ts ***!
  \****************************************/
/***/ (function(module, exports, __nested_webpack_require_5668__) {

"use strict";
/* module decorator */ module = __nested_webpack_require_5668__.nmd(module);

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _command_1 = __importDefault(__nested_webpack_require_5668__(/*! ./_command */ "../src/commands/_command.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const AWSService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/AWSService */ "../src/services/AWSService.ts"));
const fs_1 = __importDefault(__nested_webpack_require_5668__(/*! fs */ "fs"));
const path_1 = __importDefault(__nested_webpack_require_5668__(/*! path */ "path"));
const UtilsService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
const EFSService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/EFSService */ "../src/services/EFSService.ts"));
const LambdaService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/LambdaService */ "../src/services/LambdaService.ts"));
const VPCService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/VPCService */ "../src/services/VPCService.ts"));
const CloudWatchService_1 = __importDefault(__nested_webpack_require_5668__(/*! ../services/CloudWatchService */ "../src/services/CloudWatchService.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist/', '');
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
            rwsLog('RWS Lambda CLI | artillery | preDeploy', ' copying artillery config.');
            fs_1.default.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);
        },
        postDeploy: async (params) => {
            const targetArtilleryCfg = `${moduleDir}/lambda-functions/artillery/artillery-config.yml`;
            if (fs_1.default.existsSync(targetArtilleryCfg)) {
                fs_1.default.unlinkSync(targetArtilleryCfg);
                rwsLog('RWS Lambda CLI | artillery | postDeploy', 'artillery config cleaned up');
            }
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
                await theAction(params);
            }
        };
    }
    async execute(params) {
        AWSService_1.default._initApis();
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
        if (!!extraParams && !!extraParams.redeploy_loader) {
            const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir, true);
            await LambdaService_1.default.deployLambda('efs-loader', zipPath, vpcId, subnetId, true);
        }
        switch (lambdaCmd) {
            case 'deploy':
                await this.deploy(params);
                return;
            case 'undeploy':
                await this.undeploy(params);
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
            case 'open-to-web':
                await this.openToWeb(params);
                return;
            default:
                error(`[RWS Lambda CLI] "${lambdaCmd}" command is not supported in RWS Lambda CLI`);
                log(`Try: "deploy:${lambdaCmd}", "delete:${lambdaCmd}", invoke:${lambdaCmd} or "list:${lambdaCmd}"`);
                return;
        }
    }
    async getLambdaParameters(params) {
        const lambdaString = params.lambdaString || params._default;
        const [subnetId, vpcId] = params.subnetId || await VPCService_1.default.findDefaultSubnetForVPC();
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
            const payloadPath = LambdaService_1.default.findPayload(lambdaArg);
            payload = JSON.parse(fs_1.default.readFileSync(payloadPath, 'utf-8'));
        }
        const response = await LambdaService_1.default.invokeLambda(lambdaDirName, payload);
        const logsTimeout = await CloudWatchService_1.default.printLogsForLambda(`RWS-${lambdaDirName}`);
        rwsLog('RWS Lambda Service', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response (Code: ${response.Response.StatusCode}):`));
        if (response.InvocationType === 'RequestResponse') {
            log(response.Response.Payload);
            clearTimeout(logsTimeout.core);
        }
    }
    async list(params) {
        const listFunctionsParams = {
            MaxItems: 100,
        };
        const rwsLambdaFunctions = [];
        try {
            const functionsResponse = await AWSService_1.default.getLambda().listFunctions(listFunctionsParams).promise();
            if (functionsResponse.Functions) {
                for (const functionConfig of functionsResponse.Functions) {
                    if (functionConfig.FunctionName && functionConfig.FunctionName.startsWith('RWS-')) {
                        rwsLambdaFunctions.push(functionConfig);
                    }
                }
            }
        }
        catch (error) {
            throw new Error(`Error listing Lambda functions: ${error.message}`);
        }
        rwsLog('RWS Lambda Service', color().yellowBright(`RWS lambda functions list:`));
        rwsLog('RWS Lambda Service', color().yellowBright(`ARN  |  NAME`));
        rwsLambdaFunctions.map((funct) => funct.FunctionArn + '  |  ' + funct.FunctionName).forEach((msg) => {
            log(msg);
        });
    }
    async deploy(params) {
        const { lambdaDirName, vpcId, subnetId, lambdaArg } = await this.getLambdaParameters(params);
        if (lambdaDirName === 'modules') {
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
        const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/${lambdaDirName}`, moduleCfgDir, lambdaDirName === 'efs-loader');
        await this.executeLambdaLifeCycle('postArchive', lambdaDirName, lambdaParams);
        await this.executeLambdaLifeCycle('preDeploy', lambdaDirName, lambdaParams);
        try {
            await LambdaService_1.default.deployLambda(lambdaDirName, zipPath, vpcId, subnetId);
            await this.executeLambdaLifeCycle('postDeploy', lambdaDirName, lambdaParams);
            let payload = {};
            if (lambdaArg) {
                let payloadPath = LambdaService_1.default.findPayload(lambdaArg);
                payload = JSON.parse(fs_1.default.readFileSync(payloadPath, 'utf-8'));
                const response = await LambdaService_1.default.invokeLambda(lambdaDirName, payload);
                rwsLog('RWS Lambda Deploy Invoke', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response (Code: ${response.Response.StatusCode})`));
                if (response.Response.Payload.toString()) {
                    const responseData = JSON.parse(response.Response.Payload.toString());
                    log(response.Response.Payload.toString());
                    if (!responseData.success) {
                        error(responseData.errorMessage);
                    }
                }
            }
        }
        catch (e) {
            error(e.message);
            log(e.stack);
        }
        log(color().green(`[RWS Lambda CLI] "${moduleDir}/lambda-functions/${lambdaDirName}" function directory\nhas been deployed to "RWS-${lambdaDirName}" named AWS Lambda function.`));
    }
    async undeploy(params) {
        const { lambdaDirName, vpcId, subnetId, lambdaArg } = await this.getLambdaParameters(params);
        if (lambdaDirName === 'modules') {
            const [efsId] = await EFSService_1.default.getOrCreateEFS('RWS_EFS', vpcId, subnetId);
            LambdaService_1.default.setRegion(params._rws_config.aws_lambda_region);
            await LambdaService_1.default.deployModules(lambdaArg, efsId, vpcId, subnetId, true);
            return;
        }
        const lambdaParams = {
            rwsConfig: params._rws_config,
            subnetId: subnetId
        };
    }
    async openToWeb(params) {
        const { lambdaDirName } = await this.getLambdaParameters(params);
        // await APIGatewayService.associateNATGatewayWithLambda('RWS-' + lambdaDirName);        
    }
    async delete(params) {
        const { lambdaDirName } = await this.getLambdaParameters(params);
        if (!(await LambdaService_1.default.functionExists('RWS-' + lambdaDirName))) {
            error(`There is no lambda function named "RWS-${lambdaDirName}" in AWS region "${AWSService_1.default.getRegion()}"`);
            return;
        }
        await LambdaService_1.default.deleteLambda('RWS-' + lambdaDirName);
        log(color().green(`[RWS Lambda CLI] "RWS-${lambdaDirName}" lambda function has been ${color().red('deleted')} from AWS region "${AWSService_1.default.getRegion()}"`));
    }
}
exports["default"] = LambdaCommand.createCommand();


/***/ }),

/***/ "../src/commands/_command.ts":
/*!***********************************!*\
  !*** ../src/commands/_command.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_18963__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path_1 = __importDefault(__nested_webpack_require_18963__(/*! path */ "path"));
const fs_1 = __importDefault(__nested_webpack_require_18963__(/*! fs */ "fs"));
const UtilsService_1 = __importDefault(__nested_webpack_require_18963__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
class TheCommand {
    constructor(name, childModule) {
        this.name = name;
        const rootPackageDir = UtilsService_1.default.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = path_1.default.resolve(rootPackageDir, 'node_modules', '.rws');
        const cmdDirFile = `${moduleCfgDir}/_cli_cmd_dir`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        const filePath = childModule.id;
        const cmdDir = `${filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '')}`;
        let finalCmdDir = cmdDir;
        if (cmdDir.indexOf('node_modules') > -1) {
            finalCmdDir = rootPackageDir + '/' + finalCmdDir.substring(finalCmdDir.indexOf("node_modules"));
        }
        if (!fs_1.default.existsSync(cmdDirFile)) {
            fs_1.default.writeFileSync(cmdDirFile, finalCmdDir);
        }
    }
    getSourceFilePath() {
        const err = new Error();
        if (err.stack) {
            const match = err.stack.match(/at [^\s]+ \((.*):\d+:\d+\)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }
    async execute(params = null) {
        throw new Error('Implement method.');
    }
    getName() {
        return this.name;
    }
    static createCommand() {
        const className = this.name;
        if (!TheCommand._instances[className]) {
            TheCommand._instances[className] = new this();
        }
        return TheCommand._instances[className];
    }
    getCommandParameters(params) {
        const cmdString = params.cmdString || params._default;
        const cmdStringArr = cmdString.split(':');
        const subCmd = cmdStringArr[0];
        const apiCmd = cmdStringArr[1];
        const apiArg = cmdStringArr.length > 2 ? cmdStringArr[2] : null;
        const extraParams = params._extra_args.deploy_loader;
        return {
            subCmd,
            apiCmd,
            apiArg,
            extraParams
        };
    }
}
TheCommand._instances = {};
exports["default"] = TheCommand;


/***/ }),

/***/ "../src/commands/index.ts":
/*!********************************!*\
  !*** ../src/commands/index.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_21781__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const LambdaCommand_1 = __importDefault(__nested_webpack_require_21781__(/*! ./LambdaCommand */ "../src/commands/LambdaCommand.ts"));
const InitCommand_1 = __importDefault(__nested_webpack_require_21781__(/*! ./InitCommand */ "../src/commands/InitCommand.ts"));
const ClearCommand_1 = __importDefault(__nested_webpack_require_21781__(/*! ./ClearCommand */ "../src/commands/ClearCommand.ts"));
exports["default"] = [
    InitCommand_1.default,
    LambdaCommand_1.default,
    ClearCommand_1.default
];


/***/ }),

/***/ "../src/controllers/_controller.ts":
/*!*****************************************!*\
  !*** ../src/controllers/_controller.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_22733__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_22733__(/*! ../services/_service */ "../src/services/_service.ts"));
const Error404_1 = __importDefault(__nested_webpack_require_22733__(/*! ../errors/Error404 */ "../src/errors/Error404.ts"));
const Error500_1 = __importDefault(__nested_webpack_require_22733__(/*! ../errors/Error500 */ "../src/errors/Error500.ts"));
/**
 * @category Core extendable objects
 */
class Controller extends _service_1.default {
    constructor() {
        super();
    }
    callMethod(methodName) {
        return (params) => {
            if ((!this[methodName])) {
                const error = new Error404_1.default(new Error('The method does not exist in controller.'), `${__filename}::${methodName}`);
                return error;
            }
            try {
                return this[methodName](params);
            }
            catch (e) {
                const error = new Error500_1.default(e, `${__filename}::${methodName}`, params);
                return error;
            }
        };
    }
    hasError() {
        const hasError = this._hasError;
        this._hasError = false;
        return hasError;
    }
    flagError() {
        this._hasError = true;
    }
}
exports["default"] = Controller;


/***/ }),

/***/ "../src/errors/Error403.ts":
/*!*********************************!*\
  !*** ../src/errors/Error403.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_24420__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _error_1 = __importDefault(__nested_webpack_require_24420__(/*! ./_error */ "../src/errors/_error.ts"));
class Error404 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(403, baseError, params);
        this.name = '403 not authorized.';
        this.message = `RWS resource "$${resourcePath}" was not autorized for current user.`;
    }
}
exports["default"] = Error404;


/***/ }),

/***/ "../src/errors/Error404.ts":
/*!*********************************!*\
  !*** ../src/errors/Error404.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_25290__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _error_1 = __importDefault(__nested_webpack_require_25290__(/*! ./_error */ "../src/errors/_error.ts"));
class Error404 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(404, baseError, params);
        this.name = '404 Resource not found';
        this.message = `Resource "${resourcePath}" was not found`;
    }
}
exports["default"] = Error404;


/***/ }),

/***/ "../src/errors/Error500.ts":
/*!*********************************!*\
  !*** ../src/errors/Error500.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_26136__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _error_1 = __importDefault(__nested_webpack_require_26136__(/*! ./_error */ "../src/errors/_error.ts"));
class Error500 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(500, baseError, params);
        this.name = '500 internal server error';
        this.message = `RWS resource "$${resourcePath}" has internal error`;
    }
}
exports["default"] = Error500;


/***/ }),

/***/ "../src/errors/_error.ts":
/*!*******************************!*\
  !*** ../src/errors/_error.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class RWSError {
    constructor(code, baseError = null, params = null) {
        this.stack = null;
        if (!baseError) {
            baseError = new Error('Error code ' + code);
        }
        this.code = code;
        this.baseError = baseError;
        this.stack = baseError.stack;
    }
    printFullError() {
        console.error('[RWS Error]');
        console.log(`[${this.name}] ${this.message}`);
        console.log('Stack:', this.stack);
        console.error('[/RWS Error]');
    }
    getMessage() {
        return this.message;
    }
    getCode() {
        return this.code;
    }
    getStackTraceString() {
        return this.stack;
    }
}
exports["default"] = RWSError;


/***/ }),

/***/ "../src/errors/index.ts":
/*!******************************!*\
  !*** ../src/errors/index.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_27967__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RWSError = exports.Error500 = exports.Error404 = exports.Error403 = void 0;
const Error404_1 = __importDefault(__nested_webpack_require_27967__(/*! ./Error404 */ "../src/errors/Error404.ts"));
exports.Error404 = Error404_1.default;
const Error403_1 = __importDefault(__nested_webpack_require_27967__(/*! ./Error403 */ "../src/errors/Error403.ts"));
exports.Error403 = Error403_1.default;
const Error500_1 = __importDefault(__nested_webpack_require_27967__(/*! ./Error500 */ "../src/errors/Error500.ts"));
exports.Error500 = Error500_1.default;
const _error_1 = __importDefault(__nested_webpack_require_27967__(/*! ./_error */ "../src/errors/_error.ts"));
exports.RWSError = _error_1.default;


/***/ }),

/***/ "../src/index.ts":
/*!***********************!*\
  !*** ../src/index.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_29032__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RWSErrorCodes = exports.RWSPrompt = exports.RWSConvo = exports.RWSVectorStore = exports.RWSTestSuite = exports.RWSAppCommands = exports.RWSannotations = exports.ProcessService = exports.Socket = exports.TimeSeriesModel = exports.VectorStoreService = exports.UtilsService = exports.TraversalService = exports.MD5Service = exports.EFSService = exports.AWSService = exports.LambdaService = exports.ConsoleService = exports.S3Service = exports.AuthService = exports.DBService = exports.RWSServer = exports.RWSModel = exports.RWSCommand = exports.RWSSocket = exports.RWSService = exports.RWSController = exports.AppConfigService = exports.getAppConfig = exports.SetupRWS = exports.serverInit = void 0;
const socket_io_1 = __nested_webpack_require_29032__(/*! socket.io */ "socket.io");
Object.defineProperty(exports, "Socket", ({ enumerable: true, get: function () { return socket_io_1.Socket; } }));
const init_1 = __importDefault(__nested_webpack_require_29032__(/*! ./init */ "../src/init.ts"));
exports.serverInit = init_1.default;
const install_1 = __nested_webpack_require_29032__(/*! ./install */ "../src/install.ts");
Object.defineProperty(exports, "SetupRWS", ({ enumerable: true, get: function () { return install_1.SetupRWS; } }));
const TimeSeriesModel_1 = __importDefault(__nested_webpack_require_29032__(/*! ./models/types/TimeSeriesModel */ "../src/models/types/TimeSeriesModel.ts"));
exports.TimeSeriesModel = TimeSeriesModel_1.default;
const ServerService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/ServerService */ "../src/services/ServerService.ts"));
exports.RWSServer = ServerService_1.default;
const DBService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/DBService */ "../src/services/DBService.ts"));
exports.DBService = DBService_1.default;
const AuthService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/AuthService */ "../src/services/AuthService.ts"));
exports.AuthService = AuthService_1.default;
const S3Service_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/S3Service */ "../src/services/S3Service.ts"));
exports.S3Service = S3Service_1.default;
const ConsoleService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/ConsoleService */ "../src/services/ConsoleService.ts"));
exports.ConsoleService = ConsoleService_1.default;
const ProcessService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/ProcessService */ "../src/services/ProcessService.ts"));
exports.ProcessService = ProcessService_1.default;
const LambdaService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/LambdaService */ "../src/services/LambdaService.ts"));
exports.LambdaService = LambdaService_1.default;
const AWSService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/AWSService */ "../src/services/AWSService.ts"));
exports.AWSService = AWSService_1.default;
const EFSService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/EFSService */ "../src/services/EFSService.ts"));
exports.EFSService = EFSService_1.default;
const MD5Service_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/MD5Service */ "../src/services/MD5Service.ts"));
exports.MD5Service = MD5Service_1.default;
const TraversalService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/TraversalService */ "../src/services/TraversalService.ts"));
exports.TraversalService = TraversalService_1.default;
const UtilsService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/UtilsService */ "../src/services/UtilsService.ts"));
exports.UtilsService = UtilsService_1.default;
const VectorStoreService_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/VectorStoreService */ "../src/services/VectorStoreService.ts"));
exports.VectorStoreService = VectorStoreService_1.default;
const _prompt_1 = __importDefault(__nested_webpack_require_29032__(/*! ./models/prompts/_prompt */ "../src/models/prompts/_prompt.ts"));
exports.RWSPrompt = _prompt_1.default;
const ConvoLoader_1 = __importDefault(__nested_webpack_require_29032__(/*! ./models/convo/ConvoLoader */ "../src/models/convo/ConvoLoader.ts"));
exports.RWSConvo = ConvoLoader_1.default;
const VectorStore_1 = __importDefault(__nested_webpack_require_29032__(/*! ./models/convo/VectorStore */ "../src/models/convo/VectorStore.ts"));
exports.RWSVectorStore = VectorStore_1.default;
const index_1 = __nested_webpack_require_29032__(/*! ./models/annotations/index */ "../src/models/annotations/index.ts");
const index_2 = __nested_webpack_require_29032__(/*! ./routing/annotations/index */ "../src/routing/annotations/index.ts");
const AppConfigService_1 = __importStar(__nested_webpack_require_29032__(/*! ./services/AppConfigService */ "../src/services/AppConfigService.ts"));
exports.getAppConfig = AppConfigService_1.default;
Object.defineProperty(exports, "AppConfigService", ({ enumerable: true, get: function () { return AppConfigService_1.AppConfigService; } }));
const RWSannotations = {
    modelAnnotations: { InverseRelation: index_1.InverseRelation, InverseTimeSeries: index_1.InverseTimeSeries, Relation: index_1.Relation, TrackType: index_1.TrackType },
    routingAnnotations: { Route: index_2.Route }
};
exports.RWSannotations = RWSannotations;
const _command_1 = __importDefault(__nested_webpack_require_29032__(/*! ./commands/_command */ "../src/commands/_command.ts"));
exports.RWSCommand = _command_1.default;
const _model_1 = __importDefault(__nested_webpack_require_29032__(/*! ./models/_model */ "../src/models/_model.ts"));
exports.RWSModel = _model_1.default;
const _controller_1 = __importDefault(__nested_webpack_require_29032__(/*! ./controllers/_controller */ "../src/controllers/_controller.ts"));
exports.RWSController = _controller_1.default;
const _service_1 = __importDefault(__nested_webpack_require_29032__(/*! ./services/_service */ "../src/services/_service.ts"));
exports.RWSService = _service_1.default;
const _socket_1 = __importDefault(__nested_webpack_require_29032__(/*! ./sockets/_socket */ "../src/sockets/_socket.ts"));
exports.RWSSocket = _socket_1.default;
const index_3 = __importDefault(__nested_webpack_require_29032__(/*! ./commands/index */ "../src/commands/index.ts"));
exports.RWSAppCommands = index_3.default;
const RWSTestSuite = __importStar(__nested_webpack_require_29032__(/*! ./tests/index */ "../src/tests/index.ts"));
exports.RWSTestSuite = RWSTestSuite;
const RWSErrorCodes = __importStar(__nested_webpack_require_29032__(/*! ./errors/index */ "../src/errors/index.ts"));
exports.RWSErrorCodes = RWSErrorCodes;


/***/ }),

/***/ "../src/init.ts":
/*!**********************!*\
  !*** ../src/init.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_36716__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AppConfigService_1 = __importDefault(__nested_webpack_require_36716__(/*! ./services/AppConfigService */ "../src/services/AppConfigService.ts"));
const ServerService_1 = __importDefault(__nested_webpack_require_36716__(/*! ./services/ServerService */ "../src/services/ServerService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_36716__(/*! ./services/ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__nested_webpack_require_36716__(/*! ./services/UtilsService */ "../src/services/UtilsService.ts"));
const fs_1 = __importDefault(__nested_webpack_require_36716__(/*! fs */ "fs"));
const ProcessService_1 = __importDefault(__nested_webpack_require_36716__(/*! ./services/ProcessService */ "../src/services/ProcessService.ts"));
async function init(cfg, serverOptions = {}, addToConfig = null) {
    var _a;
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const port = await AppConfigService.get('port');
    const ws_port = await AppConfigService.get('ws_port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    const pub_dir = await AppConfigService.get('pub_dir');
    const cors_domain = await AppConfigService.get('cors_domain');
    const sslCert = AppConfigService.get('ssl_cert');
    const sslKey = AppConfigService.get('ssl_key');
    if (addToConfig !== null) {
        await addToConfig(AppConfigService);
    }
    let https = true;
    if (!sslCert || !sslKey) {
        https = false;
    }
    const executeDir = process.cwd();
    const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executeDir);
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    const moduleCfgFile = `${moduleCfgDir}/_rws_installed`;
    if (!fs_1.default.existsSync(moduleCfgFile)) {
        ConsoleService_1.default.log(ConsoleService_1.default.color().yellow('No config path generated for CLI. Trying to initialize with "yarn rws init config/config"'));
        await ProcessService_1.default.runShellCommand('yarn rws init config/config');
        UtilsService_1.default.setRWSVar('_rws_installed', 'OK');
    }
    const theServer = await ServerService_1.default.initializeApp({ ...{
            wsRoutes: wsRoutes,
            httpRoutes: httpRoutes,
            controllerList: controler_list,
            pub_dir: pub_dir,
            domain: `http${(await ((_a = AppConfigService.get('features')) === null || _a === void 0 ? void 0 : _a.ssl) ? 's' : '')}://${await AppConfigService.get('domain')}`,
            cors_domain: cors_domain
        }, ...serverOptions });
    const wsStart = async () => {
        return (await theServer.websocket.starter());
    };
    const httpStart = async () => {
        return (await theServer.http.starter());
    };
    wsStart();
    await httpStart();
}
exports["default"] = init;


/***/ }),

/***/ "../src/install.ts":
/*!*************************!*\
  !*** ../src/install.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_40071__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runShellCommand = exports.SetupRWS = void 0;
const AppConfigService_1 = __importDefault(__nested_webpack_require_40071__(/*! ./services/AppConfigService */ "../src/services/AppConfigService.ts"));
const _model_1 = __importDefault(__nested_webpack_require_40071__(/*! ./models/_model */ "../src/models/_model.ts"));
const fs_1 = __importDefault(__nested_webpack_require_40071__(/*! fs */ "fs"));
const path_1 = __importDefault(__nested_webpack_require_40071__(/*! path */ "path"));
__nested_webpack_require_40071__(/*! reflect-metadata */ "reflect-metadata");
const DBService_1 = __importDefault(__nested_webpack_require_40071__(/*! ./services/DBService */ "../src/services/DBService.ts"));
const TimeSeriesModel_1 = __importDefault(__nested_webpack_require_40071__(/*! ./models/types/TimeSeriesModel */ "../src/models/types/TimeSeriesModel.ts"));
const ProcessService_1 = __importDefault(__nested_webpack_require_40071__(/*! ./services/ProcessService */ "../src/services/ProcessService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_40071__(/*! ./services/ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__nested_webpack_require_40071__(/*! ./services/UtilsService */ "../src/services/UtilsService.ts"));
const { log, warn, error, color } = ConsoleService_1.default;
const { runShellCommand } = ProcessService_1.default;
exports.runShellCommand = runShellCommand;
function generateModelSections(constructor) {
    let section = '';
    // Get the prototype of the model instance
    const modelMetadatas = _model_1.default.getModelAnnotations(constructor); // Pass the class constructor   
    let embed = false;
    let modelName = constructor._collection;
    // if(Model.isSubclass(constructor, EmbedModel)){
    //   modelName = constructor.name;
    //   embed = true;
    //   throw new Error('Embed models are not supported');
    // }
    section += `model ${modelName} {\n`;
    section += `\tid String @map("_id") @id @default(auto()) @db.ObjectId\n`;
    for (const key in modelMetadatas) {
        const modelMetadata = modelMetadatas[key].metadata;
        const requiredString = modelMetadata.required ? '' : '?';
        const annotationType = modelMetadatas[key].annotationType;
        if (annotationType === 'Relation') {
            section += `\t${key} ${modelMetadata.relatedTo}${requiredString} @relation(fields: [${modelMetadata.relationField}], references: [${modelMetadata.relatedToField}])\n`;
            section += `\t${modelMetadata.relationField} String${requiredString} @db.ObjectId\n`;
        }
        else if (annotationType === 'InverseRelation') {
            section += `\t${key} ${modelMetadata.inversionModel}[]`;
        }
        else if (annotationType === 'InverseTimeSeries') {
            section += `\t${key} String[] @db.ObjectId`;
        }
        else if (annotationType === 'TrackType') {
            const tags = modelMetadata.tags.map((item) => '@' + item);
            section += `\t${key} ${toConfigCase(modelMetadata)}${requiredString} ${tags.join(' ')}\n`;
        }
    }
    section += `\n}`;
    return section;
}
function toConfigCase(modelType) {
    const type = modelType.type;
    const input = type.name;
    if (input == 'Number') {
        return 'Int';
    }
    if (input == 'Object') {
        return 'Json';
    }
    if (input == 'Date') {
        return 'DateTime';
    }
    const firstChar = input.charAt(0).toUpperCase();
    const restOfString = input.slice(1);
    return firstChar + restOfString;
}
async function main(cfg) {
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const dbUrl = await AppConfigService.get('mongo_url');
    const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist', '');
    const executionDir = path_1.default.resolve(process.cwd());
    const dbType = 'mongodb';
    let template = `generator client {\n
    provider = "prisma-client-js"\n
  }\n\n`;
    template += `\ndatasource db {\n
    provider = "${dbType}"\n
    url = env("DATABASE_URL")\n    
  }\n\n`;
    const usermodels = await AppConfigService.get('user_models');
    usermodels.forEach((model) => {
        const modelSection = generateModelSections(model);
        template += '\n\n' + modelSection;
        if (_model_1.default.isSubclass(model, TimeSeriesModel_1.default)) {
            DBService_1.default.collectionExists(model._collection).then((exists) => {
                if (exists) {
                    return;
                }
                log(color().green('[RWS Init]') + ` creating TimeSeries type collection from ${model} model`);
                DBService_1.default.createTimeSeriesCollection(model._collection);
            });
        }
    });
    const schemaPath = path_1.default.join(moduleDir, 'prisma', 'schema.prisma');
    fs_1.default.writeFileSync(schemaPath, template);
    process.env.DB_URL = dbUrl;
    // Define the command you want to run
    await ProcessService_1.default.runShellCommand('npx prisma generate --schema=' + schemaPath);
    log(color().green('[RWS Init]') + ' prisma schema generated from ', schemaPath);
    UtilsService_1.default.setRWSVar('_rws_installed', 'OK');
    return;
}
const SetupRWS = main;
exports.SetupRWS = SetupRWS;


/***/ }),

/***/ "../src/models/_model.ts":
/*!*******************************!*\
  !*** ../src/models/_model.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_45680__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackType = void 0;
const index_1 = __nested_webpack_require_45680__(/*! ../index */ "../src/index.ts");
const TrackType_1 = __importDefault(__nested_webpack_require_45680__(/*! ./annotations/TrackType */ "../src/models/annotations/TrackType.ts"));
exports.TrackType = TrackType_1.default;
class Model {
    constructor(data) {
        if (!this.getCollection()) {
            throw new Error('Model must have a collection defined');
        }
        if (!data) {
            return;
        }
        if (!this.hasTimeSeries()) {
            this._fill(data);
        }
        else {
            throw new Error('Time Series not supported in synchronous constructor. Use `await Model.create(data)` static method to instantiate this model.');
        }
    }
    _fill(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, this.constructor.prototype);
                if (meta) {
                    data[key] = {
                        create: data[key]
                    };
                }
                else {
                    this[key] = data[key];
                }
            }
        }
        return this;
    }
    async _asyncFill(data) {
        const collections_to_models = {};
        const timeSeriesIds = this.getTimeSeriesModelFields();
        const _self = this;
        this.loadModels().forEach((model) => {
            collections_to_models[model.getCollection()] = model;
        });
        const seriesHydrationfields = [];
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (seriesHydrationfields.includes(key)) {
                    continue;
                }
                const timeSeriesMetaData = timeSeriesIds[key];
                if (timeSeriesMetaData) {
                    this[key] = data[key];
                    const seriesModel = collections_to_models[timeSeriesMetaData.collection];
                    const dataModels = await seriesModel.findBy({
                        id: { in: data[key] }
                    });
                    seriesHydrationfields.push(timeSeriesMetaData.hydrationField);
                    this[timeSeriesMetaData.hydrationField] = dataModels;
                }
                else {
                    this[key] = data[key];
                }
            }
        }
        return this;
    }
    getTimeSeriesModelFields() {
        const timeSeriesIds = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, this);
                if (meta) {
                    if (!timeSeriesIds[key]) {
                        timeSeriesIds[key] = {
                            collection: meta.timeSeriesModel,
                            hydrationField: meta.hydrationField,
                            ids: this[key]
                        };
                    }
                }
            }
        }
        return timeSeriesIds;
    }
    toMongo() {
        let data = {};
        const timeSeriesIds = this.getTimeSeriesModelFields();
        const timeSeriesHydrationFields = [];
        for (const key in this) {
            if (!this.isDbVariable(key)) {
                continue;
            }
            if (this.hasOwnProperty(key) && !(this.constructor._BANNED_KEYS || Model._BANNED_KEYS).includes(key) && !timeSeriesHydrationFields.includes(key)) {
                data[key] = this[key];
            }
            if (!!timeSeriesIds[key]) {
                data[key] = this[key];
                timeSeriesHydrationFields.push(timeSeriesIds[key].hydrationField);
            }
        }
        return data;
    }
    getCollection() {
        return this.constructor._collection || this._collection;
    }
    static getCollection() {
        return this.constructor._collection || this._collection;
    }
    async save() {
        const data = this.toMongo();
        let updatedModelData = data;
        if (this.id) {
            this.preUpdate();
            updatedModelData = await index_1.DBService.update(data, this.getCollection());
            await this._asyncFill(updatedModelData);
            this.postUpdate();
        }
        else {
            this.preCreate();
            const timeSeriesModel = await Promise.resolve().then(() => __importStar(__nested_webpack_require_45680__(/*! ./types/TimeSeriesModel */ "../src/models/types/TimeSeriesModel.ts")));
            const isTimeSeries = this instanceof timeSeriesModel.default;
            updatedModelData = await index_1.DBService.insert(data, this.getCollection(), isTimeSeries);
            await this._asyncFill(updatedModelData);
            this.postCreate();
        }
        return this;
    }
    static getModelAnnotations(constructor) {
        const annotationsData = {};
        const propertyKeys = Reflect.getMetadataKeys(constructor.prototype).map((item) => {
            return item.split(':')[1];
        });
        propertyKeys.forEach(key => {
            if (String(key) == 'id') {
                return;
            }
            const annotations = ['TrackType', 'Relation', 'InverseRelation', 'InverseTimeSeries'];
            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;
                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
                if (meta) {
                    annotationsData[String(key)] = { annotationType: annotation, metadata: meta };
                }
            });
        });
        return annotationsData;
    }
    preUpdate() {
        return;
    }
    postUpdate() {
        return;
    }
    preCreate() {
        return;
    }
    postCreate() {
        return;
    }
    static isSubclass(constructor, baseClass) {
        return baseClass.prototype.isPrototypeOf(constructor.prototype);
    }
    hasTimeSeries() {
        return Model.checkTimeSeries(this.constructor);
    }
    static checkTimeSeries(constructor) {
        const data = constructor.prototype;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (Reflect.getMetadata(`InverseTimeSeries:${key}`, constructor.prototype)) {
                    return true;
                }
            }
        }
        return false;
    }
    isDbVariable(variable) {
        return Model.checkDbVariable(this.constructor, variable);
    }
    static checkDbVariable(constructor, variable) {
        if (variable === 'id') {
            return true;
        }
        const data = constructor.prototype;
        const dbAnnotations = Model.getModelAnnotations(constructor);
        const dbProperties = Object.keys(dbAnnotations).map((key) => { return { ...dbAnnotations[key], key }; }).filter((element) => element.annotationType === 'TrackType').map((element) => element.key);
        return dbProperties.includes(variable);
    }
    sanitizeDBData(data) {
        const dataKeys = Object.keys(data);
        const sanitizedData = {};
        for (const key of dataKeys) {
            if (this.isDbVariable(key)) {
                sanitizedData[key] = data[key];
            }
        }
        return sanitizedData;
    }
    static async watchCollection(preRun) {
        const collection = Reflect.get(this, '_collection');
        return await index_1.DBService.watchCollection(collection, preRun);
    }
    static async findOneBy(conditions) {
        const collection = Reflect.get(this, '_collection');
        const dbData = await index_1.DBService.findOneBy(collection, conditions);
        if (dbData) {
            const inst = new this();
            return await inst._asyncFill(dbData);
        }
        return null;
    }
    static async delete(conditions) {
        const collection = Reflect.get(this, '_collection');
        return await index_1.DBService.delete(collection, conditions);
    }
    async delete() {
        const collection = Reflect.get(this, '_collection');
        return await index_1.DBService.delete(collection, {
            id: this.id
        });
    }
    static async findBy(conditions, fields = null) {
        const collection = Reflect.get(this, '_collection');
        const dbData = await index_1.DBService.findBy(collection, conditions, fields);
        if (dbData.length) {
            const instanced = [];
            for (const data of dbData) {
                const inst = new this();
                instanced.push((await inst._asyncFill(data)));
            }
            return instanced;
        }
        return [];
    }
    static async create(data) {
        const newModel = new this();
        const sanitizedData = newModel.sanitizeDBData(data);
        await newModel._asyncFill(sanitizedData);
        return newModel;
    }
    loadModels() {
        const AppConfigService = (0, index_1.getAppConfig)();
        return AppConfigService.get('user_models');
    }
}
Model._collection = null;
Model._BANNED_KEYS = ['_collection'];
__decorate([
    (0, TrackType_1.default)(String),
    __metadata("design:type", String)
], Model.prototype, "id", void 0);
exports["default"] = Model;


/***/ }),

/***/ "../src/models/annotations/InverseRelation.ts":
/*!****************************************************!*\
  !*** ../src/models/annotations/InverseRelation.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __nested_webpack_require_57200__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__nested_webpack_require_57200__(/*! reflect-metadata */ "reflect-metadata");
function InverseRelation(inversionModel) {
    let metaOpts = {
        inversionModel: inversionModel
    };
    return function (target, key) {
        Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
    };
}
exports["default"] = InverseRelation;


/***/ }),

/***/ "../src/models/annotations/InverseTimeSeries.ts":
/*!******************************************************!*\
  !*** ../src/models/annotations/InverseTimeSeries.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __nested_webpack_require_57931__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__nested_webpack_require_57931__(/*! reflect-metadata */ "reflect-metadata");
function InverseTimeSeries(timeSeriesModel, hydrationField) {
    let metaOpts = {
        timeSeriesModel: timeSeriesModel,
        hydrationField: hydrationField
    };
    return function (target, key) {
        Reflect.defineMetadata(`InverseTimeSeries:${key}`, metaOpts, target);
    };
}
exports["default"] = InverseTimeSeries;


/***/ }),

/***/ "../src/models/annotations/Relation.ts":
/*!*********************************************!*\
  !*** ../src/models/annotations/Relation.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __nested_webpack_require_58691__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__nested_webpack_require_58691__(/*! reflect-metadata */ "reflect-metadata");
function Relation(relatedTo, required = false, relationField = null, relatedToField = 'id') {
    let metaOpts = { required };
    metaOpts.relatedToField = relatedToField;
    metaOpts.relatedTo = relatedTo;
    if (!relationField) {
        metaOpts.relationField = relatedTo + '_id';
    }
    else {
        metaOpts.relationField = relationField;
    }
    return function (target, key) {
        Reflect.defineMetadata(`Relation:${key}`, metaOpts, target);
    };
}
exports["default"] = Relation;


/***/ }),

/***/ "../src/models/annotations/TrackType.ts":
/*!**********************************************!*\
  !*** ../src/models/annotations/TrackType.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __nested_webpack_require_59624__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__nested_webpack_require_59624__(/*! reflect-metadata */ "reflect-metadata");
function TrackType(type, opts = null, tags = []) {
    if (!opts) {
        opts = {
            required: false
        };
    }
    const required = opts.required;
    let metaOpts = { type, tags, required };
    if (opts.relatedToField && opts.relatedTo) {
        metaOpts.relatedToField = opts.relatedToField;
        metaOpts.relatedTo = opts.relatedTo;
        if (!opts.relationField) {
            metaOpts.relationField = opts.relatedTo + '_id';
        }
        else {
            metaOpts.relationField = opts.relationField;
        }
    }
    if (opts.inversionModel) {
        metaOpts.inversionModel = opts.inversionModel;
    }
    const resolvedType = typeof type === 'function' ? type() : type;
    if (!!type._collection) {
        metaOpts.type = type;
    }
    return function (target, key) {
        Reflect.defineMetadata(`TrackType:${key}`, metaOpts, target);
    };
}
exports["default"] = TrackType;


/***/ }),

/***/ "../src/models/annotations/index.ts":
/*!******************************************!*\
  !*** ../src/models/annotations/index.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_60974__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InverseTimeSeries = exports.TrackType = exports.Relation = exports.InverseRelation = void 0;
const InverseRelation_1 = __importDefault(__nested_webpack_require_60974__(/*! ./InverseRelation */ "../src/models/annotations/InverseRelation.ts"));
exports.InverseRelation = InverseRelation_1.default;
const Relation_1 = __importDefault(__nested_webpack_require_60974__(/*! ./Relation */ "../src/models/annotations/Relation.ts"));
exports.Relation = Relation_1.default;
const TrackType_1 = __importDefault(__nested_webpack_require_60974__(/*! ./TrackType */ "../src/models/annotations/TrackType.ts"));
exports.TrackType = TrackType_1.default;
const InverseTimeSeries_1 = __importDefault(__nested_webpack_require_60974__(/*! ./InverseTimeSeries */ "../src/models/annotations/InverseTimeSeries.ts"));
exports.InverseTimeSeries = InverseTimeSeries_1.default;


/***/ }),

/***/ "../src/models/convo/ConvoLoader.ts":
/*!******************************************!*\
  !*** ../src/models/convo/ConvoLoader.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_62273__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const text_1 = __nested_webpack_require_62273__(/*! langchain/document_loaders/fs/text */ "langchain/document_loaders/fs/text");
const text_splitter_1 = __nested_webpack_require_62273__(/*! langchain/text_splitter */ "langchain/text_splitter");
const VectorStoreService_1 = __importDefault(__nested_webpack_require_62273__(/*! ../../services/VectorStoreService */ "../src/services/VectorStoreService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_62273__(/*! ../../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const document_1 = __nested_webpack_require_62273__(/*! langchain/document */ "langchain/document");
const uuid_1 = __nested_webpack_require_62273__(/*! uuid */ "uuid");
const AppConfigService_1 = __importDefault(__nested_webpack_require_62273__(/*! ../../services/AppConfigService */ "../src/services/AppConfigService.ts"));
const chains_1 = __nested_webpack_require_62273__(/*! langchain/chains */ "langchain/chains");
const errors_1 = __nested_webpack_require_62273__(/*! ../../errors */ "../src/errors/index.ts");
const xml2js_1 = __importDefault(__nested_webpack_require_62273__(/*! xml2js */ "xml2js"));
const fs_1 = __importDefault(__nested_webpack_require_62273__(/*! fs */ "fs"));
const path_1 = __importDefault(__nested_webpack_require_62273__(/*! path */ "path"));
const logConvo = (txt) => {
    ConsoleService_1.default.rwsLog(ConsoleService_1.default.color().blueBright(txt));
};
class ConvoLoader {
    constructor(chatConstructor, embeddings, convoId = null, baseSplitterParams = {
        chunkSize: 400, chunkOverlap: 80, separators: ["/n/n", "."]
    }) {
        this.docs = [];
        this._initiated = false;
        this.avgDocLength = (documents) => {
            return documents.reduce((sum, doc) => sum + doc.pageContent.length, 0) / documents.length;
        };
        this.embeddings = embeddings;
        if (convoId === null) {
            this.convo_id = ConvoLoader.uuid();
        }
        else {
            this.convo_id = convoId;
        }
        this.chatConstructor = chatConstructor;
        this._baseSplitterParams = baseSplitterParams;
    }
    static uuid() {
        return (0, uuid_1.v4)();
    }
    async splitDocs(filePath, params) {
        const splitDir = ConvoLoader.debugSplitDir(this.getId());
        if (!fs_1.default.existsSync(splitDir)) {
            console.log(`Split dir ${ConsoleService_1.default.color().magentaBright(splitDir)} doesn't exist. Splitting docs...`);
            this.loader = new text_1.TextLoader(filePath);
            this.docSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: params.chunkSize, // The size of the chunk that should be split.
                chunkOverlap: params.chunkOverlap, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
                separators: params.separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
            });
            fs_1.default.mkdirSync(splitDir, { recursive: true });
            const orgDocs = await this.loader.load();
            const splitDocs = await this.docSplitter.splitDocuments(orgDocs);
            const avgCharCountPre = this.avgDocLength(orgDocs);
            const avgCharCountPost = this.avgDocLength(splitDocs);
            logConvo(`Average length among ${orgDocs.length} documents loaded is ${avgCharCountPre} characters.`);
            logConvo(`After the split we have ${splitDocs.length} documents more than the original ${orgDocs.length}.`);
            logConvo(`Average length among ${orgDocs.length} documents (after split) is ${avgCharCountPost} characters.`);
            this.docs = splitDocs;
            let i = 0;
            this.docs.forEach((doc) => {
                fs_1.default.writeFileSync(this.debugSplitFile(i), doc.pageContent);
                i++;
            });
        }
        else {
            const splitFiles = fs_1.default.readdirSync(splitDir);
            for (const filePath of splitFiles) {
                const txt = fs_1.default.readFileSync(splitDir + '/' + filePath, 'utf-8');
                this.docs.push(new document_1.Document({ pageContent: txt }));
            }
            ;
        }
        this.store = await VectorStoreService_1.default.createStore(this.docs, await this.embeddings.generateEmbeddings());
    }
    getId() {
        return this.convo_id;
    }
    getDocs() {
        return this.docs;
    }
    getStore() {
        return this.store;
    }
    isInitiated() {
        return this._initiated;
    }
    setPrompt(prompt) {
        this.thePrompt = prompt;
        this.llmChat = new this.chatConstructor({
            streaming: true,
            region: (0, AppConfigService_1.default)().get('aws_bedrock_region'),
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            },
            model: "anthropic.claude-v2",
            maxTokens: prompt.getHyperParameter('max_tokens_to_sample'),
            temperature: prompt.getHyperParameter('temperature'),
            modelKwargs: {
                top_p: prompt.getHyperParameter('top_p'),
                top_k: prompt.getHyperParameter('top_k'),
            }
        });
        return this;
    }
    getChat() {
        return this.llmChat;
    }
    async call(values, cfg, debugCallback = null) {
        const output = await (this.chain()).invoke(values, cfg);
        this.thePrompt.listen(output.text);
        await this.debugCall(debugCallback);
        return this.thePrompt;
    }
    async *callStreamGenerator(values, cfg, debugCallback = null) {
        // const _self = this;
        // const chain = this.chain() as ConversationChain;  
        // console.log('call stream');      
        // const stream = await chain.call(values, [{
        //         handleLLMNewToken(token: string) {
        //             yield token;
        //         }
        //     }
        // ]);
        // console.log('got stream');
        // Listen to the stream and yield data chunks as they come
        // for await (const chunk of stream) {                  
        //     yield chunk.response;
        // }
    }
    async callStream(values, callback, end = () => { }, cfg = {}, debugCallback) {
        const _self = this;
        const callGenerator = this.callStreamGenerator({ query: values.query }, cfg, debugCallback);
        await this.chain().invoke(values, { callbacks: [{
                    handleLLMNewToken(token) {
                        callback({
                            content: token,
                            status: 'rws_streaming'
                        });
                        _self.thePrompt.listen(token, true);
                    }
                }
            ] });
        end();
        this.debugCall(debugCallback);
        return this.thePrompt;
    }
    ;
    async similaritySearch(query, splitCount) {
        console.log('Store is ready. Searching for embedds...');
        const texts = await this.getStore().getFaiss().similaritySearchWithScore(`${query}`, splitCount);
        console.log('Found best parts: ' + texts.length);
        return texts.map(([doc, score]) => `${doc["pageContent"]}`).join('\n\n');
    }
    async debugCall(debugCallback = null) {
        try {
            const debug = this.initDebugFile();
            let callData = debug.xml;
            callData.conversation.message.push(this.thePrompt.toJSON());
            if (debugCallback) {
                callData = await debugCallback(callData);
            }
            this.debugSave(callData);
        }
        catch (error) {
            console.log(error);
        }
    }
    chain() {
        if (this.llmChain) {
            return this.llmChain;
        }
        if (!this.thePrompt) {
            throw new errors_1.Error500(new Error('No prompt initialized for conversation'), __filename);
        }
        const chainParams = {
            prompt: this.thePrompt.getMultiTemplate()
        };
        this.createChain(chainParams);
        return this.llmChain;
    }
    async createChain(input) {
        this.llmChain = new chains_1.ConversationChain({
            llm: this.llmChat,
            prompt: input.prompt,
        });
        return this.llmChain;
    }
    async waitForInit() {
        const _self = this;
        return new Promise((resolve, reject) => {
            let i = 0;
            const interval = setInterval(() => {
                if (this.isInitiated()) {
                    clearInterval(interval);
                    resolve(_self);
                }
                if (i > 9) {
                    clearInterval(interval);
                    reject(null);
                }
                i++;
            }, 300);
        });
    }
    parseXML(xml, callback) {
        const parser = new xml2js_1.default.Parser();
        parser.parseString(xml, callback);
        return parser;
    }
    static debugConvoDir(id) {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations', id);
    }
    static debugSplitDir(id) {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations', id, 'split');
    }
    debugConvoFile() {
        return `${ConvoLoader.debugConvoDir(this.getId())}/conversation.xml`;
    }
    debugSplitFile(i) {
        return `${ConvoLoader.debugSplitDir(this.getId())}/${i}.splitfile`;
    }
    initDebugFile() {
        let xmlContent;
        let debugXML = null;
        const convoDir = ConvoLoader.debugConvoDir(this.getId());
        if (!fs_1.default.existsSync(convoDir)) {
            fs_1.default.mkdirSync(convoDir, { recursive: true });
        }
        const convoFilePath = this.debugConvoFile();
        if (!fs_1.default.existsSync(convoFilePath)) {
            xmlContent = `<conversation id="conversation"></conversation>`;
            fs_1.default.writeFileSync(convoFilePath, xmlContent);
        }
        else {
            xmlContent = fs_1.default.readFileSync(convoFilePath, 'utf-8');
        }
        this.parseXML(xmlContent, (error, result) => {
            debugXML = result;
        });
        if (!debugXML.conversation.message) {
            debugXML.conversation.message = [];
        }
        return { xml: debugXML, path: convoFilePath };
    }
    debugSave(xml) {
        const builder = new xml2js_1.default.Builder();
        fs_1.default.writeFileSync(this.debugConvoFile(), builder.buildObject(xml), 'utf-8');
    }
}
exports["default"] = ConvoLoader;


/***/ }),

/***/ "../src/models/convo/VectorStore.ts":
/*!******************************************!*\
  !*** ../src/models/convo/VectorStore.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __nested_webpack_require_73416__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const faiss_1 = __nested_webpack_require_73416__(/*! @langchain/community/vectorstores/faiss */ "@langchain/community/vectorstores/faiss");
class RWSVectorStore {
    constructor(docs, embeddings) {
        this.docs = docs;
        this.embeddings = embeddings;
    }
    async init() {
        this.faiss = await faiss_1.FaissStore.fromDocuments(this.docs, this.embeddings);
        return this;
    }
    getFaiss() {
        return this.faiss;
    }
}
exports["default"] = RWSVectorStore;


/***/ }),

/***/ "../src/models/prompts/_prompt.ts":
/*!****************************************!*\
  !*** ../src/models/prompts/_prompt.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class RWSPrompt {
    constructor(params) {
        this.output = '';
        this.varStorage = {};
        this.onStream = (chunk) => {
        };
        this.input = params.input;
        this.originalInput = params.input;
        this.hyperParameters = params.hyperParameters;
        this.modelId = params.modelId;
        this.modelType = params.modelType;
        this.created_at = new Date();
    }
    listen(source, stream = true) {
        this.output = '';
        if (!stream) {
            this.output = source;
        }
        else {
            this.output += source;
            this.onStream(source);
        }
        return this;
    }
    setStreamCallback(callback) {
        this.onStream = callback;
    }
    addEnchantment(enchantment) {
        this.enhancedInput.push(enchantment);
        this.input = enchantment.input;
    }
    getEnchantedInput() {
        return this.enhancedInput[this.enhancedInput.length - 1].output;
    }
    getModelId() {
        return this.modelId;
    }
    readSentInput() {
        return this.sentInput;
    }
    readInput() {
        return this.input;
    }
    readBaseInput() {
        return this.originalInput;
    }
    setBaseInput(input) {
        this.originalInput = input;
        return this;
    }
    injestOutput(content) {
        this.output = content;
        return this;
    }
    readOutput() {
        return this.output;
    }
    getHyperParameters(base = null) {
        if (base) {
            this.hyperParameters = { ...base, ...this.hyperParameters };
        }
        return this.hyperParameters;
    }
    getHyperParameter(key) {
        if (!this.hyperParameters[key]) {
            return null;
        }
        return this.hyperParameters[key];
    }
    setHyperParameter(key, value) {
        this.hyperParameters[key] = value;
        return this;
    }
    setHyperParameters(value) {
        this.hyperParameters = value;
        return this;
    }
    setMultiTemplate(template) {
        this.multiTemplate = template;
        return this;
    }
    getMultiTemplate() {
        return this.multiTemplate;
    }
    setConvo(convo) {
        this.convo = convo.setPrompt(this);
        return this;
    }
    getConvo() {
        return this.convo;
    }
    replacePromptVar(key, val) {
    }
    getModelMetadata() {
        return [this.modelType, this.modelId];
    }
    async requestWith(executor, intruderPrompt = null, debugVars = {}) {
        this.sentInput = this.input;
        const returnedRWS = await executor.promptRequest(this, null, intruderPrompt, debugVars);
        this.output = returnedRWS.readOutput();
    }
    async singleRequestWith(executor, intruderPrompt = null) {
        await executor.singlePromptRequest(this, null, intruderPrompt);
        this.sentInput = this.input;
    }
    async streamWith(executor, read, end = () => { }, debugVars = {}) {
        return executor.promptStream(this, read, end, debugVars);
    }
    setInput(content) {
        this.input = content;
        return this;
    }
    getVar(key) {
        return Object.keys(this.varStorage).includes(key) ? this.varStorage[key] : null;
    }
    setVar(key, val) {
        this.varStorage[key] = val;
        return this;
    }
    async _oldreadStream(stream, react) {
        let first = true;
        const chunks = []; // Replace 'any' with the actual type of your chunks
        for await (const event of stream) {
            // Assuming 'event' has a specific structure. Adjust according to actual event structure.
            if ('chunk' in event && event.chunk.bytes) {
                const chunk = JSON.parse(Buffer.from(event.chunk.bytes).toString("utf-8"));
                if (first) {
                    console.log('chunk', chunk);
                    first = false;
                }
                react(chunk.completion);
                chunks.push(chunk.completion || chunk.generation); // Use the actual property of 'chunk' you're interested in
            }
            else if ('internalServerException' in event ||
                'modelStreamErrorException' in event ||
                'throttlingException' in event ||
                'validationException' in event) {
                console.error(event);
                break;
            }
        }
    }
    async isChainStreamType(source) {
        if (source && typeof source[Symbol.asyncIterator] === 'function') {
            const asyncIterator = source[Symbol.asyncIterator]();
            if (typeof asyncIterator.next === 'function' &&
                typeof asyncIterator.throw === 'function' &&
                typeof asyncIterator.return === 'function') {
                try {
                    // Optionally check if the next method yields a value of the expected type
                    const { value, done } = await asyncIterator.next();
                    return !done && value instanceof ReadableStream; // or whatever check makes sense for IterableReadableStream<ChainValues>
                }
                catch (error) {
                    // Handle or ignore error
                }
            }
        }
        return false;
    }
    async readStreamAsText(readableStream, callback) {
        const reader = readableStream.getReader();
        let readResult;
        // Continuously read from the stream
        while (!(readResult = await reader.read()).done) {
            if (readResult.value && readResult.value.response) {
                // Emit each chunk text as it's read
                callback(readResult.value.response);
            }
        }
    }
    toJSON() {
        return {
            input: this.input,
            enhancedInput: this.enhancedInput,
            sentInput: this.sentInput,
            originalInput: this.originalInput,
            output: this.output,
            modelId: this.modelId,
            modelType: this.modelType,
            multiTemplate: this.multiTemplate,
            convo: {
                id: this.convo.getId()
            },
            hyperParameters: this.hyperParameters,
            varStorage: this.varStorage,
            created_at: this.created_at.toISOString()
        };
    }
}
exports["default"] = RWSPrompt;


/***/ }),

/***/ "../src/models/types/TimeSeriesModel.ts":
/*!**********************************************!*\
  !*** ../src/models/types/TimeSeriesModel.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_80814__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _model_1 = __importStar(__nested_webpack_require_80814__(/*! ../_model */ "../src/models/_model.ts"));
class TimeSeriesModel extends _model_1.default {
    constructor(data) {
        super(data);
        if (!this.timestamp) {
            this.timestamp = new Date();
        }
    }
}
exports["default"] = TimeSeriesModel;
__decorate([
    (0, _model_1.TrackType)(Number),
    __metadata("design:type", Number)
], TimeSeriesModel.prototype, "value", void 0);
__decorate([
    (0, _model_1.TrackType)(Date),
    __metadata("design:type", Date)
], TimeSeriesModel.prototype, "timestamp", void 0);
__decorate([
    (0, _model_1.TrackType)(Object),
    __metadata("design:type", Object)
], TimeSeriesModel.prototype, "params", void 0);


/***/ }),

/***/ "../src/routing/annotations/Route.ts":
/*!*******************************************!*\
  !*** ../src/routing/annotations/Route.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __nested_webpack_require_83667__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__nested_webpack_require_83667__(/*! reflect-metadata */ "reflect-metadata");
function Route(name, method = 'GET', params = { responseType: 'json' }) {
    let metaOpts = { name, method, params };
    return function (target, key) {
        Reflect.defineMetadata(`Route:${key}`, metaOpts, target);
    };
}
exports["default"] = Route;


/***/ }),

/***/ "../src/routing/annotations/index.ts":
/*!*******************************************!*\
  !*** ../src/routing/annotations/index.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_84351__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Route = void 0;
const Route_1 = __importDefault(__nested_webpack_require_84351__(/*! ./Route */ "../src/routing/annotations/Route.ts"));
exports.Route = Route_1.default;


/***/ }),

/***/ "../src/services/APIGatewayService.ts":
/*!********************************************!*\
  !*** ../src/services/APIGatewayService.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_85017__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_85017__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_85017__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const AWSService_1 = __importDefault(__nested_webpack_require_85017__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const LambdaService_1 = __importDefault(__nested_webpack_require_85017__(/*! ./LambdaService */ "../src/services/LambdaService.ts"));
const VPCService_1 = __importDefault(__nested_webpack_require_85017__(/*! ./VPCService */ "../src/services/VPCService.ts"));
const { log, error, rwsLog } = ConsoleService_1.default;
class APIGatewayService extends _service_1.default {
    constructor() {
        super();
        this.region = AWSService_1.default.getRegion();
    }
    async findApiGateway(gatewayName) {
        let theApi = null;
        const apis = await AWSService_1.default.getAPIGateway().getRestApis().promise();
        for (const api of apis.items) {
            if (api.name === gatewayName + '-API') {
                theApi = api;
                break;
            }
        }
        return theApi;
    }
    async deleteApiGateway(apiId) {
        await AWSService_1.default.getAPIGateway().deleteRestApi({ restApiId: apiId }).promise();
        error('Deleted API Gateway: ' + apiId);
    }
    async createApiGateway(gatewayName) {
        const currentGateway = await this.findApiGateway(gatewayName);
        let restApiId = null;
        if (!currentGateway) {
            const params = {
                name: gatewayName + '-API',
                description: `API Gateway for ${gatewayName}`,
                endpointConfiguration: {
                    types: ["REGIONAL"]
                }
            };
            try {
                const response = await AWSService_1.default.getAPIGateway().createRestApi(params).promise();
                restApiId = response.id || null;
            }
            catch (err) {
                error('Error creating API Gateway:', err);
                throw err;
            }
        }
        else {
            restApiId = currentGateway.id;
        }
        return restApiId;
    }
    async createResource(restApiId, resourceLabel) {
        const resources = await AWSService_1.default.getAPIGateway().getResources({ restApiId: restApiId }).promise();
        const rootResource = resources.items.find(r => r.path === '/');
        // Create a new resource under root (if it doesn't exist)
        let resource;
        const resourceName = resourceLabel + '-ENDPOINT';
        for (const res of resources.items) {
            if (res.pathPart === resourceName) {
                resource = res;
                break;
            }
        }
        if (!resource) {
            resource = await AWSService_1.default.getAPIGateway().createResource({
                restApiId: restApiId,
                parentId: rootResource.id,
                pathPart: resourceName
            }).promise();
        }
        return resource;
    }
    async createMethod(restApiId, resource, httpMethod = 'GET') {
        return await AWSService_1.default.getAPIGateway().putMethod({
            restApiId: restApiId,
            resourceId: resource.id,
            httpMethod: httpMethod,
            authorizationType: "NONE", // Change this if you want to use an authorizer
            apiKeyRequired: false
        }).promise();
    }
    async associateNATGatewayWithLambda(lambdaFunctionName) {
        rwsLog(`Creating NAT Gateway for "${lambdaFunctionName}" lambda function`);
        const lambdaConfig = { ...(await LambdaService_1.default.getLambdaFunction(lambdaFunctionName)).Configuration };
        const privateSubnetId = lambdaConfig.VpcConfig.SubnetIds[0];
        // const publicSubnet = await VPCService.createPublicSubnet(lambdaConfig.VpcConfig.VpcId, 20);    
        // const publicSubnetId = publicSubnet.Subnet.SubnetId;
        try {
            const eip = await AWSService_1.default.getEC2().allocateAddress({}).promise();
            if (!eip.AllocationId) {
                throw new Error('Failed to allocate Elastic IP.');
            }
            const natGateway = await AWSService_1.default.getEC2().createNatGateway({
                SubnetId: privateSubnetId,
                AllocationId: eip.AllocationId
            }).promise();
            const routeTable = await VPCService_1.default.getDefaultRouteTable(lambdaConfig.VpcConfig.VpcId);
            if (!routeTable) {
                throw new Error('No route table exists.');
            }
            await VPCService_1.default.waitForNatGatewayAvailable(natGateway.NatGateway.NatGatewayId);
            await AWSService_1.default.getEC2().createRoute({
                RouteTableId: routeTable.RouteTableId,
                DestinationCidrBlock: '0.0.0.0/0',
                NatGatewayId: natGateway.NatGateway.NatGatewayId
            }).promise();
            rwsLog('Lambda function associated with NAT Gateway successfully.');
        }
        catch (e) {
            error(e.code, e.message);
        }
    }
}
exports["default"] = APIGatewayService.getSingleton();


/***/ }),

/***/ "../src/services/AWSService.ts":
/*!*************************************!*\
  !*** ../src/services/AWSService.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_90647__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_90647__(/*! ./_service */ "../src/services/_service.ts"));
const AppConfigService_1 = __importDefault(__nested_webpack_require_90647__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_90647__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const aws_sdk_1 = __importDefault(__nested_webpack_require_90647__(/*! aws-sdk */ "aws-sdk"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
class AWSService extends _service_1.default {
    constructor() {
        super();
    }
    _initApis(region) {
        if (!region) {
            this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        }
        else {
            this.region = region;
        }
        // console.log(region,this.s3, this.region)
        if (!this.s3 && this.region) {
            this.s3 = new aws_sdk_1.default.S3({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.apiGateway && this.region) {
            this.apiGateway = new aws_sdk_1.default.APIGateway({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.iam && this.region) {
            this.iam = new aws_sdk_1.default.IAM({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.efs && this.region) {
            this.efs = new aws_sdk_1.default.EFS({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.ec2 && this.region) {
            this.ec2 = new aws_sdk_1.default.EC2({
                region: (0, AppConfigService_1.default)().get('aws_lambda_region'),
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.lambda && this.region) {
            this.lambda = new aws_sdk_1.default.Lambda({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.cloudWatch && this.region) {
            this.cloudWatch = new aws_sdk_1.default.CloudWatchLogs({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
    }
    async checkForRolePermissions(roleARN, permissions) {
        const { OK, policies } = await this.firePermissionCheck(roleARN, permissions);
        return {
            OK,
            policies
        };
    }
    async firePermissionCheck(roleARN, permissions) {
        const params = {
            PolicySourceArn: roleARN, // Replace with your IAM role ARN
            ActionNames: permissions
        };
        const policies = [];
        let allowed = true;
        try {
            const data = await this.getIAM().simulatePrincipalPolicy(params).promise();
            for (let result of data.EvaluationResults) {
                if (result.EvalDecision !== 'allowed') {
                    allowed = false;
                    policies.push(result.EvalActionName);
                }
            }
        }
        catch (err) {
            error('Permission check error:');
            log(err);
            allowed = false;
        }
        return {
            OK: allowed,
            policies: policies
        };
    }
    getS3(region) {
        this._initApis(region);
        return this.s3;
    }
    getEC2(region) {
        this._initApis(region);
        return this.ec2;
    }
    getEFS(region) {
        this._initApis(region);
        return this.efs;
    }
    getLambda(region) {
        this._initApis(region);
        return this.lambda;
    }
    getRegion(region) {
        this._initApis(region);
        return this.region;
    }
    getIAM(region) {
        this._initApis(region);
        return this.iam;
    }
    getAPIGateway(region) {
        this._initApis(region);
        return this.apiGateway;
    }
    getCloudWatch(region) {
        this._initApis(region);
        return this.cloudWatch;
    }
}
exports["default"] = AWSService.getSingleton();


/***/ }),

/***/ "../src/services/AppConfigService.ts":
/*!*******************************************!*\
  !*** ../src/services/AppConfigService.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_96617__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppConfigService = void 0;
const _service_1 = __importDefault(__nested_webpack_require_96617__(/*! ./_service */ "../src/services/_service.ts"));
const AppDefaultConfig = {
    mongo_url: null,
    mongo_db: null,
    port: null,
    ws_port: null,
    test_port: null,
    test_ws_port: null,
    domain: null,
    ssl_cert: null,
    ssl_key: null,
    secret_key: null,
    user_class: null,
    user_models: [],
    controller_list: [],
    ws_routes: {},
    http_routes: [],
    commands: [],
    aws_lambda_region: null,
    aws_access_key: null,
    aws_secret_key: null,
    aws_lambda_role: null,
    aws_lambda_bucket: null,
    pub_dir: null
};
class AppConfigService extends _service_1.default {
    constructor(cfg) {
        super();
        this._custom_data = {};
        this.data = cfg;
    }
    get(key) {
        if (key in this.data && this.data[key] !== null) {
            return this.data[key];
        }
        if (key in this._custom_data) {
            return this._custom_data[key];
        }
        return null;
    }
    set(key, val) {
        this._custom_data[key] = val;
    }
    reloadConfig(cfgString) {
        const cfg = (__nested_webpack_require_96617__("../src/services sync recursive")(cfgString)).defaults;
        this.data = cfg();
        return this;
    }
    static getConfigSingleton(cfg) {
        const className = this.name;
        const instanceExists = _service_1.default._instances[className];
        if (cfg) {
            _service_1.default._instances[className] = new this(cfg);
        }
        else if (!instanceExists && !cfg) {
            _service_1.default._instances[className] = new this(AppDefaultConfig);
        }
        return _service_1.default._instances[className];
    }
}
exports.AppConfigService = AppConfigService;
exports["default"] = (cfg) => AppConfigService.getConfigSingleton(cfg);


/***/ }),

/***/ "../src/services/AuthService.ts":
/*!**************************************!*\
  !*** ../src/services/AuthService.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_98950__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AppConfigService_1 = __importDefault(__nested_webpack_require_98950__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const jsonwebtoken_1 = __importDefault(__nested_webpack_require_98950__(/*! jsonwebtoken */ "jsonwebtoken"));
const _service_1 = __importDefault(__nested_webpack_require_98950__(/*! ./_service */ "../src/services/_service.ts"));
/**
 * @notExported
 */
class AuthService extends _service_1.default {
    constructor() {
        super();
    }
    async authorize(token, constructor) {
        const secretKey = (0, AppConfigService_1.default)().get('secret_key');
        try {
            return await new Promise((approve, reject) => {
                jsonwebtoken_1.default.verify(token, secretKey, (error, tokenData) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    approve(new constructor(tokenData));
                });
            });
        }
        catch (e) {
            throw e;
        }
    }
}
exports["default"] = AuthService.getSingleton();


/***/ }),

/***/ "../src/services/CloudWatchService.ts":
/*!********************************************!*\
  !*** ../src/services/CloudWatchService.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_100518__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AWSService_1 = __importDefault(__nested_webpack_require_100518__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const _service_1 = __importDefault(__nested_webpack_require_100518__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_100518__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const { log, rwsLog, error, color } = ConsoleService_1.default;
const _MS = 1000;
class CloudWatchService extends _service_1.default {
    async printLogsForLambda(lambdaFunctionName, startTime, endTime, terminateTimeout = 30 * _MS) {
        const cloudWatchLogs = AWSService_1.default.getCloudWatch();
        const logGroupName = `/aws/lambda/${lambdaFunctionName}`; // Standard log group name format for Lambda
        let logStreamName;
        let logsTimeout = { core: null };
        // Get the latest log stream
        const describeParams = {
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
            limit: 1
        };
        try {
            const describeResult = await cloudWatchLogs.describeLogStreams(describeParams).promise();
            if (describeResult.logStreams && describeResult.logStreams[0]) {
                logStreamName = describeResult.logStreams[0].logStreamName;
            }
            else {
                error("No log streams found for the specified Lambda function.");
                return;
            }
        }
        catch (err) {
            error("An error occurred while describing log streams:", err);
            return;
        }
        let terminateTimer = null;
        const getLogs = async (nextToken) => {
            // const lambdaDetails = await LambdaService.getLambdaFunction(lambdaFunctionName);     
            const params = {
                logGroupName,
                logStreamName,
                startTime,
                endTime,
                nextToken,
                limit: 100
            };
            try {
                const data = await cloudWatchLogs.getLogEvents(params).promise();
                if (data.events && data.events.length > 0) {
                    this.printLogs(data.events);
                    // Reset the termination timer since we've received new logs
                    if (terminateTimer !== null) {
                        clearTimeout(terminateTimer);
                    }
                    terminateTimer = setTimeout(() => {
                        log("Terminating log fetch due to timeout.");
                        clearTimeout(terminateTimer);
                        return;
                    }, terminateTimeout); // terminateTimeout is the time in milliseconds you want to wait
                }
                this.nextForwardToken = data.nextForwardToken;
                // Recursive call to keep polling for new logs
                logsTimeout.core = setTimeout(() => getLogs(this.nextForwardToken), 5000); //
            }
            catch (err) {
                error("An error occurred while fetching logs:", err);
            }
        };
        getLogs();
        return logsTimeout;
    }
    printLogs(events) {
        events.forEach(event => {
            log(color().blue(`[AWS CloudWatch] `) + `{${new Date(event.timestamp).toISOString()}} : ${event.message}`);
        });
    }
}
exports["default"] = CloudWatchService.getSingleton();


/***/ }),

/***/ "../src/services/ConsoleService.ts":
/*!*****************************************!*\
  !*** ../src/services/ConsoleService.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_104398__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_104398__(/*! ./_service */ "../src/services/_service.ts"));
const chalk_1 = __importDefault(__nested_webpack_require_104398__(/*! chalk */ "chalk"));
const pino_1 = __importDefault(__nested_webpack_require_104398__(/*! pino */ "pino"));
const pino_pretty_1 = __importDefault(__nested_webpack_require_104398__(/*! pino-pretty */ "pino-pretty")); // Import pino-pretty
class ConsoleService extends _service_1.default {
    constructor() {
        super();
        this.isEnabled = true;
        this.originalLogMethods = null;
        this.getOriginalLogFunctions = () => {
            return {
                log: console.log,
                warn: console.warn,
                error: console.error,
            };
        };
        this.disableOriginalLogFunctions = () => {
            console.log = (...args) => { };
            console.warn = (...args) => { };
            console.error = (...args) => { };
        };
        this.restoreOriginalLogFunctions = () => {
            const originalF = this.originalLogMethods;
            console.log = originalF.log;
            console.warn = originalF.warn;
            console.error = originalF.error;
        };
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.warn = this.warn.bind(this);
        this.isEnabled = true;
        this.originalLogMethods = this.getOriginalLogFunctions();
    }
    color() {
        return chalk_1.default;
    }
    log(...obj) {
        if (!this.isEnabled) {
            return;
        }
        const _self = this;
        let typeBucket = [];
        let lastType = null;
        obj.forEach((elem, index) => {
            const elemType = typeof elem;
            const isLast = index == obj.length - 1;
            if (((lastType === null && obj.length === 1) || (lastType !== null && lastType !== elemType)) || isLast) {
                if (lastType === 'string') {
                    console.log(typeBucket.join(' '));
                }
                else {
                    typeBucket.forEach((bucketElement) => {
                        _self.prettyPrintObject(bucketElement);
                    });
                }
                typeBucket = [];
                if (isLast) {
                    if (elemType === 'string') {
                        console.log(elem);
                    }
                    else {
                        _self.prettyPrintObject(elem);
                    }
                    return;
                }
            }
            typeBucket.push(elem);
            lastType = elemType; // Update the lastType for the next iteration
        });
    }
    colorObject(obj) {
        const _JSON_COLORS = {
            'keys': 'green',
            'objectValue': 'magenta',
            'braces': 'blue',
            'arrayBraces': 'yellow',
            'colons': 'white', // Color for colons
            'default': 'reset' // Default color to reset to default chalk color
        };
        const getCodeColor = (chalkKey, textValue) => {
            return chalk_1.default[chalkKey](textValue);
        };
        const objString = JSON.stringify(this.sanitizeObject(obj), null, 2);
        const lines = objString.split('\n');
        const coloredLines = [];
        for (const line of lines) {
            const parts = line.split(/("[^"]*"\s*:\s*)|("[^"]*":\s*)|([{}[\],])/); // Split the line into parts around keys, colons, commas, braces, and brackets
            // Process each part and colorize accordingly
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part !== undefined) {
                    const trimmedPart = part.trim();
                    if (trimmedPart === ':') {
                        // This part is a colon, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ':');
                    }
                    else if (trimmedPart === ',') {
                        // This part is a comma, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ',');
                    }
                    else if (trimmedPart === '[' || trimmedPart === ']') {
                        // This part is a bracket, colorize it with the arrayBraces color
                        parts[i] = getCodeColor(_JSON_COLORS.arrayBraces, part);
                    }
                    else if (i % 4 === 1) {
                        // This part is a key, colorize it with the keys color
                        const key = trimmedPart;
                        if (key === ':') {
                            parts[i] = getCodeColor(_JSON_COLORS.colons, key);
                        }
                        else {
                            parts[i] = getCodeColor(_JSON_COLORS.keys, key);
                        }
                    }
                    else if (i % 4 === 3) {
                        // This part is a value, colorize it with objectValue
                        const value = trimmedPart;
                        parts[i] = getCodeColor(_JSON_COLORS.objectValue, value);
                    }
                }
            }
            coloredLines.push(parts.join('')); // Join and add the modified line to the result
        }
        return coloredLines.join('\n'); // Join the colored lines and return as a single string
    }
    warn(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.log(...obj.map((txt) => chalk_1.default.yellowBright('[RWS CLI WARNING] ' + txt)));
    }
    sanitizeObject(obj) {
        const sensitiveKeys = ["mongo_url", "mongo_db", "ssl_cert", "ssl_key", "secret_key", "aws_access_key", "aws_secret_key"];
        const sanitizedObj = { ...obj }; // Create a shallow copy of the object
        for (const key of sensitiveKeys) {
            if (sanitizedObj.hasOwnProperty(key)) {
                sanitizedObj[key] = "<VALUE HIDDEN>";
            }
        }
        return sanitizedObj;
    }
    getPino() {
        return (0, pino_1.default)((0, pino_pretty_1.default)());
    }
    prettyPrintObject(obj) {
        this.getPino().info(this.colorObject(this.sanitizeObject(obj)));
    }
    error(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.error(obj);
        console.log(...obj.map((txt) => chalk_1.default.red('[RWS CLI ERROR] ' + txt)));
    }
    stopLogging() {
        this.isEnabled = false;
        this.disableOriginalLogFunctions();
    }
    startLogging() {
        this.isEnabled = true;
        this.restoreOriginalLogFunctions();
    }
    updateLogLine(message) {
        process.stdout.write('\r' + message);
    }
    rwsLog(logCat, logString = null) {
        const logName = logString ? `[${logCat}]` : '[RWS CLI]';
        const logData = logString ? logString : logCat;
        console.log(chalk_1.default.green(logName), logData);
    }
}
exports["default"] = ConsoleService.getSingleton();


/***/ }),

/***/ "../src/services/DBService.ts":
/*!************************************!*\
  !*** ../src/services/DBService.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_111865__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DBService = void 0;
const client_1 = __nested_webpack_require_111865__(/*! @prisma/client */ "@prisma/client");
const mongodb_1 = __nested_webpack_require_111865__(/*! mongodb */ "mongodb");
const AppConfigService_1 = __importDefault(__nested_webpack_require_111865__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const _service_1 = __importDefault(__nested_webpack_require_111865__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_111865__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
class DBService extends _service_1.default {
    constructor(opts = null) {
        super();
        this.opts = null;
        this.connected = false;
    }
    connectToDB(opts = null) {
        if (opts) {
            this.opts = opts;
        }
        else {
            this.opts = {
                dbUrl: (0, AppConfigService_1.default)().get('mongo_url'),
                dbName: (0, AppConfigService_1.default)().get('mongo_db'),
            };
        }
        if (!this.opts.dbUrl) {
            return;
        }
        try {
            this.client = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: this.opts.dbUrl
                    },
                },
            });
            this.connected = true;
        }
        catch (e) {
            ConsoleService_1.default.error('PRISMA CONNECTION ERROR');
        }
    }
    async createBaseMongoClient() {
        var _a;
        const dbUrl = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbUrl) || (0, AppConfigService_1.default)().get('mongo_url');
        const client = new mongodb_1.MongoClient(dbUrl);
        await client.connect();
        return client;
    }
    async createBaseMongoClientDB() {
        var _a;
        const dbName = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbName) || (0, AppConfigService_1.default)().get('mongo_db');
        const client = await this.createBaseMongoClient();
        return client.db(dbName);
    }
    async cloneDatabase(source, target) {
        const client = await this.createBaseMongoClient();
        // Source and target DB
        const sourceDb = client.db(source);
        const targetDb = client.db(target);
        // Get all collections from source DB
        const collections = await sourceDb.listCollections().toArray();
        // Loop over all collections and copy them to the target DB
        for (let collection of collections) {
            const docs = await sourceDb.collection(collection.name).find({}).toArray();
            await targetDb.collection(collection.name).insertMany(docs);
        }
        await client.close();
    }
    async watchCollection(collectionName, preRun) {
        const db = await this.createBaseMongoClientDB();
        const collection = db.collection(collectionName);
        const changeStream = collection.watch();
        return new Promise((resolve) => {
            changeStream.on('change', (change) => {
                resolve(change);
            });
            preRun();
        });
    }
    async insert(data, collection, isTimeSeries = false) {
        let result = data;
        // Insert time-series data outside of the transaction
        if (isTimeSeries) {
            const db = await this.createBaseMongoClientDB();
            const collectionHandler = db.collection(collection);
            const insert = await collectionHandler.insertOne(data);
            result = await this.findOneBy(collection, { id: insert.insertedId.toString() });
            return result;
        }
        const prismaCollection = this.getCollectionHandler(collection);
        result = await prismaCollection.create({ data });
        return await this.findOneBy(collection, { id: result.id });
    }
    async update(data, collection) {
        const model_id = data.id;
        delete data['id'];
        const prismaCollection = this.getCollectionHandler(collection);
        await prismaCollection.update({
            where: {
                id: model_id,
            },
            data: data,
        });
        return await this.findOneBy(collection, { id: model_id });
    }
    ;
    async findOneBy(collection, conditions) {
        return await this.getCollectionHandler(collection).findFirst({ where: conditions });
    }
    async delete(collection, conditions) {
        await this.getCollectionHandler(collection).deleteMany({ where: conditions });
        return;
    }
    async findBy(collection, conditions, fields = null) {
        const params = { where: conditions };
        if (fields) {
            params.select = {};
            fields.forEach((fieldName) => {
                params.select[fieldName] = true;
            });
        }
        return await this.getCollectionHandler(collection).findMany(params);
    }
    async collectionExists(collection_name) {
        var _a;
        const dbUrl = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbUrl) || (0, AppConfigService_1.default)().get('mongo_url');
        const client = new mongodb_1.MongoClient(dbUrl);
        try {
            await client.connect();
            const db = client.db('junctioned'); // Replace with your database name
            const collections = await db.listCollections().toArray();
            const existingCollectionNames = collections.map((collection) => collection.name);
            return existingCollectionNames.includes(collection_name);
        }
        catch (error) {
            ConsoleService_1.default.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    async createTimeSeriesCollection(collection_name) {
        try {
            const db = await this.createBaseMongoClientDB();
            // Create a time series collection
            const options = {
                timeseries: {
                    timeField: 'timestamp', // Replace with your timestamp field
                    metaField: 'params' // Replace with your metadata field
                }
            };
            await db.createCollection(collection_name, options); // Replace with your collection name
            return db.collection(collection_name);
        }
        catch (error) {
            ConsoleService_1.default.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    getCollectionHandler(collection) {
        if (!this.client || !this.connected) {
            this.connectToDB();
        }
        return this.client[collection];
    }
}
exports.DBService = DBService;
exports["default"] = DBService.getSingleton();


/***/ }),

/***/ "../src/services/EFSService.ts":
/*!*************************************!*\
  !*** ../src/services/EFSService.ts ***!
  \*************************************/
/***/ (function(module, exports, __nested_webpack_require_118956__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_118956__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_118956__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const LambdaService_1 = __importDefault(__nested_webpack_require_118956__(/*! ./LambdaService */ "../src/services/LambdaService.ts"));
const AWSService_1 = __importDefault(__nested_webpack_require_118956__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ProcessService_1 = __importDefault(__nested_webpack_require_118956__(/*! ./ProcessService */ "../src/services/ProcessService.ts"));
const path_1 = __importDefault(__nested_webpack_require_118956__(/*! path */ "path"));
const VPCService_1 = __importDefault(__nested_webpack_require_118956__(/*! ./VPCService */ "../src/services/VPCService.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const __STATE_WAIT_TIME = 3000; //ms
class EFSService extends _service_1.default {
    constructor() {
        super();
    }
    async getOrCreateEFS(functionName, vpcId, subnetId) {
        const response = await AWSService_1.default.getEFS().describeFileSystems({ CreationToken: functionName }).promise();
        if (response.FileSystems && response.FileSystems.length > 0) {
            const fileSystemId = response.FileSystems[0].FileSystemId;
            const accessPoints = await this.getAccessPoints(fileSystemId);
            if (!accessPoints.length) {
                throw "No acces point in EFS for RWS lambdas";
            }
            log(`${color().green('[RWS Cloud FS Service]')} EFS exists:`, {
                efsId: fileSystemId,
                apARN: accessPoints[0].AccessPointArn
            });
            return [fileSystemId, accessPoints[0].AccessPointArn, true];
        }
        else {
            const params = {
                CreationToken: functionName,
                PerformanceMode: 'generalPurpose',
            };
            try {
                const response = await AWSService_1.default.getEFS().createFileSystem(params).promise();
                await this.waitForEFS(response.FileSystemId);
                const fsMountId = await this.createMountTarget(response.FileSystemId, subnetId);
                await this.waitForFileSystemMount(response.FileSystemId);
                const [accessPointId, accessPointArn] = await this.createAccessPoint(response.FileSystemId);
                await this.waitForAccessPoint(accessPointId);
                const endpointId = await VPCService_1.default.createVPCEndpointIfNotExist(vpcId);
                await VPCService_1.default.ensureRouteToVPCEndpoint(vpcId, endpointId);
                log(`${color().green('[RWS Cloud FS Service]')} EFS Created:`, response);
                return [response.FileSystemId, accessPointArn, false];
            }
            catch (err) {
                error('Error creating EFS:', err);
                throw err; // It's a good practice to throw the error so the caller knows something went wrong.
            }
        }
    }
    async deleteEFS(fileSystemId) {
        try {
            await AWSService_1.default.getEFS().deleteFileSystem({ FileSystemId: fileSystemId }).promise();
            error(`EFS with ID ${fileSystemId} has been deleted.`);
        }
        catch (err) {
            error('Error while deleting EFS:');
            log(err);
            throw err;
        }
    }
    async waitForEFS(fileSystemId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS Listener] awaiting EFS state change')}`);
        while (!isAvailable) {
            const mountResponse = await AWSService_1.default.getEFS().describeFileSystems({ FileSystemId: fileSystemId }).promise();
            if (mountResponse.FileSystems && mountResponse.FileSystems.length && mountResponse.FileSystems[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, __STATE_WAIT_TIME)); // wait for 5 seconds before checking again
            }
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async waitForFileSystemMount(fileSystemId) {
        while (true) {
            try {
                log(`${color().yellowBright('[EFS Mount Listener] awaiting EFS mount change')}`);
                const response = await AWSService_1.default.getEFS().describeMountTargets({ FileSystemId: fileSystemId }).promise();
                const isMounted = response.MountTargets.some(mountTarget => mountTarget.LifeCycleState === 'available');
                if (isMounted) {
                    log(`${color().yellowBright('[EFS Mount Listener] DONE')}`);
                    return true;
                }
                else {
                    log(`${color().yellowBright('[EFS Mount Listener] is during creation process...')}`);
                }
                log(`${color().yellowBright('[EFS Mount Listener] .')}`);
                await ProcessService_1.default.sleep(__STATE_WAIT_TIME);
            }
            catch (error) {
                console.error('Error while checking EFS mount status:', error);
                throw error;
            }
        }
    }
    async waitForAccessPoint(accessPointId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS AP Listener] awaiting EFS access point change')}`, accessPointId);
        while (!isAvailable) {
            const accessPointResponse = await AWSService_1.default.getEFS().describeAccessPoints({ AccessPointId: accessPointId }).promise();
            if (accessPointResponse.AccessPoints && accessPointResponse.AccessPoints.length && accessPointResponse.AccessPoints[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS AP Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before checking again                
            }
        }
    }
    generateClientToken() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }
    async getAccessPoints(fileSystemId) {
        try {
            const params = {
                FileSystemId: fileSystemId // specify the FileSystemId to filter access points for a specific EFS
            };
            const response = await AWSService_1.default.getEFS().describeAccessPoints(params).promise();
            if (response.AccessPoints && response.AccessPoints.length > 0) {
                return response.AccessPoints; // this will return an array of access points
            }
            else {
                log('No access points found for the specified EFS.');
                return null;
            }
        }
        catch (err) {
            error('Error getting access point:', error);
            throw err;
        }
    }
    async createAccessPoint(fileSystemId) {
        const clientToken = this.generateClientToken(); // Generate a unique client token
        const params = {
            FileSystemId: fileSystemId,
            ClientToken: clientToken, // Add the client token here
            PosixUser: {
                Uid: 1001, // You can adjust these values as per your requirements.
                Gid: 1001
            },
            RootDirectory: {
                Path: "/mnt/efs", // The path where Lambda will mount the EFS.
                CreationInfo: {
                    OwnerUid: 1001,
                    OwnerGid: 1001,
                    Permissions: "755"
                }
            }
        };
        try {
            const response = await AWSService_1.default.getEFS().createAccessPoint(params).promise();
            log(`${color().green('[RWS Cloud FS Service]')} EFS AP created:`, response);
            return [response.AccessPointId, response.AccessPointArn];
        }
        catch (err) {
            error('Error creating EFS access point:', err);
            throw err;
        }
    }
    async createMountTarget(fileSystemId, subnetId) {
        const params = {
            FileSystemId: fileSystemId,
            SubnetId: subnetId,
        };
        try {
            const response = await AWSService_1.default.getEFS().createMountTarget(params).promise();
            log(`${color().green('[RWS Cloud FS Service]')} EFS Mount Target created:`, response);
            return response.MountTargetId;
        }
        catch (error) {
            console.error('Error creating Mount Target:', error);
        }
    }
    async uploadToEFS(baseFunctionName, efsId, modulesS3Key, s3Bucket, vpcId, subnetId) {
        const efsLoaderFunctionName = await this.processEFSLoader(vpcId, subnetId);
        const params = {
            functionName: `${baseFunctionName}`,
            efsId,
            modulesS3Key,
            s3Bucket
        };
        try {
            log(`${color().green(`[RWS Lambda Service]`)} invoking EFS Loader as "${efsLoaderFunctionName}" lambda function for "${baseFunctionName}" with ${modulesS3Key} in ${s3Bucket} bucket.`);
            const response = await LambdaService_1.default.invokeLambda(efsLoaderFunctionName, params);
            rwsLog('RWS Lambda Service', color().yellowBright(`"${efsLoaderFunctionName}" lambda function response:`));
            log(response);
            return; // JSON.parse(response.Response.Payload as string);
        }
        catch (error) {
            // await EFSService.deleteEFS(efsId);
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }
    async processEFSLoader(vpcId, subnetId) {
        const executionDir = process.cwd();
        const filePath = module.id;
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path_1.default.resolve(cmdDir, '..', '..', '..', '..');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        const _UNZIP_FUNCTION_NAME = 'efs-loader';
        if (!(await LambdaService_1.default.functionExists('RWS-' + _UNZIP_FUNCTION_NAME))) {
            log(`${color().green(`[RWS Lambda Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`, moduleDir);
            const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir);
            await LambdaService_1.default.deployLambda(_UNZIP_FUNCTION_NAME, zipPath, vpcId, subnetId, true);
        }
        return _UNZIP_FUNCTION_NAME;
    }
    async deleteDir() {
    }
}
exports["default"] = EFSService.getSingleton();


/***/ }),

/***/ "../src/services/LambdaService.ts":
/*!****************************************!*\
  !*** ../src/services/LambdaService.ts ***!
  \****************************************/
/***/ (function(module, exports, __nested_webpack_require_130142__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_130142__(/*! ./_service */ "../src/services/_service.ts"));
const AppConfigService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const EFSService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./EFSService */ "../src/services/EFSService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const AWSService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ZipService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./ZipService */ "../src/services/ZipService.ts"));
const S3Service_1 = __importDefault(__nested_webpack_require_130142__(/*! ./S3Service */ "../src/services/S3Service.ts"));
const APIGatewayService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./APIGatewayService */ "../src/services/APIGatewayService.ts"));
const path_1 = __importDefault(__nested_webpack_require_130142__(/*! path */ "path"));
const fs_1 = __importDefault(__nested_webpack_require_130142__(/*! fs */ "fs"));
const UtilsService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./UtilsService */ "../src/services/UtilsService.ts"));
const ProcessService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./ProcessService */ "../src/services/ProcessService.ts"));
const VPCService_1 = __importDefault(__nested_webpack_require_130142__(/*! ./VPCService */ "../src/services/VPCService.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const MIN = 60; // 1MIN = 60s
class LambdaService extends _service_1.default {
    constructor() {
        super();
    }
    async archiveLambda(lambdaDirPath, moduleCfgDir, fullZip = false) {
        const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
        const lambdaPath = path_1.default.join(moduleCfgDir, 'lambda', `RWS-${lambdaDirName}-app.zip`);
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
        const toolsFile = `${path_1.default.resolve(lambdaDirPath, '..')}/tools.js`;
        const targetToolsFile = `${lambdaDirPath}/tools.js`;
        fs_1.default.copyFileSync(toolsFile, targetToolsFile);
        log(`${color().green('[RWS Lambda Service]')} archiving ${color().yellowBright(lambdaDirPath)} to:\n ${color().yellowBright(lambdaPath)}`);
        tasks.push(ZipService_1.default.createArchive(lambdaPath, lambdaDirPath, fullZip ? null : {
            'ignore': ['node_modules/**/*']
        }));
        await Promise.all(tasks);
        fs_1.default.unlinkSync(targetToolsFile);
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
    async deployLambda(functionDirName, zipPath, vpcId, subnetId, noEFS = false) {
        this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        const zipFile = fs_1.default.readFileSync(zipPath);
        try {
            const s3BucketName = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
            await S3Service_1.default.bucketExists(s3BucketName);
            const [efsId, accessPointArn, efsExisted] = await EFSService_1.default.getOrCreateEFS('RWS_EFS', vpcId, subnetId);
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region)} using ${color().red(`S3://${s3BucketName}/${functionDirName}.zip`)}`);
            log(`${color().green('[RWS Lambda Service]')} uploading ${color().yellowBright(zipPath)}...`);
            const s3params = {
                Bucket: s3BucketName,
                Key: 'RWS-' + functionDirName + '.zip', // File name you want to save as in S3
                Body: zipFile
            };
            const s3Data = await S3Service_1.default.upload(s3params, true);
            log(`${color().green('[RWS Lambda Service]')} uploaded ${color().yellowBright(zipPath)} to ${color().red(`S3://${s3BucketName}/RWS-${functionDirName}.zip`)}`);
            const s3Path = s3Data.Key;
            const Code = {
                S3Bucket: s3BucketName,
                S3Key: s3Path
            };
            const lambdaFunctionName = 'RWS-' + functionDirName;
            const _HANDLER = 'index.handler';
            const functionDidExist = await this.functionExists(lambdaFunctionName);
            if (functionDidExist) {
                await AWSService_1.default.getLambda().updateFunctionCode({
                    FunctionName: lambdaFunctionName,
                    ...Code
                }).promise();
            }
            else {
                const createParams = {
                    FunctionName: lambdaFunctionName,
                    Runtime: 'nodejs18.x',
                    Role: (0, AppConfigService_1.default)().get('aws_lambda_role'),
                    Handler: _HANDLER,
                    Code,
                    VpcConfig: {
                        SubnetIds: [subnetId], // Add your subnet IDs
                        SecurityGroupIds: await VPCService_1.default.listSecurityGroups(), // Add your security group ID
                    },
                    FileSystemConfigs: [
                        {
                            Arn: accessPointArn,
                            LocalMountPath: '/mnt/efs' // The path in your Lambda function environment where the EFS will be mounted
                        }
                    ],
                    MemorySize: 2048,
                    Timeout: 15 * MIN,
                    Environment: {
                        Variables: {
                            NODE_PATH: '/mnt/efs/res/modules/' + functionDirName,
                            HOME: '/mnt/efs/res/tmp/' + functionDirName
                        }
                    }
                };
                log(color().green('[RWS Lambda Service] is ' + (functionDidExist ? 'updating' : 'creating') + ' lambda function named: ') + color().yellowBright(lambdaFunctionName));
                await AWSService_1.default.getLambda().createFunction(createParams).promise();
            }
            await this.waitForLambda(functionDirName, functionDidExist ? 'update' : 'creation');
            if (functionDidExist) {
                const functionInfo = await this.getLambdaFunction(lambdaFunctionName);
                if (functionInfo.Configuration.Handler !== _HANDLER) {
                    log(color().green('[RWS Lambda Service]') + ' is changing handler for Lambda function named: ' + color().yellowBright(lambdaFunctionName));
                    await AWSService_1.default.getLambda().updateFunctionConfiguration({
                        FunctionName: lambdaFunctionName,
                        Handler: _HANDLER
                    }, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        }
                        else {
                            console.log(data);
                        }
                    }).promise();
                    await this.waitForLambda(functionDirName, 'handler update');
                    // await S3Service.delete({
                    //   Bucket: s3params.Bucket,
                    //   Key: s3params.Key
                    // });
                    // rwsLog('Deleting S3 Object after deploy: ' + color().red(`s3://${s3params.Bucket}/${s3params.Key}`));
                }
            }
            rwsLog('RWS Lambda Service', `lambda function "${lambdaFunctionName}" has been ${functionDidExist ? 'created' : 'updated'}`);
            const npmPackage = this.getNPMPackage(functionDirName);
            if ((!!npmPackage.deployConfig) && npmPackage.deployConfig.webLambda === true) {
                if ((await APIGatewayService_1.default.findApiGateway(lambdaFunctionName)) === null) {
                    await this.setupGatewayForWebLambda(lambdaFunctionName, vpcId);
                }
                if (!(await VPCService_1.default.findPublicSubnetInVPC(vpcId))) {
                    await APIGatewayService_1.default.associateNATGatewayWithLambda(lambdaFunctionName);
                }
            }
        }
        catch (err) {
            error(err.message);
            log(err.stack);
            throw err;
        }
    }
    getNPMPackage(lambdaDirName) {
        const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist/', '');
        const npmPackagePath = `${moduleDir}/lambda-functions/${lambdaDirName}/package.json`;
        if (!fs_1.default.existsSync(npmPackagePath)) {
            throw new Error(`The lambda folder "${lambdaDirName}" has no package.json inside.`);
        }
        return JSON.parse(fs_1.default.readFileSync(npmPackagePath, 'utf-8'));
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
            await ProcessService_1.default.runShellCommand(`npm install`, null, true);
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
            const s3Data = await S3Service_1.default.upload(s3params);
            const s3Path = s3Data.Key;
            // fs.unlinkSync(packagePath);      
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('NPM package file is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);
            UtilsService_1.default.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);
            await EFSService_1.default.uploadToEFS(functionName, efsId, s3Path, S3Bucket, vpcId, subnetId);
            // await S3Service.delete({
            //   Bucket: s3params.Bucket,
            //   Key: s3params.Key
            // });
            // rwsLog('Deleting S3 Object after module deploy: ' + color().red(`s3://${s3params.Bucket}/${s3params.Key}`));
        }
    }
    async getLambdaFunction(lambdaFunctionName) {
        try {
            return await AWSService_1.default.getLambda().getFunction({ FunctionName: lambdaFunctionName }).promise();
        }
        catch (e) {
            return null;
        }
    }
    async functionExists(lambdaFunctionName) {
        return !!(await this.getLambdaFunction(lambdaFunctionName));
    }
    async waitForLambda(functionName, waitFor = null, timeoutMs = 300000, intervalMs = 5000) {
        const lambdaFunctionName = 'RWS-' + functionName;
        const startTime = Date.now();
        log(`${color().yellowBright('[Lambda Listener] awaiting Lambda' + (waitFor !== null ? ' (' + waitFor + ')' : '') + ' state change')}`);
        while (Date.now() - startTime < timeoutMs) {
            log(`${color().yellowBright('[Lambda Listener] .')}`);
            const { Configuration } = await this.getLambdaFunction(lambdaFunctionName);
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
    async deleteLambda(lambdaFunctionName) {
        const restApi = await APIGatewayService_1.default.findApiGateway(lambdaFunctionName);
        await APIGatewayService_1.default.deleteApiGateway(restApi.id);
        await AWSService_1.default.getLambda().deleteFunction({
            FunctionName: lambdaFunctionName
        }).promise();
    }
    async invokeLambda(functionDirName, payload) {
        let invocationType = 'RequestResponse';
        const npmPackage = this.getNPMPackage(functionDirName);
        if (!!npmPackage.deployConfig && npmPackage.deployConfig.invocationType) {
            invocationType = npmPackage.deployConfig.invocationType;
        }
        if (!!payload._invocationConfig) {
            const invocationConfig = payload._invocationConfig;
            invocationType = invocationConfig.invocationType;
            delete payload['_invocationConfig'];
        }
        const params = {
            FunctionName: 'RWS-' + functionDirName,
            InvocationType: invocationType,
            Payload: JSON.stringify(payload),
        };
        log(color().green('[RWS Lambda Service]') + color().yellowBright(` invoking (with ${invocationType} type) "RWS-${functionDirName}" with payload: `));
        log(payload);
        try {
            const response = await AWSService_1.default.getLambda()
                .invoke(params)
                .promise();
            return {
                StatusCode: response.StatusCode,
                Response: response,
                InvocationType: invocationType
            };
        }
        catch (e) {
            error(e.message);
            throw new Error(e);
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
    async integrateGatewayResource(lambdaFunctionName, restApiId, resource, httpMethod = 'GET') {
        const lambdaInfo = await this.getLambdaFunction(lambdaFunctionName);
        const lambdaArn = lambdaInfo.Configuration.FunctionArn;
        await AWSService_1.default.getAPIGateway().putIntegration({
            restApiId: restApiId,
            resourceId: resource.id,
            httpMethod: httpMethod,
            type: "AWS_PROXY",
            integrationHttpMethod: "POST",
            uri: `arn:aws:apigateway:${AWSService_1.default.getRegion()}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`
        }).promise();
    }
    async setupGatewayForWebLambda(lambdaFunctionName, vpcId) {
        rwsLog('Creating API Gateway for Web Lambda...');
        const restApiId = await APIGatewayService_1.default.createApiGateway(lambdaFunctionName);
        const resource = await APIGatewayService_1.default.createResource(restApiId, lambdaFunctionName);
        const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        const apiMethods = [];
        rwsLog('Pushing methods to API Gateway resource.');
        for (let methodKey in httpMethods) {
            apiMethods.push(await APIGatewayService_1.default.createMethod(restApiId, resource, httpMethods[methodKey]));
        }
        rwsLog(`Integrating API Gateway resource with "${color().yellowBright(lambdaFunctionName)}" lambda function.`);
        for (let apiMethodKey in apiMethods) {
            const apiMethod = apiMethods[apiMethodKey];
            await this.integrateGatewayResource(lambdaFunctionName, restApiId, resource, apiMethod.httpMethod);
        }
        await AWSService_1.default.getAPIGateway().createDeployment({
            restApiId: restApiId,
            stageName: "prod"
        }).promise();
        rwsLog(`API Gateway "${color().yellowBright(lambdaFunctionName + '-API')}" deployed.`);
    }
}
exports["default"] = LambdaService.getSingleton();


/***/ }),

/***/ "../src/services/MD5Service.ts":
/*!*************************************!*\
  !*** ../src/services/MD5Service.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_149016__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_149016__(/*! ./_service */ "../src/services/_service.ts"));
const crypto_1 = __importDefault(__nested_webpack_require_149016__(/*! crypto */ "crypto"));
const path_1 = __importDefault(__nested_webpack_require_149016__(/*! path */ "path"));
const fs_1 = __importDefault(__nested_webpack_require_149016__(/*! fs */ "fs"));
const TraversalService_1 = __importDefault(__nested_webpack_require_149016__(/*! ./TraversalService */ "../src/services/TraversalService.ts"));
const UtilsService_1 = __importDefault(__nested_webpack_require_149016__(/*! ./UtilsService */ "../src/services/UtilsService.ts"));
class MD5Service extends _service_1.default {
    async calculateFileMD5(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto_1.default.createHash('md5');
            const input = fs_1.default.createReadStream(filePath);
            input.on('readable', () => {
                const data = input.read();
                if (data) {
                    hash.update(data);
                }
                else {
                    resolve(hash.digest('hex'));
                }
            });
            input.on('error', reject);
        });
    }
    async generateCliHashes(fileNames) {
        const md5Pack = [];
        for (const key in fileNames) {
            const fileName = fileNames[key];
            const md5 = await this.calculateFileMD5(fileName);
            md5Pack.push(md5);
        }
        return md5Pack;
    }
    async cliClientHasChanged(consoleClientHashFile, tsFilename) {
        const generatedHash = fs_1.default.readFileSync(consoleClientHashFile, 'utf-8');
        const cmdFiles = this.batchGenerateCommandFileMD5(path_1.default.resolve(UtilsService_1.default.findRootWorkspacePath(process.cwd()), 'node_modules', '.rws'));
        const currentSumHashes = (await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/');
        if (generatedHash !== currentSumHashes) {
            return true;
        }
        return false;
    }
    batchGenerateCommandFileMD5(moduleCfgDir) {
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        if (!fs_1.default.existsSync(`${moduleCfgDir}/__rws_installed`) || !fs_1.default.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)) {
            return [];
        }
        const cmdDirPath = fs_1.default.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8');
        //path.resolve(process.cwd()) + '/' + 
        return TraversalService_1.default.getAllFilesInFolder(cmdDirPath, [
            process.cwd() + '/' + cmdDirPath + '/index.ts'
        ]);
        ;
    }
}
exports["default"] = MD5Service.getSingleton();


/***/ }),

/***/ "../src/services/ProcessService.ts":
/*!*****************************************!*\
  !*** ../src/services/ProcessService.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_152184__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_152184__(/*! ./_service */ "../src/services/_service.ts"));
const child_process_1 = __nested_webpack_require_152184__(/*! child_process */ "child_process");
const child_process_2 = __nested_webpack_require_152184__(/*! child_process */ "child_process");
const ConsoleService_1 = __importDefault(__nested_webpack_require_152184__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const readline_1 = __importDefault(__nested_webpack_require_152184__(/*! readline */ "readline"));
const os_1 = __importDefault(__nested_webpack_require_152184__(/*! os */ "os"));
const { log, warn, error, color } = ConsoleService_1.default;
const totalMemoryBytes = os_1.default.totalmem();
const totalMemoryKB = totalMemoryBytes / 1024;
const totalMemoryMB = totalMemoryKB / 1024;
const totalMemoryGB = totalMemoryMB / 1024;
class ProcessService extends _service_1.default {
    getParentPID(pid) {
        const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
        return parseInt((0, child_process_1.execSync)(command).toString().trim(), 10);
    }
    getAllProcessesIds() {
        const startingPID = process.pid;
        return [startingPID, this.getParentPID(startingPID)];
    }
    async runShellCommand(command, cwd = null, silent = false) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            if (!cwd) {
                cwd = process.cwd();
            }
            const spawned = (0, child_process_2.spawn)(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });
            spawned.on('exit', (code) => {
                if (code !== 0) {
                    return reject(new Error(`Command failed with exit code ${code}`));
                }
                resolve();
            });
            spawned.on('error', (error) => {
                reject(error);
            });
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getInput(prompt) {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question(color().red('[RWS CLI Input Prompt] ' + prompt), (answer) => {
                resolve(answer);
                rl.close();
            });
        });
    }
}
exports["default"] = ProcessService.getSingleton();


/***/ }),

/***/ "../src/services/RouterService.ts":
/*!****************************************!*\
  !*** ../src/services/RouterService.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_155059__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__nested_webpack_require_155059__(/*! reflect-metadata */ "reflect-metadata");
const _service_1 = __importDefault(__nested_webpack_require_155059__(/*! ./_service */ "../src/services/_service.ts"));
const AppConfigService_1 = __importDefault(__nested_webpack_require_155059__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const path_1 = __importDefault(__nested_webpack_require_155059__(/*! path */ "path"));
const index_1 = __nested_webpack_require_155059__(/*! ../errors/index */ "../src/errors/index.ts");
const ConsoleService_1 = __importDefault(__nested_webpack_require_155059__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
/**
 *
 */
class RouterService extends _service_1.default {
    constructor() {
        super();
    }
    static responseTypeToMIME(responseType) {
        switch (responseType) {
            case 'html': return 'text/html';
            default: return 'application/json';
        }
    }
    getRouterAnnotations(constructor) {
        const annotationsData = {};
        const propertyKeys = Reflect.getMetadataKeys(constructor.prototype).map((item) => {
            return item.split(':')[1];
        });
        propertyKeys.forEach(key => {
            const annotations = ['Route'];
            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;
                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
                if (meta) {
                    annotationsData[String(key)] = { annotationType: annotation, metadata: meta };
                }
            });
        });
        return annotationsData;
    }
    async assignRoutes(app, routesPackage, controllerList) {
        const controllerRoutes = {
            get: {}, post: {}, put: {}, delete: {}
        };
        controllerList.forEach((controllerInstance) => {
            const controllerMetadata = this.getRouterAnnotations(controllerInstance.constructor);
            if (controllerMetadata) {
                Object.keys(controllerMetadata).forEach((key) => {
                    if (controllerMetadata[key].annotationType !== 'Route') {
                        return;
                    }
                    this.setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app);
                });
            }
        });
        let routes = [];
        routesPackage.forEach((item) => {
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                // Handle the case where item is of type IPrefixedHTTProutes
                routes = [...routes, ...item.routes.map((subRouteItem) => {
                        const subRoute = {
                            path: item.prefix + subRouteItem.path,
                            name: subRouteItem.name
                        };
                        return subRoute;
                    })];
            }
            else {
                // Handle the case where item is of type IHTTProute
                routes.push(item);
            }
        });
        console.log('ROUTES IN ASSIGNMENT', routes);
        routes.forEach((route) => {
            Object.keys(controllerRoutes).forEach((_method) => {
                const actions = controllerRoutes[_method];
                if (!actions[route.name]) {
                    return;
                }
                this.addRouteToServer(actions, route);
            });
        });
        return routes;
    }
    addRouteToServer(actions, route) {
        const [routeMethod, appMethod, routeParams, methodName] = actions[route.name];
        if (!appMethod) {
            return;
        }
        appMethod(route.path, async (req, res) => {
            try {
                const controllerMethodReturn = await routeMethod({
                    req: req,
                    query: req.query,
                    params: route.noParams ? [] : req.params,
                    data: req.body,
                    res: res
                });
                res.setHeader('Content-Type', RouterService.responseTypeToMIME(routeParams.responseType));
                let status = 200;
                if (controllerMethodReturn instanceof index_1.RWSError) {
                    status = controllerMethodReturn.getCode();
                }
                this.sendResponseWithStatus(res, status, routeParams, controllerMethodReturn);
                return;
            }
            catch (err) {
                let errMsg;
                let stack;
                if (!!err.printFullError) {
                    err.printFullError();
                    errMsg = err.getMessage();
                    stack = err.getStack();
                }
                else {
                    errMsg = err.message;
                    ConsoleService_1.default.error(errMsg);
                    console.log(err.stack);
                    stack = err.stack;
                    err.message = errMsg;
                }
                const code = err.getCode ? err.getCode() : 500;
                this.sendResponseWithStatus(res, code, routeParams, {
                    success: false,
                    data: {
                        error: {
                            code: code,
                            message: errMsg,
                            stack
                        }
                    }
                });
            }
        });
    }
    sendResponseWithStatus(res, status, routeParams, output) {
        if (routeParams.responseType === 'json' || !routeParams.responseType) {
            res.status(status).send(output);
            return;
        }
        if (routeParams.responseType === 'html' && (0, AppConfigService_1.default)().get('pub_dir')) {
            res.status(status).sendFile(path_1.default.join((0, AppConfigService_1.default)().get('pub_dir'), output.template_name + '.html'));
            return;
        }
        res.status(status).send();
    }
    setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app) {
        const action = controllerInstance.callMethod(key);
        const meta = controllerMetadata[key].metadata;
        switch (meta.method) {
            case 'GET':
                controllerRoutes.get[meta.name] = [action.bind(controllerInstance), app.get.bind(app), meta.params, key];
                break;
            case 'POST':
                controllerRoutes.post[meta.name] = [action.bind(controllerInstance), app.post.bind(app), meta.params, key];
                break;
            case 'PUT':
                controllerRoutes.put[meta.name] = [action.bind(controllerInstance), app.put.bind(app), meta.params, key];
                break;
            case 'DELETE':
                controllerRoutes.delete[meta.name] = [action.bind(controllerInstance), app.delete.bind(app), meta.params, key];
                break;
        }
    }
    hasRoute(routePath, routes) {
        return this.getRoute(routePath, routes) !== null;
    }
    getRoute(routePath, routes) {
        const front_routes = (0, AppConfigService_1.default)().get('front_routes');
        const foundRoute = routes.find((item) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });
        return !!foundRoute ? foundRoute : null;
    }
}
exports["default"] = RouterService.getSingleton();


/***/ }),

/***/ "../src/services/S3Service.ts":
/*!************************************!*\
  !*** ../src/services/S3Service.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_162858__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_162858__(/*! ./_service */ "../src/services/_service.ts"));
const AWSService_1 = __importDefault(__nested_webpack_require_162858__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_162858__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const { log, warn, error, color } = ConsoleService_1.default;
class S3Service extends _service_1.default {
    constructor() {
        super();
    }
    async upload(params, override = true, region = null) {
        if (override) {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key }, region);
            if (exists) {
                log(`${color().green('[RWS Lambda Service]')} ${color().red('Deleting existing S3 object:')} ${params.Key}`);
                await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
            }
        }
        else {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key }, region);
            if (exists) {
                return null;
            }
        }
        return AWSService_1.default.getS3(region).upload(params).promise();
    }
    async downloadObject(params, region = null) {
        return AWSService_1.default.getS3(region).getObject(params).promise();
    }
    async downloadToString(s3key, bucket, region) {
        return new Promise(async (resolve, reject) => {
            let s3pageResponse = await this.downloadObject({
                Key: s3key,
                Bucket: bucket
            }, region);
            if (s3pageResponse.Body instanceof Buffer || s3pageResponse.Body instanceof Uint8Array) {
                resolve(s3pageResponse.Body.toString());
            }
            else if (typeof s3pageResponse.Body === 'string') {
                resolve(s3pageResponse.Body);
            }
            else {
                // Handle other types or throw an error
                console.error('Unsupported data type');
                reject('Unsupported data type');
            }
        });
    }
    async delete(params, region = null) {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key }, region);
        return;
    }
    async objectExists(params, region = null) {
        try {
            await AWSService_1.default.getS3(region).headObject(params).promise();
            return true;
        }
        catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    async deleteObject(params, region = null) {
        await AWSService_1.default.getS3(region).deleteObject(params).promise();
    }
    async bucketExists(bucketName, region = null) {
        try {
            await AWSService_1.default.getS3(region).headBucket({ Bucket: bucketName }).promise();
            return bucketName;
        }
        catch (err) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };
                await AWSService_1.default.getS3(region).createBucket(params).promise();
                log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
                return bucketName;
            }
            else {
                // Handle other errors
                error(`Error checking bucket ${bucketName}:`, err);
            }
        }
    }
}
exports["default"] = S3Service.getSingleton();


/***/ }),

/***/ "../src/services/ServerService.ts":
/*!****************************************!*\
  !*** ../src/services/ServerService.ts ***!
  \****************************************/
/***/ (function(module, exports, __nested_webpack_require_166917__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const socket_io_1 = __nested_webpack_require_166917__(/*! socket.io */ "socket.io");
const https_1 = __importDefault(__nested_webpack_require_166917__(/*! https */ "https"));
const AppConfigService_1 = __importDefault(__nested_webpack_require_166917__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const cors_1 = __importDefault(__nested_webpack_require_166917__(/*! cors */ "cors"));
const http_1 = __importStar(__nested_webpack_require_166917__(/*! http */ "http"));
const AuthService_1 = __importDefault(__nested_webpack_require_166917__(/*! ./AuthService */ "../src/services/AuthService.ts"));
const fs_1 = __importDefault(__nested_webpack_require_166917__(/*! fs */ "fs"));
const express_1 = __importDefault(__nested_webpack_require_166917__(/*! express */ "express"));
const RouterService_1 = __importDefault(__nested_webpack_require_166917__(/*! ./RouterService */ "../src/services/RouterService.ts"));
const ProcessService_1 = __importDefault(__nested_webpack_require_166917__(/*! ./ProcessService */ "../src/services/ProcessService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_166917__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__nested_webpack_require_166917__(/*! ./UtilsService */ "../src/services/UtilsService.ts"));
const path_1 = __importDefault(__nested_webpack_require_166917__(/*! path */ "path"));
const body_parser_1 = __importDefault(__nested_webpack_require_166917__(/*! body-parser */ "body-parser"));
const Error404_1 = __importDefault(__nested_webpack_require_166917__(/*! ../errors/Error404 */ "../src/errors/Error404.ts"));
const compression_1 = __importDefault(__nested_webpack_require_166917__(/*! compression */ "compression"));
const fileUpload = __nested_webpack_require_166917__(/*! express-fileupload */ "express-fileupload");
const getCurrentLineNumber = UtilsService_1.default.getCurrentLineNumber;
const wsLog = async (fakeError, text, socketId = null, isError = false) => {
    const logit = isError ? console.error : console.log;
    const filePath = module.id;
    const fileName = filePath.split('/').pop();
    const marker = '[RWS Websocket]';
    logit(isError ? ConsoleService_1.default.color().red(marker) : ConsoleService_1.default.color().green(marker), `|`, `${filePath}:${await getCurrentLineNumber(fakeError)}`, `|${socketId ? ConsoleService_1.default.color().blueBright(` (${socketId})`) : ''}:`, `${text}`);
};
const MINUTE = 1000 * 60;
class ServerService extends socket_io_1.Server {
    constructor(webServer, expressApp, opts) {
        const _DOMAIN = opts.cors_domain || opts.domain;
        const WEBSOCKET_CORS = {
            origin: _DOMAIN,
            methods: ["GET", "POST"]
        };
        const cors_headers = ['Content-Type', 'x-csrf-token', 'Accept', 'Authorization', 'x-junctionapi-version'];
        super(webServer, {
            cors: WEBSOCKET_CORS,
            transports: [opts.transport || 'websocket'],
            pingTimeout: 5 * MINUTE
        });
        this.tokens = {};
        this.users = {};
        this.disconnectClient = (clientSocket) => {
            clientSocket.disconnect(true);
        };
        const _self = this;
        this.server_app = expressApp;
        this.srv = webServer;
        this.options = opts;
        const corsHeadersSettings = {
            "Access-Control-Allow-Origin": _DOMAIN, // Replace with your frontend domain
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": cors_headers.join(', '),
            "Access-Control-Allow-Credentials": 'true'
        };
        this.srv.on("options", (req, res) => {
            res.writeHead(200, corsHeadersSettings);
            res.end();
        });
        this.server_app.use((req, res, next) => {
            Object.keys(corsHeadersSettings).forEach((key) => {
                res.setHeader(key, corsHeadersSettings[key]);
            });
            next();
        });
        const corsOptions = {
            origin: _DOMAIN, // Replace with the appropriate origins or set it to '*'
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: cors_headers
        };
        console.log('cors-options', corsOptions);
        const corsMiddleware = (0, cors_1.default)(corsOptions);
        this.use(async (socket, next) => {
            const request = socket.request;
            const response = new http_1.ServerResponse(request);
            corsMiddleware(request, response, next);
        });
        this.server_app.options('*', (0, cors_1.default)(corsOptions)); // Enable pre-flight for all routes
        if (opts.authorization) {
            this.setupAuth();
        }
    }
    static async initializeApp(opts) {
        var _b, _c;
        if (!_a.http_server) {
            const [baseHttpServer, expressHttpServer] = await _a.createServerInstance(opts);
            const http_instance = new _a(baseHttpServer, expressHttpServer, opts);
            const isSSL = (_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ssl;
            const httpPort = (0, AppConfigService_1.default)().get('port');
            _a.http_server = { instance: await http_instance.configureHTTPServer(), starter: http_instance.createServerStarter(httpPort, () => {
                    ConsoleService_1.default.log(ConsoleService_1.default.color().green('Request/response server' + ` is working on port ${httpPort} using HTTP${isSSL ? 'S' : ''} protocol`));
                }) };
        }
        if (!_a.ws_server) {
            const [baseWsServer, expressWsServer] = await _a.createServerInstance(opts);
            const ws_instance = new _a(baseWsServer, expressWsServer, opts);
            const isSSL = (_c = (0, AppConfigService_1.default)().get('features')) === null || _c === void 0 ? void 0 : _c.ssl;
            const wsPort = (0, AppConfigService_1.default)().get('ws_port');
            _a.ws_server = { instance: await ws_instance.configureWSServer(), starter: ws_instance.createServerStarter(wsPort, () => {
                    ConsoleService_1.default.log(ConsoleService_1.default.color().green('Websocket server' + ` is working on port ${wsPort}. SSL is ${isSSL ? 'enabled' : 'disabled'}.`));
                }) };
        }
        const allProcessesIds = ProcessService_1.default.getAllProcessesIds();
        const executeDir = process.cwd();
        const pacakgeDir = UtilsService_1.default.findRootWorkspacePath(process.cwd());
        const rwsDir = `${pacakgeDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(rwsDir)) {
            fs_1.default.mkdirSync(rwsDir);
        }
        return {
            websocket: this.ws_server,
            http: this.http_server,
        };
    }
    setJWTToken(socketId, token) {
        if (token.indexOf('Bearer') > -1) {
            this.tokens[socketId] = token.split(' ')[1];
        }
        else {
            this.tokens[socketId] = token;
        }
    }
    webServer() {
        return this.srv;
    }
    static async createServerInstance(opts) {
        var _b;
        const app = (0, express_1.default)();
        const isSSL = (_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ssl;
        const options = {};
        if (isSSL) {
            const sslCert = (0, AppConfigService_1.default)().get('ssl_cert');
            const sslKey = (0, AppConfigService_1.default)().get('ssl_key');
            if (!sslKey || !sslCert || !fs_1.default.existsSync(sslCert) || !fs_1.default.existsSync(sslKey)) {
                throw new Error('SSL keys set in config do not exist.');
            }
            options.key = fs_1.default.readFileSync(sslKey);
            options.cert = fs_1.default.readFileSync(sslCert);
        }
        const webServer = isSSL ? https_1.default.createServer(options, app) : http_1.default.createServer(app);
        return [webServer, app];
    }
    createServerStarter(port, injected = () => { }) {
        return (async (callback = () => { }) => {
            this.webServer().listen(port, () => {
                injected();
                callback();
            });
        }).bind(this);
    }
    async configureHTTPServer() {
        var _b;
        this.server_app.use(fileUpload());
        // app.use(express.json({ limit: '200mb' }));
        this.server_app.use(body_parser_1.default.json({ limit: '200mb' }));
        if ((_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.routing_enabled) {
            if (this.options.pub_dir) {
                this.server_app.use(express_1.default.static(this.options.pub_dir));
            }
            this.server_app.set('view engine', 'ejs');
            const processed_routes = await RouterService_1.default.assignRoutes(this.server_app, this.options.httpRoutes, this.options.controllerList);
            this.server_app.use((req, res, next) => {
                if (!RouterService_1.default.hasRoute(req.originalUrl, processed_routes)) {
                    _a.on404(req, res);
                }
                else {
                    next();
                }
            });
        }
        this.use(compression_1.default);
        return this;
    }
    async configureWSServer() {
        var _b;
        if ((_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ws_enabled) {
            this.sockets.on('connection', async (socket) => {
                const socketId = socket.id;
                wsLog(new Error(), `Client connection recieved`, socketId);
                socket.on("disconnect", async (reason) => {
                    wsLog(new Error(), `Client disconnected due to ${reason}`, socketId);
                    if (reason === 'transport error') {
                        wsLog(new Error(), `Transport error`, socketId, true);
                    }
                });
                socket.on('error', async (error) => {
                    wsLog(new Error(), error, socketId, true);
                });
                socket.on('__PING__', async () => {
                    wsLog(new Error(), `Recieved ping... Emmiting response callback.`, socketId);
                    socket.emit('__PONG__', '__PONG__');
                });
                Object.keys(this.options.wsRoutes).forEach((eventName) => {
                    const SocketClass = this.options.wsRoutes[eventName];
                    new SocketClass(_a.ws_server).handleConnection(socket, eventName);
                });
            });
        }
        return this;
    }
    setupAuth() {
        const _self = this;
        this.use(async (socket, next) => {
            const AppConfigService = (0, AppConfigService_1.default)();
            const request = socket.request;
            const response = new http_1.ServerResponse(request);
            const authHeader = request.headers.authorization;
            const UserClass = await AppConfigService.get('user_class');
            if (!authHeader) {
                response.writeHead(400, 'No token provided');
                response.end();
                return;
            }
            if (!_self.tokens[socket.id]) {
                _self.setJWTToken(socket.id, authHeader);
            }
            if (!_self.users[socket.id]) {
                try {
                    _self.users[socket.id] = await AuthService_1.default.authorize(_self.tokens[socket.id], UserClass);
                }
                catch (e) {
                    ConsoleService_1.default.error('Token authorization error: ', e.message);
                }
            }
            if (!_self.users[socket.id]) {
                _self.disconnectClient(socket);
                ConsoleService_1.default.error('Token unauthorized');
                response.writeHead(403, 'Token unauthorized');
                response.end();
                return;
            }
        });
    }
    static on404(req, res) {
        const error = new Error404_1.default(new Error('Sorry, the page you\'re looking for doesn\'t exist.'), req.url);
        error.printFullError();
        let response = error.getMessage();
        if (req.headers.accept.indexOf('text/html') > -1) {
            const htmlTemplate = this.processErrorTemplate(error);
            response = htmlTemplate;
        }
        res.status(404).send(response);
    }
    static processErrorTemplate(error) {
        return fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', '..', '..', 'html') + '/error.html', 'utf-8')
            .replace('{{error_number}}', error.getCode().toString())
            .replace('{{error_message}}', error.getMessage())
            .replace('{{error_stack_trace}}', error.getStackTraceString() !== '' ? `<h4>Stack trace:</h4><pre>${error.getStackTraceString()}</pre>` : '');
    }
    getOptions() {
        return this.options;
    }
}
_a = ServerService;
ServerService.cookies = {
    getCookies: async (headers) => {
        return new Promise((resolve) => {
            resolve(headers.cookie.split(';').map((cookieEntry) => {
                const [key, value] = cookieEntry.split('=');
                return {
                    [key]: value
                };
            }));
        });
    },
    getCookie: async (headers, key) => {
        const cookiesBin = await _a.cookies.getCookies(headers);
        if (!cookiesBin[key]) {
            return null;
        }
        return cookiesBin[key];
    }
};
exports["default"] = ServerService;


/***/ }),

/***/ "../src/services/TraversalService.ts":
/*!*******************************************!*\
  !*** ../src/services/TraversalService.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_181827__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_181827__(/*! ./_service */ "../src/services/_service.ts"));
const path_1 = __importDefault(__nested_webpack_require_181827__(/*! path */ "path"));
const fs_1 = __importDefault(__nested_webpack_require_181827__(/*! fs */ "fs"));
class TraversalService extends _service_1.default {
    getAllFilesInFolder(folderPath, ignoreFilenames = [], recursive = false) {
        const files = [];
        function traverseDirectory(currentPath) {
            const entries = fs_1.default.readdirSync(currentPath, { withFileTypes: true });
            entries.forEach(entry => {
                const entryPath = path_1.default.join(currentPath, entry.name);
                if (entry.isFile()) {
                    if (!ignoreFilenames.includes(entryPath)) {
                        files.push(entryPath);
                    }
                }
                else if (entry.isDirectory() && recursive) {
                    traverseDirectory(entryPath);
                }
            });
        }
        traverseDirectory(folderPath);
        return files;
    }
}
exports["default"] = TraversalService.getSingleton();


/***/ }),

/***/ "../src/services/UtilsService.ts":
/*!***************************************!*\
  !*** ../src/services/UtilsService.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_183439__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_183439__(/*! ./_service */ "../src/services/_service.ts"));
const fs_1 = __importDefault(__nested_webpack_require_183439__(/*! fs */ "fs"));
const path_1 = __importDefault(__nested_webpack_require_183439__(/*! path */ "path"));
const source_map_1 = __nested_webpack_require_183439__(/*! source-map */ "source-map");
class UtilsService extends _service_1.default {
    startExecTimeRecord() {
        this._startTime = process.hrtime();
    }
    endExecTimeRecord() {
        if (this._startTime === null) {
            return 0;
        }
        const elapsed = process.hrtime(this._startTime);
        this._startTime = null;
        return Math.round(elapsed[0] * 1000 + elapsed[1] / 1e6);
    }
    filterNonEmpty(arr) {
        return arr.filter((argElement) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
    }
    isInterface(func) {
        return typeof func === 'function';
    }
    getRWSVar(fileName) {
        const packageDir = this.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return;
        }
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    }
    setRWSVar(fileName, value) {
        const packageDir = this.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        fs_1.default.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
    findRootWorkspacePath(currentPath) {
        const parentPackageJsonPath = path_1.default.join(currentPath + '/..', 'package.json');
        const parentPackageDir = path_1.default.dirname(parentPackageJsonPath);
        if (fs_1.default.existsSync(parentPackageJsonPath)) {
            const packageJson = JSON.parse(fs_1.default.readFileSync(parentPackageJsonPath, 'utf-8'));
            if (packageJson.workspaces) {
                return this.findRootWorkspacePath(parentPackageDir);
            }
        }
        return currentPath;
    }
    async getCurrentLineNumber(error = null) {
        if (!error) {
            error = new Error();
        }
        const stack = error.stack || '';
        const stackLines = stack.split('\n');
        const relevantLine = stackLines[1];
        // Extract file path from the stack line
        const match = relevantLine.match(/\((.*?):\d+:\d+\)/);
        if (!match)
            return -1;
        const filePath = match[1];
        // Assuming the source map is in the same directory with '.map' extension
        const sourceMapPath = `${filePath}.map`;
        // Read the source map
        const sourceMapContent = fs_1.default.readFileSync(sourceMapPath, 'utf-8');
        const sourceMap = JSON.parse(sourceMapContent);
        const consumer = await new source_map_1.SourceMapConsumer(sourceMap);
        // Extract line and column number
        const lineMatch = relevantLine.match(/:(\d+):(\d+)/);
        if (!lineMatch)
            return -1;
        const originalPosition = consumer.originalPositionFor({
            line: parseInt(lineMatch[1]),
            column: parseInt(lineMatch[2]),
        });
        return originalPosition.line;
    }
}
exports["default"] = UtilsService.getSingleton();


/***/ }),

/***/ "../src/services/VPCService.ts":
/*!*************************************!*\
  !*** ../src/services/VPCService.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_187409__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AWSService_1 = __importDefault(__nested_webpack_require_187409__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_187409__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const _service_1 = __importDefault(__nested_webpack_require_187409__(/*! ./_service */ "../src/services/_service.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
class VPCService extends _service_1.default {
    async findDefaultSubnetForVPC() {
        try {
            const response = await AWSService_1.default.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
            if (response.Vpcs && response.Vpcs.length > 0) {
                return [await this.getSubnetIdForVpc(response.Vpcs[0].VpcId), response.Vpcs[0].VpcId];
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
        const result = await AWSService_1.default.getEC2().describeSubnets(params).promise();
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId)[0];
        }
        else {
            return null;
        }
    }
    async listSecurityGroups() {
        try {
            const result = await AWSService_1.default.getEC2().describeSecurityGroups().promise();
            const securityGroups = result.SecurityGroups || [];
            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
            return securityGroupIds;
        }
        catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }
    async getDefaultRouteTable(vpcId, subnetId = null) {
        var _a;
        const filters = [{
                Name: "vpc-id",
                Values: [vpcId]
            }];
        if (subnetId) {
            filters.push({
                Name: "association.subnet-id",
                Values: [subnetId]
            });
        }
        const routeTablesResponse = await AWSService_1.default.getEC2().describeRouteTables({
            Filters: filters
        }).promise();
        return (_a = routeTablesResponse.RouteTables) === null || _a === void 0 ? void 0 : _a.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }
    async createVPCEndpointIfNotExist(vpcId) {
        const endpointName = "RWS-S3-GATE";
        const serviceName = `com.amazonaws.${AWSService_1.default.getRegion()}.s3`;
        // Describe VPC Endpoints
        const existingEndpoints = await AWSService_1.default.getEC2().describeVpcEndpoints({
            Filters: [
                {
                    Name: "tag:Name",
                    Values: [endpointName]
                }
            ]
        }).promise();
        const defaultRouteTable = await this.getDefaultRouteTable(vpcId);
        // Check if the endpoint already exists
        const endpointExists = existingEndpoints.VpcEndpoints && existingEndpoints.VpcEndpoints.length > 0;
        if (!endpointExists) {
            // Create VPC Endpoint for S3
            const endpointResponse = await AWSService_1.default.getEC2().createVpcEndpoint({
                VpcId: vpcId,
                ServiceName: serviceName,
                VpcEndpointType: "Gateway",
                RouteTableIds: [defaultRouteTable.RouteTableId], // Add your route table IDs here
                TagSpecifications: [
                    {
                        ResourceType: "vpc-endpoint",
                        Tags: [
                            {
                                Key: "Name",
                                Value: endpointName
                            }
                        ]
                    }
                ]
            }).promise();
            if (endpointResponse.VpcEndpoint) {
                log(`VPC Endpoint "${endpointName}" created with ID: ${endpointResponse.VpcEndpoint.VpcEndpointId}`);
                return endpointResponse.VpcEndpoint.VpcEndpointId;
            }
            else {
                error("Failed to create VPC Endpoint");
                throw new Error("Failed to create VPC Endpoint");
            }
        }
        else {
            log(`VPC Endpoint "${endpointName}" already exists.`);
            return existingEndpoints.VpcEndpoints[0].VpcEndpointId;
        }
    }
    async ensureRouteToVPCEndpoint(vpcId, vpcEndpointId) {
        try {
            const routeTable = await this.getDefaultRouteTable(vpcId);
            const routes = routeTable.Routes || [];
            const hasS3EndpointRoute = routes.some((route) => route.GatewayId === vpcEndpointId);
            if (!hasS3EndpointRoute) {
                // Get the prefix list associated with the S3 VPC endpoint
                const vpcEndpointDescription = (await AWSService_1.default.getEC2().describeVpcEndpoints({
                    VpcEndpointIds: [vpcEndpointId]
                }).promise()).VpcEndpoints;
                rwsLog('Creating VPC Endpoint route');
                // Add a route to the route table
                await AWSService_1.default.getEC2().createRoute({
                    RouteTableId: routeTable.RouteTableId,
                    DestinationCidrBlock: '0.0.0.0/0',
                    VpcEndpointId: vpcEndpointDescription[0].VpcEndpointId
                }).promise();
                log(`Added route to VPC Endpoint ${vpcEndpointId} in Route Table ${routeTable.RouteTableId}`);
            }
            else {
                log(`Route to VPC Endpoint ${vpcEndpointId} already exists in Route Table ${routeTable.RouteTableId}`);
            }
        }
        catch (error) {
            console.error('Error ensuring route to VPC Endpoint:', error);
        }
    }
    async findPublicSubnetInVPC(vpcId) {
        const subnets = await AWSService_1.default.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        for (const subnet of subnets.Subnets || []) {
            const routeTables = await AWSService_1.default.getEC2().describeRouteTables({
                Filters: [{ Name: 'association.subnet-id', Values: [subnet.SubnetId] }]
            }).promise();
            for (const routeTable of routeTables.RouteTables || []) {
                for (const route of routeTable.Routes || []) {
                    if (route.DestinationCidrBlock === '0.0.0.0/0' && route.GatewayId && route.GatewayId.startsWith('igw-')) {
                        return subnet;
                    }
                }
            }
        }
        return null;
    }
    calculateNextThirdOctetIncrement(range) {
        const thirdOctet = 0;
        // Calculate the number of addresses represented by the CIDR range
        const numAddresses = Math.pow(2, 32 - range);
        // Calculate how many blocks in the third octet those addresses span
        const increment = Math.ceil(numAddresses / 256);
        const nextThirdOctet = increment;
        return nextThirdOctet;
    }
    async createPublicSubnet(vpcId, range = 24, passedCIDRBlock = null) {
        var _a;
        const _SUBNET_PASS_VAL = this.calculateNextThirdOctetIncrement(range);
        const vpcInfo = await AWSService_1.default.getEC2().describeVpcs({ VpcIds: [vpcId] }).promise();
        if (!vpcInfo.Vpcs || vpcInfo.Vpcs.length === 0) {
            throw new Error('VPC not found.');
        }
        const vpcCidrBlock = vpcInfo.Vpcs[0].CidrBlock;
        // Retrieve existing subnets within the VPC
        const subnets = await AWSService_1.default.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        const existingCidrs = ((_a = subnets.Subnets) === null || _a === void 0 ? void 0 : _a.map(subnet => subnet.CidrBlock).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))) || [];
        // Propose a new CIDR block
        let newCidrBlock;
        const baseIp = (passedCIDRBlock ? passedCIDRBlock : vpcCidrBlock).split('/')[0];
        const maxThirdOctet = Math.max(...existingCidrs.map(cidr => {
            const octets = cidr.split('.');
            return parseInt(octets[2]);
        }));
        const rerun = async (newOctet, newRange) => await this.createPublicSubnet(vpcId, range, `${baseIp.split('.').slice(0, 2).join('.')}.${newOctet}.0/${newRange}`);
        const baseThirdOctet = existingCidrs.length ? maxThirdOctet : 0;
        let nextThirdOctet = baseThirdOctet + _SUBNET_PASS_VAL;
        newCidrBlock = `${baseIp.split('.').slice(0, 2).join('.')}.${nextThirdOctet}.0/${range.toString()}`;
        rwsLog(`Trying to create public subnet for "${vpcId}" VPC with "${newCidrBlock}" address`);
        if (!existingCidrs.includes(newCidrBlock)) {
            try {
                const subnet = await AWSService_1.default.getEC2().createSubnet({
                    VpcId: vpcId,
                    CidrBlock: newCidrBlock
                }).promise();
                rwsLog(`Created public subnet "${subnet.Subnet.SubnetId}" for "${vpcId}" VPC with "${newCidrBlock}" address`);
                return subnet;
            }
            catch (err) {
                // If there's an error due to the CIDR block, adjust and try again
                warn(err.code);
                if (['InvalidSubnet.Range', 'InvalidSubnet.Conflict'].includes(err.code)) {
                    nextThirdOctet += _SUBNET_PASS_VAL;
                    error(`CIDR Address taken. Retrying...`);
                    return await rerun(nextThirdOctet, range);
                }
                else {
                    throw err;
                }
            }
        }
        else {
            nextThirdOctet += _SUBNET_PASS_VAL;
            error(`CIDR Address already used. Retrying...`);
            return await rerun(nextThirdOctet, range);
        }
    }
    extractThirdOctet(ip) {
        return parseInt(ip.split('.')[2]);
    }
    async waitForNatGatewayAvailable(natGatewayId) {
        try {
            rwsLog(`Waiting for NAT Gateway ${natGatewayId}...`);
            await AWSService_1.default.getEC2().waitFor('natGatewayAvailable', {
                NatGatewayIds: [natGatewayId]
            }).promise();
            rwsLog(`NAT Gateway ${natGatewayId} is now available.`);
        }
        catch (err) {
            error(`Error waiting for NAT Gateway ${natGatewayId} to become available:`);
            log(err);
            throw err;
        }
    }
}
exports["default"] = VPCService.getSingleton();


/***/ }),

/***/ "../src/services/VectorStoreService.ts":
/*!*********************************************!*\
  !*** ../src/services/VectorStoreService.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_198867__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_198867__(/*! ./_service */ "../src/services/_service.ts"));
const VectorStore_1 = __importDefault(__nested_webpack_require_198867__(/*! ../models/convo/VectorStore */ "../src/models/convo/VectorStore.ts"));
class VectorStoreService extends _service_1.default {
    async createStore(docs, embeddings) {
        return await (new VectorStore_1.default(docs, embeddings)).init();
    }
}
exports["default"] = VectorStoreService.getSingleton();


/***/ }),

/***/ "../src/services/ZipService.ts":
/*!*************************************!*\
  !*** ../src/services/ZipService.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_199814__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__nested_webpack_require_199814__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__nested_webpack_require_199814__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const path_1 = __importDefault(__nested_webpack_require_199814__(/*! path */ "path"));
const fs_1 = __importDefault(__nested_webpack_require_199814__(/*! fs */ "fs"));
const archiver_1 = __importDefault(__nested_webpack_require_199814__(/*! archiver */ "archiver"));
const { log, warn, error, color } = ConsoleService_1.default;
const defaultZipParams = {
    recursive: true,
    format: 'zip',
    ignore: []
};
class ZipService extends _service_1.default {
    constructor() {
        super();
    }
    async createArchive(outputPath, sourcePath, params = null) {
        if (params) {
            params = Object.assign(defaultZipParams, params);
        }
        else {
            params = defaultZipParams;
        }
        const archive = (0, archiver_1.default)(params.format);
        const output = fs_1.default.createWriteStream(outputPath);
        archive.pipe(output);
        // archive.directory(sourcePath, params.recursive ? false : params.destpath);
        archive.glob('**/*', {
            cwd: sourcePath,
            dot: true, //include .dotpaths
            ignore: params.ignore
        });
        log(`${color().green('[RWS Lambda Service]')} ZIP params:`);
        log(params);
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
    listFilesInDirectory(directoryPath) {
        const files = fs_1.default.readdirSync(directoryPath);
        const filePaths = [];
        files.forEach(file => {
            const fullPath = path_1.default.join(directoryPath, file);
            const stats = fs_1.default.statSync(fullPath);
            if (stats.isFile()) {
                filePaths.push(fullPath);
            }
        });
        return filePaths;
    }
}
exports["default"] = ZipService.getSingleton();


/***/ }),

/***/ "../src/services/_service.ts":
/*!***********************************!*\
  !*** ../src/services/_service.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TheService {
    constructor() {
        this._RELOADABLE = false;
    }
    static getSingleton() {
        const className = this.name;
        if (!TheService._instances[className]) {
            TheService._instances[className] = new this();
        }
        return TheService._instances[className];
    }
    getReloadable() {
        return this.constructor._RELOADABLE || this._RELOADABLE;
    }
    reloadService(...params) {
        const className = this.name;
        TheService._instances[className] = new this(...params);
        return TheService._instances[className];
    }
}
TheService._instances = {};
exports["default"] = TheService;


/***/ }),

/***/ "../src/sockets/_socket.ts":
/*!*********************************!*\
  !*** ../src/sockets/_socket.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TheSocket {
    constructor(server) {
        this.server = server;
    }
    handleConnection(socket, routeName) {
        throw new Error("Method not implemented.");
    }
    middlewareImplementation(next) {
        throw new Error("Method not implemented.");
    }
    getJson(input) {
        return JSON.parse(input);
    }
    sendJson(input) {
        return JSON.stringify(input);
    }
    emitMessage(method, socket, data = null) {
        socket.emit(method, this.sendJson({ success: true, data, method }));
    }
}
exports["default"] = TheSocket;


/***/ }),

/***/ "../src/tests/actions/_action.ts":
/*!***************************************!*\
  !*** ../src/tests/actions/_action.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TestAction {
    constructor(vars) {
        this.vars = vars;
    }
}
exports["default"] = TestAction;


/***/ }),

/***/ "../src/tests/helpers/AxiosHelper.ts":
/*!*******************************************!*\
  !*** ../src/tests/helpers/AxiosHelper.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_204778__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const axios_1 = __importDefault(__nested_webpack_require_204778__(/*! axios */ "axios"));
const https_1 = __importDefault(__nested_webpack_require_204778__(/*! https */ "https"));
const AppConfigService_1 = __importDefault(__nested_webpack_require_204778__(/*! ../../services/AppConfigService */ "../src/services/AppConfigService.ts"));
exports["default"] = {
    createInstance: (opts) => {
        const axiosInstance = axios_1.default.create(Object.assign({
            headers: {
                'Content-Type': 'application/json',
                'Origin': (0, AppConfigService_1.default)().get('domain')
            },
            withCredentials: true,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false // This line will ignore SSL verification.
            })
        }, opts));
        axiosInstance.defaults.timeout = 60000; // Increase timeout to 60000ms (60 seconds)
        axiosInstance.interceptors.request.use((config) => {
            return config;
        });
        return axiosInstance;
    }
};


/***/ }),

/***/ "../src/tests/helpers/BrowserHelper.ts":
/*!*********************************************!*\
  !*** ../src/tests/helpers/BrowserHelper.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_206303__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebBrowser = void 0;
const puppeteer_1 = __importDefault(__nested_webpack_require_206303__(/*! puppeteer */ "puppeteer"));
class WebBrowser {
    constructor(app, params) {
        this.app = app;
        this.params = params;
    }
    async getCookies() {
        const page = await this.app.newPage();
        await page.goto(this.params.url);
        // Get cookies
        const cookiesArray = await page.cookies();
        await this.app.close();
        return cookiesArray.reduce((acc, cookie) => {
            acc[cookie.name] = cookie;
            return acc;
        }, {});
    }
    async getCookieString() {
        return Object.entries(await this.getCookies())
            .map(([name, cookie]) => `${name}=${cookie.value}`)
            .join('; ');
    }
}
exports.WebBrowser = WebBrowser;
async function create(params) {
    const browser = await puppeteer_1.default.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    });
    return new WebBrowser(browser, params);
}
exports["default"] = {
    create,
};


/***/ }),

/***/ "../src/tests/helpers/TestHelper.ts":
/*!******************************************!*\
  !*** ../src/tests/helpers/TestHelper.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_207894__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestCase = exports.MOCHA = void 0;
const AppConfigService_1 = __importDefault(__nested_webpack_require_207894__(/*! ../../services/AppConfigService */ "../src/services/AppConfigService.ts"));
const ServerService_1 = __importDefault(__nested_webpack_require_207894__(/*! ../../services/ServerService */ "../src/services/ServerService.ts"));
const socket_io_client_1 = __nested_webpack_require_207894__(/*! socket.io-client */ "socket.io-client");
const _mocha = __importStar(__nested_webpack_require_207894__(/*! mocha */ "mocha"));
const chai_1 = __importStar(__nested_webpack_require_207894__(/*! chai */ "chai"));
const chai_like_1 = __importDefault(__nested_webpack_require_207894__(/*! chai-like */ "chai-like"));
const chai_things_1 = __importDefault(__nested_webpack_require_207894__(/*! chai-things */ "chai-things"));
const _test_case_1 = __importDefault(__nested_webpack_require_207894__(/*! ../test_cases/_test_case */ "../src/tests/test_cases/_test_case.ts"));
exports.TestCase = _test_case_1.default;
chai_1.default.use(chai_like_1.default);
chai_1.default.use(chai_things_1.default);
const createTestVars = (cfg = null) => {
    (0, AppConfigService_1.default)(cfg);
    return {
        server: null,
        socket: null,
        theUser: null,
        browser: null
    };
};
const connectToWS = async (jwt_token, ping_event = '__PING__', ping_response_event = '__PONG__') => {
    const headers = {
        Authorization: 'Bearer ' + jwt_token
    };
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const _TESTPORT = await (0, AppConfigService_1.default)().get('test_port');
        const socket = (0, socket_io_client_1.io)(`https://localhost:${_TESTPORT}`, {
            extraHeaders: headers,
            rejectUnauthorized: false
        });
        socket.on('error', (error) => {
            console.error('Socket Error:', error);
        });
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
        return new Promise((done) => {
            socket.on(ping_response_event, () => {
                done(socket);
            });
            socket.emit(ping_event);
        });
    }
    catch (error) {
        console.error('Error initializing socket:', error.context.responseText);
        throw error;
    }
};
const setLoggedLifeCycle = (testVars, callbacks) => {
    setLifeCycle(testVars, {
        before: async () => {
            testVars.server = await startServer();
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
                return await callbacks.after(testVars);
            }
            return;
        },
        beforeEach: async () => {
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.beforeEach) {
                return await callbacks.beforeEach(testVars);
            }
            return;
        },
        afterEach: async () => {
            if (testVars.socket && testVars.socket.connected) {
                testVars.socket.disconnect();
            }
            return;
        },
        after: async () => {
            if (testVars.server) {
                testVars.server.http.instance.close();
                testVars.server.websocket.instance.close();
            }
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
                return await callbacks.after(testVars);
            }
            return;
        }
    }, {
        beforeEach: 30000
    });
};
const startServer = async () => {
    const _TESTPORT = await (0, AppConfigService_1.default)().get('test_port');
    const _TESTWSPORT = await (0, AppConfigService_1.default)().get('test_ws_port');
    const server = await ServerService_1.default.initializeApp({
        controllerList: await (0, AppConfigService_1.default)().get('controller_list'),
        wsRoutes: await (0, AppConfigService_1.default)().get('ws_routes'),
        httpRoutes: await (0, AppConfigService_1.default)().get('http_routes')
    });
    const startHTTPListener = async () => new Promise((resolve) => {
        server.http.starter();
    });
    const startWSListener = async () => new Promise((resolve) => {
        server.websocket.starter();
    });
    return server;
};
const setLifeCycle = (testVars, callbacks, timeouts) => {
    MOCHA.before(async function () {
        if (timeouts === null || timeouts === void 0 ? void 0 : timeouts.before) {
            this.timeout(timeouts.before);
        }
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.before) {
            await callbacks.before(testVars);
        }
    });
    MOCHA.beforeEach(async function () {
        if (timeouts === null || timeouts === void 0 ? void 0 : timeouts.beforeEach) {
            this.timeout(timeouts.beforeEach);
        }
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.beforeEach) {
            await callbacks.beforeEach(testVars);
        }
        return;
    });
    MOCHA.afterEach(async function () {
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.afterEach) {
            await callbacks.afterEach(testVars);
        }
    });
    MOCHA.after(async function () {
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
            await callbacks.after(testVars);
        }
    });
};
exports["default"] = {
    connectToWS,
    startServer,
    createTestVars,
    disableLogging: () => { console.log = () => { }; }
};
const MOCHA = Object.assign(_mocha, {
    expect: chai_1.expect,
    setLifeCycle,
    setLoggedLifeCycle
});
exports.MOCHA = MOCHA;


/***/ }),

/***/ "../src/tests/index.ts":
/*!*****************************!*\
  !*** ../src/tests/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __nested_webpack_require_214938__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MOCHA = exports.TestHelper = exports.TestCase = exports.TestAction = exports.BrowserHelper = exports.AxiosHelper = void 0;
const AxiosHelper_1 = __importDefault(__nested_webpack_require_214938__(/*! ./helpers/AxiosHelper */ "../src/tests/helpers/AxiosHelper.ts"));
exports.AxiosHelper = AxiosHelper_1.default;
const BrowserHelper_1 = __importDefault(__nested_webpack_require_214938__(/*! ./helpers/BrowserHelper */ "../src/tests/helpers/BrowserHelper.ts"));
exports.BrowserHelper = BrowserHelper_1.default;
const TestHelper_1 = __importStar(__nested_webpack_require_214938__(/*! ./helpers/TestHelper */ "../src/tests/helpers/TestHelper.ts"));
exports.TestHelper = TestHelper_1.default;
Object.defineProperty(exports, "MOCHA", ({ enumerable: true, get: function () { return TestHelper_1.MOCHA; } }));
const _action_1 = __importDefault(__nested_webpack_require_214938__(/*! ./actions/_action */ "../src/tests/actions/_action.ts"));
exports.TestAction = _action_1.default;
const _test_case_1 = __importDefault(__nested_webpack_require_214938__(/*! ./test_cases/_test_case */ "../src/tests/test_cases/_test_case.ts"));
exports.TestCase = _test_case_1.default;


/***/ }),

/***/ "../src/tests/test_cases/_test_case.ts":
/*!*********************************************!*\
  !*** ../src/tests/test_cases/_test_case.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TestCase {
    constructor() {
        throw new Error('Class not instantiable');
    }
    static declare(testVars) {
        throw new Error('Method not implemented.');
    }
}
exports["default"] = TestCase;


/***/ }),

/***/ "@langchain/community/vectorstores/faiss":
/*!**********************************************************!*\
  !*** external "@langchain/community/vectorstores/faiss" ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! @langchain/community/vectorstores/faiss */ "@langchain/community/vectorstores/faiss");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! @prisma/client */ "@prisma/client");

/***/ }),

/***/ "archiver":
/*!***************************!*\
  !*** external "archiver" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! archiver */ "archiver");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! aws-sdk */ "aws-sdk");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! axios */ "axios");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! body-parser */ "body-parser");

/***/ }),

/***/ "chai":
/*!***********************!*\
  !*** external "chai" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! chai */ "chai");

/***/ }),

/***/ "chai-like":
/*!****************************!*\
  !*** external "chai-like" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! chai-like */ "chai-like");

/***/ }),

/***/ "chai-things":
/*!******************************!*\
  !*** external "chai-things" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! chai-things */ "chai-things");

/***/ }),

/***/ "chalk":
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! chalk */ "chalk");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! compression */ "compression");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! cors */ "cors");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! express */ "express");

/***/ }),

/***/ "express-fileupload":
/*!*************************************!*\
  !*** external "express-fileupload" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! express-fileupload */ "express-fileupload");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! fs */ "fs");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! fs/promises */ "fs/promises");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");

/***/ }),

/***/ "langchain/chains":
/*!***********************************!*\
  !*** external "langchain/chains" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! langchain/chains */ "langchain/chains");

/***/ }),

/***/ "langchain/document":
/*!*************************************!*\
  !*** external "langchain/document" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! langchain/document */ "langchain/document");

/***/ }),

/***/ "langchain/document_loaders/fs/text":
/*!*****************************************************!*\
  !*** external "langchain/document_loaders/fs/text" ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! langchain/document_loaders/fs/text */ "langchain/document_loaders/fs/text");

/***/ }),

/***/ "langchain/text_splitter":
/*!******************************************!*\
  !*** external "langchain/text_splitter" ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! langchain/text_splitter */ "langchain/text_splitter");

/***/ }),

/***/ "mocha":
/*!************************!*\
  !*** external "mocha" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! mocha */ "mocha");

/***/ }),

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! mongodb */ "mongodb");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! path */ "path");

/***/ }),

/***/ "pino":
/*!***********************!*\
  !*** external "pino" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! pino */ "pino");

/***/ }),

/***/ "pino-pretty":
/*!******************************!*\
  !*** external "pino-pretty" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! pino-pretty */ "pino-pretty");

/***/ }),

/***/ "puppeteer":
/*!****************************!*\
  !*** external "puppeteer" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! puppeteer */ "puppeteer");

/***/ }),

/***/ "reflect-metadata":
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! reflect-metadata */ "reflect-metadata");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! socket.io */ "socket.io");

/***/ }),

/***/ "socket.io-client":
/*!***********************************!*\
  !*** external "socket.io-client" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! socket.io-client */ "socket.io-client");

/***/ }),

/***/ "source-map":
/*!*****************************!*\
  !*** external "source-map" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! source-map */ "source-map");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! uuid */ "uuid");

/***/ }),

/***/ "xml2js":
/*!*************************!*\
  !*** external "xml2js" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! xml2js */ "xml2js");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! child_process */ "child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! crypto */ "crypto");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! http */ "http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! https */ "https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! os */ "os");

/***/ }),

/***/ "readline":
/*!***************************!*\
  !*** external "readline" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = __webpack_require__(/*! readline */ "readline");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nested_webpack_require_226447__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nested_webpack_require_226447__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nested_webpack_require_226447__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__nested_webpack_require_226447__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __nested_webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __nested_webpack_exports__;
/*!********************!*\
  !*** ./src/rws.ts ***!
  \********************/
//#!/usr/bin/env node

Object.defineProperty(exports, "__esModule", ({ value: true }));
const index_1 = __nested_webpack_require_226447__(/*! ../../src/index */ "../src/index.ts");
const { log, warn, error, color, rwsLog } = index_1.ConsoleService;
const fs = __nested_webpack_require_226447__(/*! fs */ "fs");
const path = __nested_webpack_require_226447__(/*! path */ "path");
// process.argv[2] will be the first command line argument after `rws`
const command = process.argv[2];
// process.argv[3] will be the parameter args for commands
const cmdParamString = process.argv[3];
const cmdArgs = !!cmdParamString && cmdParamString.length > 2 ? cmdParamString.split(',') : [];
const commandExecutionArgs = { _default: null, _extra_args: {} };
if (cmdParamString && cmdParamString.indexOf('=') > -1) {
    cmdArgs.forEach((arg) => {
        const argData = arg.split('=');
        commandExecutionArgs[argData[0].replace('--', '')] = argData[1];
        if (!commandExecutionArgs._default) {
            commandExecutionArgs._default = argData[1];
        }
    });
}
else if (!cmdParamString || !cmdArgs.length) {
    commandExecutionArgs._default = null;
}
else {
    commandExecutionArgs._default = cmdParamString;
}
if (process.argv.length > 4) {
    for (let i = 4; i <= process.argv.length - 1; i++) {
        const parameter = process.argv[i].replace('--', '').replace('-', '_');
        const valuePair = parameter.split('=');
        commandExecutionArgs._extra_args[valuePair[0]] = valuePair.length > 1 ? valuePair[1] : true;
    }
}
const executionDir = process.cwd();
const packageRootDir = index_1.UtilsService.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const moduleCfgFile = `${moduleCfgDir}/_cfg_path`;
function getConfig(configPath, cfgPathFile = null) {
    if (cfgPathFile === null) {
        cfgPathFile = configPath;
        if (cfgPathFile) {
            const rwsConfigVar = index_1.UtilsService.getRWSVar(cfgPathFile);
            if (rwsConfigVar) {
                configPath = rwsConfigVar;
            }
        }
    }
    else {
        index_1.UtilsService.setRWSVar(cfgPathFile, configPath);
    }
    const pathWorkspaceToCwd = path.relative(__dirname, process.cwd());
    console.log(__dirname);
    const frameworkConfigFactory = Object(function webpackMissingModule() { var e = new Error("Cannot find module 'undefined'"); e.code = 'MODULE_NOT_FOUND'; throw e; }()).default;
    return frameworkConfigFactory();
}
function copyFileSync(source, destination) {
    try {
        const content = fs.readFileSync(source);
        fs.writeFileSync(destination, content);
        console.log(`File copied from ${source} to ${destination}`);
    }
    catch (error) {
        console.error('Error occurred while copying file:', error);
    }
}
const main = async () => {
    const cfgPathFile = `_cfg_path`;
    const tsFile = path.resolve(__dirname, '..', 'src') + '/rws.ts';
    let APP_CFG = null;
    if (command === 'init') {
        const configPath = commandExecutionArgs.config || commandExecutionArgs._default || 'config/config';
        const cfgData = getConfig(configPath, cfgPathFile);
        APP_CFG = cfgData;
    }
    let savedHash = null;
    const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;
    if (fs.existsSync(`${moduleCfgDir}/_cli_hash`)) {
        savedHash = fs.readFileSync(consoleClientHashFile, 'utf-8');
    }
    if (!APP_CFG) {
        APP_CFG = getConfig('config/config', cfgPathFile);
    }
    if (!APP_CFG) {
        throw new Error(`No config for CLI. Try to initialize with "yarn rws init config=path/to/config.ts" (config path from ${process.cwd()}/src)`);
    }
    const APP = (0, index_1.getAppConfig)(APP_CFG);
    const commands = [...index_1.RWSAppCommands, ...APP.get('commands')];
    const theCommand = commands.find((cmd) => cmd.getName() == command);
    commandExecutionArgs._rws_config = APP_CFG;
    const cmdFiles = index_1.MD5Service.batchGenerateCommandFileMD5(moduleCfgDir);
    const currentSumHashes = (await index_1.MD5Service.generateCliHashes([tsFile, ...cmdFiles])).join('/');
    if (!savedHash || currentSumHashes !== savedHash) {
        fs.writeFileSync(consoleClientHashFile, currentSumHashes);
    }
    if (theCommand) {
        await theCommand.execute(commandExecutionArgs);
        return;
    }
    if (!fs.existsSync(`${moduleCfgDir}/${cfgPathFile}`)) {
        throw new Error('No config path generated for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
    }
    error(`Unknown command: ${command}.`);
    return;
};
main().then(() => {
    process.exit(0);
});

})();

/******/ })()
;
//# sourceMappingURL=cfg.js.map

/***/ }),

/***/ "../src/services sync recursive":
/*!*****************************!*\
  !*** ../src/services/ sync ***!
  \*****************************/
/***/ ((module) => {

function webpackEmptyContext(req) {
	var e = new Error("Cannot find module '" + req + "'");
	e.code = 'MODULE_NOT_FOUND';
	throw e;
}
webpackEmptyContext.keys = () => ([]);
webpackEmptyContext.resolve = webpackEmptyContext;
webpackEmptyContext.id = "../src/services sync recursive";
module.exports = webpackEmptyContext;

/***/ }),

/***/ "../src/commands/ClearCommand.ts":
/*!***************************************!*\
  !*** ../src/commands/ClearCommand.ts ***!
  \***************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _command_1 = __importDefault(__webpack_require__(/*! ./_command */ "../src/commands/_command.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const promises_1 = __webpack_require__(/*! fs/promises */ "fs/promises");
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
const { log, warn, error, color } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
class ClearCommand extends _command_1.default {
    constructor() {
        super('clear', module);
    }
    async removeDirRecursively(path) {
        try {
            await (0, promises_1.rmdir)(path, { recursive: true });
            console.log(`Directory at ${path} removed successfully`);
        }
        catch (error) {
            console.error(`Error while removing directory: ${error}`);
        }
    }
    async execute(params) {
        ConsoleService_1.default.log('clearing systems...');
        await this.removeDirRecursively(moduleCfgDir);
        ConsoleService_1.default.log(color().green('[RWS]') + ' systems cleared. Use npx rws init to reinitialize.');
    }
}
exports["default"] = ClearCommand.createCommand();


/***/ }),

/***/ "../src/commands/InitCommand.ts":
/*!**************************************!*\
  !*** ../src/commands/InitCommand.ts ***!
  \**************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _command_1 = __importDefault(__webpack_require__(/*! ./_command */ "../src/commands/_command.ts"));
const install_1 = __webpack_require__(/*! ../install */ "../src/install.ts");
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const { log, warn, error, color } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
class InitCommand extends _command_1.default {
    constructor() {
        super('init', module);
    }
    async execute(params) {
        ConsoleService_1.default.log(color().green('[RWS]') + ' starting systems...');
        const configPath = params.config || params._default || 'config/config';
        if (!configPath) {
            ConsoleService_1.default.error('[RWS] No config path provided! Use "npx rws init path/to/config/file (from ./src)"');
            return;
        }
        try {
            const cfgData = params._rws_config;
            try {
                await (0, install_1.SetupRWS)(cfgData);
                const prismaCfgPath = moduleDir + '/prisma/schema.prisma';
                fs_1.default.unlinkSync(prismaCfgPath);
                ConsoleService_1.default.log(color().green('[RWS]') + ' systems initialized.');
            }
            catch (error) {
                ConsoleService_1.default.error('Error while initiating RWS server installation:', error);
            }
        }
        catch (e) {
            ConsoleService_1.default.log(color().red('[RWS]') + ' wrong config file path...');
            throw new Error(e);
        }
    }
}
exports["default"] = InitCommand.createCommand();


/***/ }),

/***/ "../src/commands/LambdaCommand.ts":
/*!****************************************!*\
  !*** ../src/commands/LambdaCommand.ts ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* module decorator */ module = __webpack_require__.nmd(module);

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _command_1 = __importDefault(__webpack_require__(/*! ./_command */ "../src/commands/_command.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const AWSService_1 = __importDefault(__webpack_require__(/*! ../services/AWSService */ "../src/services/AWSService.ts"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
const EFSService_1 = __importDefault(__webpack_require__(/*! ../services/EFSService */ "../src/services/EFSService.ts"));
const LambdaService_1 = __importDefault(__webpack_require__(/*! ../services/LambdaService */ "../src/services/LambdaService.ts"));
const VPCService_1 = __importDefault(__webpack_require__(/*! ../services/VPCService */ "../src/services/VPCService.ts"));
const CloudWatchService_1 = __importDefault(__webpack_require__(/*! ../services/CloudWatchService */ "../src/services/CloudWatchService.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist/', '');
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
            rwsLog('RWS Lambda CLI | artillery | preDeploy', ' copying artillery config.');
            fs_1.default.copyFileSync(sourceArtilleryCfg, targetArtilleryCfg);
        },
        postDeploy: async (params) => {
            const targetArtilleryCfg = `${moduleDir}/lambda-functions/artillery/artillery-config.yml`;
            if (fs_1.default.existsSync(targetArtilleryCfg)) {
                fs_1.default.unlinkSync(targetArtilleryCfg);
                rwsLog('RWS Lambda CLI | artillery | postDeploy', 'artillery config cleaned up');
            }
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
                await theAction(params);
            }
        };
    }
    async execute(params) {
        AWSService_1.default._initApis();
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
        if (!!extraParams && !!extraParams.redeploy_loader) {
            const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir, true);
            await LambdaService_1.default.deployLambda('efs-loader', zipPath, vpcId, subnetId, true);
        }
        switch (lambdaCmd) {
            case 'deploy':
                await this.deploy(params);
                return;
            case 'undeploy':
                await this.undeploy(params);
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
            case 'open-to-web':
                await this.openToWeb(params);
                return;
            default:
                error(`[RWS Lambda CLI] "${lambdaCmd}" command is not supported in RWS Lambda CLI`);
                log(`Try: "deploy:${lambdaCmd}", "delete:${lambdaCmd}", invoke:${lambdaCmd} or "list:${lambdaCmd}"`);
                return;
        }
    }
    async getLambdaParameters(params) {
        const lambdaString = params.lambdaString || params._default;
        const [subnetId, vpcId] = params.subnetId || await VPCService_1.default.findDefaultSubnetForVPC();
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
            const payloadPath = LambdaService_1.default.findPayload(lambdaArg);
            payload = JSON.parse(fs_1.default.readFileSync(payloadPath, 'utf-8'));
        }
        const response = await LambdaService_1.default.invokeLambda(lambdaDirName, payload);
        const logsTimeout = await CloudWatchService_1.default.printLogsForLambda(`RWS-${lambdaDirName}`);
        rwsLog('RWS Lambda Service', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response (Code: ${response.Response.StatusCode}):`));
        if (response.InvocationType === 'RequestResponse') {
            log(response.Response.Payload);
            clearTimeout(logsTimeout.core);
        }
    }
    async list(params) {
        const listFunctionsParams = {
            MaxItems: 100,
        };
        const rwsLambdaFunctions = [];
        try {
            const functionsResponse = await AWSService_1.default.getLambda().listFunctions(listFunctionsParams).promise();
            if (functionsResponse.Functions) {
                for (const functionConfig of functionsResponse.Functions) {
                    if (functionConfig.FunctionName && functionConfig.FunctionName.startsWith('RWS-')) {
                        rwsLambdaFunctions.push(functionConfig);
                    }
                }
            }
        }
        catch (error) {
            throw new Error(`Error listing Lambda functions: ${error.message}`);
        }
        rwsLog('RWS Lambda Service', color().yellowBright(`RWS lambda functions list:`));
        rwsLog('RWS Lambda Service', color().yellowBright(`ARN  |  NAME`));
        rwsLambdaFunctions.map((funct) => funct.FunctionArn + '  |  ' + funct.FunctionName).forEach((msg) => {
            log(msg);
        });
    }
    async deploy(params) {
        const { lambdaDirName, vpcId, subnetId, lambdaArg } = await this.getLambdaParameters(params);
        if (lambdaDirName === 'modules') {
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
        const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/${lambdaDirName}`, moduleCfgDir, lambdaDirName === 'efs-loader');
        await this.executeLambdaLifeCycle('postArchive', lambdaDirName, lambdaParams);
        await this.executeLambdaLifeCycle('preDeploy', lambdaDirName, lambdaParams);
        try {
            await LambdaService_1.default.deployLambda(lambdaDirName, zipPath, vpcId, subnetId);
            await this.executeLambdaLifeCycle('postDeploy', lambdaDirName, lambdaParams);
            let payload = {};
            if (lambdaArg) {
                let payloadPath = LambdaService_1.default.findPayload(lambdaArg);
                payload = JSON.parse(fs_1.default.readFileSync(payloadPath, 'utf-8'));
                const response = await LambdaService_1.default.invokeLambda(lambdaDirName, payload);
                rwsLog('RWS Lambda Deploy Invoke', color().yellowBright(`"RWS-${lambdaDirName}" lambda function response (Code: ${response.Response.StatusCode})`));
                if (response.Response.Payload.toString()) {
                    const responseData = JSON.parse(response.Response.Payload.toString());
                    log(response.Response.Payload.toString());
                    if (!responseData.success) {
                        error(responseData.errorMessage);
                    }
                }
            }
        }
        catch (e) {
            error(e.message);
            log(e.stack);
        }
        log(color().green(`[RWS Lambda CLI] "${moduleDir}/lambda-functions/${lambdaDirName}" function directory\nhas been deployed to "RWS-${lambdaDirName}" named AWS Lambda function.`));
    }
    async undeploy(params) {
        const { lambdaDirName, vpcId, subnetId, lambdaArg } = await this.getLambdaParameters(params);
        if (lambdaDirName === 'modules') {
            const [efsId] = await EFSService_1.default.getOrCreateEFS('RWS_EFS', vpcId, subnetId);
            LambdaService_1.default.setRegion(params._rws_config.aws_lambda_region);
            await LambdaService_1.default.deployModules(lambdaArg, efsId, vpcId, subnetId, true);
            return;
        }
        const lambdaParams = {
            rwsConfig: params._rws_config,
            subnetId: subnetId
        };
    }
    async openToWeb(params) {
        const { lambdaDirName } = await this.getLambdaParameters(params);
        // await APIGatewayService.associateNATGatewayWithLambda('RWS-' + lambdaDirName);        
    }
    async delete(params) {
        const { lambdaDirName } = await this.getLambdaParameters(params);
        if (!(await LambdaService_1.default.functionExists('RWS-' + lambdaDirName))) {
            error(`There is no lambda function named "RWS-${lambdaDirName}" in AWS region "${AWSService_1.default.getRegion()}"`);
            return;
        }
        await LambdaService_1.default.deleteLambda('RWS-' + lambdaDirName);
        log(color().green(`[RWS Lambda CLI] "RWS-${lambdaDirName}" lambda function has been ${color().red('deleted')} from AWS region "${AWSService_1.default.getRegion()}"`));
    }
}
exports["default"] = LambdaCommand.createCommand();


/***/ }),

/***/ "../src/commands/_command.ts":
/*!***********************************!*\
  !*** ../src/commands/_command.ts ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ../services/UtilsService */ "../src/services/UtilsService.ts"));
class TheCommand {
    constructor(name, childModule) {
        this.name = name;
        const rootPackageDir = UtilsService_1.default.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = path_1.default.resolve(rootPackageDir, 'node_modules', '.rws');
        const cmdDirFile = `${moduleCfgDir}/_cli_cmd_dir`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        const filePath = childModule.id;
        const cmdDir = `${filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '')}`;
        let finalCmdDir = cmdDir;
        if (cmdDir.indexOf('node_modules') > -1) {
            finalCmdDir = rootPackageDir + '/' + finalCmdDir.substring(finalCmdDir.indexOf("node_modules"));
        }
        if (!fs_1.default.existsSync(cmdDirFile)) {
            fs_1.default.writeFileSync(cmdDirFile, finalCmdDir);
        }
    }
    getSourceFilePath() {
        const err = new Error();
        if (err.stack) {
            const match = err.stack.match(/at [^\s]+ \((.*):\d+:\d+\)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }
    async execute(params = null) {
        throw new Error('Implement method.');
    }
    getName() {
        return this.name;
    }
    static createCommand() {
        const className = this.name;
        if (!TheCommand._instances[className]) {
            TheCommand._instances[className] = new this();
        }
        return TheCommand._instances[className];
    }
    getCommandParameters(params) {
        const cmdString = params.cmdString || params._default;
        const cmdStringArr = cmdString.split(':');
        const subCmd = cmdStringArr[0];
        const apiCmd = cmdStringArr[1];
        const apiArg = cmdStringArr.length > 2 ? cmdStringArr[2] : null;
        const extraParams = params._extra_args.deploy_loader;
        return {
            subCmd,
            apiCmd,
            apiArg,
            extraParams
        };
    }
}
TheCommand._instances = {};
exports["default"] = TheCommand;


/***/ }),

/***/ "../src/commands/index.ts":
/*!********************************!*\
  !*** ../src/commands/index.ts ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const LambdaCommand_1 = __importDefault(__webpack_require__(/*! ./LambdaCommand */ "../src/commands/LambdaCommand.ts"));
const InitCommand_1 = __importDefault(__webpack_require__(/*! ./InitCommand */ "../src/commands/InitCommand.ts"));
const ClearCommand_1 = __importDefault(__webpack_require__(/*! ./ClearCommand */ "../src/commands/ClearCommand.ts"));
exports["default"] = [
    InitCommand_1.default,
    LambdaCommand_1.default,
    ClearCommand_1.default
];


/***/ }),

/***/ "../src/controllers/_controller.ts":
/*!*****************************************!*\
  !*** ../src/controllers/_controller.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ../services/_service */ "../src/services/_service.ts"));
const Error404_1 = __importDefault(__webpack_require__(/*! ../errors/Error404 */ "../src/errors/Error404.ts"));
const Error500_1 = __importDefault(__webpack_require__(/*! ../errors/Error500 */ "../src/errors/Error500.ts"));
/**
 * @category Core extendable objects
 */
class Controller extends _service_1.default {
    constructor() {
        super();
    }
    callMethod(methodName) {
        return (params) => {
            if ((!this[methodName])) {
                const error = new Error404_1.default(new Error('The method does not exist in controller.'), `${__filename}::${methodName}`);
                return error;
            }
            try {
                return this[methodName](params);
            }
            catch (e) {
                const error = new Error500_1.default(e, `${__filename}::${methodName}`, params);
                return error;
            }
        };
    }
    hasError() {
        const hasError = this._hasError;
        this._hasError = false;
        return hasError;
    }
    flagError() {
        this._hasError = true;
    }
}
exports["default"] = Controller;


/***/ }),

/***/ "../src/errors/Error403.ts":
/*!*********************************!*\
  !*** ../src/errors/Error403.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _error_1 = __importDefault(__webpack_require__(/*! ./_error */ "../src/errors/_error.ts"));
class Error404 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(403, baseError, params);
        this.name = '403 not authorized.';
        this.message = `RWS resource "$${resourcePath}" was not autorized for current user.`;
    }
}
exports["default"] = Error404;


/***/ }),

/***/ "../src/errors/Error404.ts":
/*!*********************************!*\
  !*** ../src/errors/Error404.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _error_1 = __importDefault(__webpack_require__(/*! ./_error */ "../src/errors/_error.ts"));
class Error404 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(404, baseError, params);
        this.name = '404 Resource not found';
        this.message = `Resource "${resourcePath}" was not found`;
    }
}
exports["default"] = Error404;


/***/ }),

/***/ "../src/errors/Error500.ts":
/*!*********************************!*\
  !*** ../src/errors/Error500.ts ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _error_1 = __importDefault(__webpack_require__(/*! ./_error */ "../src/errors/_error.ts"));
class Error500 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(500, baseError, params);
        this.name = '500 internal server error';
        this.message = `RWS resource "$${resourcePath}" has internal error`;
    }
}
exports["default"] = Error500;


/***/ }),

/***/ "../src/errors/_error.ts":
/*!*******************************!*\
  !*** ../src/errors/_error.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class RWSError {
    constructor(code, baseError = null, params = null) {
        this.stack = null;
        if (!baseError) {
            baseError = new Error('Error code ' + code);
        }
        this.code = code;
        this.baseError = baseError;
        this.stack = baseError.stack;
    }
    printFullError() {
        console.error('[RWS Error]');
        console.log(`[${this.name}] ${this.message}`);
        console.log('Stack:', this.stack);
        console.error('[/RWS Error]');
    }
    getMessage() {
        return this.message;
    }
    getCode() {
        return this.code;
    }
    getStackTraceString() {
        return this.stack;
    }
}
exports["default"] = RWSError;


/***/ }),

/***/ "../src/errors/index.ts":
/*!******************************!*\
  !*** ../src/errors/index.ts ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RWSError = exports.Error500 = exports.Error404 = exports.Error403 = void 0;
const Error404_1 = __importDefault(__webpack_require__(/*! ./Error404 */ "../src/errors/Error404.ts"));
exports.Error404 = Error404_1.default;
const Error403_1 = __importDefault(__webpack_require__(/*! ./Error403 */ "../src/errors/Error403.ts"));
exports.Error403 = Error403_1.default;
const Error500_1 = __importDefault(__webpack_require__(/*! ./Error500 */ "../src/errors/Error500.ts"));
exports.Error500 = Error500_1.default;
const _error_1 = __importDefault(__webpack_require__(/*! ./_error */ "../src/errors/_error.ts"));
exports.RWSError = _error_1.default;


/***/ }),

/***/ "../src/index.ts":
/*!***********************!*\
  !*** ../src/index.ts ***!
  \***********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.RWSErrorCodes = exports.RWSPrompt = exports.RWSConvo = exports.RWSVectorStore = exports.RWSTestSuite = exports.RWSAppCommands = exports.RWSannotations = exports.ProcessService = exports.Socket = exports.TimeSeriesModel = exports.VectorStoreService = exports.UtilsService = exports.TraversalService = exports.MD5Service = exports.EFSService = exports.AWSService = exports.LambdaService = exports.ConsoleService = exports.S3Service = exports.AuthService = exports.DBService = exports.RWSServer = exports.RWSModel = exports.RWSCommand = exports.RWSSocket = exports.RWSService = exports.RWSController = exports.AppConfigService = exports.getAppConfig = exports.SetupRWS = exports.serverInit = void 0;
const socket_io_1 = __webpack_require__(/*! socket.io */ "socket.io");
Object.defineProperty(exports, "Socket", ({ enumerable: true, get: function () { return socket_io_1.Socket; } }));
const init_1 = __importDefault(__webpack_require__(/*! ./init */ "../src/init.ts"));
exports.serverInit = init_1.default;
const install_1 = __webpack_require__(/*! ./install */ "../src/install.ts");
Object.defineProperty(exports, "SetupRWS", ({ enumerable: true, get: function () { return install_1.SetupRWS; } }));
const TimeSeriesModel_1 = __importDefault(__webpack_require__(/*! ./models/types/TimeSeriesModel */ "../src/models/types/TimeSeriesModel.ts"));
exports.TimeSeriesModel = TimeSeriesModel_1.default;
const ServerService_1 = __importDefault(__webpack_require__(/*! ./services/ServerService */ "../src/services/ServerService.ts"));
exports.RWSServer = ServerService_1.default;
const DBService_1 = __importDefault(__webpack_require__(/*! ./services/DBService */ "../src/services/DBService.ts"));
exports.DBService = DBService_1.default;
const AuthService_1 = __importDefault(__webpack_require__(/*! ./services/AuthService */ "../src/services/AuthService.ts"));
exports.AuthService = AuthService_1.default;
const S3Service_1 = __importDefault(__webpack_require__(/*! ./services/S3Service */ "../src/services/S3Service.ts"));
exports.S3Service = S3Service_1.default;
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./services/ConsoleService */ "../src/services/ConsoleService.ts"));
exports.ConsoleService = ConsoleService_1.default;
const ProcessService_1 = __importDefault(__webpack_require__(/*! ./services/ProcessService */ "../src/services/ProcessService.ts"));
exports.ProcessService = ProcessService_1.default;
const LambdaService_1 = __importDefault(__webpack_require__(/*! ./services/LambdaService */ "../src/services/LambdaService.ts"));
exports.LambdaService = LambdaService_1.default;
const AWSService_1 = __importDefault(__webpack_require__(/*! ./services/AWSService */ "../src/services/AWSService.ts"));
exports.AWSService = AWSService_1.default;
const EFSService_1 = __importDefault(__webpack_require__(/*! ./services/EFSService */ "../src/services/EFSService.ts"));
exports.EFSService = EFSService_1.default;
const MD5Service_1 = __importDefault(__webpack_require__(/*! ./services/MD5Service */ "../src/services/MD5Service.ts"));
exports.MD5Service = MD5Service_1.default;
const TraversalService_1 = __importDefault(__webpack_require__(/*! ./services/TraversalService */ "../src/services/TraversalService.ts"));
exports.TraversalService = TraversalService_1.default;
const UtilsService_1 = __importDefault(__webpack_require__(/*! ./services/UtilsService */ "../src/services/UtilsService.ts"));
exports.UtilsService = UtilsService_1.default;
const VectorStoreService_1 = __importDefault(__webpack_require__(/*! ./services/VectorStoreService */ "../src/services/VectorStoreService.ts"));
exports.VectorStoreService = VectorStoreService_1.default;
const _prompt_1 = __importDefault(__webpack_require__(/*! ./models/prompts/_prompt */ "../src/models/prompts/_prompt.ts"));
exports.RWSPrompt = _prompt_1.default;
const ConvoLoader_1 = __importDefault(__webpack_require__(/*! ./models/convo/ConvoLoader */ "../src/models/convo/ConvoLoader.ts"));
exports.RWSConvo = ConvoLoader_1.default;
const VectorStore_1 = __importDefault(__webpack_require__(/*! ./models/convo/VectorStore */ "../src/models/convo/VectorStore.ts"));
exports.RWSVectorStore = VectorStore_1.default;
const index_1 = __webpack_require__(/*! ./models/annotations/index */ "../src/models/annotations/index.ts");
const index_2 = __webpack_require__(/*! ./routing/annotations/index */ "../src/routing/annotations/index.ts");
const AppConfigService_1 = __importStar(__webpack_require__(/*! ./services/AppConfigService */ "../src/services/AppConfigService.ts"));
exports.getAppConfig = AppConfigService_1.default;
Object.defineProperty(exports, "AppConfigService", ({ enumerable: true, get: function () { return AppConfigService_1.AppConfigService; } }));
const RWSannotations = {
    modelAnnotations: { InverseRelation: index_1.InverseRelation, InverseTimeSeries: index_1.InverseTimeSeries, Relation: index_1.Relation, TrackType: index_1.TrackType },
    routingAnnotations: { Route: index_2.Route }
};
exports.RWSannotations = RWSannotations;
const _command_1 = __importDefault(__webpack_require__(/*! ./commands/_command */ "../src/commands/_command.ts"));
exports.RWSCommand = _command_1.default;
const _model_1 = __importDefault(__webpack_require__(/*! ./models/_model */ "../src/models/_model.ts"));
exports.RWSModel = _model_1.default;
const _controller_1 = __importDefault(__webpack_require__(/*! ./controllers/_controller */ "../src/controllers/_controller.ts"));
exports.RWSController = _controller_1.default;
const _service_1 = __importDefault(__webpack_require__(/*! ./services/_service */ "../src/services/_service.ts"));
exports.RWSService = _service_1.default;
const _socket_1 = __importDefault(__webpack_require__(/*! ./sockets/_socket */ "../src/sockets/_socket.ts"));
exports.RWSSocket = _socket_1.default;
const index_3 = __importDefault(__webpack_require__(/*! ./commands/index */ "../src/commands/index.ts"));
exports.RWSAppCommands = index_3.default;
const RWSTestSuite = __importStar(__webpack_require__(/*! ./tests/index */ "../src/tests/index.ts"));
exports.RWSTestSuite = RWSTestSuite;
const RWSErrorCodes = __importStar(__webpack_require__(/*! ./errors/index */ "../src/errors/index.ts"));
exports.RWSErrorCodes = RWSErrorCodes;


/***/ }),

/***/ "../src/init.ts":
/*!**********************!*\
  !*** ../src/init.ts ***!
  \**********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./services/AppConfigService */ "../src/services/AppConfigService.ts"));
const ServerService_1 = __importDefault(__webpack_require__(/*! ./services/ServerService */ "../src/services/ServerService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./services/ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ./services/UtilsService */ "../src/services/UtilsService.ts"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const ProcessService_1 = __importDefault(__webpack_require__(/*! ./services/ProcessService */ "../src/services/ProcessService.ts"));
async function init(cfg, serverOptions = {}, addToConfig = null) {
    var _a;
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const port = await AppConfigService.get('port');
    const ws_port = await AppConfigService.get('ws_port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    const pub_dir = await AppConfigService.get('pub_dir');
    const cors_domain = await AppConfigService.get('cors_domain');
    const sslCert = AppConfigService.get('ssl_cert');
    const sslKey = AppConfigService.get('ssl_key');
    if (addToConfig !== null) {
        await addToConfig(AppConfigService);
    }
    let https = true;
    if (!sslCert || !sslKey) {
        https = false;
    }
    const executeDir = process.cwd();
    const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executeDir);
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    const moduleCfgFile = `${moduleCfgDir}/_rws_installed`;
    if (!fs_1.default.existsSync(moduleCfgFile)) {
        ConsoleService_1.default.log(ConsoleService_1.default.color().yellow('No config path generated for CLI. Trying to initialize with "yarn rws init config/config"'));
        await ProcessService_1.default.runShellCommand('yarn rws init config/config');
        UtilsService_1.default.setRWSVar('_rws_installed', 'OK');
    }
    const theServer = await ServerService_1.default.initializeApp({ ...{
            wsRoutes: wsRoutes,
            httpRoutes: httpRoutes,
            controllerList: controler_list,
            pub_dir: pub_dir,
            domain: `http${(await ((_a = AppConfigService.get('features')) === null || _a === void 0 ? void 0 : _a.ssl) ? 's' : '')}://${await AppConfigService.get('domain')}`,
            cors_domain: cors_domain
        }, ...serverOptions });
    const wsStart = async () => {
        return (await theServer.websocket.starter());
    };
    const httpStart = async () => {
        return (await theServer.http.starter());
    };
    wsStart();
    await httpStart();
}
exports["default"] = init;


/***/ }),

/***/ "../src/install.ts":
/*!*************************!*\
  !*** ../src/install.ts ***!
  \*************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.runShellCommand = exports.SetupRWS = void 0;
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./services/AppConfigService */ "../src/services/AppConfigService.ts"));
const _model_1 = __importDefault(__webpack_require__(/*! ./models/_model */ "../src/models/_model.ts"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
const DBService_1 = __importDefault(__webpack_require__(/*! ./services/DBService */ "../src/services/DBService.ts"));
const TimeSeriesModel_1 = __importDefault(__webpack_require__(/*! ./models/types/TimeSeriesModel */ "../src/models/types/TimeSeriesModel.ts"));
const ProcessService_1 = __importDefault(__webpack_require__(/*! ./services/ProcessService */ "../src/services/ProcessService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./services/ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ./services/UtilsService */ "../src/services/UtilsService.ts"));
const { log, warn, error, color } = ConsoleService_1.default;
const { runShellCommand } = ProcessService_1.default;
exports.runShellCommand = runShellCommand;
function generateModelSections(constructor) {
    let section = '';
    // Get the prototype of the model instance
    const modelMetadatas = _model_1.default.getModelAnnotations(constructor); // Pass the class constructor   
    let embed = false;
    let modelName = constructor._collection;
    // if(Model.isSubclass(constructor, EmbedModel)){
    //   modelName = constructor.name;
    //   embed = true;
    //   throw new Error('Embed models are not supported');
    // }
    section += `model ${modelName} {\n`;
    section += `\tid String @map("_id") @id @default(auto()) @db.ObjectId\n`;
    for (const key in modelMetadatas) {
        const modelMetadata = modelMetadatas[key].metadata;
        const requiredString = modelMetadata.required ? '' : '?';
        const annotationType = modelMetadatas[key].annotationType;
        if (annotationType === 'Relation') {
            section += `\t${key} ${modelMetadata.relatedTo}${requiredString} @relation(fields: [${modelMetadata.relationField}], references: [${modelMetadata.relatedToField}])\n`;
            section += `\t${modelMetadata.relationField} String${requiredString} @db.ObjectId\n`;
        }
        else if (annotationType === 'InverseRelation') {
            section += `\t${key} ${modelMetadata.inversionModel}[]`;
        }
        else if (annotationType === 'InverseTimeSeries') {
            section += `\t${key} String[] @db.ObjectId`;
        }
        else if (annotationType === 'TrackType') {
            const tags = modelMetadata.tags.map((item) => '@' + item);
            section += `\t${key} ${toConfigCase(modelMetadata)}${requiredString} ${tags.join(' ')}\n`;
        }
    }
    section += `\n}`;
    return section;
}
function toConfigCase(modelType) {
    const type = modelType.type;
    const input = type.name;
    if (input == 'Number') {
        return 'Int';
    }
    if (input == 'Object') {
        return 'Json';
    }
    if (input == 'Date') {
        return 'DateTime';
    }
    const firstChar = input.charAt(0).toUpperCase();
    const restOfString = input.slice(1);
    return firstChar + restOfString;
}
async function main(cfg) {
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const dbUrl = await AppConfigService.get('mongo_url');
    const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist', '');
    const executionDir = path_1.default.resolve(process.cwd());
    const dbType = 'mongodb';
    let template = `generator client {\n
    provider = "prisma-client-js"\n
  }\n\n`;
    template += `\ndatasource db {\n
    provider = "${dbType}"\n
    url = env("DATABASE_URL")\n    
  }\n\n`;
    const usermodels = await AppConfigService.get('user_models');
    usermodels.forEach((model) => {
        const modelSection = generateModelSections(model);
        template += '\n\n' + modelSection;
        if (_model_1.default.isSubclass(model, TimeSeriesModel_1.default)) {
            DBService_1.default.collectionExists(model._collection).then((exists) => {
                if (exists) {
                    return;
                }
                log(color().green('[RWS Init]') + ` creating TimeSeries type collection from ${model} model`);
                DBService_1.default.createTimeSeriesCollection(model._collection);
            });
        }
    });
    const schemaPath = path_1.default.join(moduleDir, 'prisma', 'schema.prisma');
    fs_1.default.writeFileSync(schemaPath, template);
    process.env.DB_URL = dbUrl;
    // Define the command you want to run
    await ProcessService_1.default.runShellCommand('npx prisma generate --schema=' + schemaPath);
    log(color().green('[RWS Init]') + ' prisma schema generated from ', schemaPath);
    UtilsService_1.default.setRWSVar('_rws_installed', 'OK');
    return;
}
const SetupRWS = main;
exports.SetupRWS = SetupRWS;


/***/ }),

/***/ "../src/models/_model.ts":
/*!*******************************!*\
  !*** ../src/models/_model.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TrackType = void 0;
const index_1 = __webpack_require__(/*! ../index */ "../src/index.ts");
const TrackType_1 = __importDefault(__webpack_require__(/*! ./annotations/TrackType */ "../src/models/annotations/TrackType.ts"));
exports.TrackType = TrackType_1.default;
class Model {
    constructor(data) {
        if (!this.getCollection()) {
            throw new Error('Model must have a collection defined');
        }
        if (!data) {
            return;
        }
        if (!this.hasTimeSeries()) {
            this._fill(data);
        }
        else {
            throw new Error('Time Series not supported in synchronous constructor. Use `await Model.create(data)` static method to instantiate this model.');
        }
    }
    _fill(data) {
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, this.constructor.prototype);
                if (meta) {
                    data[key] = {
                        create: data[key]
                    };
                }
                else {
                    this[key] = data[key];
                }
            }
        }
        return this;
    }
    async _asyncFill(data) {
        const collections_to_models = {};
        const timeSeriesIds = this.getTimeSeriesModelFields();
        const _self = this;
        this.loadModels().forEach((model) => {
            collections_to_models[model.getCollection()] = model;
        });
        const seriesHydrationfields = [];
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (seriesHydrationfields.includes(key)) {
                    continue;
                }
                const timeSeriesMetaData = timeSeriesIds[key];
                if (timeSeriesMetaData) {
                    this[key] = data[key];
                    const seriesModel = collections_to_models[timeSeriesMetaData.collection];
                    const dataModels = await seriesModel.findBy({
                        id: { in: data[key] }
                    });
                    seriesHydrationfields.push(timeSeriesMetaData.hydrationField);
                    this[timeSeriesMetaData.hydrationField] = dataModels;
                }
                else {
                    this[key] = data[key];
                }
            }
        }
        return this;
    }
    getTimeSeriesModelFields() {
        const timeSeriesIds = {};
        for (const key in this) {
            if (this.hasOwnProperty(key)) {
                const meta = Reflect.getMetadata(`InverseTimeSeries:${key}`, this);
                if (meta) {
                    if (!timeSeriesIds[key]) {
                        timeSeriesIds[key] = {
                            collection: meta.timeSeriesModel,
                            hydrationField: meta.hydrationField,
                            ids: this[key]
                        };
                    }
                }
            }
        }
        return timeSeriesIds;
    }
    toMongo() {
        let data = {};
        const timeSeriesIds = this.getTimeSeriesModelFields();
        const timeSeriesHydrationFields = [];
        for (const key in this) {
            if (!this.isDbVariable(key)) {
                continue;
            }
            if (this.hasOwnProperty(key) && !(this.constructor._BANNED_KEYS || Model._BANNED_KEYS).includes(key) && !timeSeriesHydrationFields.includes(key)) {
                data[key] = this[key];
            }
            if (!!timeSeriesIds[key]) {
                data[key] = this[key];
                timeSeriesHydrationFields.push(timeSeriesIds[key].hydrationField);
            }
        }
        return data;
    }
    getCollection() {
        return this.constructor._collection || this._collection;
    }
    static getCollection() {
        return this.constructor._collection || this._collection;
    }
    async save() {
        const data = this.toMongo();
        let updatedModelData = data;
        if (this.id) {
            this.preUpdate();
            updatedModelData = await index_1.DBService.update(data, this.getCollection());
            await this._asyncFill(updatedModelData);
            this.postUpdate();
        }
        else {
            this.preCreate();
            const timeSeriesModel = await Promise.resolve().then(() => __importStar(__webpack_require__(/*! ./types/TimeSeriesModel */ "../src/models/types/TimeSeriesModel.ts")));
            const isTimeSeries = this instanceof timeSeriesModel.default;
            updatedModelData = await index_1.DBService.insert(data, this.getCollection(), isTimeSeries);
            await this._asyncFill(updatedModelData);
            this.postCreate();
        }
        return this;
    }
    static getModelAnnotations(constructor) {
        const annotationsData = {};
        const propertyKeys = Reflect.getMetadataKeys(constructor.prototype).map((item) => {
            return item.split(':')[1];
        });
        propertyKeys.forEach(key => {
            if (String(key) == 'id') {
                return;
            }
            const annotations = ['TrackType', 'Relation', 'InverseRelation', 'InverseTimeSeries'];
            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;
                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
                if (meta) {
                    annotationsData[String(key)] = { annotationType: annotation, metadata: meta };
                }
            });
        });
        return annotationsData;
    }
    preUpdate() {
        return;
    }
    postUpdate() {
        return;
    }
    preCreate() {
        return;
    }
    postCreate() {
        return;
    }
    static isSubclass(constructor, baseClass) {
        return baseClass.prototype.isPrototypeOf(constructor.prototype);
    }
    hasTimeSeries() {
        return Model.checkTimeSeries(this.constructor);
    }
    static checkTimeSeries(constructor) {
        const data = constructor.prototype;
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                if (Reflect.getMetadata(`InverseTimeSeries:${key}`, constructor.prototype)) {
                    return true;
                }
            }
        }
        return false;
    }
    isDbVariable(variable) {
        return Model.checkDbVariable(this.constructor, variable);
    }
    static checkDbVariable(constructor, variable) {
        if (variable === 'id') {
            return true;
        }
        const data = constructor.prototype;
        const dbAnnotations = Model.getModelAnnotations(constructor);
        const dbProperties = Object.keys(dbAnnotations).map((key) => { return { ...dbAnnotations[key], key }; }).filter((element) => element.annotationType === 'TrackType').map((element) => element.key);
        return dbProperties.includes(variable);
    }
    sanitizeDBData(data) {
        const dataKeys = Object.keys(data);
        const sanitizedData = {};
        for (const key of dataKeys) {
            if (this.isDbVariable(key)) {
                sanitizedData[key] = data[key];
            }
        }
        return sanitizedData;
    }
    static async watchCollection(preRun) {
        const collection = Reflect.get(this, '_collection');
        return await index_1.DBService.watchCollection(collection, preRun);
    }
    static async findOneBy(conditions) {
        const collection = Reflect.get(this, '_collection');
        const dbData = await index_1.DBService.findOneBy(collection, conditions);
        if (dbData) {
            const inst = new this();
            return await inst._asyncFill(dbData);
        }
        return null;
    }
    static async delete(conditions) {
        const collection = Reflect.get(this, '_collection');
        return await index_1.DBService.delete(collection, conditions);
    }
    async delete() {
        const collection = Reflect.get(this, '_collection');
        return await index_1.DBService.delete(collection, {
            id: this.id
        });
    }
    static async findBy(conditions, fields = null) {
        const collection = Reflect.get(this, '_collection');
        const dbData = await index_1.DBService.findBy(collection, conditions, fields);
        if (dbData.length) {
            const instanced = [];
            for (const data of dbData) {
                const inst = new this();
                instanced.push((await inst._asyncFill(data)));
            }
            return instanced;
        }
        return [];
    }
    static async create(data) {
        const newModel = new this();
        const sanitizedData = newModel.sanitizeDBData(data);
        await newModel._asyncFill(sanitizedData);
        return newModel;
    }
    loadModels() {
        const AppConfigService = (0, index_1.getAppConfig)();
        return AppConfigService.get('user_models');
    }
}
Model._collection = null;
Model._BANNED_KEYS = ['_collection'];
__decorate([
    (0, TrackType_1.default)(String),
    __metadata("design:type", String)
], Model.prototype, "id", void 0);
exports["default"] = Model;


/***/ }),

/***/ "../src/models/annotations/InverseRelation.ts":
/*!****************************************************!*\
  !*** ../src/models/annotations/InverseRelation.ts ***!
  \****************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
function InverseRelation(inversionModel) {
    let metaOpts = {
        inversionModel: inversionModel
    };
    return function (target, key) {
        Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
    };
}
exports["default"] = InverseRelation;


/***/ }),

/***/ "../src/models/annotations/InverseTimeSeries.ts":
/*!******************************************************!*\
  !*** ../src/models/annotations/InverseTimeSeries.ts ***!
  \******************************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
function InverseTimeSeries(timeSeriesModel, hydrationField) {
    let metaOpts = {
        timeSeriesModel: timeSeriesModel,
        hydrationField: hydrationField
    };
    return function (target, key) {
        Reflect.defineMetadata(`InverseTimeSeries:${key}`, metaOpts, target);
    };
}
exports["default"] = InverseTimeSeries;


/***/ }),

/***/ "../src/models/annotations/Relation.ts":
/*!*********************************************!*\
  !*** ../src/models/annotations/Relation.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
function Relation(relatedTo, required = false, relationField = null, relatedToField = 'id') {
    let metaOpts = { required };
    metaOpts.relatedToField = relatedToField;
    metaOpts.relatedTo = relatedTo;
    if (!relationField) {
        metaOpts.relationField = relatedTo + '_id';
    }
    else {
        metaOpts.relationField = relationField;
    }
    return function (target, key) {
        Reflect.defineMetadata(`Relation:${key}`, metaOpts, target);
    };
}
exports["default"] = Relation;


/***/ }),

/***/ "../src/models/annotations/TrackType.ts":
/*!**********************************************!*\
  !*** ../src/models/annotations/TrackType.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
function TrackType(type, opts = null, tags = []) {
    if (!opts) {
        opts = {
            required: false
        };
    }
    const required = opts.required;
    let metaOpts = { type, tags, required };
    if (opts.relatedToField && opts.relatedTo) {
        metaOpts.relatedToField = opts.relatedToField;
        metaOpts.relatedTo = opts.relatedTo;
        if (!opts.relationField) {
            metaOpts.relationField = opts.relatedTo + '_id';
        }
        else {
            metaOpts.relationField = opts.relationField;
        }
    }
    if (opts.inversionModel) {
        metaOpts.inversionModel = opts.inversionModel;
    }
    const resolvedType = typeof type === 'function' ? type() : type;
    if (!!type._collection) {
        metaOpts.type = type;
    }
    return function (target, key) {
        Reflect.defineMetadata(`TrackType:${key}`, metaOpts, target);
    };
}
exports["default"] = TrackType;


/***/ }),

/***/ "../src/models/annotations/index.ts":
/*!******************************************!*\
  !*** ../src/models/annotations/index.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.InverseTimeSeries = exports.TrackType = exports.Relation = exports.InverseRelation = void 0;
const InverseRelation_1 = __importDefault(__webpack_require__(/*! ./InverseRelation */ "../src/models/annotations/InverseRelation.ts"));
exports.InverseRelation = InverseRelation_1.default;
const Relation_1 = __importDefault(__webpack_require__(/*! ./Relation */ "../src/models/annotations/Relation.ts"));
exports.Relation = Relation_1.default;
const TrackType_1 = __importDefault(__webpack_require__(/*! ./TrackType */ "../src/models/annotations/TrackType.ts"));
exports.TrackType = TrackType_1.default;
const InverseTimeSeries_1 = __importDefault(__webpack_require__(/*! ./InverseTimeSeries */ "../src/models/annotations/InverseTimeSeries.ts"));
exports.InverseTimeSeries = InverseTimeSeries_1.default;


/***/ }),

/***/ "../src/models/convo/ConvoLoader.ts":
/*!******************************************!*\
  !*** ../src/models/convo/ConvoLoader.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const text_1 = __webpack_require__(/*! langchain/document_loaders/fs/text */ "langchain/document_loaders/fs/text");
const text_splitter_1 = __webpack_require__(/*! langchain/text_splitter */ "langchain/text_splitter");
const VectorStoreService_1 = __importDefault(__webpack_require__(/*! ../../services/VectorStoreService */ "../src/services/VectorStoreService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ../../services/ConsoleService */ "../src/services/ConsoleService.ts"));
const document_1 = __webpack_require__(/*! langchain/document */ "langchain/document");
const uuid_1 = __webpack_require__(/*! uuid */ "uuid");
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ../../services/AppConfigService */ "../src/services/AppConfigService.ts"));
const chains_1 = __webpack_require__(/*! langchain/chains */ "langchain/chains");
const errors_1 = __webpack_require__(/*! ../../errors */ "../src/errors/index.ts");
const xml2js_1 = __importDefault(__webpack_require__(/*! xml2js */ "xml2js"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const logConvo = (txt) => {
    ConsoleService_1.default.rwsLog(ConsoleService_1.default.color().blueBright(txt));
};
class ConvoLoader {
    constructor(chatConstructor, embeddings, convoId = null, baseSplitterParams = {
        chunkSize: 400, chunkOverlap: 80, separators: ["/n/n", "."]
    }) {
        this.docs = [];
        this._initiated = false;
        this.avgDocLength = (documents) => {
            return documents.reduce((sum, doc) => sum + doc.pageContent.length, 0) / documents.length;
        };
        this.embeddings = embeddings;
        if (convoId === null) {
            this.convo_id = ConvoLoader.uuid();
        }
        else {
            this.convo_id = convoId;
        }
        this.chatConstructor = chatConstructor;
        this._baseSplitterParams = baseSplitterParams;
    }
    static uuid() {
        return (0, uuid_1.v4)();
    }
    async splitDocs(filePath, params) {
        const splitDir = ConvoLoader.debugSplitDir(this.getId());
        if (!fs_1.default.existsSync(splitDir)) {
            console.log(`Split dir ${ConsoleService_1.default.color().magentaBright(splitDir)} doesn't exist. Splitting docs...`);
            this.loader = new text_1.TextLoader(filePath);
            this.docSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: params.chunkSize, // The size of the chunk that should be split.
                chunkOverlap: params.chunkOverlap, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
                separators: params.separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
            });
            fs_1.default.mkdirSync(splitDir, { recursive: true });
            const orgDocs = await this.loader.load();
            const splitDocs = await this.docSplitter.splitDocuments(orgDocs);
            const avgCharCountPre = this.avgDocLength(orgDocs);
            const avgCharCountPost = this.avgDocLength(splitDocs);
            logConvo(`Average length among ${orgDocs.length} documents loaded is ${avgCharCountPre} characters.`);
            logConvo(`After the split we have ${splitDocs.length} documents more than the original ${orgDocs.length}.`);
            logConvo(`Average length among ${orgDocs.length} documents (after split) is ${avgCharCountPost} characters.`);
            this.docs = splitDocs;
            let i = 0;
            this.docs.forEach((doc) => {
                fs_1.default.writeFileSync(this.debugSplitFile(i), doc.pageContent);
                i++;
            });
        }
        else {
            const splitFiles = fs_1.default.readdirSync(splitDir);
            for (const filePath of splitFiles) {
                const txt = fs_1.default.readFileSync(splitDir + '/' + filePath, 'utf-8');
                this.docs.push(new document_1.Document({ pageContent: txt }));
            }
            ;
        }
        this.store = await VectorStoreService_1.default.createStore(this.docs, await this.embeddings.generateEmbeddings());
    }
    getId() {
        return this.convo_id;
    }
    getDocs() {
        return this.docs;
    }
    getStore() {
        return this.store;
    }
    isInitiated() {
        return this._initiated;
    }
    setPrompt(prompt) {
        this.thePrompt = prompt;
        this.llmChat = new this.chatConstructor({
            streaming: true,
            region: (0, AppConfigService_1.default)().get('aws_bedrock_region'),
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            },
            model: "anthropic.claude-v2",
            maxTokens: prompt.getHyperParameter('max_tokens_to_sample'),
            temperature: prompt.getHyperParameter('temperature'),
            modelKwargs: {
                top_p: prompt.getHyperParameter('top_p'),
                top_k: prompt.getHyperParameter('top_k'),
            }
        });
        return this;
    }
    getChat() {
        return this.llmChat;
    }
    async call(values, cfg, debugCallback = null) {
        const output = await (this.chain()).invoke(values, cfg);
        this.thePrompt.listen(output.text);
        await this.debugCall(debugCallback);
        return this.thePrompt;
    }
    async *callStreamGenerator(values, cfg, debugCallback = null) {
        // const _self = this;
        // const chain = this.chain() as ConversationChain;  
        // console.log('call stream');      
        // const stream = await chain.call(values, [{
        //         handleLLMNewToken(token: string) {
        //             yield token;
        //         }
        //     }
        // ]);
        // console.log('got stream');
        // Listen to the stream and yield data chunks as they come
        // for await (const chunk of stream) {                  
        //     yield chunk.response;
        // }
    }
    async callStream(values, callback, end = () => { }, cfg = {}, debugCallback) {
        const _self = this;
        const callGenerator = this.callStreamGenerator({ query: values.query }, cfg, debugCallback);
        await this.chain().invoke(values, { callbacks: [{
                    handleLLMNewToken(token) {
                        callback({
                            content: token,
                            status: 'rws_streaming'
                        });
                        _self.thePrompt.listen(token, true);
                    }
                }
            ] });
        end();
        this.debugCall(debugCallback);
        return this.thePrompt;
    }
    ;
    async similaritySearch(query, splitCount) {
        console.log('Store is ready. Searching for embedds...');
        const texts = await this.getStore().getFaiss().similaritySearchWithScore(`${query}`, splitCount);
        console.log('Found best parts: ' + texts.length);
        return texts.map(([doc, score]) => `${doc["pageContent"]}`).join('\n\n');
    }
    async debugCall(debugCallback = null) {
        try {
            const debug = this.initDebugFile();
            let callData = debug.xml;
            callData.conversation.message.push(this.thePrompt.toJSON());
            if (debugCallback) {
                callData = await debugCallback(callData);
            }
            this.debugSave(callData);
        }
        catch (error) {
            console.log(error);
        }
    }
    chain() {
        if (this.llmChain) {
            return this.llmChain;
        }
        if (!this.thePrompt) {
            throw new errors_1.Error500(new Error('No prompt initialized for conversation'), __filename);
        }
        const chainParams = {
            prompt: this.thePrompt.getMultiTemplate()
        };
        this.createChain(chainParams);
        return this.llmChain;
    }
    async createChain(input) {
        this.llmChain = new chains_1.ConversationChain({
            llm: this.llmChat,
            prompt: input.prompt,
        });
        return this.llmChain;
    }
    async waitForInit() {
        const _self = this;
        return new Promise((resolve, reject) => {
            let i = 0;
            const interval = setInterval(() => {
                if (this.isInitiated()) {
                    clearInterval(interval);
                    resolve(_self);
                }
                if (i > 9) {
                    clearInterval(interval);
                    reject(null);
                }
                i++;
            }, 300);
        });
    }
    parseXML(xml, callback) {
        const parser = new xml2js_1.default.Parser();
        parser.parseString(xml, callback);
        return parser;
    }
    static debugConvoDir(id) {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations', id);
    }
    static debugSplitDir(id) {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations', id, 'split');
    }
    debugConvoFile() {
        return `${ConvoLoader.debugConvoDir(this.getId())}/conversation.xml`;
    }
    debugSplitFile(i) {
        return `${ConvoLoader.debugSplitDir(this.getId())}/${i}.splitfile`;
    }
    initDebugFile() {
        let xmlContent;
        let debugXML = null;
        const convoDir = ConvoLoader.debugConvoDir(this.getId());
        if (!fs_1.default.existsSync(convoDir)) {
            fs_1.default.mkdirSync(convoDir, { recursive: true });
        }
        const convoFilePath = this.debugConvoFile();
        if (!fs_1.default.existsSync(convoFilePath)) {
            xmlContent = `<conversation id="conversation"></conversation>`;
            fs_1.default.writeFileSync(convoFilePath, xmlContent);
        }
        else {
            xmlContent = fs_1.default.readFileSync(convoFilePath, 'utf-8');
        }
        this.parseXML(xmlContent, (error, result) => {
            debugXML = result;
        });
        if (!debugXML.conversation.message) {
            debugXML.conversation.message = [];
        }
        return { xml: debugXML, path: convoFilePath };
    }
    debugSave(xml) {
        const builder = new xml2js_1.default.Builder();
        fs_1.default.writeFileSync(this.debugConvoFile(), builder.buildObject(xml), 'utf-8');
    }
}
exports["default"] = ConvoLoader;


/***/ }),

/***/ "../src/models/convo/VectorStore.ts":
/*!******************************************!*\
  !*** ../src/models/convo/VectorStore.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
const faiss_1 = __webpack_require__(/*! @langchain/community/vectorstores/faiss */ "@langchain/community/vectorstores/faiss");
class RWSVectorStore {
    constructor(docs, embeddings) {
        this.docs = docs;
        this.embeddings = embeddings;
    }
    async init() {
        this.faiss = await faiss_1.FaissStore.fromDocuments(this.docs, this.embeddings);
        return this;
    }
    getFaiss() {
        return this.faiss;
    }
}
exports["default"] = RWSVectorStore;


/***/ }),

/***/ "../src/models/prompts/_prompt.ts":
/*!****************************************!*\
  !*** ../src/models/prompts/_prompt.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class RWSPrompt {
    constructor(params) {
        this.output = '';
        this.varStorage = {};
        this.onStream = (chunk) => {
        };
        this.input = params.input;
        this.originalInput = params.input;
        this.hyperParameters = params.hyperParameters;
        this.modelId = params.modelId;
        this.modelType = params.modelType;
        this.created_at = new Date();
    }
    listen(source, stream = true) {
        this.output = '';
        if (!stream) {
            this.output = source;
        }
        else {
            this.output += source;
            this.onStream(source);
        }
        return this;
    }
    setStreamCallback(callback) {
        this.onStream = callback;
    }
    addEnchantment(enchantment) {
        this.enhancedInput.push(enchantment);
        this.input = enchantment.input;
    }
    getEnchantedInput() {
        return this.enhancedInput[this.enhancedInput.length - 1].output;
    }
    getModelId() {
        return this.modelId;
    }
    readSentInput() {
        return this.sentInput;
    }
    readInput() {
        return this.input;
    }
    readBaseInput() {
        return this.originalInput;
    }
    setBaseInput(input) {
        this.originalInput = input;
        return this;
    }
    injestOutput(content) {
        this.output = content;
        return this;
    }
    readOutput() {
        return this.output;
    }
    getHyperParameters(base = null) {
        if (base) {
            this.hyperParameters = { ...base, ...this.hyperParameters };
        }
        return this.hyperParameters;
    }
    getHyperParameter(key) {
        if (!this.hyperParameters[key]) {
            return null;
        }
        return this.hyperParameters[key];
    }
    setHyperParameter(key, value) {
        this.hyperParameters[key] = value;
        return this;
    }
    setHyperParameters(value) {
        this.hyperParameters = value;
        return this;
    }
    setMultiTemplate(template) {
        this.multiTemplate = template;
        return this;
    }
    getMultiTemplate() {
        return this.multiTemplate;
    }
    setConvo(convo) {
        this.convo = convo.setPrompt(this);
        return this;
    }
    getConvo() {
        return this.convo;
    }
    replacePromptVar(key, val) {
    }
    getModelMetadata() {
        return [this.modelType, this.modelId];
    }
    async requestWith(executor, intruderPrompt = null, debugVars = {}) {
        this.sentInput = this.input;
        const returnedRWS = await executor.promptRequest(this, null, intruderPrompt, debugVars);
        this.output = returnedRWS.readOutput();
    }
    async singleRequestWith(executor, intruderPrompt = null) {
        await executor.singlePromptRequest(this, null, intruderPrompt);
        this.sentInput = this.input;
    }
    async streamWith(executor, read, end = () => { }, debugVars = {}) {
        return executor.promptStream(this, read, end, debugVars);
    }
    setInput(content) {
        this.input = content;
        return this;
    }
    getVar(key) {
        return Object.keys(this.varStorage).includes(key) ? this.varStorage[key] : null;
    }
    setVar(key, val) {
        this.varStorage[key] = val;
        return this;
    }
    async _oldreadStream(stream, react) {
        let first = true;
        const chunks = []; // Replace 'any' with the actual type of your chunks
        for await (const event of stream) {
            // Assuming 'event' has a specific structure. Adjust according to actual event structure.
            if ('chunk' in event && event.chunk.bytes) {
                const chunk = JSON.parse(Buffer.from(event.chunk.bytes).toString("utf-8"));
                if (first) {
                    console.log('chunk', chunk);
                    first = false;
                }
                react(chunk.completion);
                chunks.push(chunk.completion || chunk.generation); // Use the actual property of 'chunk' you're interested in
            }
            else if ('internalServerException' in event ||
                'modelStreamErrorException' in event ||
                'throttlingException' in event ||
                'validationException' in event) {
                console.error(event);
                break;
            }
        }
    }
    async isChainStreamType(source) {
        if (source && typeof source[Symbol.asyncIterator] === 'function') {
            const asyncIterator = source[Symbol.asyncIterator]();
            if (typeof asyncIterator.next === 'function' &&
                typeof asyncIterator.throw === 'function' &&
                typeof asyncIterator.return === 'function') {
                try {
                    // Optionally check if the next method yields a value of the expected type
                    const { value, done } = await asyncIterator.next();
                    return !done && value instanceof ReadableStream; // or whatever check makes sense for IterableReadableStream<ChainValues>
                }
                catch (error) {
                    // Handle or ignore error
                }
            }
        }
        return false;
    }
    async readStreamAsText(readableStream, callback) {
        const reader = readableStream.getReader();
        let readResult;
        // Continuously read from the stream
        while (!(readResult = await reader.read()).done) {
            if (readResult.value && readResult.value.response) {
                // Emit each chunk text as it's read
                callback(readResult.value.response);
            }
        }
    }
    toJSON() {
        return {
            input: this.input,
            enhancedInput: this.enhancedInput,
            sentInput: this.sentInput,
            originalInput: this.originalInput,
            output: this.output,
            modelId: this.modelId,
            modelType: this.modelType,
            multiTemplate: this.multiTemplate,
            convo: {
                id: this.convo.getId()
            },
            hyperParameters: this.hyperParameters,
            varStorage: this.varStorage,
            created_at: this.created_at.toISOString()
        };
    }
}
exports["default"] = RWSPrompt;


/***/ }),

/***/ "../src/models/types/TimeSeriesModel.ts":
/*!**********************************************!*\
  !*** ../src/models/types/TimeSeriesModel.ts ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _model_1 = __importStar(__webpack_require__(/*! ../_model */ "../src/models/_model.ts"));
class TimeSeriesModel extends _model_1.default {
    constructor(data) {
        super(data);
        if (!this.timestamp) {
            this.timestamp = new Date();
        }
    }
}
exports["default"] = TimeSeriesModel;
__decorate([
    (0, _model_1.TrackType)(Number),
    __metadata("design:type", Number)
], TimeSeriesModel.prototype, "value", void 0);
__decorate([
    (0, _model_1.TrackType)(Date),
    __metadata("design:type", Date)
], TimeSeriesModel.prototype, "timestamp", void 0);
__decorate([
    (0, _model_1.TrackType)(Object),
    __metadata("design:type", Object)
], TimeSeriesModel.prototype, "params", void 0);


/***/ }),

/***/ "../src/routing/annotations/Route.ts":
/*!*******************************************!*\
  !*** ../src/routing/annotations/Route.ts ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
function Route(name, method = 'GET', params = { responseType: 'json' }) {
    let metaOpts = { name, method, params };
    return function (target, key) {
        Reflect.defineMetadata(`Route:${key}`, metaOpts, target);
    };
}
exports["default"] = Route;


/***/ }),

/***/ "../src/routing/annotations/index.ts":
/*!*******************************************!*\
  !*** ../src/routing/annotations/index.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Route = void 0;
const Route_1 = __importDefault(__webpack_require__(/*! ./Route */ "../src/routing/annotations/Route.ts"));
exports.Route = Route_1.default;


/***/ }),

/***/ "../src/services/APIGatewayService.ts":
/*!********************************************!*\
  !*** ../src/services/APIGatewayService.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const AWSService_1 = __importDefault(__webpack_require__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const LambdaService_1 = __importDefault(__webpack_require__(/*! ./LambdaService */ "../src/services/LambdaService.ts"));
const VPCService_1 = __importDefault(__webpack_require__(/*! ./VPCService */ "../src/services/VPCService.ts"));
const { log, error, rwsLog } = ConsoleService_1.default;
class APIGatewayService extends _service_1.default {
    constructor() {
        super();
        this.region = AWSService_1.default.getRegion();
    }
    async findApiGateway(gatewayName) {
        let theApi = null;
        const apis = await AWSService_1.default.getAPIGateway().getRestApis().promise();
        for (const api of apis.items) {
            if (api.name === gatewayName + '-API') {
                theApi = api;
                break;
            }
        }
        return theApi;
    }
    async deleteApiGateway(apiId) {
        await AWSService_1.default.getAPIGateway().deleteRestApi({ restApiId: apiId }).promise();
        error('Deleted API Gateway: ' + apiId);
    }
    async createApiGateway(gatewayName) {
        const currentGateway = await this.findApiGateway(gatewayName);
        let restApiId = null;
        if (!currentGateway) {
            const params = {
                name: gatewayName + '-API',
                description: `API Gateway for ${gatewayName}`,
                endpointConfiguration: {
                    types: ["REGIONAL"]
                }
            };
            try {
                const response = await AWSService_1.default.getAPIGateway().createRestApi(params).promise();
                restApiId = response.id || null;
            }
            catch (err) {
                error('Error creating API Gateway:', err);
                throw err;
            }
        }
        else {
            restApiId = currentGateway.id;
        }
        return restApiId;
    }
    async createResource(restApiId, resourceLabel) {
        const resources = await AWSService_1.default.getAPIGateway().getResources({ restApiId: restApiId }).promise();
        const rootResource = resources.items.find(r => r.path === '/');
        // Create a new resource under root (if it doesn't exist)
        let resource;
        const resourceName = resourceLabel + '-ENDPOINT';
        for (const res of resources.items) {
            if (res.pathPart === resourceName) {
                resource = res;
                break;
            }
        }
        if (!resource) {
            resource = await AWSService_1.default.getAPIGateway().createResource({
                restApiId: restApiId,
                parentId: rootResource.id,
                pathPart: resourceName
            }).promise();
        }
        return resource;
    }
    async createMethod(restApiId, resource, httpMethod = 'GET') {
        return await AWSService_1.default.getAPIGateway().putMethod({
            restApiId: restApiId,
            resourceId: resource.id,
            httpMethod: httpMethod,
            authorizationType: "NONE", // Change this if you want to use an authorizer
            apiKeyRequired: false
        }).promise();
    }
    async associateNATGatewayWithLambda(lambdaFunctionName) {
        rwsLog(`Creating NAT Gateway for "${lambdaFunctionName}" lambda function`);
        const lambdaConfig = { ...(await LambdaService_1.default.getLambdaFunction(lambdaFunctionName)).Configuration };
        const privateSubnetId = lambdaConfig.VpcConfig.SubnetIds[0];
        // const publicSubnet = await VPCService.createPublicSubnet(lambdaConfig.VpcConfig.VpcId, 20);    
        // const publicSubnetId = publicSubnet.Subnet.SubnetId;
        try {
            const eip = await AWSService_1.default.getEC2().allocateAddress({}).promise();
            if (!eip.AllocationId) {
                throw new Error('Failed to allocate Elastic IP.');
            }
            const natGateway = await AWSService_1.default.getEC2().createNatGateway({
                SubnetId: privateSubnetId,
                AllocationId: eip.AllocationId
            }).promise();
            const routeTable = await VPCService_1.default.getDefaultRouteTable(lambdaConfig.VpcConfig.VpcId);
            if (!routeTable) {
                throw new Error('No route table exists.');
            }
            await VPCService_1.default.waitForNatGatewayAvailable(natGateway.NatGateway.NatGatewayId);
            await AWSService_1.default.getEC2().createRoute({
                RouteTableId: routeTable.RouteTableId,
                DestinationCidrBlock: '0.0.0.0/0',
                NatGatewayId: natGateway.NatGateway.NatGatewayId
            }).promise();
            rwsLog('Lambda function associated with NAT Gateway successfully.');
        }
        catch (e) {
            error(e.code, e.message);
        }
    }
}
exports["default"] = APIGatewayService.getSingleton();


/***/ }),

/***/ "../src/services/AWSService.ts":
/*!*************************************!*\
  !*** ../src/services/AWSService.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const aws_sdk_1 = __importDefault(__webpack_require__(/*! aws-sdk */ "aws-sdk"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
class AWSService extends _service_1.default {
    constructor() {
        super();
    }
    _initApis(region) {
        if (!region) {
            this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        }
        else {
            this.region = region;
        }
        // console.log(region,this.s3, this.region)
        if (!this.s3 && this.region) {
            this.s3 = new aws_sdk_1.default.S3({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.apiGateway && this.region) {
            this.apiGateway = new aws_sdk_1.default.APIGateway({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.iam && this.region) {
            this.iam = new aws_sdk_1.default.IAM({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.efs && this.region) {
            this.efs = new aws_sdk_1.default.EFS({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.ec2 && this.region) {
            this.ec2 = new aws_sdk_1.default.EC2({
                region: (0, AppConfigService_1.default)().get('aws_lambda_region'),
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.lambda && this.region) {
            this.lambda = new aws_sdk_1.default.Lambda({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
        if (!this.cloudWatch && this.region) {
            this.cloudWatch = new aws_sdk_1.default.CloudWatchLogs({
                region: this.region,
                credentials: {
                    accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                    secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
                }
            });
        }
    }
    async checkForRolePermissions(roleARN, permissions) {
        const { OK, policies } = await this.firePermissionCheck(roleARN, permissions);
        return {
            OK,
            policies
        };
    }
    async firePermissionCheck(roleARN, permissions) {
        const params = {
            PolicySourceArn: roleARN, // Replace with your IAM role ARN
            ActionNames: permissions
        };
        const policies = [];
        let allowed = true;
        try {
            const data = await this.getIAM().simulatePrincipalPolicy(params).promise();
            for (let result of data.EvaluationResults) {
                if (result.EvalDecision !== 'allowed') {
                    allowed = false;
                    policies.push(result.EvalActionName);
                }
            }
        }
        catch (err) {
            error('Permission check error:');
            log(err);
            allowed = false;
        }
        return {
            OK: allowed,
            policies: policies
        };
    }
    getS3(region) {
        this._initApis(region);
        return this.s3;
    }
    getEC2(region) {
        this._initApis(region);
        return this.ec2;
    }
    getEFS(region) {
        this._initApis(region);
        return this.efs;
    }
    getLambda(region) {
        this._initApis(region);
        return this.lambda;
    }
    getRegion(region) {
        this._initApis(region);
        return this.region;
    }
    getIAM(region) {
        this._initApis(region);
        return this.iam;
    }
    getAPIGateway(region) {
        this._initApis(region);
        return this.apiGateway;
    }
    getCloudWatch(region) {
        this._initApis(region);
        return this.cloudWatch;
    }
}
exports["default"] = AWSService.getSingleton();


/***/ }),

/***/ "../src/services/AppConfigService.ts":
/*!*******************************************!*\
  !*** ../src/services/AppConfigService.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppConfigService = void 0;
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const AppDefaultConfig = {
    mongo_url: null,
    mongo_db: null,
    port: null,
    ws_port: null,
    test_port: null,
    test_ws_port: null,
    domain: null,
    ssl_cert: null,
    ssl_key: null,
    secret_key: null,
    user_class: null,
    user_models: [],
    controller_list: [],
    ws_routes: {},
    http_routes: [],
    commands: [],
    aws_lambda_region: null,
    aws_access_key: null,
    aws_secret_key: null,
    aws_lambda_role: null,
    aws_lambda_bucket: null,
    pub_dir: null
};
class AppConfigService extends _service_1.default {
    constructor(cfg) {
        super();
        this._custom_data = {};
        this.data = cfg;
    }
    get(key) {
        if (key in this.data && this.data[key] !== null) {
            return this.data[key];
        }
        if (key in this._custom_data) {
            return this._custom_data[key];
        }
        return null;
    }
    set(key, val) {
        this._custom_data[key] = val;
    }
    reloadConfig(cfgString) {
        const cfg = (__webpack_require__("../src/services sync recursive")(cfgString)).defaults;
        this.data = cfg();
        return this;
    }
    static getConfigSingleton(cfg) {
        const className = this.name;
        const instanceExists = _service_1.default._instances[className];
        if (cfg) {
            _service_1.default._instances[className] = new this(cfg);
        }
        else if (!instanceExists && !cfg) {
            _service_1.default._instances[className] = new this(AppDefaultConfig);
        }
        return _service_1.default._instances[className];
    }
}
exports.AppConfigService = AppConfigService;
exports["default"] = (cfg) => AppConfigService.getConfigSingleton(cfg);


/***/ }),

/***/ "../src/services/AuthService.ts":
/*!**************************************!*\
  !*** ../src/services/AuthService.ts ***!
  \**************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const jsonwebtoken_1 = __importDefault(__webpack_require__(/*! jsonwebtoken */ "jsonwebtoken"));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
/**
 * @notExported
 */
class AuthService extends _service_1.default {
    constructor() {
        super();
    }
    async authorize(token, constructor) {
        const secretKey = (0, AppConfigService_1.default)().get('secret_key');
        try {
            return await new Promise((approve, reject) => {
                jsonwebtoken_1.default.verify(token, secretKey, (error, tokenData) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    approve(new constructor(tokenData));
                });
            });
        }
        catch (e) {
            throw e;
        }
    }
}
exports["default"] = AuthService.getSingleton();


/***/ }),

/***/ "../src/services/CloudWatchService.ts":
/*!********************************************!*\
  !*** ../src/services/CloudWatchService.ts ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AWSService_1 = __importDefault(__webpack_require__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const { log, rwsLog, error, color } = ConsoleService_1.default;
const _MS = 1000;
class CloudWatchService extends _service_1.default {
    async printLogsForLambda(lambdaFunctionName, startTime, endTime, terminateTimeout = 30 * _MS) {
        const cloudWatchLogs = AWSService_1.default.getCloudWatch();
        const logGroupName = `/aws/lambda/${lambdaFunctionName}`; // Standard log group name format for Lambda
        let logStreamName;
        let logsTimeout = { core: null };
        // Get the latest log stream
        const describeParams = {
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
            limit: 1
        };
        try {
            const describeResult = await cloudWatchLogs.describeLogStreams(describeParams).promise();
            if (describeResult.logStreams && describeResult.logStreams[0]) {
                logStreamName = describeResult.logStreams[0].logStreamName;
            }
            else {
                error("No log streams found for the specified Lambda function.");
                return;
            }
        }
        catch (err) {
            error("An error occurred while describing log streams:", err);
            return;
        }
        let terminateTimer = null;
        const getLogs = async (nextToken) => {
            // const lambdaDetails = await LambdaService.getLambdaFunction(lambdaFunctionName);     
            const params = {
                logGroupName,
                logStreamName,
                startTime,
                endTime,
                nextToken,
                limit: 100
            };
            try {
                const data = await cloudWatchLogs.getLogEvents(params).promise();
                if (data.events && data.events.length > 0) {
                    this.printLogs(data.events);
                    // Reset the termination timer since we've received new logs
                    if (terminateTimer !== null) {
                        clearTimeout(terminateTimer);
                    }
                    terminateTimer = setTimeout(() => {
                        log("Terminating log fetch due to timeout.");
                        clearTimeout(terminateTimer);
                        return;
                    }, terminateTimeout); // terminateTimeout is the time in milliseconds you want to wait
                }
                this.nextForwardToken = data.nextForwardToken;
                // Recursive call to keep polling for new logs
                logsTimeout.core = setTimeout(() => getLogs(this.nextForwardToken), 5000); //
            }
            catch (err) {
                error("An error occurred while fetching logs:", err);
            }
        };
        getLogs();
        return logsTimeout;
    }
    printLogs(events) {
        events.forEach(event => {
            log(color().blue(`[AWS CloudWatch] `) + `{${new Date(event.timestamp).toISOString()}} : ${event.message}`);
        });
    }
}
exports["default"] = CloudWatchService.getSingleton();


/***/ }),

/***/ "../src/services/ConsoleService.ts":
/*!*****************************************!*\
  !*** ../src/services/ConsoleService.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const chalk_1 = __importDefault(__webpack_require__(/*! chalk */ "chalk"));
const pino_1 = __importDefault(__webpack_require__(/*! pino */ "pino"));
const pino_pretty_1 = __importDefault(__webpack_require__(/*! pino-pretty */ "pino-pretty")); // Import pino-pretty
class ConsoleService extends _service_1.default {
    constructor() {
        super();
        this.isEnabled = true;
        this.originalLogMethods = null;
        this.getOriginalLogFunctions = () => {
            return {
                log: console.log,
                warn: console.warn,
                error: console.error,
            };
        };
        this.disableOriginalLogFunctions = () => {
            console.log = (...args) => { };
            console.warn = (...args) => { };
            console.error = (...args) => { };
        };
        this.restoreOriginalLogFunctions = () => {
            const originalF = this.originalLogMethods;
            console.log = originalF.log;
            console.warn = originalF.warn;
            console.error = originalF.error;
        };
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.warn = this.warn.bind(this);
        this.isEnabled = true;
        this.originalLogMethods = this.getOriginalLogFunctions();
    }
    color() {
        return chalk_1.default;
    }
    log(...obj) {
        if (!this.isEnabled) {
            return;
        }
        const _self = this;
        let typeBucket = [];
        let lastType = null;
        obj.forEach((elem, index) => {
            const elemType = typeof elem;
            const isLast = index == obj.length - 1;
            if (((lastType === null && obj.length === 1) || (lastType !== null && lastType !== elemType)) || isLast) {
                if (lastType === 'string') {
                    console.log(typeBucket.join(' '));
                }
                else {
                    typeBucket.forEach((bucketElement) => {
                        _self.prettyPrintObject(bucketElement);
                    });
                }
                typeBucket = [];
                if (isLast) {
                    if (elemType === 'string') {
                        console.log(elem);
                    }
                    else {
                        _self.prettyPrintObject(elem);
                    }
                    return;
                }
            }
            typeBucket.push(elem);
            lastType = elemType; // Update the lastType for the next iteration
        });
    }
    colorObject(obj) {
        const _JSON_COLORS = {
            'keys': 'green',
            'objectValue': 'magenta',
            'braces': 'blue',
            'arrayBraces': 'yellow',
            'colons': 'white', // Color for colons
            'default': 'reset' // Default color to reset to default chalk color
        };
        const getCodeColor = (chalkKey, textValue) => {
            return chalk_1.default[chalkKey](textValue);
        };
        const objString = JSON.stringify(this.sanitizeObject(obj), null, 2);
        const lines = objString.split('\n');
        const coloredLines = [];
        for (const line of lines) {
            const parts = line.split(/("[^"]*"\s*:\s*)|("[^"]*":\s*)|([{}[\],])/); // Split the line into parts around keys, colons, commas, braces, and brackets
            // Process each part and colorize accordingly
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part !== undefined) {
                    const trimmedPart = part.trim();
                    if (trimmedPart === ':') {
                        // This part is a colon, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ':');
                    }
                    else if (trimmedPart === ',') {
                        // This part is a comma, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ',');
                    }
                    else if (trimmedPart === '[' || trimmedPart === ']') {
                        // This part is a bracket, colorize it with the arrayBraces color
                        parts[i] = getCodeColor(_JSON_COLORS.arrayBraces, part);
                    }
                    else if (i % 4 === 1) {
                        // This part is a key, colorize it with the keys color
                        const key = trimmedPart;
                        if (key === ':') {
                            parts[i] = getCodeColor(_JSON_COLORS.colons, key);
                        }
                        else {
                            parts[i] = getCodeColor(_JSON_COLORS.keys, key);
                        }
                    }
                    else if (i % 4 === 3) {
                        // This part is a value, colorize it with objectValue
                        const value = trimmedPart;
                        parts[i] = getCodeColor(_JSON_COLORS.objectValue, value);
                    }
                }
            }
            coloredLines.push(parts.join('')); // Join and add the modified line to the result
        }
        return coloredLines.join('\n'); // Join the colored lines and return as a single string
    }
    warn(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.log(...obj.map((txt) => chalk_1.default.yellowBright('[RWS CLI WARNING] ' + txt)));
    }
    sanitizeObject(obj) {
        const sensitiveKeys = ["mongo_url", "mongo_db", "ssl_cert", "ssl_key", "secret_key", "aws_access_key", "aws_secret_key"];
        const sanitizedObj = { ...obj }; // Create a shallow copy of the object
        for (const key of sensitiveKeys) {
            if (sanitizedObj.hasOwnProperty(key)) {
                sanitizedObj[key] = "<VALUE HIDDEN>";
            }
        }
        return sanitizedObj;
    }
    getPino() {
        return (0, pino_1.default)((0, pino_pretty_1.default)());
    }
    prettyPrintObject(obj) {
        this.getPino().info(this.colorObject(this.sanitizeObject(obj)));
    }
    error(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.error(obj);
        console.log(...obj.map((txt) => chalk_1.default.red('[RWS CLI ERROR] ' + txt)));
    }
    stopLogging() {
        this.isEnabled = false;
        this.disableOriginalLogFunctions();
    }
    startLogging() {
        this.isEnabled = true;
        this.restoreOriginalLogFunctions();
    }
    updateLogLine(message) {
        process.stdout.write('\r' + message);
    }
    rwsLog(logCat, logString = null) {
        const logName = logString ? `[${logCat}]` : '[RWS CLI]';
        const logData = logString ? logString : logCat;
        console.log(chalk_1.default.green(logName), logData);
    }
}
exports["default"] = ConsoleService.getSingleton();


/***/ }),

/***/ "../src/services/DBService.ts":
/*!************************************!*\
  !*** ../src/services/DBService.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DBService = void 0;
const client_1 = __webpack_require__(/*! @prisma/client */ "@prisma/client");
const mongodb_1 = __webpack_require__(/*! mongodb */ "mongodb");
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
class DBService extends _service_1.default {
    constructor(opts = null) {
        super();
        this.opts = null;
        this.connected = false;
    }
    connectToDB(opts = null) {
        if (opts) {
            this.opts = opts;
        }
        else {
            this.opts = {
                dbUrl: (0, AppConfigService_1.default)().get('mongo_url'),
                dbName: (0, AppConfigService_1.default)().get('mongo_db'),
            };
        }
        if (!this.opts.dbUrl) {
            return;
        }
        try {
            this.client = new client_1.PrismaClient({
                datasources: {
                    db: {
                        url: this.opts.dbUrl
                    },
                },
            });
            this.connected = true;
        }
        catch (e) {
            ConsoleService_1.default.error('PRISMA CONNECTION ERROR');
        }
    }
    async createBaseMongoClient() {
        var _a;
        const dbUrl = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbUrl) || (0, AppConfigService_1.default)().get('mongo_url');
        const client = new mongodb_1.MongoClient(dbUrl);
        await client.connect();
        return client;
    }
    async createBaseMongoClientDB() {
        var _a;
        const dbName = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbName) || (0, AppConfigService_1.default)().get('mongo_db');
        const client = await this.createBaseMongoClient();
        return client.db(dbName);
    }
    async cloneDatabase(source, target) {
        const client = await this.createBaseMongoClient();
        // Source and target DB
        const sourceDb = client.db(source);
        const targetDb = client.db(target);
        // Get all collections from source DB
        const collections = await sourceDb.listCollections().toArray();
        // Loop over all collections and copy them to the target DB
        for (let collection of collections) {
            const docs = await sourceDb.collection(collection.name).find({}).toArray();
            await targetDb.collection(collection.name).insertMany(docs);
        }
        await client.close();
    }
    async watchCollection(collectionName, preRun) {
        const db = await this.createBaseMongoClientDB();
        const collection = db.collection(collectionName);
        const changeStream = collection.watch();
        return new Promise((resolve) => {
            changeStream.on('change', (change) => {
                resolve(change);
            });
            preRun();
        });
    }
    async insert(data, collection, isTimeSeries = false) {
        let result = data;
        // Insert time-series data outside of the transaction
        if (isTimeSeries) {
            const db = await this.createBaseMongoClientDB();
            const collectionHandler = db.collection(collection);
            const insert = await collectionHandler.insertOne(data);
            result = await this.findOneBy(collection, { id: insert.insertedId.toString() });
            return result;
        }
        const prismaCollection = this.getCollectionHandler(collection);
        result = await prismaCollection.create({ data });
        return await this.findOneBy(collection, { id: result.id });
    }
    async update(data, collection) {
        const model_id = data.id;
        delete data['id'];
        const prismaCollection = this.getCollectionHandler(collection);
        await prismaCollection.update({
            where: {
                id: model_id,
            },
            data: data,
        });
        return await this.findOneBy(collection, { id: model_id });
    }
    ;
    async findOneBy(collection, conditions) {
        return await this.getCollectionHandler(collection).findFirst({ where: conditions });
    }
    async delete(collection, conditions) {
        await this.getCollectionHandler(collection).deleteMany({ where: conditions });
        return;
    }
    async findBy(collection, conditions, fields = null) {
        const params = { where: conditions };
        if (fields) {
            params.select = {};
            fields.forEach((fieldName) => {
                params.select[fieldName] = true;
            });
        }
        return await this.getCollectionHandler(collection).findMany(params);
    }
    async collectionExists(collection_name) {
        var _a;
        const dbUrl = ((_a = this.opts) === null || _a === void 0 ? void 0 : _a.dbUrl) || (0, AppConfigService_1.default)().get('mongo_url');
        const client = new mongodb_1.MongoClient(dbUrl);
        try {
            await client.connect();
            const db = client.db('junctioned'); // Replace with your database name
            const collections = await db.listCollections().toArray();
            const existingCollectionNames = collections.map((collection) => collection.name);
            return existingCollectionNames.includes(collection_name);
        }
        catch (error) {
            ConsoleService_1.default.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    async createTimeSeriesCollection(collection_name) {
        try {
            const db = await this.createBaseMongoClientDB();
            // Create a time series collection
            const options = {
                timeseries: {
                    timeField: 'timestamp', // Replace with your timestamp field
                    metaField: 'params' // Replace with your metadata field
                }
            };
            await db.createCollection(collection_name, options); // Replace with your collection name
            return db.collection(collection_name);
        }
        catch (error) {
            ConsoleService_1.default.error('Error connecting to MongoDB:', error);
            throw error;
        }
    }
    getCollectionHandler(collection) {
        if (!this.client || !this.connected) {
            this.connectToDB();
        }
        return this.client[collection];
    }
}
exports.DBService = DBService;
exports["default"] = DBService.getSingleton();


/***/ }),

/***/ "../src/services/EFSService.ts":
/*!*************************************!*\
  !*** ../src/services/EFSService.ts ***!
  \*************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const LambdaService_1 = __importDefault(__webpack_require__(/*! ./LambdaService */ "../src/services/LambdaService.ts"));
const AWSService_1 = __importDefault(__webpack_require__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ProcessService_1 = __importDefault(__webpack_require__(/*! ./ProcessService */ "../src/services/ProcessService.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const VPCService_1 = __importDefault(__webpack_require__(/*! ./VPCService */ "../src/services/VPCService.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const __STATE_WAIT_TIME = 3000; //ms
class EFSService extends _service_1.default {
    constructor() {
        super();
    }
    async getOrCreateEFS(functionName, vpcId, subnetId) {
        const response = await AWSService_1.default.getEFS().describeFileSystems({ CreationToken: functionName }).promise();
        if (response.FileSystems && response.FileSystems.length > 0) {
            const fileSystemId = response.FileSystems[0].FileSystemId;
            const accessPoints = await this.getAccessPoints(fileSystemId);
            if (!accessPoints.length) {
                throw "No acces point in EFS for RWS lambdas";
            }
            log(`${color().green('[RWS Cloud FS Service]')} EFS exists:`, {
                efsId: fileSystemId,
                apARN: accessPoints[0].AccessPointArn
            });
            return [fileSystemId, accessPoints[0].AccessPointArn, true];
        }
        else {
            const params = {
                CreationToken: functionName,
                PerformanceMode: 'generalPurpose',
            };
            try {
                const response = await AWSService_1.default.getEFS().createFileSystem(params).promise();
                await this.waitForEFS(response.FileSystemId);
                const fsMountId = await this.createMountTarget(response.FileSystemId, subnetId);
                await this.waitForFileSystemMount(response.FileSystemId);
                const [accessPointId, accessPointArn] = await this.createAccessPoint(response.FileSystemId);
                await this.waitForAccessPoint(accessPointId);
                const endpointId = await VPCService_1.default.createVPCEndpointIfNotExist(vpcId);
                await VPCService_1.default.ensureRouteToVPCEndpoint(vpcId, endpointId);
                log(`${color().green('[RWS Cloud FS Service]')} EFS Created:`, response);
                return [response.FileSystemId, accessPointArn, false];
            }
            catch (err) {
                error('Error creating EFS:', err);
                throw err; // It's a good practice to throw the error so the caller knows something went wrong.
            }
        }
    }
    async deleteEFS(fileSystemId) {
        try {
            await AWSService_1.default.getEFS().deleteFileSystem({ FileSystemId: fileSystemId }).promise();
            error(`EFS with ID ${fileSystemId} has been deleted.`);
        }
        catch (err) {
            error('Error while deleting EFS:');
            log(err);
            throw err;
        }
    }
    async waitForEFS(fileSystemId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS Listener] awaiting EFS state change')}`);
        while (!isAvailable) {
            const mountResponse = await AWSService_1.default.getEFS().describeFileSystems({ FileSystemId: fileSystemId }).promise();
            if (mountResponse.FileSystems && mountResponse.FileSystems.length && mountResponse.FileSystems[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, __STATE_WAIT_TIME)); // wait for 5 seconds before checking again
            }
        }
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async waitForFileSystemMount(fileSystemId) {
        while (true) {
            try {
                log(`${color().yellowBright('[EFS Mount Listener] awaiting EFS mount change')}`);
                const response = await AWSService_1.default.getEFS().describeMountTargets({ FileSystemId: fileSystemId }).promise();
                const isMounted = response.MountTargets.some(mountTarget => mountTarget.LifeCycleState === 'available');
                if (isMounted) {
                    log(`${color().yellowBright('[EFS Mount Listener] DONE')}`);
                    return true;
                }
                else {
                    log(`${color().yellowBright('[EFS Mount Listener] is during creation process...')}`);
                }
                log(`${color().yellowBright('[EFS Mount Listener] .')}`);
                await ProcessService_1.default.sleep(__STATE_WAIT_TIME);
            }
            catch (error) {
                console.error('Error while checking EFS mount status:', error);
                throw error;
            }
        }
    }
    async waitForAccessPoint(accessPointId) {
        let isAvailable = false;
        log(`${color().yellowBright('[EFS AP Listener] awaiting EFS access point change')}`, accessPointId);
        while (!isAvailable) {
            const accessPointResponse = await AWSService_1.default.getEFS().describeAccessPoints({ AccessPointId: accessPointId }).promise();
            if (accessPointResponse.AccessPoints && accessPointResponse.AccessPoints.length && accessPointResponse.AccessPoints[0].LifeCycleState === 'available') {
                isAvailable = true;
            }
            else {
                log(`${color().yellowBright('[EFS AP Listener] .')}`);
                await new Promise(resolve => setTimeout(resolve, 5000)); // wait for 5 seconds before checking again                
            }
        }
    }
    generateClientToken() {
        return Date.now().toString() + Math.random().toString(36).substr(2, 5);
    }
    async getAccessPoints(fileSystemId) {
        try {
            const params = {
                FileSystemId: fileSystemId // specify the FileSystemId to filter access points for a specific EFS
            };
            const response = await AWSService_1.default.getEFS().describeAccessPoints(params).promise();
            if (response.AccessPoints && response.AccessPoints.length > 0) {
                return response.AccessPoints; // this will return an array of access points
            }
            else {
                log('No access points found for the specified EFS.');
                return null;
            }
        }
        catch (err) {
            error('Error getting access point:', error);
            throw err;
        }
    }
    async createAccessPoint(fileSystemId) {
        const clientToken = this.generateClientToken(); // Generate a unique client token
        const params = {
            FileSystemId: fileSystemId,
            ClientToken: clientToken, // Add the client token here
            PosixUser: {
                Uid: 1001, // You can adjust these values as per your requirements.
                Gid: 1001
            },
            RootDirectory: {
                Path: "/mnt/efs", // The path where Lambda will mount the EFS.
                CreationInfo: {
                    OwnerUid: 1001,
                    OwnerGid: 1001,
                    Permissions: "755"
                }
            }
        };
        try {
            const response = await AWSService_1.default.getEFS().createAccessPoint(params).promise();
            log(`${color().green('[RWS Cloud FS Service]')} EFS AP created:`, response);
            return [response.AccessPointId, response.AccessPointArn];
        }
        catch (err) {
            error('Error creating EFS access point:', err);
            throw err;
        }
    }
    async createMountTarget(fileSystemId, subnetId) {
        const params = {
            FileSystemId: fileSystemId,
            SubnetId: subnetId,
        };
        try {
            const response = await AWSService_1.default.getEFS().createMountTarget(params).promise();
            log(`${color().green('[RWS Cloud FS Service]')} EFS Mount Target created:`, response);
            return response.MountTargetId;
        }
        catch (error) {
            console.error('Error creating Mount Target:', error);
        }
    }
    async uploadToEFS(baseFunctionName, efsId, modulesS3Key, s3Bucket, vpcId, subnetId) {
        const efsLoaderFunctionName = await this.processEFSLoader(vpcId, subnetId);
        const params = {
            functionName: `${baseFunctionName}`,
            efsId,
            modulesS3Key,
            s3Bucket
        };
        try {
            log(`${color().green(`[RWS Lambda Service]`)} invoking EFS Loader as "${efsLoaderFunctionName}" lambda function for "${baseFunctionName}" with ${modulesS3Key} in ${s3Bucket} bucket.`);
            const response = await LambdaService_1.default.invokeLambda(efsLoaderFunctionName, params);
            rwsLog('RWS Lambda Service', color().yellowBright(`"${efsLoaderFunctionName}" lambda function response:`));
            log(response);
            return; // JSON.parse(response.Response.Payload as string);
        }
        catch (error) {
            // await EFSService.deleteEFS(efsId);
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }
    async processEFSLoader(vpcId, subnetId) {
        const executionDir = process.cwd();
        const filePath = module.id;
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path_1.default.resolve(cmdDir, '..', '..', '..', '..');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        const _UNZIP_FUNCTION_NAME = 'efs-loader';
        if (!(await LambdaService_1.default.functionExists('RWS-' + _UNZIP_FUNCTION_NAME))) {
            log(`${color().green(`[RWS Lambda Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`, moduleDir);
            const zipPath = await LambdaService_1.default.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir);
            await LambdaService_1.default.deployLambda(_UNZIP_FUNCTION_NAME, zipPath, vpcId, subnetId, true);
        }
        return _UNZIP_FUNCTION_NAME;
    }
    async deleteDir() {
    }
}
exports["default"] = EFSService.getSingleton();


/***/ }),

/***/ "../src/services/LambdaService.ts":
/*!****************************************!*\
  !*** ../src/services/LambdaService.ts ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const EFSService_1 = __importDefault(__webpack_require__(/*! ./EFSService */ "../src/services/EFSService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const AWSService_1 = __importDefault(__webpack_require__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ZipService_1 = __importDefault(__webpack_require__(/*! ./ZipService */ "../src/services/ZipService.ts"));
const S3Service_1 = __importDefault(__webpack_require__(/*! ./S3Service */ "../src/services/S3Service.ts"));
const APIGatewayService_1 = __importDefault(__webpack_require__(/*! ./APIGatewayService */ "../src/services/APIGatewayService.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ./UtilsService */ "../src/services/UtilsService.ts"));
const ProcessService_1 = __importDefault(__webpack_require__(/*! ./ProcessService */ "../src/services/ProcessService.ts"));
const VPCService_1 = __importDefault(__webpack_require__(/*! ./VPCService */ "../src/services/VPCService.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
const MIN = 60; // 1MIN = 60s
class LambdaService extends _service_1.default {
    constructor() {
        super();
    }
    async archiveLambda(lambdaDirPath, moduleCfgDir, fullZip = false) {
        const lambdaDirName = lambdaDirPath.split('/').filter(Boolean).pop();
        const lambdaPath = path_1.default.join(moduleCfgDir, 'lambda', `RWS-${lambdaDirName}-app.zip`);
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
        const toolsFile = `${path_1.default.resolve(lambdaDirPath, '..')}/tools.js`;
        const targetToolsFile = `${lambdaDirPath}/tools.js`;
        fs_1.default.copyFileSync(toolsFile, targetToolsFile);
        log(`${color().green('[RWS Lambda Service]')} archiving ${color().yellowBright(lambdaDirPath)} to:\n ${color().yellowBright(lambdaPath)}`);
        tasks.push(ZipService_1.default.createArchive(lambdaPath, lambdaDirPath, fullZip ? null : {
            'ignore': ['node_modules/**/*']
        }));
        await Promise.all(tasks);
        fs_1.default.unlinkSync(targetToolsFile);
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
    async deployLambda(functionDirName, zipPath, vpcId, subnetId, noEFS = false) {
        this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        const zipFile = fs_1.default.readFileSync(zipPath);
        try {
            const s3BucketName = (0, AppConfigService_1.default)().get('aws_lambda_bucket');
            await S3Service_1.default.bucketExists(s3BucketName);
            const [efsId, accessPointArn, efsExisted] = await EFSService_1.default.getOrCreateEFS('RWS_EFS', vpcId, subnetId);
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('deploying lambda on ' + this.region)} using ${color().red(`S3://${s3BucketName}/${functionDirName}.zip`)}`);
            log(`${color().green('[RWS Lambda Service]')} uploading ${color().yellowBright(zipPath)}...`);
            const s3params = {
                Bucket: s3BucketName,
                Key: 'RWS-' + functionDirName + '.zip', // File name you want to save as in S3
                Body: zipFile
            };
            const s3Data = await S3Service_1.default.upload(s3params, true);
            log(`${color().green('[RWS Lambda Service]')} uploaded ${color().yellowBright(zipPath)} to ${color().red(`S3://${s3BucketName}/RWS-${functionDirName}.zip`)}`);
            const s3Path = s3Data.Key;
            const Code = {
                S3Bucket: s3BucketName,
                S3Key: s3Path
            };
            const lambdaFunctionName = 'RWS-' + functionDirName;
            const _HANDLER = 'index.handler';
            const functionDidExist = await this.functionExists(lambdaFunctionName);
            if (functionDidExist) {
                await AWSService_1.default.getLambda().updateFunctionCode({
                    FunctionName: lambdaFunctionName,
                    ...Code
                }).promise();
            }
            else {
                const createParams = {
                    FunctionName: lambdaFunctionName,
                    Runtime: 'nodejs18.x',
                    Role: (0, AppConfigService_1.default)().get('aws_lambda_role'),
                    Handler: _HANDLER,
                    Code,
                    VpcConfig: {
                        SubnetIds: [subnetId], // Add your subnet IDs
                        SecurityGroupIds: await VPCService_1.default.listSecurityGroups(), // Add your security group ID
                    },
                    FileSystemConfigs: [
                        {
                            Arn: accessPointArn,
                            LocalMountPath: '/mnt/efs' // The path in your Lambda function environment where the EFS will be mounted
                        }
                    ],
                    MemorySize: 2048,
                    Timeout: 15 * MIN,
                    Environment: {
                        Variables: {
                            NODE_PATH: '/mnt/efs/res/modules/' + functionDirName,
                            HOME: '/mnt/efs/res/tmp/' + functionDirName
                        }
                    }
                };
                log(color().green('[RWS Lambda Service] is ' + (functionDidExist ? 'updating' : 'creating') + ' lambda function named: ') + color().yellowBright(lambdaFunctionName));
                await AWSService_1.default.getLambda().createFunction(createParams).promise();
            }
            await this.waitForLambda(functionDirName, functionDidExist ? 'update' : 'creation');
            if (functionDidExist) {
                const functionInfo = await this.getLambdaFunction(lambdaFunctionName);
                if (functionInfo.Configuration.Handler !== _HANDLER) {
                    log(color().green('[RWS Lambda Service]') + ' is changing handler for Lambda function named: ' + color().yellowBright(lambdaFunctionName));
                    await AWSService_1.default.getLambda().updateFunctionConfiguration({
                        FunctionName: lambdaFunctionName,
                        Handler: _HANDLER
                    }, (err, data) => {
                        if (err) {
                            console.log(err, err.stack);
                        }
                        else {
                            console.log(data);
                        }
                    }).promise();
                    await this.waitForLambda(functionDirName, 'handler update');
                    // await S3Service.delete({
                    //   Bucket: s3params.Bucket,
                    //   Key: s3params.Key
                    // });
                    // rwsLog('Deleting S3 Object after deploy: ' + color().red(`s3://${s3params.Bucket}/${s3params.Key}`));
                }
            }
            rwsLog('RWS Lambda Service', `lambda function "${lambdaFunctionName}" has been ${functionDidExist ? 'created' : 'updated'}`);
            const npmPackage = this.getNPMPackage(functionDirName);
            if ((!!npmPackage.deployConfig) && npmPackage.deployConfig.webLambda === true) {
                if ((await APIGatewayService_1.default.findApiGateway(lambdaFunctionName)) === null) {
                    await this.setupGatewayForWebLambda(lambdaFunctionName, vpcId);
                }
                if (!(await VPCService_1.default.findPublicSubnetInVPC(vpcId))) {
                    await APIGatewayService_1.default.associateNATGatewayWithLambda(lambdaFunctionName);
                }
            }
        }
        catch (err) {
            error(err.message);
            log(err.stack);
            throw err;
        }
    }
    getNPMPackage(lambdaDirName) {
        const moduleDir = path_1.default.resolve(__dirname, '..', '..').replace('dist/', '');
        const npmPackagePath = `${moduleDir}/lambda-functions/${lambdaDirName}/package.json`;
        if (!fs_1.default.existsSync(npmPackagePath)) {
            throw new Error(`The lambda folder "${lambdaDirName}" has no package.json inside.`);
        }
        return JSON.parse(fs_1.default.readFileSync(npmPackagePath, 'utf-8'));
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
            await ProcessService_1.default.runShellCommand(`npm install`, null, true);
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
            const s3Data = await S3Service_1.default.upload(s3params);
            const s3Path = s3Data.Key;
            // fs.unlinkSync(packagePath);      
            log(`${color().green('[RWS Lambda Service]')} ${color().yellowBright('NPM package file is uploaded to ' + this.region + ' with key:  ' + s3Path)}`);
            UtilsService_1.default.setRWSVar(_RWS_MODULES_UPLOADED, s3Path);
            await EFSService_1.default.uploadToEFS(functionName, efsId, s3Path, S3Bucket, vpcId, subnetId);
            // await S3Service.delete({
            //   Bucket: s3params.Bucket,
            //   Key: s3params.Key
            // });
            // rwsLog('Deleting S3 Object after module deploy: ' + color().red(`s3://${s3params.Bucket}/${s3params.Key}`));
        }
    }
    async getLambdaFunction(lambdaFunctionName) {
        try {
            return await AWSService_1.default.getLambda().getFunction({ FunctionName: lambdaFunctionName }).promise();
        }
        catch (e) {
            return null;
        }
    }
    async functionExists(lambdaFunctionName) {
        return !!(await this.getLambdaFunction(lambdaFunctionName));
    }
    async waitForLambda(functionName, waitFor = null, timeoutMs = 300000, intervalMs = 5000) {
        const lambdaFunctionName = 'RWS-' + functionName;
        const startTime = Date.now();
        log(`${color().yellowBright('[Lambda Listener] awaiting Lambda' + (waitFor !== null ? ' (' + waitFor + ')' : '') + ' state change')}`);
        while (Date.now() - startTime < timeoutMs) {
            log(`${color().yellowBright('[Lambda Listener] .')}`);
            const { Configuration } = await this.getLambdaFunction(lambdaFunctionName);
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
    async deleteLambda(lambdaFunctionName) {
        const restApi = await APIGatewayService_1.default.findApiGateway(lambdaFunctionName);
        await APIGatewayService_1.default.deleteApiGateway(restApi.id);
        await AWSService_1.default.getLambda().deleteFunction({
            FunctionName: lambdaFunctionName
        }).promise();
    }
    async invokeLambda(functionDirName, payload) {
        let invocationType = 'RequestResponse';
        const npmPackage = this.getNPMPackage(functionDirName);
        if (!!npmPackage.deployConfig && npmPackage.deployConfig.invocationType) {
            invocationType = npmPackage.deployConfig.invocationType;
        }
        if (!!payload._invocationConfig) {
            const invocationConfig = payload._invocationConfig;
            invocationType = invocationConfig.invocationType;
            delete payload['_invocationConfig'];
        }
        const params = {
            FunctionName: 'RWS-' + functionDirName,
            InvocationType: invocationType,
            Payload: JSON.stringify(payload),
        };
        log(color().green('[RWS Lambda Service]') + color().yellowBright(` invoking (with ${invocationType} type) "RWS-${functionDirName}" with payload: `));
        log(payload);
        try {
            const response = await AWSService_1.default.getLambda()
                .invoke(params)
                .promise();
            return {
                StatusCode: response.StatusCode,
                Response: response,
                InvocationType: invocationType
            };
        }
        catch (e) {
            error(e.message);
            throw new Error(e);
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
    async integrateGatewayResource(lambdaFunctionName, restApiId, resource, httpMethod = 'GET') {
        const lambdaInfo = await this.getLambdaFunction(lambdaFunctionName);
        const lambdaArn = lambdaInfo.Configuration.FunctionArn;
        await AWSService_1.default.getAPIGateway().putIntegration({
            restApiId: restApiId,
            resourceId: resource.id,
            httpMethod: httpMethod,
            type: "AWS_PROXY",
            integrationHttpMethod: "POST",
            uri: `arn:aws:apigateway:${AWSService_1.default.getRegion()}:lambda:path/2015-03-31/functions/${lambdaArn}/invocations`
        }).promise();
    }
    async setupGatewayForWebLambda(lambdaFunctionName, vpcId) {
        rwsLog('Creating API Gateway for Web Lambda...');
        const restApiId = await APIGatewayService_1.default.createApiGateway(lambdaFunctionName);
        const resource = await APIGatewayService_1.default.createResource(restApiId, lambdaFunctionName);
        const httpMethods = ['GET', 'POST', 'PUT', 'DELETE'];
        const apiMethods = [];
        rwsLog('Pushing methods to API Gateway resource.');
        for (let methodKey in httpMethods) {
            apiMethods.push(await APIGatewayService_1.default.createMethod(restApiId, resource, httpMethods[methodKey]));
        }
        rwsLog(`Integrating API Gateway resource with "${color().yellowBright(lambdaFunctionName)}" lambda function.`);
        for (let apiMethodKey in apiMethods) {
            const apiMethod = apiMethods[apiMethodKey];
            await this.integrateGatewayResource(lambdaFunctionName, restApiId, resource, apiMethod.httpMethod);
        }
        await AWSService_1.default.getAPIGateway().createDeployment({
            restApiId: restApiId,
            stageName: "prod"
        }).promise();
        rwsLog(`API Gateway "${color().yellowBright(lambdaFunctionName + '-API')}" deployed.`);
    }
}
exports["default"] = LambdaService.getSingleton();


/***/ }),

/***/ "../src/services/MD5Service.ts":
/*!*************************************!*\
  !*** ../src/services/MD5Service.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const crypto_1 = __importDefault(__webpack_require__(/*! crypto */ "crypto"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const TraversalService_1 = __importDefault(__webpack_require__(/*! ./TraversalService */ "../src/services/TraversalService.ts"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ./UtilsService */ "../src/services/UtilsService.ts"));
class MD5Service extends _service_1.default {
    async calculateFileMD5(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto_1.default.createHash('md5');
            const input = fs_1.default.createReadStream(filePath);
            input.on('readable', () => {
                const data = input.read();
                if (data) {
                    hash.update(data);
                }
                else {
                    resolve(hash.digest('hex'));
                }
            });
            input.on('error', reject);
        });
    }
    async generateCliHashes(fileNames) {
        const md5Pack = [];
        for (const key in fileNames) {
            const fileName = fileNames[key];
            const md5 = await this.calculateFileMD5(fileName);
            md5Pack.push(md5);
        }
        return md5Pack;
    }
    async cliClientHasChanged(consoleClientHashFile, tsFilename) {
        const generatedHash = fs_1.default.readFileSync(consoleClientHashFile, 'utf-8');
        const cmdFiles = this.batchGenerateCommandFileMD5(path_1.default.resolve(UtilsService_1.default.findRootWorkspacePath(process.cwd()), 'node_modules', '.rws'));
        const currentSumHashes = (await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/');
        if (generatedHash !== currentSumHashes) {
            return true;
        }
        return false;
    }
    batchGenerateCommandFileMD5(moduleCfgDir) {
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        if (!fs_1.default.existsSync(`${moduleCfgDir}/__rws_installed`) || !fs_1.default.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)) {
            return [];
        }
        const cmdDirPath = fs_1.default.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8');
        //path.resolve(process.cwd()) + '/' + 
        return TraversalService_1.default.getAllFilesInFolder(cmdDirPath, [
            process.cwd() + '/' + cmdDirPath + '/index.ts'
        ]);
        ;
    }
}
exports["default"] = MD5Service.getSingleton();


/***/ }),

/***/ "../src/services/ProcessService.ts":
/*!*****************************************!*\
  !*** ../src/services/ProcessService.ts ***!
  \*****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const child_process_1 = __webpack_require__(/*! child_process */ "child_process");
const child_process_2 = __webpack_require__(/*! child_process */ "child_process");
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const readline_1 = __importDefault(__webpack_require__(/*! readline */ "readline"));
const os_1 = __importDefault(__webpack_require__(/*! os */ "os"));
const { log, warn, error, color } = ConsoleService_1.default;
const totalMemoryBytes = os_1.default.totalmem();
const totalMemoryKB = totalMemoryBytes / 1024;
const totalMemoryMB = totalMemoryKB / 1024;
const totalMemoryGB = totalMemoryMB / 1024;
class ProcessService extends _service_1.default {
    getParentPID(pid) {
        const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
        return parseInt((0, child_process_1.execSync)(command).toString().trim(), 10);
    }
    getAllProcessesIds() {
        const startingPID = process.pid;
        return [startingPID, this.getParentPID(startingPID)];
    }
    async runShellCommand(command, cwd = null, silent = false) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            if (!cwd) {
                cwd = process.cwd();
            }
            const spawned = (0, child_process_2.spawn)(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });
            spawned.on('exit', (code) => {
                if (code !== 0) {
                    return reject(new Error(`Command failed with exit code ${code}`));
                }
                resolve();
            });
            spawned.on('error', (error) => {
                reject(error);
            });
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getInput(prompt) {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question(color().red('[RWS CLI Input Prompt] ' + prompt), (answer) => {
                resolve(answer);
                rl.close();
            });
        });
    }
}
exports["default"] = ProcessService.getSingleton();


/***/ }),

/***/ "../src/services/RouterService.ts":
/*!****************************************!*\
  !*** ../src/services/RouterService.ts ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__webpack_require__(/*! reflect-metadata */ "reflect-metadata");
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const index_1 = __webpack_require__(/*! ../errors/index */ "../src/errors/index.ts");
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
/**
 *
 */
class RouterService extends _service_1.default {
    constructor() {
        super();
    }
    static responseTypeToMIME(responseType) {
        switch (responseType) {
            case 'html': return 'text/html';
            default: return 'application/json';
        }
    }
    getRouterAnnotations(constructor) {
        const annotationsData = {};
        const propertyKeys = Reflect.getMetadataKeys(constructor.prototype).map((item) => {
            return item.split(':')[1];
        });
        propertyKeys.forEach(key => {
            const annotations = ['Route'];
            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;
                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
                if (meta) {
                    annotationsData[String(key)] = { annotationType: annotation, metadata: meta };
                }
            });
        });
        return annotationsData;
    }
    async assignRoutes(app, routesPackage, controllerList) {
        const controllerRoutes = {
            get: {}, post: {}, put: {}, delete: {}
        };
        controllerList.forEach((controllerInstance) => {
            const controllerMetadata = this.getRouterAnnotations(controllerInstance.constructor);
            if (controllerMetadata) {
                Object.keys(controllerMetadata).forEach((key) => {
                    if (controllerMetadata[key].annotationType !== 'Route') {
                        return;
                    }
                    this.setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app);
                });
            }
        });
        let routes = [];
        routesPackage.forEach((item) => {
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                // Handle the case where item is of type IPrefixedHTTProutes
                routes = [...routes, ...item.routes.map((subRouteItem) => {
                        const subRoute = {
                            path: item.prefix + subRouteItem.path,
                            name: subRouteItem.name
                        };
                        return subRoute;
                    })];
            }
            else {
                // Handle the case where item is of type IHTTProute
                routes.push(item);
            }
        });
        console.log('ROUTES IN ASSIGNMENT', routes);
        routes.forEach((route) => {
            Object.keys(controllerRoutes).forEach((_method) => {
                const actions = controllerRoutes[_method];
                if (!actions[route.name]) {
                    return;
                }
                this.addRouteToServer(actions, route);
            });
        });
        return routes;
    }
    addRouteToServer(actions, route) {
        const [routeMethod, appMethod, routeParams, methodName] = actions[route.name];
        if (!appMethod) {
            return;
        }
        appMethod(route.path, async (req, res) => {
            try {
                const controllerMethodReturn = await routeMethod({
                    req: req,
                    query: req.query,
                    params: route.noParams ? [] : req.params,
                    data: req.body,
                    res: res
                });
                res.setHeader('Content-Type', RouterService.responseTypeToMIME(routeParams.responseType));
                let status = 200;
                if (controllerMethodReturn instanceof index_1.RWSError) {
                    status = controllerMethodReturn.getCode();
                }
                this.sendResponseWithStatus(res, status, routeParams, controllerMethodReturn);
                return;
            }
            catch (err) {
                let errMsg;
                let stack;
                if (!!err.printFullError) {
                    err.printFullError();
                    errMsg = err.getMessage();
                    stack = err.getStack();
                }
                else {
                    errMsg = err.message;
                    ConsoleService_1.default.error(errMsg);
                    console.log(err.stack);
                    stack = err.stack;
                    err.message = errMsg;
                }
                const code = err.getCode ? err.getCode() : 500;
                this.sendResponseWithStatus(res, code, routeParams, {
                    success: false,
                    data: {
                        error: {
                            code: code,
                            message: errMsg,
                            stack
                        }
                    }
                });
            }
        });
    }
    sendResponseWithStatus(res, status, routeParams, output) {
        if (routeParams.responseType === 'json' || !routeParams.responseType) {
            res.status(status).send(output);
            return;
        }
        if (routeParams.responseType === 'html' && (0, AppConfigService_1.default)().get('pub_dir')) {
            res.status(status).sendFile(path_1.default.join((0, AppConfigService_1.default)().get('pub_dir'), output.template_name + '.html'));
            return;
        }
        res.status(status).send();
    }
    setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app) {
        const action = controllerInstance.callMethod(key);
        const meta = controllerMetadata[key].metadata;
        switch (meta.method) {
            case 'GET':
                controllerRoutes.get[meta.name] = [action.bind(controllerInstance), app.get.bind(app), meta.params, key];
                break;
            case 'POST':
                controllerRoutes.post[meta.name] = [action.bind(controllerInstance), app.post.bind(app), meta.params, key];
                break;
            case 'PUT':
                controllerRoutes.put[meta.name] = [action.bind(controllerInstance), app.put.bind(app), meta.params, key];
                break;
            case 'DELETE':
                controllerRoutes.delete[meta.name] = [action.bind(controllerInstance), app.delete.bind(app), meta.params, key];
                break;
        }
    }
    hasRoute(routePath, routes) {
        return this.getRoute(routePath, routes) !== null;
    }
    getRoute(routePath, routes) {
        const front_routes = (0, AppConfigService_1.default)().get('front_routes');
        const foundRoute = routes.find((item) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });
        return !!foundRoute ? foundRoute : null;
    }
}
exports["default"] = RouterService.getSingleton();


/***/ }),

/***/ "../src/services/S3Service.ts":
/*!************************************!*\
  !*** ../src/services/S3Service.ts ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const AWSService_1 = __importDefault(__webpack_require__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const { log, warn, error, color } = ConsoleService_1.default;
class S3Service extends _service_1.default {
    constructor() {
        super();
    }
    async upload(params, override = true, region = null) {
        if (override) {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key }, region);
            if (exists) {
                log(`${color().green('[RWS Lambda Service]')} ${color().red('Deleting existing S3 object:')} ${params.Key}`);
                await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
            }
        }
        else {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key }, region);
            if (exists) {
                return null;
            }
        }
        return AWSService_1.default.getS3(region).upload(params).promise();
    }
    async downloadObject(params, region = null) {
        return AWSService_1.default.getS3(region).getObject(params).promise();
    }
    async downloadToString(s3key, bucket, region) {
        return new Promise(async (resolve, reject) => {
            let s3pageResponse = await this.downloadObject({
                Key: s3key,
                Bucket: bucket
            }, region);
            if (s3pageResponse.Body instanceof Buffer || s3pageResponse.Body instanceof Uint8Array) {
                resolve(s3pageResponse.Body.toString());
            }
            else if (typeof s3pageResponse.Body === 'string') {
                resolve(s3pageResponse.Body);
            }
            else {
                // Handle other types or throw an error
                console.error('Unsupported data type');
                reject('Unsupported data type');
            }
        });
    }
    async delete(params, region = null) {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key }, region);
        return;
    }
    async objectExists(params, region = null) {
        try {
            await AWSService_1.default.getS3(region).headObject(params).promise();
            return true;
        }
        catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    async deleteObject(params, region = null) {
        await AWSService_1.default.getS3(region).deleteObject(params).promise();
    }
    async bucketExists(bucketName, region = null) {
        try {
            await AWSService_1.default.getS3(region).headBucket({ Bucket: bucketName }).promise();
            return bucketName;
        }
        catch (err) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };
                await AWSService_1.default.getS3(region).createBucket(params).promise();
                log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
                return bucketName;
            }
            else {
                // Handle other errors
                error(`Error checking bucket ${bucketName}:`, err);
            }
        }
    }
}
exports["default"] = S3Service.getSingleton();


/***/ }),

/***/ "../src/services/ServerService.ts":
/*!****************************************!*\
  !*** ../src/services/ServerService.ts ***!
  \****************************************/
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
const socket_io_1 = __webpack_require__(/*! socket.io */ "socket.io");
const https_1 = __importDefault(__webpack_require__(/*! https */ "https"));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ./AppConfigService */ "../src/services/AppConfigService.ts"));
const cors_1 = __importDefault(__webpack_require__(/*! cors */ "cors"));
const http_1 = __importStar(__webpack_require__(/*! http */ "http"));
const AuthService_1 = __importDefault(__webpack_require__(/*! ./AuthService */ "../src/services/AuthService.ts"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const express_1 = __importDefault(__webpack_require__(/*! express */ "express"));
const RouterService_1 = __importDefault(__webpack_require__(/*! ./RouterService */ "../src/services/RouterService.ts"));
const ProcessService_1 = __importDefault(__webpack_require__(/*! ./ProcessService */ "../src/services/ProcessService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const UtilsService_1 = __importDefault(__webpack_require__(/*! ./UtilsService */ "../src/services/UtilsService.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const body_parser_1 = __importDefault(__webpack_require__(/*! body-parser */ "body-parser"));
const Error404_1 = __importDefault(__webpack_require__(/*! ../errors/Error404 */ "../src/errors/Error404.ts"));
const compression_1 = __importDefault(__webpack_require__(/*! compression */ "compression"));
const fileUpload = __webpack_require__(/*! express-fileupload */ "express-fileupload");
const getCurrentLineNumber = UtilsService_1.default.getCurrentLineNumber;
const wsLog = async (fakeError, text, socketId = null, isError = false) => {
    const logit = isError ? console.error : console.log;
    const filePath = module.id;
    const fileName = filePath.split('/').pop();
    const marker = '[RWS Websocket]';
    logit(isError ? ConsoleService_1.default.color().red(marker) : ConsoleService_1.default.color().green(marker), `|`, `${filePath}:${await getCurrentLineNumber(fakeError)}`, `|${socketId ? ConsoleService_1.default.color().blueBright(` (${socketId})`) : ''}:`, `${text}`);
};
const MINUTE = 1000 * 60;
class ServerService extends socket_io_1.Server {
    constructor(webServer, expressApp, opts) {
        const _DOMAIN = opts.cors_domain || opts.domain;
        const WEBSOCKET_CORS = {
            origin: _DOMAIN,
            methods: ["GET", "POST"]
        };
        const cors_headers = ['Content-Type', 'x-csrf-token', 'Accept', 'Authorization', 'x-junctionapi-version'];
        super(webServer, {
            cors: WEBSOCKET_CORS,
            transports: [opts.transport || 'websocket'],
            pingTimeout: 5 * MINUTE
        });
        this.tokens = {};
        this.users = {};
        this.disconnectClient = (clientSocket) => {
            clientSocket.disconnect(true);
        };
        const _self = this;
        this.server_app = expressApp;
        this.srv = webServer;
        this.options = opts;
        const corsHeadersSettings = {
            "Access-Control-Allow-Origin": _DOMAIN, // Replace with your frontend domain
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": cors_headers.join(', '),
            "Access-Control-Allow-Credentials": 'true'
        };
        this.srv.on("options", (req, res) => {
            res.writeHead(200, corsHeadersSettings);
            res.end();
        });
        this.server_app.use((req, res, next) => {
            Object.keys(corsHeadersSettings).forEach((key) => {
                res.setHeader(key, corsHeadersSettings[key]);
            });
            next();
        });
        const corsOptions = {
            origin: _DOMAIN, // Replace with the appropriate origins or set it to '*'
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: cors_headers
        };
        console.log('cors-options', corsOptions);
        const corsMiddleware = (0, cors_1.default)(corsOptions);
        this.use(async (socket, next) => {
            const request = socket.request;
            const response = new http_1.ServerResponse(request);
            corsMiddleware(request, response, next);
        });
        this.server_app.options('*', (0, cors_1.default)(corsOptions)); // Enable pre-flight for all routes
        if (opts.authorization) {
            this.setupAuth();
        }
    }
    static async initializeApp(opts) {
        var _b, _c;
        if (!_a.http_server) {
            const [baseHttpServer, expressHttpServer] = await _a.createServerInstance(opts);
            const http_instance = new _a(baseHttpServer, expressHttpServer, opts);
            const isSSL = (_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ssl;
            const httpPort = (0, AppConfigService_1.default)().get('port');
            _a.http_server = { instance: await http_instance.configureHTTPServer(), starter: http_instance.createServerStarter(httpPort, () => {
                    ConsoleService_1.default.log(ConsoleService_1.default.color().green('Request/response server' + ` is working on port ${httpPort} using HTTP${isSSL ? 'S' : ''} protocol`));
                }) };
        }
        if (!_a.ws_server) {
            const [baseWsServer, expressWsServer] = await _a.createServerInstance(opts);
            const ws_instance = new _a(baseWsServer, expressWsServer, opts);
            const isSSL = (_c = (0, AppConfigService_1.default)().get('features')) === null || _c === void 0 ? void 0 : _c.ssl;
            const wsPort = (0, AppConfigService_1.default)().get('ws_port');
            _a.ws_server = { instance: await ws_instance.configureWSServer(), starter: ws_instance.createServerStarter(wsPort, () => {
                    ConsoleService_1.default.log(ConsoleService_1.default.color().green('Websocket server' + ` is working on port ${wsPort}. SSL is ${isSSL ? 'enabled' : 'disabled'}.`));
                }) };
        }
        const allProcessesIds = ProcessService_1.default.getAllProcessesIds();
        const executeDir = process.cwd();
        const pacakgeDir = UtilsService_1.default.findRootWorkspacePath(process.cwd());
        const rwsDir = `${pacakgeDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(rwsDir)) {
            fs_1.default.mkdirSync(rwsDir);
        }
        return {
            websocket: this.ws_server,
            http: this.http_server,
        };
    }
    setJWTToken(socketId, token) {
        if (token.indexOf('Bearer') > -1) {
            this.tokens[socketId] = token.split(' ')[1];
        }
        else {
            this.tokens[socketId] = token;
        }
    }
    webServer() {
        return this.srv;
    }
    static async createServerInstance(opts) {
        var _b;
        const app = (0, express_1.default)();
        const isSSL = (_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ssl;
        const options = {};
        if (isSSL) {
            const sslCert = (0, AppConfigService_1.default)().get('ssl_cert');
            const sslKey = (0, AppConfigService_1.default)().get('ssl_key');
            if (!sslKey || !sslCert || !fs_1.default.existsSync(sslCert) || !fs_1.default.existsSync(sslKey)) {
                throw new Error('SSL keys set in config do not exist.');
            }
            options.key = fs_1.default.readFileSync(sslKey);
            options.cert = fs_1.default.readFileSync(sslCert);
        }
        const webServer = isSSL ? https_1.default.createServer(options, app) : http_1.default.createServer(app);
        return [webServer, app];
    }
    createServerStarter(port, injected = () => { }) {
        return (async (callback = () => { }) => {
            this.webServer().listen(port, () => {
                injected();
                callback();
            });
        }).bind(this);
    }
    async configureHTTPServer() {
        var _b;
        this.server_app.use(fileUpload());
        // app.use(express.json({ limit: '200mb' }));
        this.server_app.use(body_parser_1.default.json({ limit: '200mb' }));
        if ((_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.routing_enabled) {
            if (this.options.pub_dir) {
                this.server_app.use(express_1.default.static(this.options.pub_dir));
            }
            this.server_app.set('view engine', 'ejs');
            const processed_routes = await RouterService_1.default.assignRoutes(this.server_app, this.options.httpRoutes, this.options.controllerList);
            this.server_app.use((req, res, next) => {
                if (!RouterService_1.default.hasRoute(req.originalUrl, processed_routes)) {
                    _a.on404(req, res);
                }
                else {
                    next();
                }
            });
        }
        this.use(compression_1.default);
        return this;
    }
    async configureWSServer() {
        var _b;
        if ((_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ws_enabled) {
            this.sockets.on('connection', async (socket) => {
                const socketId = socket.id;
                wsLog(new Error(), `Client connection recieved`, socketId);
                socket.on("disconnect", async (reason) => {
                    wsLog(new Error(), `Client disconnected due to ${reason}`, socketId);
                    if (reason === 'transport error') {
                        wsLog(new Error(), `Transport error`, socketId, true);
                    }
                });
                socket.on('error', async (error) => {
                    wsLog(new Error(), error, socketId, true);
                });
                socket.on('__PING__', async () => {
                    wsLog(new Error(), `Recieved ping... Emmiting response callback.`, socketId);
                    socket.emit('__PONG__', '__PONG__');
                });
                Object.keys(this.options.wsRoutes).forEach((eventName) => {
                    const SocketClass = this.options.wsRoutes[eventName];
                    new SocketClass(_a.ws_server).handleConnection(socket, eventName);
                });
            });
        }
        return this;
    }
    setupAuth() {
        const _self = this;
        this.use(async (socket, next) => {
            const AppConfigService = (0, AppConfigService_1.default)();
            const request = socket.request;
            const response = new http_1.ServerResponse(request);
            const authHeader = request.headers.authorization;
            const UserClass = await AppConfigService.get('user_class');
            if (!authHeader) {
                response.writeHead(400, 'No token provided');
                response.end();
                return;
            }
            if (!_self.tokens[socket.id]) {
                _self.setJWTToken(socket.id, authHeader);
            }
            if (!_self.users[socket.id]) {
                try {
                    _self.users[socket.id] = await AuthService_1.default.authorize(_self.tokens[socket.id], UserClass);
                }
                catch (e) {
                    ConsoleService_1.default.error('Token authorization error: ', e.message);
                }
            }
            if (!_self.users[socket.id]) {
                _self.disconnectClient(socket);
                ConsoleService_1.default.error('Token unauthorized');
                response.writeHead(403, 'Token unauthorized');
                response.end();
                return;
            }
        });
    }
    static on404(req, res) {
        const error = new Error404_1.default(new Error('Sorry, the page you\'re looking for doesn\'t exist.'), req.url);
        error.printFullError();
        let response = error.getMessage();
        if (req.headers.accept.indexOf('text/html') > -1) {
            const htmlTemplate = this.processErrorTemplate(error);
            response = htmlTemplate;
        }
        res.status(404).send(response);
    }
    static processErrorTemplate(error) {
        return fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', '..', '..', 'html') + '/error.html', 'utf-8')
            .replace('{{error_number}}', error.getCode().toString())
            .replace('{{error_message}}', error.getMessage())
            .replace('{{error_stack_trace}}', error.getStackTraceString() !== '' ? `<h4>Stack trace:</h4><pre>${error.getStackTraceString()}</pre>` : '');
    }
    getOptions() {
        return this.options;
    }
}
_a = ServerService;
ServerService.cookies = {
    getCookies: async (headers) => {
        return new Promise((resolve) => {
            resolve(headers.cookie.split(';').map((cookieEntry) => {
                const [key, value] = cookieEntry.split('=');
                return {
                    [key]: value
                };
            }));
        });
    },
    getCookie: async (headers, key) => {
        const cookiesBin = await _a.cookies.getCookies(headers);
        if (!cookiesBin[key]) {
            return null;
        }
        return cookiesBin[key];
    }
};
exports["default"] = ServerService;


/***/ }),

/***/ "../src/services/TraversalService.ts":
/*!*******************************************!*\
  !*** ../src/services/TraversalService.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
class TraversalService extends _service_1.default {
    getAllFilesInFolder(folderPath, ignoreFilenames = [], recursive = false) {
        const files = [];
        function traverseDirectory(currentPath) {
            const entries = fs_1.default.readdirSync(currentPath, { withFileTypes: true });
            entries.forEach(entry => {
                const entryPath = path_1.default.join(currentPath, entry.name);
                if (entry.isFile()) {
                    if (!ignoreFilenames.includes(entryPath)) {
                        files.push(entryPath);
                    }
                }
                else if (entry.isDirectory() && recursive) {
                    traverseDirectory(entryPath);
                }
            });
        }
        traverseDirectory(folderPath);
        return files;
    }
}
exports["default"] = TraversalService.getSingleton();


/***/ }),

/***/ "../src/services/UtilsService.ts":
/*!***************************************!*\
  !*** ../src/services/UtilsService.ts ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const source_map_1 = __webpack_require__(/*! source-map */ "source-map");
class UtilsService extends _service_1.default {
    startExecTimeRecord() {
        this._startTime = process.hrtime();
    }
    endExecTimeRecord() {
        if (this._startTime === null) {
            return 0;
        }
        const elapsed = process.hrtime(this._startTime);
        this._startTime = null;
        return Math.round(elapsed[0] * 1000 + elapsed[1] / 1e6);
    }
    filterNonEmpty(arr) {
        return arr.filter((argElement) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
    }
    isInterface(func) {
        return typeof func === 'function';
    }
    getRWSVar(fileName) {
        const packageDir = this.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return;
        }
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    }
    setRWSVar(fileName, value) {
        const packageDir = this.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        fs_1.default.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
    findRootWorkspacePath(currentPath) {
        const parentPackageJsonPath = path_1.default.join(currentPath + '/..', 'package.json');
        const parentPackageDir = path_1.default.dirname(parentPackageJsonPath);
        if (fs_1.default.existsSync(parentPackageJsonPath)) {
            const packageJson = JSON.parse(fs_1.default.readFileSync(parentPackageJsonPath, 'utf-8'));
            if (packageJson.workspaces) {
                return this.findRootWorkspacePath(parentPackageDir);
            }
        }
        return currentPath;
    }
    async getCurrentLineNumber(error = null) {
        if (!error) {
            error = new Error();
        }
        const stack = error.stack || '';
        const stackLines = stack.split('\n');
        const relevantLine = stackLines[1];
        // Extract file path from the stack line
        const match = relevantLine.match(/\((.*?):\d+:\d+\)/);
        if (!match)
            return -1;
        const filePath = match[1];
        // Assuming the source map is in the same directory with '.map' extension
        const sourceMapPath = `${filePath}.map`;
        // Read the source map
        const sourceMapContent = fs_1.default.readFileSync(sourceMapPath, 'utf-8');
        const sourceMap = JSON.parse(sourceMapContent);
        const consumer = await new source_map_1.SourceMapConsumer(sourceMap);
        // Extract line and column number
        const lineMatch = relevantLine.match(/:(\d+):(\d+)/);
        if (!lineMatch)
            return -1;
        const originalPosition = consumer.originalPositionFor({
            line: parseInt(lineMatch[1]),
            column: parseInt(lineMatch[2]),
        });
        return originalPosition.line;
    }
}
exports["default"] = UtilsService.getSingleton();


/***/ }),

/***/ "../src/services/VPCService.ts":
/*!*************************************!*\
  !*** ../src/services/VPCService.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const AWSService_1 = __importDefault(__webpack_require__(/*! ./AWSService */ "../src/services/AWSService.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
class VPCService extends _service_1.default {
    async findDefaultSubnetForVPC() {
        try {
            const response = await AWSService_1.default.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
            if (response.Vpcs && response.Vpcs.length > 0) {
                return [await this.getSubnetIdForVpc(response.Vpcs[0].VpcId), response.Vpcs[0].VpcId];
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
        const result = await AWSService_1.default.getEC2().describeSubnets(params).promise();
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId)[0];
        }
        else {
            return null;
        }
    }
    async listSecurityGroups() {
        try {
            const result = await AWSService_1.default.getEC2().describeSecurityGroups().promise();
            const securityGroups = result.SecurityGroups || [];
            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
            return securityGroupIds;
        }
        catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }
    async getDefaultRouteTable(vpcId, subnetId = null) {
        var _a;
        const filters = [{
                Name: "vpc-id",
                Values: [vpcId]
            }];
        if (subnetId) {
            filters.push({
                Name: "association.subnet-id",
                Values: [subnetId]
            });
        }
        const routeTablesResponse = await AWSService_1.default.getEC2().describeRouteTables({
            Filters: filters
        }).promise();
        return (_a = routeTablesResponse.RouteTables) === null || _a === void 0 ? void 0 : _a.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }
    async createVPCEndpointIfNotExist(vpcId) {
        const endpointName = "RWS-S3-GATE";
        const serviceName = `com.amazonaws.${AWSService_1.default.getRegion()}.s3`;
        // Describe VPC Endpoints
        const existingEndpoints = await AWSService_1.default.getEC2().describeVpcEndpoints({
            Filters: [
                {
                    Name: "tag:Name",
                    Values: [endpointName]
                }
            ]
        }).promise();
        const defaultRouteTable = await this.getDefaultRouteTable(vpcId);
        // Check if the endpoint already exists
        const endpointExists = existingEndpoints.VpcEndpoints && existingEndpoints.VpcEndpoints.length > 0;
        if (!endpointExists) {
            // Create VPC Endpoint for S3
            const endpointResponse = await AWSService_1.default.getEC2().createVpcEndpoint({
                VpcId: vpcId,
                ServiceName: serviceName,
                VpcEndpointType: "Gateway",
                RouteTableIds: [defaultRouteTable.RouteTableId], // Add your route table IDs here
                TagSpecifications: [
                    {
                        ResourceType: "vpc-endpoint",
                        Tags: [
                            {
                                Key: "Name",
                                Value: endpointName
                            }
                        ]
                    }
                ]
            }).promise();
            if (endpointResponse.VpcEndpoint) {
                log(`VPC Endpoint "${endpointName}" created with ID: ${endpointResponse.VpcEndpoint.VpcEndpointId}`);
                return endpointResponse.VpcEndpoint.VpcEndpointId;
            }
            else {
                error("Failed to create VPC Endpoint");
                throw new Error("Failed to create VPC Endpoint");
            }
        }
        else {
            log(`VPC Endpoint "${endpointName}" already exists.`);
            return existingEndpoints.VpcEndpoints[0].VpcEndpointId;
        }
    }
    async ensureRouteToVPCEndpoint(vpcId, vpcEndpointId) {
        try {
            const routeTable = await this.getDefaultRouteTable(vpcId);
            const routes = routeTable.Routes || [];
            const hasS3EndpointRoute = routes.some((route) => route.GatewayId === vpcEndpointId);
            if (!hasS3EndpointRoute) {
                // Get the prefix list associated with the S3 VPC endpoint
                const vpcEndpointDescription = (await AWSService_1.default.getEC2().describeVpcEndpoints({
                    VpcEndpointIds: [vpcEndpointId]
                }).promise()).VpcEndpoints;
                rwsLog('Creating VPC Endpoint route');
                // Add a route to the route table
                await AWSService_1.default.getEC2().createRoute({
                    RouteTableId: routeTable.RouteTableId,
                    DestinationCidrBlock: '0.0.0.0/0',
                    VpcEndpointId: vpcEndpointDescription[0].VpcEndpointId
                }).promise();
                log(`Added route to VPC Endpoint ${vpcEndpointId} in Route Table ${routeTable.RouteTableId}`);
            }
            else {
                log(`Route to VPC Endpoint ${vpcEndpointId} already exists in Route Table ${routeTable.RouteTableId}`);
            }
        }
        catch (error) {
            console.error('Error ensuring route to VPC Endpoint:', error);
        }
    }
    async findPublicSubnetInVPC(vpcId) {
        const subnets = await AWSService_1.default.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        for (const subnet of subnets.Subnets || []) {
            const routeTables = await AWSService_1.default.getEC2().describeRouteTables({
                Filters: [{ Name: 'association.subnet-id', Values: [subnet.SubnetId] }]
            }).promise();
            for (const routeTable of routeTables.RouteTables || []) {
                for (const route of routeTable.Routes || []) {
                    if (route.DestinationCidrBlock === '0.0.0.0/0' && route.GatewayId && route.GatewayId.startsWith('igw-')) {
                        return subnet;
                    }
                }
            }
        }
        return null;
    }
    calculateNextThirdOctetIncrement(range) {
        const thirdOctet = 0;
        // Calculate the number of addresses represented by the CIDR range
        const numAddresses = Math.pow(2, 32 - range);
        // Calculate how many blocks in the third octet those addresses span
        const increment = Math.ceil(numAddresses / 256);
        const nextThirdOctet = increment;
        return nextThirdOctet;
    }
    async createPublicSubnet(vpcId, range = 24, passedCIDRBlock = null) {
        var _a;
        const _SUBNET_PASS_VAL = this.calculateNextThirdOctetIncrement(range);
        const vpcInfo = await AWSService_1.default.getEC2().describeVpcs({ VpcIds: [vpcId] }).promise();
        if (!vpcInfo.Vpcs || vpcInfo.Vpcs.length === 0) {
            throw new Error('VPC not found.');
        }
        const vpcCidrBlock = vpcInfo.Vpcs[0].CidrBlock;
        // Retrieve existing subnets within the VPC
        const subnets = await AWSService_1.default.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        const existingCidrs = ((_a = subnets.Subnets) === null || _a === void 0 ? void 0 : _a.map(subnet => subnet.CidrBlock).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))) || [];
        // Propose a new CIDR block
        let newCidrBlock;
        const baseIp = (passedCIDRBlock ? passedCIDRBlock : vpcCidrBlock).split('/')[0];
        const maxThirdOctet = Math.max(...existingCidrs.map(cidr => {
            const octets = cidr.split('.');
            return parseInt(octets[2]);
        }));
        const rerun = async (newOctet, newRange) => await this.createPublicSubnet(vpcId, range, `${baseIp.split('.').slice(0, 2).join('.')}.${newOctet}.0/${newRange}`);
        const baseThirdOctet = existingCidrs.length ? maxThirdOctet : 0;
        let nextThirdOctet = baseThirdOctet + _SUBNET_PASS_VAL;
        newCidrBlock = `${baseIp.split('.').slice(0, 2).join('.')}.${nextThirdOctet}.0/${range.toString()}`;
        rwsLog(`Trying to create public subnet for "${vpcId}" VPC with "${newCidrBlock}" address`);
        if (!existingCidrs.includes(newCidrBlock)) {
            try {
                const subnet = await AWSService_1.default.getEC2().createSubnet({
                    VpcId: vpcId,
                    CidrBlock: newCidrBlock
                }).promise();
                rwsLog(`Created public subnet "${subnet.Subnet.SubnetId}" for "${vpcId}" VPC with "${newCidrBlock}" address`);
                return subnet;
            }
            catch (err) {
                // If there's an error due to the CIDR block, adjust and try again
                warn(err.code);
                if (['InvalidSubnet.Range', 'InvalidSubnet.Conflict'].includes(err.code)) {
                    nextThirdOctet += _SUBNET_PASS_VAL;
                    error(`CIDR Address taken. Retrying...`);
                    return await rerun(nextThirdOctet, range);
                }
                else {
                    throw err;
                }
            }
        }
        else {
            nextThirdOctet += _SUBNET_PASS_VAL;
            error(`CIDR Address already used. Retrying...`);
            return await rerun(nextThirdOctet, range);
        }
    }
    extractThirdOctet(ip) {
        return parseInt(ip.split('.')[2]);
    }
    async waitForNatGatewayAvailable(natGatewayId) {
        try {
            rwsLog(`Waiting for NAT Gateway ${natGatewayId}...`);
            await AWSService_1.default.getEC2().waitFor('natGatewayAvailable', {
                NatGatewayIds: [natGatewayId]
            }).promise();
            rwsLog(`NAT Gateway ${natGatewayId} is now available.`);
        }
        catch (err) {
            error(`Error waiting for NAT Gateway ${natGatewayId} to become available:`);
            log(err);
            throw err;
        }
    }
}
exports["default"] = VPCService.getSingleton();


/***/ }),

/***/ "../src/services/VectorStoreService.ts":
/*!*********************************************!*\
  !*** ../src/services/VectorStoreService.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const VectorStore_1 = __importDefault(__webpack_require__(/*! ../models/convo/VectorStore */ "../src/models/convo/VectorStore.ts"));
class VectorStoreService extends _service_1.default {
    async createStore(docs, embeddings) {
        return await (new VectorStore_1.default(docs, embeddings)).init();
    }
}
exports["default"] = VectorStoreService.getSingleton();


/***/ }),

/***/ "../src/services/ZipService.ts":
/*!*************************************!*\
  !*** ../src/services/ZipService.ts ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const _service_1 = __importDefault(__webpack_require__(/*! ./_service */ "../src/services/_service.ts"));
const ConsoleService_1 = __importDefault(__webpack_require__(/*! ./ConsoleService */ "../src/services/ConsoleService.ts"));
const path_1 = __importDefault(__webpack_require__(/*! path */ "path"));
const fs_1 = __importDefault(__webpack_require__(/*! fs */ "fs"));
const archiver_1 = __importDefault(__webpack_require__(/*! archiver */ "archiver"));
const { log, warn, error, color } = ConsoleService_1.default;
const defaultZipParams = {
    recursive: true,
    format: 'zip',
    ignore: []
};
class ZipService extends _service_1.default {
    constructor() {
        super();
    }
    async createArchive(outputPath, sourcePath, params = null) {
        if (params) {
            params = Object.assign(defaultZipParams, params);
        }
        else {
            params = defaultZipParams;
        }
        const archive = (0, archiver_1.default)(params.format);
        const output = fs_1.default.createWriteStream(outputPath);
        archive.pipe(output);
        // archive.directory(sourcePath, params.recursive ? false : params.destpath);
        archive.glob('**/*', {
            cwd: sourcePath,
            dot: true, //include .dotpaths
            ignore: params.ignore
        });
        log(`${color().green('[RWS Lambda Service]')} ZIP params:`);
        log(params);
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
    listFilesInDirectory(directoryPath) {
        const files = fs_1.default.readdirSync(directoryPath);
        const filePaths = [];
        files.forEach(file => {
            const fullPath = path_1.default.join(directoryPath, file);
            const stats = fs_1.default.statSync(fullPath);
            if (stats.isFile()) {
                filePaths.push(fullPath);
            }
        });
        return filePaths;
    }
}
exports["default"] = ZipService.getSingleton();


/***/ }),

/***/ "../src/services/_service.ts":
/*!***********************************!*\
  !*** ../src/services/_service.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TheService {
    constructor() {
        this._RELOADABLE = false;
    }
    static getSingleton() {
        const className = this.name;
        if (!TheService._instances[className]) {
            TheService._instances[className] = new this();
        }
        return TheService._instances[className];
    }
    getReloadable() {
        return this.constructor._RELOADABLE || this._RELOADABLE;
    }
    reloadService(...params) {
        const className = this.name;
        TheService._instances[className] = new this(...params);
        return TheService._instances[className];
    }
}
TheService._instances = {};
exports["default"] = TheService;


/***/ }),

/***/ "../src/sockets/_socket.ts":
/*!*********************************!*\
  !*** ../src/sockets/_socket.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TheSocket {
    constructor(server) {
        this.server = server;
    }
    handleConnection(socket, routeName) {
        throw new Error("Method not implemented.");
    }
    middlewareImplementation(next) {
        throw new Error("Method not implemented.");
    }
    getJson(input) {
        return JSON.parse(input);
    }
    sendJson(input) {
        return JSON.stringify(input);
    }
    emitMessage(method, socket, data = null) {
        socket.emit(method, this.sendJson({ success: true, data, method }));
    }
}
exports["default"] = TheSocket;


/***/ }),

/***/ "../src/tests/actions/_action.ts":
/*!***************************************!*\
  !*** ../src/tests/actions/_action.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TestAction {
    constructor(vars) {
        this.vars = vars;
    }
}
exports["default"] = TestAction;


/***/ }),

/***/ "../src/tests/helpers/AxiosHelper.ts":
/*!*******************************************!*\
  !*** ../src/tests/helpers/AxiosHelper.ts ***!
  \*******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const axios_1 = __importDefault(__webpack_require__(/*! axios */ "axios"));
const https_1 = __importDefault(__webpack_require__(/*! https */ "https"));
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ../../services/AppConfigService */ "../src/services/AppConfigService.ts"));
exports["default"] = {
    createInstance: (opts) => {
        const axiosInstance = axios_1.default.create(Object.assign({
            headers: {
                'Content-Type': 'application/json',
                'Origin': (0, AppConfigService_1.default)().get('domain')
            },
            withCredentials: true,
            httpsAgent: new https_1.default.Agent({
                rejectUnauthorized: false // This line will ignore SSL verification.
            })
        }, opts));
        axiosInstance.defaults.timeout = 60000; // Increase timeout to 60000ms (60 seconds)
        axiosInstance.interceptors.request.use((config) => {
            return config;
        });
        return axiosInstance;
    }
};


/***/ }),

/***/ "../src/tests/helpers/BrowserHelper.ts":
/*!*********************************************!*\
  !*** ../src/tests/helpers/BrowserHelper.ts ***!
  \*********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.WebBrowser = void 0;
const puppeteer_1 = __importDefault(__webpack_require__(/*! puppeteer */ "puppeteer"));
class WebBrowser {
    constructor(app, params) {
        this.app = app;
        this.params = params;
    }
    async getCookies() {
        const page = await this.app.newPage();
        await page.goto(this.params.url);
        // Get cookies
        const cookiesArray = await page.cookies();
        await this.app.close();
        return cookiesArray.reduce((acc, cookie) => {
            acc[cookie.name] = cookie;
            return acc;
        }, {});
    }
    async getCookieString() {
        return Object.entries(await this.getCookies())
            .map(([name, cookie]) => `${name}=${cookie.value}`)
            .join('; ');
    }
}
exports.WebBrowser = WebBrowser;
async function create(params) {
    const browser = await puppeteer_1.default.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        ignoreHTTPSErrors: true,
    });
    return new WebBrowser(browser, params);
}
exports["default"] = {
    create,
};


/***/ }),

/***/ "../src/tests/helpers/TestHelper.ts":
/*!******************************************!*\
  !*** ../src/tests/helpers/TestHelper.ts ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.TestCase = exports.MOCHA = void 0;
const AppConfigService_1 = __importDefault(__webpack_require__(/*! ../../services/AppConfigService */ "../src/services/AppConfigService.ts"));
const ServerService_1 = __importDefault(__webpack_require__(/*! ../../services/ServerService */ "../src/services/ServerService.ts"));
const socket_io_client_1 = __webpack_require__(/*! socket.io-client */ "socket.io-client");
const _mocha = __importStar(__webpack_require__(/*! mocha */ "mocha"));
const chai_1 = __importStar(__webpack_require__(/*! chai */ "chai"));
const chai_like_1 = __importDefault(__webpack_require__(/*! chai-like */ "chai-like"));
const chai_things_1 = __importDefault(__webpack_require__(/*! chai-things */ "chai-things"));
const _test_case_1 = __importDefault(__webpack_require__(/*! ../test_cases/_test_case */ "../src/tests/test_cases/_test_case.ts"));
exports.TestCase = _test_case_1.default;
chai_1.default.use(chai_like_1.default);
chai_1.default.use(chai_things_1.default);
const createTestVars = (cfg = null) => {
    (0, AppConfigService_1.default)(cfg);
    return {
        server: null,
        socket: null,
        theUser: null,
        browser: null
    };
};
const connectToWS = async (jwt_token, ping_event = '__PING__', ping_response_event = '__PONG__') => {
    const headers = {
        Authorization: 'Bearer ' + jwt_token
    };
    try {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
        const _TESTPORT = await (0, AppConfigService_1.default)().get('test_port');
        const socket = (0, socket_io_client_1.io)(`https://localhost:${_TESTPORT}`, {
            extraHeaders: headers,
            rejectUnauthorized: false
        });
        socket.on('error', (error) => {
            console.error('Socket Error:', error);
        });
        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
        });
        return new Promise((done) => {
            socket.on(ping_response_event, () => {
                done(socket);
            });
            socket.emit(ping_event);
        });
    }
    catch (error) {
        console.error('Error initializing socket:', error.context.responseText);
        throw error;
    }
};
const setLoggedLifeCycle = (testVars, callbacks) => {
    setLifeCycle(testVars, {
        before: async () => {
            testVars.server = await startServer();
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
                return await callbacks.after(testVars);
            }
            return;
        },
        beforeEach: async () => {
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.beforeEach) {
                return await callbacks.beforeEach(testVars);
            }
            return;
        },
        afterEach: async () => {
            if (testVars.socket && testVars.socket.connected) {
                testVars.socket.disconnect();
            }
            return;
        },
        after: async () => {
            if (testVars.server) {
                testVars.server.http.instance.close();
                testVars.server.websocket.instance.close();
            }
            if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
                return await callbacks.after(testVars);
            }
            return;
        }
    }, {
        beforeEach: 30000
    });
};
const startServer = async () => {
    const _TESTPORT = await (0, AppConfigService_1.default)().get('test_port');
    const _TESTWSPORT = await (0, AppConfigService_1.default)().get('test_ws_port');
    const server = await ServerService_1.default.initializeApp({
        controllerList: await (0, AppConfigService_1.default)().get('controller_list'),
        wsRoutes: await (0, AppConfigService_1.default)().get('ws_routes'),
        httpRoutes: await (0, AppConfigService_1.default)().get('http_routes')
    });
    const startHTTPListener = async () => new Promise((resolve) => {
        server.http.starter();
    });
    const startWSListener = async () => new Promise((resolve) => {
        server.websocket.starter();
    });
    return server;
};
const setLifeCycle = (testVars, callbacks, timeouts) => {
    MOCHA.before(async function () {
        if (timeouts === null || timeouts === void 0 ? void 0 : timeouts.before) {
            this.timeout(timeouts.before);
        }
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.before) {
            await callbacks.before(testVars);
        }
    });
    MOCHA.beforeEach(async function () {
        if (timeouts === null || timeouts === void 0 ? void 0 : timeouts.beforeEach) {
            this.timeout(timeouts.beforeEach);
        }
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.beforeEach) {
            await callbacks.beforeEach(testVars);
        }
        return;
    });
    MOCHA.afterEach(async function () {
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.afterEach) {
            await callbacks.afterEach(testVars);
        }
    });
    MOCHA.after(async function () {
        if (callbacks === null || callbacks === void 0 ? void 0 : callbacks.after) {
            await callbacks.after(testVars);
        }
    });
};
exports["default"] = {
    connectToWS,
    startServer,
    createTestVars,
    disableLogging: () => { console.log = () => { }; }
};
const MOCHA = Object.assign(_mocha, {
    expect: chai_1.expect,
    setLifeCycle,
    setLoggedLifeCycle
});
exports.MOCHA = MOCHA;


/***/ }),

/***/ "../src/tests/index.ts":
/*!*****************************!*\
  !*** ../src/tests/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.MOCHA = exports.TestHelper = exports.TestCase = exports.TestAction = exports.BrowserHelper = exports.AxiosHelper = void 0;
const AxiosHelper_1 = __importDefault(__webpack_require__(/*! ./helpers/AxiosHelper */ "../src/tests/helpers/AxiosHelper.ts"));
exports.AxiosHelper = AxiosHelper_1.default;
const BrowserHelper_1 = __importDefault(__webpack_require__(/*! ./helpers/BrowserHelper */ "../src/tests/helpers/BrowserHelper.ts"));
exports.BrowserHelper = BrowserHelper_1.default;
const TestHelper_1 = __importStar(__webpack_require__(/*! ./helpers/TestHelper */ "../src/tests/helpers/TestHelper.ts"));
exports.TestHelper = TestHelper_1.default;
Object.defineProperty(exports, "MOCHA", ({ enumerable: true, get: function () { return TestHelper_1.MOCHA; } }));
const _action_1 = __importDefault(__webpack_require__(/*! ./actions/_action */ "../src/tests/actions/_action.ts"));
exports.TestAction = _action_1.default;
const _test_case_1 = __importDefault(__webpack_require__(/*! ./test_cases/_test_case */ "../src/tests/test_cases/_test_case.ts"));
exports.TestCase = _test_case_1.default;


/***/ }),

/***/ "../src/tests/test_cases/_test_case.ts":
/*!*********************************************!*\
  !*** ../src/tests/test_cases/_test_case.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
class TestCase {
    constructor() {
        throw new Error('Class not instantiable');
    }
    static declare(testVars) {
        throw new Error('Method not implemented.');
    }
}
exports["default"] = TestCase;


/***/ }),

/***/ "@langchain/community/vectorstores/faiss":
/*!**********************************************************!*\
  !*** external "@langchain/community/vectorstores/faiss" ***!
  \**********************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("@langchain/community/vectorstores/faiss");

/***/ }),

/***/ "@prisma/client":
/*!*********************************!*\
  !*** external "@prisma/client" ***!
  \*********************************/
/***/ ((module) => {

"use strict";
module.exports = require("@prisma/client");

/***/ }),

/***/ "archiver":
/*!***************************!*\
  !*** external "archiver" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("archiver");

/***/ }),

/***/ "aws-sdk":
/*!**************************!*\
  !*** external "aws-sdk" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("aws-sdk");

/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("axios");

/***/ }),

/***/ "body-parser":
/*!******************************!*\
  !*** external "body-parser" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("body-parser");

/***/ }),

/***/ "chai":
/*!***********************!*\
  !*** external "chai" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("chai");

/***/ }),

/***/ "chai-like":
/*!****************************!*\
  !*** external "chai-like" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("chai-like");

/***/ }),

/***/ "chai-things":
/*!******************************!*\
  !*** external "chai-things" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("chai-things");

/***/ }),

/***/ "chalk":
/*!************************!*\
  !*** external "chalk" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("chalk");

/***/ }),

/***/ "compression":
/*!******************************!*\
  !*** external "compression" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("compression");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("cors");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("express");

/***/ }),

/***/ "express-fileupload":
/*!*************************************!*\
  !*** external "express-fileupload" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = require("express-fileupload");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("fs");

/***/ }),

/***/ "fs/promises":
/*!******************************!*\
  !*** external "fs/promises" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("fs/promises");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

"use strict";
module.exports = require("jsonwebtoken");

/***/ }),

/***/ "langchain/chains":
/*!***********************************!*\
  !*** external "langchain/chains" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("langchain/chains");

/***/ }),

/***/ "langchain/document":
/*!*************************************!*\
  !*** external "langchain/document" ***!
  \*************************************/
/***/ ((module) => {

"use strict";
module.exports = require("langchain/document");

/***/ }),

/***/ "langchain/document_loaders/fs/text":
/*!*****************************************************!*\
  !*** external "langchain/document_loaders/fs/text" ***!
  \*****************************************************/
/***/ ((module) => {

"use strict";
module.exports = require("langchain/document_loaders/fs/text");

/***/ }),

/***/ "langchain/text_splitter":
/*!******************************************!*\
  !*** external "langchain/text_splitter" ***!
  \******************************************/
/***/ ((module) => {

"use strict";
module.exports = require("langchain/text_splitter");

/***/ }),

/***/ "mocha":
/*!************************!*\
  !*** external "mocha" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("mocha");

/***/ }),

/***/ "mongodb":
/*!**************************!*\
  !*** external "mongodb" ***!
  \**************************/
/***/ ((module) => {

"use strict";
module.exports = require("mongodb");

/***/ }),

/***/ "path":
/*!***********************!*\
  !*** external "path" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("path");

/***/ }),

/***/ "pino":
/*!***********************!*\
  !*** external "pino" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("pino");

/***/ }),

/***/ "pino-pretty":
/*!******************************!*\
  !*** external "pino-pretty" ***!
  \******************************/
/***/ ((module) => {

"use strict";
module.exports = require("pino-pretty");

/***/ }),

/***/ "puppeteer":
/*!****************************!*\
  !*** external "puppeteer" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("puppeteer");

/***/ }),

/***/ "reflect-metadata":
/*!***********************************!*\
  !*** external "reflect-metadata" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("reflect-metadata");

/***/ }),

/***/ "socket.io":
/*!****************************!*\
  !*** external "socket.io" ***!
  \****************************/
/***/ ((module) => {

"use strict";
module.exports = require("socket.io");

/***/ }),

/***/ "socket.io-client":
/*!***********************************!*\
  !*** external "socket.io-client" ***!
  \***********************************/
/***/ ((module) => {

"use strict";
module.exports = require("socket.io-client");

/***/ }),

/***/ "source-map":
/*!*****************************!*\
  !*** external "source-map" ***!
  \*****************************/
/***/ ((module) => {

"use strict";
module.exports = require("source-map");

/***/ }),

/***/ "uuid":
/*!***********************!*\
  !*** external "uuid" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("uuid");

/***/ }),

/***/ "xml2js":
/*!*************************!*\
  !*** external "xml2js" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("xml2js");

/***/ }),

/***/ "child_process":
/*!********************************!*\
  !*** external "child_process" ***!
  \********************************/
/***/ ((module) => {

"use strict";
module.exports = require("child_process");

/***/ }),

/***/ "crypto":
/*!*************************!*\
  !*** external "crypto" ***!
  \*************************/
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ "http":
/*!***********************!*\
  !*** external "http" ***!
  \***********************/
/***/ ((module) => {

"use strict";
module.exports = require("http");

/***/ }),

/***/ "https":
/*!************************!*\
  !*** external "https" ***!
  \************************/
/***/ ((module) => {

"use strict";
module.exports = require("https");

/***/ }),

/***/ "os":
/*!*********************!*\
  !*** external "os" ***!
  \*********************/
/***/ ((module) => {

"use strict";
module.exports = require("os");

/***/ }),

/***/ "readline":
/*!***************************!*\
  !*** external "readline" ***!
  \***************************/
/***/ ((module) => {

"use strict";
module.exports = require("readline");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
var exports = __webpack_exports__;
/*!********************!*\
  !*** ./src/rws.ts ***!
  \********************/
//#!/usr/bin/env node

Object.defineProperty(exports, "__esModule", ({ value: true }));
const index_1 = __webpack_require__(/*! ../../src/index */ "../src/index.ts");
const { log, warn, error, color, rwsLog } = index_1.ConsoleService;
const fs = __webpack_require__(/*! fs */ "fs");
const path = __webpack_require__(/*! path */ "path");
// process.argv[2] will be the first command line argument after `rws`
const command = process.argv[2];
// process.argv[3] will be the parameter args for commands
const cmdParamString = process.argv[3];
const cmdArgs = !!cmdParamString && cmdParamString.length > 2 ? cmdParamString.split(',') : [];
const commandExecutionArgs = { _default: null, _extra_args: {} };
if (cmdParamString && cmdParamString.indexOf('=') > -1) {
    cmdArgs.forEach((arg) => {
        const argData = arg.split('=');
        commandExecutionArgs[argData[0].replace('--', '')] = argData[1];
        if (!commandExecutionArgs._default) {
            commandExecutionArgs._default = argData[1];
        }
    });
}
else if (!cmdParamString || !cmdArgs.length) {
    commandExecutionArgs._default = null;
}
else {
    commandExecutionArgs._default = cmdParamString;
}
if (process.argv.length > 4) {
    for (let i = 4; i <= process.argv.length - 1; i++) {
        const parameter = process.argv[i].replace('--', '').replace('-', '_');
        const valuePair = parameter.split('=');
        commandExecutionArgs._extra_args[valuePair[0]] = valuePair.length > 1 ? valuePair[1] : true;
    }
}
const executionDir = process.cwd();
const packageRootDir = index_1.UtilsService.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const moduleCfgFile = `${moduleCfgDir}/_cfg_path`;
function getConfig(configPath, cfgPathFile = null) {
    if (cfgPathFile === null) {
        cfgPathFile = configPath;
        if (cfgPathFile) {
            const rwsConfigVar = index_1.UtilsService.getRWSVar(cfgPathFile);
            if (rwsConfigVar) {
                configPath = rwsConfigVar;
            }
        }
    }
    else {
        index_1.UtilsService.setRWSVar(cfgPathFile, configPath);
    }
    const pathWorkspaceToCwd = path.relative(__dirname, process.cwd());
    console.log(__dirname);
    const frameworkConfigFactory = (__webpack_require__(/*! ./cfg */ "./src/cfg.js")["default"]);
    return frameworkConfigFactory();
}
function copyFileSync(source, destination) {
    try {
        const content = fs.readFileSync(source);
        fs.writeFileSync(destination, content);
        console.log(`File copied from ${source} to ${destination}`);
    }
    catch (error) {
        console.error('Error occurred while copying file:', error);
    }
}
const main = async () => {
    const cfgPathFile = `_cfg_path`;
    const tsFile = path.resolve(__dirname, '..', 'src') + '/rws.ts';
    let APP_CFG = null;
    if (command === 'init') {
        const configPath = commandExecutionArgs.config || commandExecutionArgs._default || 'config/config';
        const cfgData = getConfig(configPath, cfgPathFile);
        APP_CFG = cfgData;
    }
    let savedHash = null;
    const consoleClientHashFile = `${moduleCfgDir}/_cli_hash`;
    if (fs.existsSync(`${moduleCfgDir}/_cli_hash`)) {
        savedHash = fs.readFileSync(consoleClientHashFile, 'utf-8');
    }
    if (!APP_CFG) {
        APP_CFG = getConfig('config/config', cfgPathFile);
    }
    if (!APP_CFG) {
        throw new Error(`No config for CLI. Try to initialize with "yarn rws init config=path/to/config.ts" (config path from ${process.cwd()}/src)`);
    }
    const APP = (0, index_1.getAppConfig)(APP_CFG);
    const commands = [...index_1.RWSAppCommands, ...APP.get('commands')];
    const theCommand = commands.find((cmd) => cmd.getName() == command);
    commandExecutionArgs._rws_config = APP_CFG;
    const cmdFiles = index_1.MD5Service.batchGenerateCommandFileMD5(moduleCfgDir);
    const currentSumHashes = (await index_1.MD5Service.generateCliHashes([tsFile, ...cmdFiles])).join('/');
    if (!savedHash || currentSumHashes !== savedHash) {
        fs.writeFileSync(consoleClientHashFile, currentSumHashes);
    }
    if (theCommand) {
        await theCommand.execute(commandExecutionArgs);
        return;
    }
    if (!fs.existsSync(`${moduleCfgDir}/${cfgPathFile}`)) {
        throw new Error('No config path generated for CLI. Try to initialize with "npx rws init config=path/to/config.ts"');
    }
    error(`Unknown command: ${command}.`);
    return;
};
main().then(() => {
    process.exit(0);
});

})();

/******/ })()
;
//# sourceMappingURL=cfg.js.map