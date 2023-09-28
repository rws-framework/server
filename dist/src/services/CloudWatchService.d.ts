/// <reference types="node" />
import TheService from './_service';
declare class CloudWatchService extends TheService {
    private nextForwardToken?;
    printLogsForLambda(lambdaFunctionName: string, startTime?: number, endTime?: number, terminateTimeout?: number): Promise<{
        core: NodeJS.Timeout;
    }>;
    private printLogs;
}
declare const _default: CloudWatchService;
export default _default;
