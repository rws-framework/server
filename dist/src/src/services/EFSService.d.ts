import TheService from "./_service";
import AWS from 'aws-sdk';
declare class EFSService extends TheService {
    private region;
    private s3;
    private efs;
    private lambda;
    private ec2;
    constructor();
    getOrCreateEFS(functionName: string, vpcId: string, subnetId: string): Promise<[string, string, boolean]>;
    deleteEFS(fileSystemId: string): Promise<void>;
    waitForEFS(fileSystemId: string): Promise<void>;
    sleep(ms: number): Promise<void>;
    waitForFileSystemMount(fileSystemId: string): Promise<boolean>;
    waitForAccessPoint2(fileSystemId: string, accessPointId: string): Promise<void>;
    waitForAccessPoint(accessPointId: string): Promise<void>;
    generateClientToken(): string;
    getAccessPoints(fileSystemId: string): Promise<AWS.EFS.AccessPointDescriptions | null>;
    createAccessPoint(fileSystemId: string): Promise<[string, string]>;
    createMountTarget(fileSystemId: string, subnetId: string): Promise<string>;
    uploadToEFS(baseFunctionName: string, efsId: string, modulesS3Key: string, s3Bucket: string, vpcId: string, subnetId: string): Promise<any>;
    processEFSLoader(vpcId: string, subnetId: string): Promise<string>;
    deleteDir(): Promise<void>;
}
declare const _default: EFSService;
export default _default;
