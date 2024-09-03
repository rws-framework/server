import TheService from './_service';
import chalk, { Chalk } from 'chalk';
import pino, { Logger as PinoLogger } from 'pino';
import pinoPretty from 'pino-pretty'; // Import pino-pretty
import moment from 'moment';
import { rwsPath } from '@rws-framework/console';
import fs from 'fs';
import getAppConfig from './AppConfigService';

interface IJSONColors {
  [codeLement: string]: keyof Chalk
}

class ConsoleService extends TheService {
    private isEnabled: boolean = true;
    private originalLogMethods?: any = null;

    private listeners: {[listenerName: string]: (logLine: string) => Promise<void>} = {}

    constructor() {
        super();

        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.warn = this.warn.bind(this);

        this.isEnabled = true;
        this.originalLogMethods = this.getOriginalLogFunctions();
    }


    color(): Chalk {
        return chalk;
    }

    async addLogListener(callbackListenerName: string, callback: (logLine: string) => Promise<void>){
        this.listeners[callbackListenerName] = callback;
    }

    log(...obj: any[]){
        if (!this.isEnabled) {
            return;
        }
    
        let lines: string[] = [];
        const _self = this;
    
        let typeBucket: any[] = [];
        let lastType: string = null;

        obj.forEach((elem: any, index: number) => {
            const elemType = typeof elem;
            const isLast: boolean = index == obj.length - 1;
    
            if (((lastType === null && obj.length === 1) || (lastType !== null && lastType !== elemType)) || isLast) {
                if(lastType){
                    if (lastType === 'string') {
                        lines.push(typeBucket.join(' '));
                        typeBucket = [];
                    } else {
                        lines.push(_self.prettyPrintObject(elem));
                    }                   
                }           
    
                if (isLast) {
                    lines.push(elem);
                    return;
                }
            }else{
                lastType = elemType; // Update the lastType for the next iteration
                typeBucket.push(elem);
            }                  
           
        });
            
        console.log(this.getDateString(), ...lines);
        
        this.postLog(lines);
    }

    postLog(lines: string[]) {
        this.writeToLogFile([this.getDateString(), ...lines]);

        for(const listenerName of Object.keys(this.listeners)){
            this.listeners[listenerName](this.squishLines(lines));
        }
    }

    colorObject(obj: any): string {
        const _JSON_COLORS: IJSONColors = {
            'keys': 'green',
            'objectValue': 'magenta',
            'braces': 'blue',
            'arrayBraces': 'yellow',
            'colons': 'white', // Color for colons
            'default': 'reset' // Default color to reset to default chalk color
        };

        const getCodeColor = (chalkKey: string, textValue: string): string => {
            return (chalk as any)[chalkKey](textValue);
        };

        const objString = JSON.stringify(this.sanitizeObject(obj), null, 2);
        const lines = objString.split('\n');

        const coloredLines: string[] = [];

        for (const line of lines) {
            const parts = line.split(/("[^"]*"\s*:\s*)|("[^"]*":\s*)|([{}[\],])/); // Split the line into parts around keys, colons, commas, braces, and brackets

            // Process each part and colorize accordingly
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part !== undefined) {
                    const trimmedPart = part.trim();
                    if (trimmedPart === ':') {
                    // This part is a colon, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ':');
                    } else if (trimmedPart === ',') {
                    // This part is a comma, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ',');
                    } else if (trimmedPart === '[' || trimmedPart === ']') {
                    // This part is a bracket, colorize it with the arrayBraces color
                        parts[i] = getCodeColor(_JSON_COLORS.arrayBraces, part);
                    } else if (i % 4 === 1) {
                    // This part is a key, colorize it with the keys color
                        const key = trimmedPart;
                        if (key === ':') {
                            parts[i] = getCodeColor(_JSON_COLORS.colons, key);
                        } else {
                            parts[i] = getCodeColor(_JSON_COLORS.keys, key);
                        }
                    } else if (i % 4 === 3) {
                    // This part is a value, colorize it with objectValue
                        const value = trimmedPart;
                        parts[i] = getCodeColor(_JSON_COLORS.objectValue, value);
                    }
                }
            }

            coloredLines.push(parts.join('')); // Join and add the modified line to the result
        }

        return coloredLines.join('\n'); // Join the colored lines and return as a single string
    }



    warn(...obj: any[]): void {
        if (!this.isEnabled) {
            return;
        }

        let intro = 'RWS CLI WARNING';

        if(obj.length > 1 && typeof obj[0] === 'string'){
            intro = obj[0];
            obj = obj.filter((el: any, index: number) => index > 0);
        }

        obj = [this.getDateString(), chalk.yellow(`[${intro}]`), ...obj];

        console.warn(...obj); 
    }

    sanitizeObject(obj: any): any {
        const sensitiveKeys = ['mongo_url', 'mongo_db', 'ssl_cert', 'ssl_key', 'secret_key', 'aws_access_key', 'aws_secret_key'];
    
        const sanitizedObj = { ...obj }; // Create a shallow copy of the object

        for (const key of sensitiveKeys) {
            if (sanitizedObj.hasOwnProperty(key)) {
                sanitizedObj[key] = '<VALUE HIDDEN>';
            }
        }

        return sanitizedObj;
    }

    getPino(): PinoLogger
    {
        return pino(pinoPretty());
    }

    prettyPrintObject(obj: any): string {
        return this.colorObject(this.sanitizeObject(obj));
    }

    error(...obj: any[]): void {
        if (!this.isEnabled) {
            return;
        }        

        let intro = 'RWS CLI ERROR';

        if(obj.length > 1 && typeof obj[0] === 'string'){
            intro = obj[0];
            obj = obj.filter((el: any, index: number) => index > 0);
        }

        obj = [chalk.red(`[${intro}]`), ...obj];

        console.log(...obj);
    }

    stopLogging(): void {
        this.isEnabled = false;
        this.disableOriginalLogFunctions();
    }

    startLogging(): void {
        this.isEnabled = true;
        this.restoreOriginalLogFunctions();
    }

    private getOriginalLogFunctions = () => {
        return {
            log: console.log,
            warn: console.warn,
            error: console.error,
        };
    };

    private disableOriginalLogFunctions = () => {
        console.log = (...args: string[]) => { };
        console.warn = (...args: string[]) => { };
        console.error = (...args: string[]) => { };
    };

    public overrideGlobalLogs = () => {
        console.log = this.log;
        console.warn = this.warn;
        console.error = this.error;
    };

    private restoreOriginalLogFunctions = () => {
        const originalF = this.originalLogMethods;

        console.log = originalF.log;
        console.warn = originalF.warn;
        console.error = originalF.error;
    };

    private getDateString(): string
    {
        return chalk.blue(`[${moment().format('Y-MM-DD H:mm:ss')}]`);
    }

    updateLogLine(message: string) {
        process.stdout.write('\r' + message);
    }  

    stripAnsiCodes(text: any): string {
       try {
        if(typeof text !== 'string'){
            text = JSON.stringify(text);
        }

        // This regex matches all ANSI color codes
        const ansiRegex = /[\u001b\u009b][[()#;?]*(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nqry=><]/g;
        return text.replace(ansiRegex, '');

       } catch (e: Error | unknown){        
          this.error(e);
       }  
    }

    squishLines(lines: string[]): string
    {
        return lines.map((line: any) => typeof line !== 'string' ? JSON.stringify(line, null, 2) : line).map((line: any) => this.stripAnsiCodes(line)).join(' ')
    }

    writeToLogFile(lines: string[]) {
        if(!getAppConfig().get('features').logging){
            return;
        }

        
        const logsPath = getAppConfig().get('logs_directory') || rwsPath.findRootWorkspacePath(process.cwd()) + '/node_modules/.rws/logs';
        const logFile = `${logsPath}/rws_log_${moment().format('Y_MM_DD')}.log`;
    
        if (!fs.existsSync(logsPath)) {
            fs.mkdirSync(logsPath, { recursive: true });
        }

        const logContent = this.squishLines(lines) + '\n';
    
        fs.appendFile(logFile, logContent, (err) => {
            if (err) {
                console.error('Error writing to log file:', err);
            }
        });
    }    
}

export default ConsoleService.getSingleton();
export {
    ConsoleService
};