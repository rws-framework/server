import TheService from "./_service";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import ConsoleService from './ConsoleService';

const { log, warn, error, color, AWSProgressBar } = ConsoleService;

class S3Service extends TheService {
    constructor(){
        super();
    }

    async upload(params: AWS.S3.Types.PutObjectRequest, override = true): Promise<AWS.S3.ManagedUpload.SendData>
    {
        if (override) {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key });
            if (exists) {

                log(`${color().green('[RWS Lambda Service]')} ${color().red('Deleting existing S3 object:')} ${params.Key}`);
                await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
            }
        }

        return AWSService.getS3().upload(params).promise()
    }

    async delete(params: AWS.S3.Types.DeleteObjectRequest): Promise<void>
    {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });

        return;
    }

    async objectExists(params: AWS.S3.Types.HeadObjectRequest): Promise<boolean> {
        try {
            await AWSService.getS3().headObject(params).promise();
            return true;
        } catch (error: Error | any) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    async deleteObject(params: AWS.S3.Types.DeleteObjectRequest): Promise<void> {
        await AWSService.getS3().deleteObject(params).promise();
    }

    async bucketExists(bucketName: string): Promise<string> { 
        try {            
            await AWSService.getS3().headBucket({ Bucket: bucketName }).promise();

            return bucketName;
        } catch (err: Error | any) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };                

                await AWSService.getS3().createBucket(params).promise();
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