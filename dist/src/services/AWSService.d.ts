import TheService from "./_service";
import AWS from 'aws-sdk';
declare class AWSService extends TheService {
    private region;
    private s3;
    private efs;
    private lambda;
    private ec2;
    private iam;
    private apiGateway;
    private cloudWatch;
    constructor();
    _initApis(region?: string): void;
    checkForRolePermissions(roleARN: string, permissions: string[]): Promise<{
        OK: boolean;
        policies: string[];
    }>;
    private firePermissionCheck;
    getS3(region?: string): AWS.S3;
    getEC2(region?: string): AWS.EC2;
    getEFS(region?: string): AWS.EFS;
    getLambda(region?: string): AWS.Lambda;
    getRegion(region?: string): string;
    getIAM(region?: string): AWS.IAM;
    getAPIGateway(region?: string): AWS.APIGateway;
    getCloudWatch(region?: string): AWS.CloudWatchLogs;
}
declare const _default: AWSService;
export default _default;
