import TheService from "./_service";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import ConsoleService from './ConsoleService';
import { PutObjectCommand, HeadObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, PutObjectCommandInput, PutObjectCommandOutput, HeadObjectCommandInput, DeleteObjectCommandInput, HeadBucketCommandInput, CreateBucketCommandInput } from "@aws-sdk/client-s3";


const { log, warn, error, color, AWSProgressBar } = ConsoleService;


class S3Service extends TheService {
    constructor(){
        super();
    }

    async upload(params: PutObjectCommandInput, override = true): Promise<PutObjectCommandOutput>
    {
        if (override) {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key });
            if (exists) {
                log(`${color().green('[RWS Lambda Service]')} ${color().red('Deleting existing S3 object:')} ${params.Key}`);
                await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
            }
        }

        const command = new PutObjectCommand(params);
        return AWSService.getS3().send(command);
    }

    async delete(params: DeleteObjectCommandInput): Promise<void>
    {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
    }

    async objectExists(params: HeadObjectCommandInput): Promise<boolean> {
        try {
            const command = new HeadObjectCommand(params);
            await AWSService.getS3().send(command);
            return true;
        } catch (error: Error | any) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    async deleteObject(params: DeleteObjectCommandInput): Promise<void> {
        const command = new DeleteObjectCommand(params);
        await AWSService.getS3().send(command);
    }

    async bucketExists(bucketName: string): Promise<string> { 
        try {            
            const command = new HeadBucketCommand({ Bucket: bucketName });
            await AWSService.getS3().send(command);
            return bucketName;
        } catch (err: Error | any) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params: CreateBucketCommandInput = {
                    Bucket: bucketName,
                };                

                const createBucketCommand = new CreateBucketCommand(params);
                await AWSService.getS3().send(createBucketCommand);
                log(`${color().green(`[RWS Lambda Service]`)} s3 bucket ${bucketName} created.`);
                return bucketName;
            } else {
                // Handle other errors
                error(`Error checking bucket ${bucketName}:`, err);
            }
        }
    }
}

export default S3Service.getSingleton();

