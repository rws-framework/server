import TheService from './_service';
import ConsoleService from './ConsoleService';
import AWS from 'aws-sdk';
import AWSService from './AWSService';
import LambdaService from './LambdaService';
import VPCService from './VPCService';

const {  error, rwsLog } = ConsoleService;

class APIGatewayService extends TheService {
    private region: string;    

    constructor() {
        super();

        this.region = AWSService.getRegion();
    }

    async findApiGateway(gatewayName: string): Promise<AWS.APIGateway.RestApi | null> {
        let theApi: AWS.APIGateway.RestApi = null;
        const apis = await AWSService.getAPIGateway().getRestApis().promise();
        for (const api of apis.items) {
            if (api.name === gatewayName + '-API') {
                theApi = api;
                break;
            }
        }

        return theApi;
    }

    async deleteApiGateway(apiId: string): Promise<void> {        
        await AWSService.getAPIGateway().deleteRestApi({ restApiId: apiId }).promise();        
        error('Deleted API Gateway: '+ apiId);
    }

    async createApiGateway(gatewayName: string): Promise<string> {

        const currentGateway: AWS.APIGateway.RestApi | null = await this.findApiGateway(gatewayName);

        let restApiId: string = null;

        if(!currentGateway){
            const params: AWS.APIGateway.CreateRestApiRequest = {
                name: gatewayName + '-API',
                description: `API Gateway for ${gatewayName}`,
                endpointConfiguration: {
                    types: ['REGIONAL']
                }
            };

            try {
                const response = await AWSService.getAPIGateway().createRestApi(params).promise();
                restApiId =  response.id || null;
            } catch (err) {
                error('Error creating API Gateway:', err);
                throw err;
            }
        } else {
            restApiId = currentGateway.id;
        }

        return restApiId;
    }

    async createResource(restApiId: string, resourceLabel: string): Promise<AWS.APIGateway.Resource>
    {
        const resources = await AWSService.getAPIGateway().getResources({ restApiId: restApiId }).promise();
        const rootResource = resources.items.find(r => r.path === '/');

        // Create a new resource under root (if it doesn't exist)
        let resource;
        const resourceName = resourceLabel + '-ENDPOINT';

        for (const res of resources.items) {
            if (res.pathPart === resourceName) {
                resource = res;
                break;
            }
        }
        if (!resource) {
            resource = await AWSService.getAPIGateway().createResource({
                restApiId: restApiId,
                parentId: rootResource.id,
                pathPart: resourceName
            }).promise();
        }

        return resource;
    }

    async createMethod(restApiId:  string, resource: AWS.APIGateway.Resource, httpMethod: string = 'GET'): Promise<AWS.APIGateway.Method>
    {        
        return await AWSService.getAPIGateway().putMethod({
            restApiId: restApiId,
            resourceId: resource.id,
            httpMethod: httpMethod,
            authorizationType: 'NONE', // Change this if you want to use an authorizer
            apiKeyRequired: false
        }).promise();
    }    

    async associateNATGatewayWithLambda(lambdaFunctionName: string): Promise<void> {
        rwsLog(`Creating NAT Gateway for "${lambdaFunctionName}" lambda function`);

        const lambdaConfig: AWS.Lambda.FunctionConfiguration = {...(await LambdaService.getLambdaFunction(lambdaFunctionName)).Configuration};
        const privateSubnetId = lambdaConfig.VpcConfig.SubnetIds[0];
    
        // const publicSubnet = await VPCService.createPublicSubnet(lambdaConfig.VpcConfig.VpcId, 20);    
        // const publicSubnetId = publicSubnet.Subnet.SubnetId;

        try{            

            const eip = await AWSService.getEC2().allocateAddress({}).promise();

            if (!eip.AllocationId) {
                throw new Error('Failed to allocate Elastic IP.');
            }

            const natGateway = await AWSService.getEC2().createNatGateway({                
                SubnetId: privateSubnetId,
                AllocationId: eip.AllocationId
            }).promise();    


            const routeTable = await VPCService.getDefaultRouteTable(lambdaConfig.VpcConfig.VpcId);

            if(!routeTable){
                throw new Error('No route table exists.');
            }

            await VPCService.waitForNatGatewayAvailable(natGateway.NatGateway.NatGatewayId);

            await AWSService.getEC2().createRoute({
                RouteTableId: routeTable.RouteTableId,
                DestinationCidrBlock: '0.0.0.0/0',
                NatGatewayId: natGateway.NatGateway.NatGatewayId
            }).promise();

            rwsLog('Lambda function associated with NAT Gateway successfully.');

        } catch(e: Error | any){
            error(e.code, e.message);
        }       
    }
}

export default APIGatewayService.getSingleton();