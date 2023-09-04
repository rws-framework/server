import TheService from "./_service";
declare class LambdaService extends TheService {
    private region;
    private lambda;
    private s3;
    private efs;
    constructor();
    archiveLambda(lambdaDirPath: string, moduleCfgDir: string): Promise<[string, string]>;
    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string];
    createArchive(outputPath: string, sourcePath: string, onlyNodeModules?: boolean): Promise<string>;
    createLambdaLayer(zipPath: string, functionName: string): Promise<string>;
    deployLambda(functionName: string, appPaths: string[], subnetId?: string): Promise<any>;
    private functionExists;
    S3BucketExists(bucketName: string): Promise<string>;
    waitForLambda(functionName: string, timeoutMs?: number, intervalMs?: number): Promise<void>;
    createEFS(functionName: string, subnetId: string): Promise<string>;
    createMountTarget(fileSystemId: string, subnetId: string): Promise<void>;
    findDefaultVPC(): Promise<string>;
    getSubnetIdForVpc(vpcId: string): Promise<string>;
    listSecurityGroups(): Promise<string[]>;
}
declare const _default: LambdaService;
export default _default;
