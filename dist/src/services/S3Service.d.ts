import TheService from "./_service";
declare class S3Service extends TheService {
    constructor();
    upload(params: AWS.S3.Types.PutObjectRequest, override?: boolean, region?: string): Promise<AWS.S3.ManagedUpload.SendData | null>;
    downloadObject(params: AWS.S3.Types.GetObjectRequest, region?: string): Promise<AWS.S3.GetObjectOutput | null>;
    downloadToString(s3key: string, bucket: string, region?: string): Promise<string>;
    delete(params: AWS.S3.Types.DeleteObjectRequest, region?: string): Promise<void>;
    objectExists(params: AWS.S3.Types.HeadObjectRequest, region?: string): Promise<boolean>;
    deleteObject(params: AWS.S3.Types.DeleteObjectRequest, region?: string): Promise<void>;
    bucketExists(bucketName: string, region?: string): Promise<string>;
}
declare const _default: S3Service;
export default _default;
