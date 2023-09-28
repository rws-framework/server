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
    _initApis(): void;
    checkForRolePermissions(roleARN: string, permissions: string[]): Promise<{
        OK: boolean;
        policies: string[];
    }>;
    private firePermissionCheck;
    getS3(): AWS.S3;
    getEC2(): AWS.EC2;
    getEFS(): AWS.EFS;
    getLambda(): AWS.Lambda;
    getRegion(): string;
    getIAM(): AWS.IAM;
    getAPIGateway(): AWS.APIGateway;
    getCloudWatch(): AWS.CloudWatchLogs;
}
declare const _default: AWSService;
export default _default;
