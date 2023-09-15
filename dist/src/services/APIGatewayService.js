"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const AWSService_1 = __importDefault(require("./AWSService"));
const { log, error } = ConsoleService_1.default;
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
            authorizationType: "NONE",
            apiKeyRequired: false
        }).promise();
    }
}
exports.default = APIGatewayService.getSingleton();
//# sourceMappingURL=APIGatewayService.js.map