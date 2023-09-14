import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";
import LambdaService from "./LambdaService";

import path from 'path';
import fs from 'fs';
import AWS from 'aws-sdk';
import archiver from 'archiver';
import ZipService from "./ZipService";
import EFSService from "./EFSService";


const { log, warn, error, color, AWSProgressBar, rwsLog } = ConsoleService;


class AWSService extends TheService {
    private region: string;

    private s3: AWS.S3;
    private efs: AWS.EFS;
    private lambda: AWS.Lambda;
    private ec2: AWS.EC2;
    private iam: AWS.IAM;

    constructor() {
        super();        
    }

    _initApis(): void
    {

        if(!this.region){
            this.region = AppConfigService().get('aws_lambda_region');
        }

        if(!this.s3){
            this.s3 = new AWS.S3({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.iam){
            this.iam = new AWS.IAM({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.efs){
            this.efs = new AWS.EFS({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        if(!this.ec2){
            this.ec2 = new AWS.EC2({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }

        
        if(!this.lambda){
            this.lambda = new AWS.Lambda({
                region: this.region,
                credentials: {
                    accessKeyId: AppConfigService().get('aws_access_key'),
                    secretAccessKey: AppConfigService().get('aws_secret_key'),
                }
            });
        }
    }        

    async findDefaultSubnetForVPC(): Promise<[string, string]> 
    {
        try {
            const response = await this.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();

            if (response.Vpcs && response.Vpcs.length > 0) {                
                return [await this.getSubnetIdForVpc(response.Vpcs[0].VpcId), response.Vpcs[0].VpcId];
            } else {
                console.log('No default VPC found.');
            }
        } catch (error) {
            console.error('Error fetching default VPC:', error);
        }
    }

    private async getSubnetIdForVpc(vpcId: string): Promise<string> {
        const params = {
            Filters: [{
                Name: 'vpc-id',
                Values: [vpcId]
            }]
        };

        const result = await this.getEC2().describeSubnets(params).promise();

        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId as string)[0];
        } else {
            return null;
        }
    }

    async listSecurityGroups(): Promise<string[]> 
    {
        try {
            const result = await this.getEC2().describeSecurityGroups().promise();

            const securityGroups = result.SecurityGroups || [];

            const securityGroupIds = securityGroups.map(sg => sg.GroupId);            

            return securityGroupIds;
        } catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }

    async uploadToEFS(baseFunctionName: string, efsId: string, modulesS3Key: string, s3Bucket:string, vpcId: string, subnetId: string): Promise<any>
    {
        const efsLoaderFunctionName = await this.processEFSLoader(vpcId, subnetId);

        const params = {
            functionName: `RWS-${baseFunctionName}`,
            efsId,
            modulesS3Key,
            s3Bucket
        };
    
        try {
            log(`${color().green(`[RWS Lambda Service]`)} invoking EFS Loader as "${efsLoaderFunctionName}" lambda function for "${baseFunctionName}" with ${modulesS3Key} in ${s3Bucket} bucket.`);

            const response = await LambdaService.invokeLambda(efsLoaderFunctionName, params);
            rwsLog('RWS Lambda Service', color().yellowBright(`"${efsLoaderFunctionName}" lambda function response:`));
            log(response);            
            return;// JSON.parse(response.Response.Payload as string);
        } catch (error) {
            // await EFSService.deleteEFS(efsId);
            console.error('Error invoking Lambda:', error);
            throw error;
        }
    }

    async processEFSLoader(vpcId: string, subnetId: string): Promise<string>
    {
        const executionDir = process.cwd();

        const filePath:string = module.id;        
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        const moduleDir = path.resolve(__dirname, '..', '..').replace('dist', '');
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;

        const _UNZIP_FUNCTION_NAME: string = 'RWS-efs-loader';

        log(`${color().green(`[RWS Clud FS Service]`)} processing EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`);


        if(!(await LambdaService.functionExists(_UNZIP_FUNCTION_NAME))){
            log(`${color().green(`[RWS Clud FS Service]`)} creating EFS Loader as "${_UNZIP_FUNCTION_NAME}" lambda function.`, moduleDir);
            const zipPath = await LambdaService.archiveLambda(`${moduleDir}/lambda-functions/efs-loader`, moduleCfgDir);

            await LambdaService.deployLambda(_UNZIP_FUNCTION_NAME, zipPath, vpcId, subnetId, true);
        }

        return _UNZIP_FUNCTION_NAME;
    }    

    async checkForRolePermissions(roleARN: string, permissions: string[]): Promise<{ OK: boolean, policies: string[] }>
    {            
        const {OK, policies} = await this.firePermissionCheck(roleARN, permissions);

        return {
            OK,
            policies
        };
    }

    private async firePermissionCheck(roleARN: string, permissions: string[])
    {
        const params = {
            PolicySourceArn: roleARN, // Replace with your IAM role ARN
            ActionNames: permissions
        };

        const policies: string[] = [];
        let allowed = true;

        try {
            const data = await this.getIAM().simulatePrincipalPolicy(params).promise();
            for (let result of data.EvaluationResults) {
                if(result.EvalDecision !== 'allowed'){
                    allowed = false;
                    policies.push(result.EvalActionName);
                }
            }        
        } catch (err) {
            error('Permission check error:');
            log(err);
            allowed = false;
        }

        return {
            OK: allowed,
            policies: policies
        };
    }

    private async getDefaultRouteTable(vpcId: string): Promise<AWS.EC2.RouteTable>
    {
        const routeTablesResponse = await this.ec2.describeRouteTables({
            Filters: [
                {
                    Name: "vpc-id",
                    Values: [vpcId]  // Provide the VPC ID here, not the VPC Endpoint ID
                }
            ]
        }).promise();        

        return routeTablesResponse.RouteTables?.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }

    async createVPCEndpointIfNotExist(vpcId: string): Promise<string> {
        const endpointName = "RWS-S3-GATE";
        const serviceName = `com.amazonaws.${this.region}.s3`;        
    
        // Describe VPC Endpoints
        const existingEndpoints = await this.getEC2().describeVpcEndpoints({
            Filters: [
                {
                    Name: "tag:Name",
                    Values: [endpointName]
                }
            ]
        }).promise();

        const defaultRouteTable = await this.getDefaultRouteTable(vpcId);

        // Check if the endpoint already exists
        const endpointExists = existingEndpoints.VpcEndpoints && existingEndpoints.VpcEndpoints.length > 0;
    
        if (!endpointExists) {
            // Create VPC Endpoint for S3
            
            const endpointResponse = await this.getEC2().createVpcEndpoint({
                VpcId: vpcId,
                ServiceName: serviceName,
                VpcEndpointType: "Gateway",
                RouteTableIds: [defaultRouteTable.RouteTableId], // Add your route table IDs here
                TagSpecifications: [
                    {
                        ResourceType: "vpc-endpoint",
                        Tags: [
                            {
                                Key: "Name",
                                Value: endpointName
                            }
                        ]
                    }
                ]
            }).promise();
            
    
            if (endpointResponse.VpcEndpoint) {
                log(`VPC Endpoint "${endpointName}" created with ID: ${endpointResponse.VpcEndpoint.VpcEndpointId}`);
                return endpointResponse.VpcEndpoint.VpcEndpointId;
            } else {
                error("Failed to create VPC Endpoint");
                throw new Error("Failed to create VPC Endpoint");
            }
        } else {
            log(`VPC Endpoint "${endpointName}" already exists.`);
            return existingEndpoints.VpcEndpoints[0].VpcEndpointId;

        }
    }

    async ensureRouteToVPCEndpoint(vpcId: string, vpcEndpointId: string): Promise<void> {
    
        try {
            const routeTable = await this.getDefaultRouteTable(vpcId);

            const routes = routeTable.Routes || [];
            const hasS3EndpointRoute = routes.some((route: AWS.EC2.Route) => route.GatewayId === vpcEndpointId);    

            if (!hasS3EndpointRoute) {
                // Get the prefix list associated with the S3 VPC endpoint
                const vpcEndpointDescription  = (await this.ec2.describeVpcEndpoints({
                    VpcEndpointIds: [vpcEndpointId]
                }).promise()).VpcEndpoints;

                rwsLog('Creating VPC Endpoint route')
                // Add a route to the route table
                await this.ec2.createRoute({
                    RouteTableId: routeTable.RouteTableId,
                    DestinationCidrBlock: '0.0.0.0/0',
                    VpcEndpointId: vpcEndpointDescription[0].VpcEndpointId
                }).promise();

                log(`Added route to VPC Endpoint ${vpcEndpointId} in Route Table ${routeTable.RouteTableId}`);
            } else {
                log(`Route to VPC Endpoint ${vpcEndpointId} already exists in Route Table ${routeTable.RouteTableId}`);
            }
            
        } catch (error) {
            console.error('Error ensuring route to VPC Endpoint:', error);
        }
    }

    getS3(): AWS.S3 
    {
        this._initApis();

        return this.s3;
    }

    getEC2(): AWS.EC2 
    {
        this._initApis();

        return this.ec2;
    }

    getEFS(): AWS.EFS 
    {   
        this._initApis();

        return this.efs;
    }

    getLambda(): AWS.Lambda
    {   
        this._initApis();

        return this.lambda;
    }

    getRegion(): string 
    {   
        this._initApis();

        return this.region;
    }

    getIAM(): AWS.IAM 
    {   
        this._initApis();

        return this.iam;
    }    
}

export default AWSService.getSingleton();