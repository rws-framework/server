import TheService from "./_service";
import AWS from 'aws-sdk';
type InvocationTypeType = 'RequestResponse' | 'Event' | 'DryDrun';
declare class LambdaService extends TheService {
    private region;
    constructor();
    archiveLambda(lambdaDirPath: string, moduleCfgDir: string, fullZip?: boolean): Promise<string>;
    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string];
    setRegion(region: string): void;
    deployLambda(functionDirName: string, zipPath: string, vpcId: string, subnetId?: string, noEFS?: boolean): Promise<any>;
    deployModules(functionName: string, efsId: string, vpcId: string, subnetId: string, force?: boolean): Promise<void>;
    getLambdaFunction(lambdaFunctionName: string): Promise<AWS.Lambda.GetFunctionResponse | null>;
    functionExists(lambdaFunctionName: string): Promise<boolean>;
    waitForLambda(functionName: string, waitFor?: string, timeoutMs?: number, intervalMs?: number): Promise<void>;
    deleteLambda(functionName: string): Promise<void>;
    invokeLambda(functionName: string, payload: any, invocationType?: InvocationTypeType): Promise<{
        StatusCode: number;
        Response: AWS.Lambda.InvocationResponse;
        CapturedLogs?: string[];
    }>;
    retrieveCloudWatchLogs(logResult: string, functionName: string): Promise<string[]>;
    findPayload(lambdaArg: string): string;
    integrateGatewayResource(lambdaFunctionName: string, restApiId: string, resource: AWS.APIGateway.Resource, httpMethod?: string): Promise<void>;
    setupGatewayForWebLambda(lambdaFunctionName: string): Promise<void>;
}
declare const _default: LambdaService;
export default _default;
