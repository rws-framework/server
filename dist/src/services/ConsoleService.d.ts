import TheService from "./_service";
import ProgressBar from 'progress';
import AWS from 'aws-sdk';
declare class ConsoleService extends TheService {
    private isEnabled;
    private originalLogMethods?;
    constructor();
    color(): any;
    log(...obj: any[]): void;
    warn(...obj: any[]): void;
    error(...obj: any[]): void;
    stopLogging(): void;
    startLogging(): void;
    AWSProgressBar(managedUpload: AWS.S3.ManagedUpload): ProgressBar;
    private getOriginalLogFunctions;
    private disableOriginalLogFunctions;
    private restoreOriginalLogFunctions;
    updateLogLine(message: string): void;
}
declare const _default: ConsoleService;
export default _default;
