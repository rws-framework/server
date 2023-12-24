"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
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
exports.default = AWSService.getSingleton();
//# sourceMappingURL=AWSService.js.map