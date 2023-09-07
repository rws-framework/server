import TheService from "./_service";
declare class S3Service extends TheService {
    constructor();
    upload(params: AWS.S3.Types.PutObjectRequest, override?: boolean): Promise<AWS.S3.ManagedUpload.SendData>;
    objectExists(params: AWS.S3.Types.HeadObjectRequest): Promise<boolean>;
    deleteObject(params: AWS.S3.Types.DeleteObjectRequest): Promise<void>;
    bucketExists(bucketName: string): Promise<string>;
}
declare const _default: S3Service;
export default _default;
