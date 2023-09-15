import TheService from "./_service";
import { InvocationType } from "@aws-sdk/client-lambda";
declare class LambdaService extends TheService {
    private region;
    constructor();
    archiveLambda(lambdaDirPath: string, moduleCfgDir: string, fullZip?: boolean): Promise<string>;
    determineLambdaPackagePaths(lambdaDirName: string, moduleCfgDir: string): [string, string];
    setRegion(region: string): void;
    deployLambda(functionDirName: string, zipPath: string, vpcId: string, subnetId?: string, noEFS?: boolean): Promise<any>;
    deployModules(functionName: string, efsId: string, vpcId: string, subnetId: string, force?: boolean): Promise<void>;
    functionExists(lambdaFunctionName: string): Promise<boolean>;
    waitForLambda(functionName: string, waitFor?: string, timeoutMs?: number, intervalMs?: number): Promise<void>;
    deleteLambda(functionName: string): Promise<void>;
    invokeLambda(functionName: string, payload: any, invocationType?: InvocationType): Promise<{
        StatusCode: number;
        Response: any;
        CapturedLogs?: string[];
    }>;
    findPayload(lambdaArg: string): string;
}
declare const _default: LambdaService;
export default _default;
