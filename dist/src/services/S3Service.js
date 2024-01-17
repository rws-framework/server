"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AWSService_1 = __importDefault(require("./AWSService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
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
    async download(params, region = null) {
        return AWSService_1.default.getS3(region).getObject(params).promise();
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
exports.default = S3Service.getSingleton();
//# sourceMappingURL=S3Service.js.map