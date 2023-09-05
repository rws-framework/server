import TheService from "./_service";
import { String } from "aws-sdk/clients/batch";
declare class LambdaService extends TheService {
    private region;
    private lambda;
    private s3;
    private efs;
    constructor();
    archiveLambda(lambdaDirPath: string, moduleCfgDir: string): Promise<[string, string]>;
    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string];
    deployLambda(functionName: string, appPaths: string[], subnetId?: string): Promise<any>;
    deployModules(layerPath: string, functionName: string, efsId: string, subnetId: string): Promise<void>;
    functionExists(functionName: String): Promise<boolean>;
    waitForLambda(functionName: string, timeoutMs?: number, intervalMs?: number): Promise<void>;
}
declare const _default: LambdaService;
export default _default;
