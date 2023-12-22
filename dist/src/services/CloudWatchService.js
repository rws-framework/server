"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AWSService_1 = __importDefault(require("./AWSService"));
const _service_1 = __importDefault(require("./_service"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const { log, rwsLog, error, color } = ConsoleService_1.default;
const _MS = 1000;
class CloudWatchService extends _service_1.default {
    async printLogsForLambda(lambdaFunctionName, startTime, endTime, terminateTimeout = 30 * _MS) {
        const cloudWatchLogs = AWSService_1.default.getCloudWatch();
        const logGroupName = `/aws/lambda/${lambdaFunctionName}`; // Standard log group name format for Lambda
        let logStreamName;
        let logsTimeout = { core: null };
        // Get the latest log stream
        const describeParams = {
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
            limit: 1
        };
        try {
            const describeResult = await cloudWatchLogs.describeLogStreams(describeParams).promise();
            if (describeResult.logStreams && describeResult.logStreams[0]) {
                logStreamName = describeResult.logStreams[0].logStreamName;
            }
            else {
                error("No log streams found for the specified Lambda function.");
                return;
            }
        }
        catch (err) {
            error("An error occurred while describing log streams:", err);
            return;
        }
        let terminateTimer = null;
        const getLogs = async (nextToken) => {
            // const lambdaDetails = await LambdaService.getLambdaFunction(lambdaFunctionName);     
            const params = {
                logGroupName,
                logStreamName,
                startTime,
                endTime,
                nextToken,
                limit: 100
            };
            try {
                const data = await cloudWatchLogs.getLogEvents(params).promise();
                if (data.events && data.events.length > 0) {
                    this.printLogs(data.events);
                    // Reset the termination timer since we've received new logs
                    if (terminateTimer !== null) {
                        clearTimeout(terminateTimer);
                    }
                    terminateTimer = setTimeout(() => {
                        log("Terminating log fetch due to timeout.");
                        clearTimeout(terminateTimer);
                        return;
                    }, terminateTimeout); // terminateTimeout is the time in milliseconds you want to wait
                }
                this.nextForwardToken = data.nextForwardToken;
                // Recursive call to keep polling for new logs
                logsTimeout.core = setTimeout(() => getLogs(this.nextForwardToken), 5000); //
            }
            catch (err) {
                error("An error occurred while fetching logs:", err);
            }
        };
        getLogs();
        return logsTimeout;
    }
    printLogs(events) {
        events.forEach(event => {
            log(color().blue(`[AWS CloudWatch] `) + `{${new Date(event.timestamp).toISOString()}} : ${event.message}`);
        });
    }
}
exports.default = CloudWatchService.getSingleton();
//# sourceMappingURL=CloudWatchService.js.map