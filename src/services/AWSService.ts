import TheService from "./_service";

import AppConfigService from "./AppConfigService";
import ConsoleService from "./ConsoleService";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { IAMClient, SimulatePrincipalPolicyCommand } from "@aws-sdk/client-iam";
import { EFSClient } from "@aws-sdk/client-efs";
import { EC2Client, CreateRouteCommand, DescribeVpcsCommand, DescribeRouteTablesCommand, DescribeSubnetsCommand, DescribeSecurityGroupsCommand, DescribeVpcEndpointsCommand, CreateVpcEndpointCommand } from "@aws-sdk/client-ec2";
import {
    LambdaClient,
  } from "@aws-sdk/client-lambda";


const { log, warn, error, color, AWSProgressBar, rwsLog } = ConsoleService;


class AWSService extends TheService {
    private region: string;

    private s3: S3Client;
    private efs: EFSClient;
    private lambda: LambdaClient;
    private ec2: EC2Client;
    private iam: IAMClient;

    constructor() {
        super();        
    }

    _initApis(): void {
        if(!this.region){
            this.region = AppConfigService().get('aws_lambda_region');
        }

        const credentials = {
            accessKeyId: AppConfigService().get('aws_access_key'),
            secretAccessKey: AppConfigService().get('aws_secret_key'),
        };

        if(!this.s3){
            this.s3 = new S3Client({
                region: this.region,
                credentials
            });
        }

        if(!this.iam){
            this.iam = new IAMClient({
                region: this.region,
                credentials
            });
        }

        if(!this.efs){
            this.efs = new EFSClient({
                region: this.region,
                credentials
            });
        }

        if(!this.ec2){
            this.ec2 = new EC2Client({
                region: this.region,
                credentials
            });
        }

        if(!this.lambda){
            this.lambda = new LambdaClient({
                region: this.region,
                credentials
            });
        }
    }
    

    async findDefaultSubnetForVPC(): Promise<[string, string]> 
    {
        try {
            const command = new DescribeVpcsCommand({ Filters: [{ Name: 'isDefault', Values: ['true'] }] });
            const response = await this.getEC2().send(command);

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
        const command = new DescribeSubnetsCommand({
            Filters: [{
                Name: 'vpc-id',
                Values: [vpcId]
            }]
        });
    
        const result = await this.getEC2().send(command);
    
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId as string)[0];
        } else {
            return null;
        }
    }

    async listSecurityGroups(): Promise<string[]> {
        try {
            const command = new DescribeSecurityGroupsCommand({});
            const result = await this.getEC2().send(command);
    
            const securityGroups = result.SecurityGroups || [];
            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
    
            return securityGroupIds;
        } catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }         

    async checkForRolePermissions(roleARN: string, permissions: string[]): Promise<{ OK: boolean, policies: string[] }>
    {            
        const {OK, policies} = await this.firePermissionCheck(roleARN, permissions);

        return {
            OK,
            policies
        };
    }

    private async firePermissionCheck(roleARN: string, permissions: string[]) {
        const params = {
            PolicySourceArn: roleARN,
            ActionNames: permissions
        };

        const command = new SimulatePrincipalPolicyCommand(params);
        const policies: string[] = [];
        let allowed = true;

        try {
            const data = await this.getIAM().send(command);
            for (let result of data.EvaluationResults!) {
                if(result.EvalDecision !== 'allowed'){
                    allowed = false;
                    policies.push(result.EvalActionName!);
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
        const command = new DescribeRouteTablesCommand({
            Filters: [
                {
                    Name: "vpc-id",
                    Values: [vpcId]
                }
            ]
        });
    
        const response = await this.getEC2().send(command);
    
        return response.RouteTables?.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }

    async createVPCEndpointIfNotExist(vpcId: string): Promise<string> {
        const endpointName = "RWS-S3-GATE";
        const serviceName = `com.amazonaws.${this.region}.s3`;        
        
        // Describe VPC Endpoints
        const describeCommand = new DescribeVpcEndpointsCommand({
            Filters: [
                {
                    Name: "tag:Name",
                    Values: [endpointName]
                }
            ]
        });
        const existingEndpoints = await this.getEC2().send(describeCommand);
        const defaultRouteTable = await this.getDefaultRouteTable(vpcId);
    
        // Check if the endpoint already exists
        const endpointExists = existingEndpoints.VpcEndpoints && existingEndpoints.VpcEndpoints.length > 0;
        
        if (!endpointExists) {
            // Create VPC Endpoint for S3
            const createEndpointCommand = new CreateVpcEndpointCommand({
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
            });
            const endpointResponse = await this.getEC2().send(createEndpointCommand);
            
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
                const command = new DescribeVpcEndpointsCommand({
                    VpcEndpointIds: [vpcEndpointId]
                });
                const vpcEndpointDescription = await this.getEC2().send(command);

                rwsLog('Creating VPC Endpoint route')
                // Add a route to the route table
                 // Add a route to the route table
                const createRouteCommand = new CreateRouteCommand({
                    RouteTableId: routeTable.RouteTableId,
                    DestinationCidrBlock: '0.0.0.0/0',
                    VpcEndpointId: vpcEndpointDescription.VpcEndpoints[0].VpcEndpointId
                });
                await this.getEC2().send(createRouteCommand);

                log(`Added route to VPC Endpoint ${vpcEndpointId} in Route Table ${routeTable.RouteTableId}`);
            } else {
                log(`Route to VPC Endpoint ${vpcEndpointId} already exists in Route Table ${routeTable.RouteTableId}`);
            }
            
        } catch (error) {
            console.error('Error ensuring route to VPC Endpoint:', error);
        }
    }

    getS3(): S3Client
    {
        this._initApis();

        return this.s3;
    }

    getEC2(): EC2Client
    {
        this._initApis();

        return this.ec2;
    }

    getEFS(): EFSClient
    {   
        this._initApis();

        return this.efs;
    }

    getLambda(): LambdaClient
    {   
        this._initApis();

        return this.lambda;
    }

    getRegion(): string 
    {   
        this._initApis();

        return this.region;
    }

    getIAM(): IAMClient
    {   
        this._initApis();

        return this.iam;
    }    
}

export default AWSService.getSingleton();