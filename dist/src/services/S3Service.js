"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AWSService_1 = __importDefault(require("./AWSService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const client_s3_1 = require("@aws-sdk/client-s3");
const { log, warn, error, color, AWSProgressBar } = ConsoleService_1.default;
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
        const command = new client_s3_1.PutObjectCommand(params);
        return AWSService_1.default.getS3().send(command);
    }
    async delete(params) {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
    }
    async objectExists(params) {
        try {
            const command = new client_s3_1.HeadObjectCommand(params);
            await AWSService_1.default.getS3().send(command);
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
        const command = new client_s3_1.DeleteObjectCommand(params);
        await AWSService_1.default.getS3().send(command);
    }
    async bucketExists(bucketName) {
        try {
            const command = new client_s3_1.HeadBucketCommand({ Bucket: bucketName });
            await AWSService_1.default.getS3().send(command);
            return bucketName;
        }
        catch (err) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };
                const createBucketCommand = new client_s3_1.CreateBucketCommand(params);
                await AWSService_1.default.getS3().send(createBucketCommand);
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