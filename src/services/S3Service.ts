import TheService from "./_service";
import AWSService from "./AWSService";
import ZipService from "./ZipService";
import ConsoleService from './ConsoleService';

const { log, warn, error, color } = ConsoleService;

class S3Service extends TheService {
    constructor(){
        super();
    }

    async upload(params: AWS.S3.Types.PutObjectRequest, override: boolean = true, region: string = null): Promise<AWS.S3.ManagedUpload.SendData | null>
    {
     
        if (override) {
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key }, region);
            if (exists) {

                log(`${color().green('[RWS Lambda Service]')} ${color().red('Deleting existing S3 object:')} ${params.Key}`);
                await this.deleteObject({ Bucket: params.Bucket, Key: params.Key });
            }
        }else{
            const exists = await this.objectExists({ Bucket: params.Bucket, Key: params.Key }, region);
            if (exists) {
                return null;
            }
        }
        
        return AWSService.getS3(region).upload(params).promise()
    }

    async download(params: AWS.S3.Types.GetObjectRequest, region: string = null): Promise<AWS.S3.GetObjectOutput | null>
    {     
        return AWSService.getS3(region).getObject(params).promise();
    }

    async delete(params: AWS.S3.Types.DeleteObjectRequest, region: string = null): Promise<void>
    {
        await this.deleteObject({ Bucket: params.Bucket, Key: params.Key }, region);

        return;
    }

    async objectExists(params: AWS.S3.Types.HeadObjectRequest, region: string = null): Promise<boolean> {
        try {
            await AWSService.getS3(region).headObject(params).promise();
            return true;
        } catch (error: Error | any) {
            if (error.code === 'NotFound') {
                return false;
            }
            throw error;
        }
    }

    async deleteObject(params: AWS.S3.Types.DeleteObjectRequest, region: string = null): Promise<void> {
        await AWSService.getS3(region).deleteObject(params).promise();
    }

    async bucketExists(bucketName: string, region: string = null): Promise<string> { 
        try {            
            await AWSService.getS3(region).headBucket({ Bucket: bucketName }).promise();

            return bucketName;
        } catch (err: Error | any) {
            if (err.code === 'NotFound') {
                // Create bucket if it doesn't exist
                const params = {
                    Bucket: bucketName,
                };                

                await AWSService.getS3(region).createBucket(params).promise();
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