import AWSService from './AWSService';
import ConsoleService from './ConsoleService';
import TheService from './_service';

const { log, warn, error, rwsLog } = ConsoleService;


class VPCService extends TheService{

    async findDefaultSubnetForVPC(): Promise<[string, string]> 
    {
        try {
            const response = await AWSService.getEC2().describeVpcs({ Filters: [{ Name: 'isDefault', Values: ['true'] }] }).promise();

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

        const result = await AWSService.getEC2().describeSubnets(params).promise();

        if (result.Subnets && result.Subnets.length > 0) {
            return result.Subnets.map(subnet => subnet.SubnetId as string)[0];
        } else {
            return null;
        }
    }

    async listSecurityGroups(): Promise<string[]> 
    {
        try {
            const result = await AWSService.getEC2().describeSecurityGroups().promise();

            const securityGroups = result.SecurityGroups || [];

            const securityGroupIds = securityGroups.map(sg => sg.GroupId);            

            return securityGroupIds;
        } catch (error) {
            console.error('Error fetching security groups:', error);
            return [];
        }
    }   

    async getDefaultRouteTable(vpcId: string, subnetId: string = null): Promise<AWS.EC2.RouteTable>
    {
        const filters = [ {
            Name: 'vpc-id',
            Values: [vpcId]
        }];

        if(subnetId){
            filters.push({
                Name: 'association.subnet-id',
                Values: [subnetId]
            });
        }

        const routeTablesResponse = await AWSService.getEC2().describeRouteTables({
            Filters: filters
        }).promise();        

        return routeTablesResponse.RouteTables?.find(rt => {
            // A default route table won't have explicit subnet associations
            return !rt.Associations || rt.Associations.every(assoc => !assoc.SubnetId);
        });
    }

    async createVPCEndpointIfNotExist(vpcId: string): Promise<string> {
        const endpointName = 'RWS-S3-GATE';
        const serviceName = `com.amazonaws.${AWSService.getRegion()}.s3`;        
    
        // Describe VPC Endpoints
        const existingEndpoints = await AWSService.getEC2().describeVpcEndpoints({
            Filters: [
                {
                    Name: 'tag:Name',
                    Values: [endpointName]
                }
            ]
        }).promise();

        const defaultRouteTable = await this.getDefaultRouteTable(vpcId);

        // Check if the endpoint already exists
        const endpointExists = existingEndpoints.VpcEndpoints && existingEndpoints.VpcEndpoints.length > 0;
    
        if (!endpointExists) {
            // Create VPC Endpoint for S3
            
            const endpointResponse = await AWSService.getEC2().createVpcEndpoint({
                VpcId: vpcId,
                ServiceName: serviceName,
                VpcEndpointType: 'Gateway',
                RouteTableIds: [defaultRouteTable.RouteTableId], // Add your route table IDs here
                TagSpecifications: [
                    {
                        ResourceType: 'vpc-endpoint',
                        Tags: [
                            {
                                Key: 'Name',
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
                error('Failed to create VPC Endpoint');
                throw new Error('Failed to create VPC Endpoint');
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
                const vpcEndpointDescription  = (await AWSService.getEC2().describeVpcEndpoints({
                    VpcEndpointIds: [vpcEndpointId]
                }).promise()).VpcEndpoints;

                rwsLog('Creating VPC Endpoint route');
                // Add a route to the route table
                await AWSService.getEC2().createRoute({
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

    async findPublicSubnetInVPC(vpcId: string): Promise<AWS.EC2.Subnet | null> {
        const subnets = await AWSService.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();

        for (const subnet of subnets.Subnets || []) {
            const routeTables = await AWSService.getEC2().describeRouteTables({
                Filters: [{ Name: 'association.subnet-id', Values: [subnet.SubnetId!] }]
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

    calculateNextThirdOctetIncrement(range: number): number {
    
        // Calculate the number of addresses represented by the CIDR range
        const numAddresses = Math.pow(2, 32 - range);
    
        // Calculate how many blocks in the third octet those addresses span
        const increment = Math.ceil(numAddresses / 256);
    
        const nextThirdOctet = increment;

        return nextThirdOctet;
    }

    async createPublicSubnet(vpcId: string, range: number = 24,passedCIDRBlock: string = null): Promise<AWS.EC2.CreateSubnetResult> {
        const _SUBNET_PASS_VAL = this.calculateNextThirdOctetIncrement(range);

        const vpcInfo = await AWSService.getEC2().describeVpcs({ VpcIds: [vpcId] }).promise();
        if (!vpcInfo.Vpcs || vpcInfo.Vpcs.length === 0) {
            throw new Error('VPC not found.');
        }

        const vpcCidrBlock = vpcInfo.Vpcs[0].CidrBlock;
    
        // Retrieve existing subnets within the VPC
        const subnets = await AWSService.getEC2().describeSubnets({ Filters: [{ Name: 'vpc-id', Values: [vpcId] }] }).promise();
        const existingCidrs = subnets.Subnets?.map(subnet => subnet.CidrBlock).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })) || [];        
        
        const baseIp: string = (passedCIDRBlock ? passedCIDRBlock : vpcCidrBlock).split('/')[0];
        
        const maxThirdOctet = Math.max(...existingCidrs.map(cidr => {
            const octets = cidr.split('.');
            return parseInt(octets[2]);
        }));

        const rerun = async (newOctet: number, newRange: number) => await this.createPublicSubnet(vpcId, range, `${baseIp.split('.').slice(0, 2).join('.')}.${newOctet}.0/${newRange}`);

        const baseThirdOctet = existingCidrs.length ? maxThirdOctet : 0;

        let nextThirdOctet: number = baseThirdOctet + _SUBNET_PASS_VAL;
    
        const newCidrBlock = `${baseIp.split('.').slice(0, 2).join('.')}.${nextThirdOctet }.0/${range.toString()}`;
        rwsLog(`Trying to create public subnet for "${vpcId}" VPC with "${newCidrBlock}" address`);

        if (!existingCidrs.includes(newCidrBlock)) {
            try {
                const subnet = await AWSService.getEC2().createSubnet({
                    VpcId: vpcId,
                    CidrBlock: newCidrBlock
                }).promise();  
                
                rwsLog(`Created public subnet "${subnet.Subnet.SubnetId}" for "${vpcId}" VPC with "${newCidrBlock}" address`);

                return subnet;
            } catch (err: Error | any) {
                // If there's an error due to the CIDR block, adjust and try again
                warn(err.code);

                if (['InvalidSubnet.Range', 'InvalidSubnet.Conflict'].includes(err.code)) {
                    nextThirdOctet += _SUBNET_PASS_VAL;

                    error('CIDR Address taken. Retrying...');

                    return await rerun(nextThirdOctet, range);
                } else {
                    throw err;
                }
            }
        } else {
            nextThirdOctet += _SUBNET_PASS_VAL;

            error('CIDR Address already used. Retrying...');
            return await rerun(nextThirdOctet, range);
        }
    }


    async waitForNatGatewayAvailable(natGatewayId: string): Promise<void> {
        try {
            rwsLog(`Waiting for NAT Gateway ${natGatewayId}...`);

            await AWSService.getEC2().waitFor('natGatewayAvailable', {
                NatGatewayIds: [natGatewayId]
            }).promise();
            rwsLog(`NAT Gateway ${natGatewayId} is now available.`);
        } catch (err) {
            error(`Error waiting for NAT Gateway ${natGatewayId} to become available:`);
            log(err);
            throw err;
        }
    }
}

export default VPCService.getSingleton();
export {VPCService};