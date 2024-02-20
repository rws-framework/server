import { DescribeLogStreamsRequest, GetLogEventsRequest, GetLogEventsResponse, OutputLogEvent } from 'aws-sdk/clients/cloudwatchlogs';
import AWSService from './AWSService';
import TheService from './_service';
import ConsoleService from './ConsoleService';
const { log, error, color } = ConsoleService;

const _MS = 1000;

class CloudWatchService extends TheService {
    private nextForwardToken?: string;  

    public async printLogsForLambda(lambdaFunctionName: string, startTime?: number, endTime?: number, terminateTimeout: number = 30 * _MS): Promise<{ core: NodeJS.Timeout}> {
        const cloudWatchLogs = AWSService.getCloudWatch();
        const logGroupName = `/aws/lambda/${lambdaFunctionName}`;  // Standard log group name format for Lambda

        let logStreamName: string;
        const logsTimeout: { core: NodeJS.Timeout } = { core: null };

        // Get the latest log stream
        const describeParams: DescribeLogStreamsRequest = {
            logGroupName,
            orderBy: 'LastEventTime',
            descending: true,
            limit: 1
        };

        try {
            const describeResult = await cloudWatchLogs.describeLogStreams(describeParams).promise();
            if (describeResult.logStreams && describeResult.logStreams[0]) {
                logStreamName = describeResult.logStreams[0].logStreamName!;
            } else {
                error('No log streams found for the specified Lambda function.');
                return;
            }
        } catch (err) {
            error('An error occurred while describing log streams:', err);
            return;
        }

        let terminateTimer: NodeJS.Timeout | null = null;

        const getLogs = async (nextToken?: string): Promise<void> => {
        // const lambdaDetails = await LambdaService.getLambdaFunction(lambdaFunctionName);     
            const params: GetLogEventsRequest = {
                logGroupName,
                logStreamName,
                startTime,
                endTime,
                nextToken,
                limit: 100
            };

            try {
                const data: GetLogEventsResponse = await cloudWatchLogs.getLogEvents(params).promise();
                if (data.events && data.events.length > 0) {
                    this.printLogs(data.events);
    
                    // Reset the termination timer since we've received new logs
                    if (terminateTimer !== null) {
                        clearTimeout(terminateTimer);
                    }
    
                    terminateTimer = setTimeout(() => {
                        log('Terminating log fetch due to timeout.');
                        clearTimeout(terminateTimer!);
                        return;
                    }, terminateTimeout);  // terminateTimeout is the time in milliseconds you want to wait
                }
    
                this.nextForwardToken = data.nextForwardToken;
    
                // Recursive call to keep polling for new logs
                logsTimeout.core = setTimeout(() => getLogs(this.nextForwardToken), 5000);  //
            } catch (err) {
                error('An error occurred while fetching logs:', err);
            }
        };

        getLogs();

        return logsTimeout;
    }

    private printLogs(events: OutputLogEvent[]): void {
        events.forEach(event => {
            log(color().blue('[AWS CloudWatch] ') + `{${new Date(event.timestamp!).toISOString()}} : ${event.message}`);
        });
    }
}

export default CloudWatchService.getSingleton();
export { CloudWatchService };