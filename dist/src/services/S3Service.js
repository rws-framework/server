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
    async upload(params, override = true) {
        if (override) {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key });
            if (exists) {
                log(`${color().green('[RWS Lambda Service]')} ${color().red('Deleting existing S3 object:')} ${params.Key}`);
                await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
            }
        }
        return AWSService_1.default.getS3().upload(params).promise();
    }
    async delete(params) {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
        return;
    }
    async objectExists(params) {
        try {
            await AWSService_1.default.getS3().headObject(params).promise();
            return true;
        }
        catch (error) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }
    async deleteObject(params) {
        await AWSService_1.default.getS3().deleteObject(params).promise();
    }
    async bucketExists(bucketName) {
        try {
            await AWSService_1.default.getS3().headBucket({ Bucket: bucketName }).promise();
            return bucketName;
        }
        catch (err) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };
                await AWSService_1.default.getS3().createBucket(params).promise();
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