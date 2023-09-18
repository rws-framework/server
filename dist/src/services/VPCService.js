"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWSService_1 = __importDefault(require("./AWSService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const _service_1 = __importDefault(require("./_service"));
const { log, warn, error, color, rwsLog } = ConsoleService_1.default;
class VPCService extends _service_1.default {
    async findDefaultSubnetForVPC() {
        try {
            const response = await AWSService_1.default.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();
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
        const params = {
            Filters: [{
                    Name: 'vpc-id',
                    Values: [vpcId]
                }]
        };
        const result = await AWSService_1.default.getEC2().describeSubnets(params).promise();
        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId)[0];
        }
        else {
            return null;
        }
    }
    async listSecurityGroups() {
        try {
            const result = await AWSService_1.default.getEC2().describeSecurityGroups().promise();
            const securityGroups = result.SecurityGroups || [];
            const securityGroupIds = securityGroups.map(sg => sg.GroupId);
            return securityGroupIds;
        }
        catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }
    async getDefaultRouteTable(vpcId, subnetId = null) {
        var _a;
        const filters = [{
                Name: "vpc-id",
                Values: [vpcId]
            }];
        if (subnetId) {
            filters.push({
                Name: "association.subnet-id",
                Values: [subnetId]
            });
        }
        const routeTablesResponse = await AWSService_1.default.getEC2().describeRouteTables({
            Filters: filters
        }).promise();
        return (_a = routeTablesResponse.RouteTables) === null || _a === void 0 ? void 0 : _a.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }
    async createVPCEndpointIfNotExist(vpcId) {
        const endpointName = "RWS-S3-GATE";
        const serviceName = `com.amazonaws.${AWSService_1.default.getRegion()}.s3`;
        // Describe VPC Endpoints
        const existingEndpoints = await AWSService_1.default.getEC2().describeVpcEndpoints({
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
            const endpointResponse = await AWSService_1.default.getEC2().createVpcEndpoint({
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
            }).promise();
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
                const vpcEndpointDescription = (await AWSService_1.default.getEC2().describeVpcEndpoints({
                    VpcEndpointIds: [vpcEndpointId]
                }).promise()).VpcEndpoints;
                rwsLog('Creating VPC Endpoint route');
                // Add a route to the route table
                await AWSService_1.default.getEC2().createRoute({
                    RouteTableId: routeTable.RouteTableId,
                    DestinationCidrBlock: '0.0.0.0/0',
                    VpcEndpointId: vpcEndpointDescription[0].VpcEndpointId
                }).promise();
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
    async findPublicSubnetInVPC(vpcId) {
        const subnets = await AWSService_1.default.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        for (const subnet of subnets.Subnets || []) {
            const routeTables = await AWSService_1.default.getEC2().describeRouteTables({
                Filters: [{ Name: 'association.subnet-id', Values: [subnet.SubnetId] }]
            }).promise();
            for (const routeTable of routeTables.RouteTables || []) {
                for (const route of routeTable.Routes || []) {
                    if (route.DestinationCidrBlock === '0.0.0.0/0' && route.GatewayId && route.GatewayId.startsWith('igw-')) {
                        return subnet;
                    }
                }
            }
        }
        return null;
    }
    calculateNextThirdOctetIncrement(range) {
        const thirdOctet = 0;
        // Calculate the number of addresses represented by the CIDR range
        const numAddresses = Math.pow(2, 32 - range);
        // Calculate how many blocks in the third octet those addresses span
        const increment = Math.ceil(numAddresses / 256);
        const nextThirdOctet = increment;
        return nextThirdOctet;
    }
    async createPublicSubnet(vpcId, range = 24, passedCIDRBlock = null) {
        var _a;
        const _SUBNET_PASS_VAL = this.calculateNextThirdOctetIncrement(range);
        const vpcInfo = await AWSService_1.default.getEC2().describeVpcs({ VpcIds: [vpcId] }).promise();
        if (!vpcInfo.Vpcs || vpcInfo.Vpcs.length === 0) {
            throw new Error('VPC not found.');
        }
        const vpcCidrBlock = vpcInfo.Vpcs[0].CidrBlock;
        // Retrieve existing subnets within the VPC
        const subnets = await AWSService_1.default.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        const existingCidrs = ((_a = subnets.Subnets) === null || _a === void 0 ? void 0 : _a.map(subnet => subnet.CidrBlock).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))) || [];
        // Propose a new CIDR block
        let newCidrBlock;
        const baseIp = (passedCIDRBlock ? passedCIDRBlock : vpcCidrBlock).split('/')[0];
        const maxThirdOctet = Math.max(...existingCidrs.map(cidr => {
            const octets = cidr.split('.');
            return parseInt(octets[2]);
        }));
        const rerun = async (newOctet, newRange) => await this.createPublicSubnet(vpcId, range, `${baseIp.split('.').slice(0, 2).join('.')}.${newOctet}.0/${newRange}`);
        const baseThirdOctet = existingCidrs.length ? maxThirdOctet : 0;
        let nextThirdOctet = baseThirdOctet + _SUBNET_PASS_VAL;
        newCidrBlock = `${baseIp.split('.').slice(0, 2).join('.')}.${nextThirdOctet}.0/${range.toString()}`;
        rwsLog(`Trying to create public subnet for "${vpcId}" VPC with "${newCidrBlock}" address`);
        if (!existingCidrs.includes(newCidrBlock)) {
            try {
                const subnet = await AWSService_1.default.getEC2().createSubnet({
                    VpcId: vpcId,
                    CidrBlock: newCidrBlock
                }).promise();
                rwsLog(`Created public subnet "${subnet.Subnet.SubnetId}" for "${vpcId}" VPC with "${newCidrBlock}" address`);
                return subnet;
            }
            catch (err) {
                // If there's an error due to the CIDR block, adjust and try again
                warn(err.code);
                if (['InvalidSubnet.Range', 'InvalidSubnet.Conflict'].includes(err.code)) {
                    nextThirdOctet += _SUBNET_PASS_VAL;
                    error(`CIDR Address taken. Retrying...`);
                    return await rerun(nextThirdOctet, range);
                }
                else {
                    throw err;
                }
            }
        }
        else {
            nextThirdOctet += _SUBNET_PASS_VAL;
            error(`CIDR Address already used. Retrying...`);
            return await rerun(nextThirdOctet, range);
        }
    }
    extractThirdOctet(ip) {
        return parseInt(ip.split('.')[2]);
    }
    async waitForNatGatewayAvailable(natGatewayId) {
        try {
            rwsLog(`Waiting for NAT Gateway ${natGatewayId}...`);
            await AWSService_1.default.getEC2().waitFor('natGatewayAvailable', {
                NatGatewayIds: [natGatewayId]
            }).promise();
            rwsLog(`NAT Gateway ${natGatewayId} is now available.`);
        }
        catch (err) {
            error(`Error waiting for NAT Gateway ${natGatewayId} to become available:`);
            log(err);
            throw err;
        }
    }
}
exports.default = VPCService.getSingleton();
//# sourceMappingURL=VPCService.js.map