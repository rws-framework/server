"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const AWSService_1 = __importDefault(require("./AWSService"));
const LambdaService_1 = __importDefault(require("./LambdaService"));
const VPCService_1 = __importDefault(require("./VPCService"));
const { log, error, rwsLog } = ConsoleService_1.default;
class APIGatewayService extends _service_1.default {
    constructor() {
        super();
        this.region = AWSService_1.default.getRegion();
    }
    async findApiGateway(gatewayName) {
        let theApi = null;
        const apis = await AWSService_1.default.getAPIGateway().getRestApis().promise();
        for (const api of apis.items) {
            if (api.name === gatewayName + '-API') {
                theApi = api;
                break;
            }
        }
        return theApi;
    }
    async deleteApiGateway(apiId) {
        await AWSService_1.default.getAPIGateway().deleteRestApi({ restApiId: apiId }).promise();
        error('Deleted API Gateway: ' + apiId);
    }
    async createApiGateway(gatewayName) {
        const currentGateway = await this.findApiGateway(gatewayName);
        let restApiId = null;
        if (!currentGateway) {
            const params = {
                name: gatewayName + '-API',
                description: `API Gateway for ${gatewayName}`,
                endpointConfiguration: {
                    types: ["REGIONAL"]
                }
            };
            try {
                const response = await AWSService_1.default.getAPIGateway().createRestApi(params).promise();
                restApiId = response.id || null;
            }
            catch (err) {
                error('Error creating API Gateway:', err);
                throw err;
            }
        }
        else {
            restApiId = currentGateway.id;
        }
        return restApiId;
    }
    async createResource(restApiId, resourceLabel) {
        const resources = await AWSService_1.default.getAPIGateway().getResources({ restApiId: restApiId }).promise();
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
            resource = await AWSService_1.default.getAPIGateway().createResource({
                restApiId: restApiId,
                parentId: rootResource.id,
                pathPart: resourceName
            }).promise();
        }
        return resource;
    }
    async createMethod(restApiId, resource, httpMethod = 'GET') {
        return await AWSService_1.default.getAPIGateway().putMethod({
            restApiId: restApiId,
            resourceId: resource.id,
            httpMethod: httpMethod,
            authorizationType: "NONE", // Change this if you want to use an authorizer
            apiKeyRequired: false
        }).promise();
    }
    async associateNATGatewayWithLambda(lambdaFunctionName) {
        rwsLog(`Creating NAT Gateway for "${lambdaFunctionName}" lambda function`);
        const lambdaConfig = { ...(await LambdaService_1.default.getLambdaFunction(lambdaFunctionName)).Configuration };
        const privateSubnetId = lambdaConfig.VpcConfig.SubnetIds[0];
        // const publicSubnet = await VPCService.createPublicSubnet(lambdaConfig.VpcConfig.VpcId, 20);    
        // const publicSubnetId = publicSubnet.Subnet.SubnetId;
        try {
            const eip = await AWSService_1.default.getEC2().allocateAddress({}).promise();
            if (!eip.AllocationId) {
                throw new Error('Failed to allocate Elastic IP.');
            }
            const natGateway = await AWSService_1.default.getEC2().createNatGateway({
                SubnetId: privateSubnetId,
                AllocationId: eip.AllocationId
            }).promise();
            const routeTable = await VPCService_1.default.getDefaultRouteTable(lambdaConfig.VpcConfig.VpcId);
            if (!routeTable) {
                throw new Error('No route table exists.');
            }
            await VPCService_1.default.waitForNatGatewayAvailable(natGateway.NatGateway.NatGatewayId);
            await AWSService_1.default.getEC2().createRoute({
                RouteTableId: routeTable.RouteTableId,
                DestinationCidrBlock: '0.0.0.0/0',
                NatGatewayId: natGateway.NatGateway.NatGatewayId
            }).promise();
            rwsLog('Lambda function associated with NAT Gateway successfully.');
        }
        catch (e) {
            error(e.code, e.message);
        }
    }
}
exports.default = APIGatewayService.getSingleton();
//# sourceMappingURL=APIGatewayService.js.map