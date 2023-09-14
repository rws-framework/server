import TheService from "./_service";
declare class EFSService extends TheService {
    private region;
    private efs;
    constructor();
    uploadToEFS(baseFunctionName: string, efsId: string, modulesS3Key: string, s3Bucket: string, vpcId: string, subnetId: string): Promise<any>;
    processEFSLoader(vpcId: string, subnetId: string): Promise<string>;
    getOrCreateEFS(functionName: string, vpcId: string, subnetId: string): Promise<[string, string, boolean]>;
    deleteEFS(fileSystemId: string, subnetId: string): Promise<void>;
    waitForEFS(fileSystemId: string): Promise<void>;
    waitForFileSystemMount(fileSystemId: string): Promise<boolean>;
    waitForAccessPoint(accessPointId: string): Promise<void>;
    getAccessPoints(fileSystemId: string): Promise<import("@aws-sdk/client-efs").AccessPointDescription[]>;
    createMountTarget(fileSystemId: string, subnetId: string): Promise<string>;
    createAccessPoint(fileSystemId: string): Promise<[string, string]>;
    generateClientToken(): string;
}
declare const _default: EFSService;
export default _default;
