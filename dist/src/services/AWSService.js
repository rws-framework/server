"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const client_s3_1 = require("@aws-sdk/client-s3");
const client_iam_1 = require("@aws-sdk/client-iam");
const client_efs_1 = require("@aws-sdk/client-efs");
const client_ec2_1 = require("@aws-sdk/client-ec2");
const client_lambda_1 = require("@aws-sdk/client-lambda");
const { log, warn, error, color, AWSProgressBar, rwsLog } = ConsoleService_1.default;
class AWSService extends _service_1.default {
    constructor() {
        super();
    }
    _initApis() {
        if (!this.region) {
            this.region = (0, AppConfigService_1.default)().get('aws_lambda_region');
        }
        const credentials = {
            accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
            secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
        };
        if (!this.s3) {
            this.s3 = new client_s3_1.S3Client({
                region: this.region,
                credentials
            });
        }
        if (!this.iam) {
            this.iam = new client_iam_1.IAMClient({
                region: this.region,
                credentials
            });
        }
        if (!this.efs) {
            this.efs = new client_efs_1.EFSClient({
                region: this.region,
                credentials
            });
        }
        if (!this.ec2) {
            this.ec2 = new client_ec2_1.EC2Client({
                region: this.region,
                credentials
            });
        }
        if (!this.lambda) {
            this.lambda = new client_lambda_1.LambdaClient({
                region: this.region,
                credentials
            });
        }
    }
    async findDefaultSubnetForVPC() {
        try {
            const command = new client_ec2_1.DescribeVpcsCommand({ Filters: [{ Name: 'isDefault', Values: ['true'] }] });
            const response = await this.getEC2().send(command);
            if (response.Vpcs && response.Vpcs.length > 0) {
                return [await this.getSubnetIdForVpc(response.Vpcs[0].VpcId), response.Vpcs[0].VpcId];
            }
            else {
                console.log('No default VPC found.');
            }
        }
        catch (error) {
            console.error('Error fetching default VPC:', error);
        }
    }
    async getSubnetIdForVpc(vpcId) {
        const command = new client_ec2_1.DescribeSubnetsCommand({
            Filters: [{
                    Name: 'vpc-id',
                    Values: [vpcId]
                }]
        });
        const result = await this.getEC2().send(command);
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId)[0];
        }
        else {
            return null;
        }
    }
    async listSecurityGroups() {
        try {
            const command = new client_ec2_1.DescribeSecurityGroupsCommand({});
            const result = await this.getEC2().send(command);
            const securityGroups = result.SecurityGroups || [];
            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
            return securityGroupIds;
        }
        catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }
    async checkForRolePermissions(roleARN, permissions) {
        const { OK, policies } = await this.firePermissionCheck(roleARN, permissions);
        return {
            OK,
            policies
        };
    }
    async firePermissionCheck(roleARN, permissions) {
        const params = {
            PolicySourceArn: roleARN,
            ActionNames: permissions
        };
        const command = new client_iam_1.SimulatePrincipalPolicyCommand(params);
        const policies = [];
        let allowed = true;
        try {
            const data = await this.getIAM().send(command);
            for (let result of data.EvaluationResults) {
                if (result.EvalDecision !== 'allowed') {
                    allowed = false;
                    policies.push(result.EvalActionName);
                }
            }
        }
        catch (err) {
            error('Permission check error:');
            log(err);
            allowed = false;
        }
        return {
            OK: allowed,
            policies: policies
        };
    }
    async getDefaultRouteTable(vpcId) {
        var _a;
        const command = new client_ec2_1.DescribeRouteTablesCommand({
            Filters: [
                {
                    Name: "vpc-id",
                    Values: [vpcId]
                }
            ]
        });
        const response = await this.getEC2().send(command);
        return (_a = response.RouteTables) === null || _a === void 0 ? void 0 : _a.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }
    async createVPCEndpointIfNotExist(vpcId) {
        const endpointName = "RWS-S3-GATE";
        const serviceName = `com.amazonaws.${this.region}.s3`;
        // Describe VPC Endpoints
        const describeCommand = new client_ec2_1.DescribeVpcEndpointsCommand({
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
            const createEndpointCommand = new client_ec2_1.CreateVpcEndpointCommand({
                VpcId: vpcId,
                ServiceName: serviceName,
                VpcEndpointType: "Gateway",
                RouteTableIds: [defaultRouteTable.RouteTableId],
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
            }
            else {
                error("Failed to create VPC Endpoint");
                throw new Error("Failed to create VPC Endpoint");
            }
        }
        else {
            log(`VPC Endpoint "${endpointName}" already exists.`);
            return existingEndpoints.VpcEndpoints[0].VpcEndpointId;
        }
    }
    async ensureRouteToVPCEndpoint(vpcId, vpcEndpointId) {
        try {
            const routeTable = await this.getDefaultRouteTable(vpcId);
            const routes = routeTable.Routes || [];
            const hasS3EndpointRoute = routes.some((route) => route.GatewayId === vpcEndpointId);
            if (!hasS3EndpointRoute) {
                // Get the prefix list associated with the S3 VPC endpoint
                const command = new client_ec2_1.DescribeVpcEndpointsCommand({
                    VpcEndpointIds: [vpcEndpointId]
                });
                const vpcEndpointDescription = await this.getEC2().send(command);
                rwsLog('Creating VPC Endpoint route');
                // Add a route to the route table
                // Add a route to the route table
                const createRouteCommand = new client_ec2_1.CreateRouteCommand({
                    RouteTableId: routeTable.RouteTableId,
                    DestinationCidrBlock: '0.0.0.0/0',
                    VpcEndpointId: vpcEndpointDescription.VpcEndpoints[0].VpcEndpointId
                });
                await this.getEC2().send(createRouteCommand);
                log(`Added route to VPC Endpoint ${vpcEndpointId} in Route Table ${routeTable.RouteTableId}`);
            }
            else {
                log(`Route to VPC Endpoint ${vpcEndpointId} already exists in Route Table ${routeTable.RouteTableId}`);
            }
        }
        catch (error) {
            console.error('Error ensuring route to VPC Endpoint:', error);
        }
    }
    getS3() {
        this._initApis();
        return this.s3;
    }
    getEC2() {
        this._initApis();
        return this.ec2;
    }
    getEFS() {
        this._initApis();
        return this.efs;
    }
    getLambda() {
        this._initApis();
        return this.lambda;
    }
    getRegion() {
        this._initApis();
        return this.region;
    }
    getIAM() {
        this._initApis();
        return this.iam;
    }
}
exports.default = AWSService.getSingleton();
//# sourceMappingURL=AWSService.js.map