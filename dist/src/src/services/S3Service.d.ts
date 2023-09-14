import TheService from "./_service";
import { PutObjectCommandInput, PutObjectCommandOutput, HeadObjectCommandInput, DeleteObjectCommandInput } from "@aws-sdk/client-s3";
declare class S3Service extends TheService {
    constructor();
    upload(params: PutObjectCommandInput, override?: boolean): Promise<PutObjectCommandOutput>;
    delete(params: DeleteObjectCommandInput): Promise<void>;
    objectExists(params: HeadObjectCommandInput): Promise<boolean>;
    deleteObject(params: DeleteObjectCommandInput): Promise<void>;
    bucketExists(bucketName: string): Promise<string>;
}
declare const _default: S3Service;
export default _default;
