import TheService from "./_service";
import { String } from "aws-sdk/clients/batch";
declare class LambdaService extends TheService {
    private region;
    constructor();
    archiveLambda(lambdaDirPath: string, moduleCfgDir: string): Promise<[string, string]>;
    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string];
    deployLambda(functionName: string, appPaths: string[], subnetId?: string, noEFS?: boolean): Promise<any>;
    deployModules(layerPath: string, efsId: string, subnetId: string, force?: boolean): Promise<void>;
    functionExists(functionName: String): Promise<boolean>;
    waitForLambda(functionName: string, waitFor?: string, timeoutMs?: number, intervalMs?: number): Promise<void>;
}
declare const _default: LambdaService;
export default _default;
