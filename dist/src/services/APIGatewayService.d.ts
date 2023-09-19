import TheService from "./_service";
import AWS from 'aws-sdk';
declare class APIGatewayService extends TheService {
    private region;
    constructor();
    findApiGateway(gatewayName: string): Promise<AWS.APIGateway.RestApi | null>;
    deleteApiGateway(apiId: string): Promise<void>;
    createApiGateway(gatewayName: string): Promise<string>;
    createResource(restApiId: string, resourceLabel: string): Promise<AWS.APIGateway.Resource>;
    createMethod(restApiId: string, resource: AWS.APIGateway.Resource, httpMethod?: string): Promise<AWS.APIGateway.Method>;
    associateNATGatewayWithLambda(lambdaFunctionName: string): Promise<void>;
}
declare const _default: APIGatewayService;
export default _default;
