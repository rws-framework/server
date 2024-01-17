import TheService from "./_service";
import { Chalk } from 'chalk';
import { Logger as PinoLogger } from 'pino';
declare class ConsoleService extends TheService {
    private isEnabled;
    private originalLogMethods?;
    constructor();
    color(): Chalk;
    log(...obj: any[]): void;
    colorObject(obj: any): string;
    warn(...obj: any[]): void;
    sanitizeObject(obj: any): any;
    getPino(): PinoLogger;
    prettyPrintObject(obj: any): void;
    error(...obj: any[]): void;
    stopLogging(): void;
    startLogging(): void;
    private getOriginalLogFunctions;
    private disableOriginalLogFunctions;
    private restoreOriginalLogFunctions;
    updateLogLine(message: string): void;
    rwsLog(logCat: string | any[], logString?: string | null | any): void;
}
declare const _default: ConsoleService;
export default _default;
