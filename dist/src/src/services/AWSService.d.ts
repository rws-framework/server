import TheService from "./_service";
import { S3Client } from "@aws-sdk/client-s3";
import { IAMClient } from "@aws-sdk/client-iam";
import { EFSClient } from "@aws-sdk/client-efs";
import { EC2Client } from "@aws-sdk/client-ec2";
import { LambdaClient } from "@aws-sdk/client-lambda";
declare class AWSService extends TheService {
    private region;
    private s3;
    private efs;
    private lambda;
    private ec2;
    private iam;
    constructor();
    _initApis(): void;
    findDefaultSubnetForVPC(): Promise<[string, string]>;
    private getSubnetIdForVpc;
    listSecurityGroups(): Promise<string[]>;
    checkForRolePermissions(roleARN: string, permissions: string[]): Promise<{
        OK: boolean;
        policies: string[];
    }>;
    private firePermissionCheck;
    private getDefaultRouteTable;
    createVPCEndpointIfNotExist(vpcId: string): Promise<string>;
    ensureRouteToVPCEndpoint(vpcId: string, vpcEndpointId: string): Promise<void>;
    getS3(): S3Client;
    getEC2(): EC2Client;
    getEFS(): EFSClient;
    getLambda(): LambdaClient;
    getRegion(): string;
    getIAM(): IAMClient;
}
declare const _default: AWSService;
export default _default;
