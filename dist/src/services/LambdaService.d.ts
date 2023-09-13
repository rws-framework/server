import TheService from "./_service";
import AWS from 'aws-sdk';
declare class LambdaService extends TheService {
    private region;
    constructor();
    archiveLambda(lambdaDirPath: string, moduleCfgDir: string): Promise<[string, string]>;
    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string];
    deployLambda(functionName: string, appPaths: string[], subnetId?: string, noEFS?: boolean): Promise<any>;
    deployModules(layerPath: string, efsId: string, subnetId: string, force?: boolean): Promise<void>;
    functionExists(functionName: string): Promise<boolean>;
    waitForLambda(functionName: string, waitFor?: string, timeoutMs?: number, intervalMs?: number): Promise<void>;
    deleteLambda(functionName: string): Promise<void>;
    invokeLambda(functionName: string, payload: any): Promise<{
        StatusCode: number;
        Response: AWS.Lambda.InvocationResponse;
        CapturedLogs?: string[];
    }>;
    private captureAndLogMessages;
}
declare const _default: LambdaService;
export default _default;
