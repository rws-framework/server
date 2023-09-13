import TheService from "./_service";
import AWS from 'aws-sdk';
declare class AWSService extends TheService {
    private region;
    private s3;
    private efs;
    private lambda;
    private ec2;
    constructor();
    _initApis(): void;
    findDefaultVPC(): Promise<string>;
    getSubnetIdForVpc(vpcId: string): Promise<string>;
    listSecurityGroups(): Promise<string[]>;
    uploadToEFS(baseFunctionName: string, efsId: string, modulesS3Key: string, s3Bucket: string, subnetId: string): Promise<any>;
    processEFSLoader(subnetId: string): Promise<string>;
    getS3(): AWS.S3;
    getEC2(): AWS.EC2;
    getEFS(): AWS.EFS;
    getLambda(): AWS.Lambda;
    getRegion(): string;
}
declare const _default: AWSService;
export default _default;
