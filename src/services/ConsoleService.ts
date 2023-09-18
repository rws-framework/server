import TheService from "./_service";
import chalk, { Chalk } from 'chalk';
import pino, { Logger as PinoLogger } from 'pino';
import pinoPretty from 'pino-pretty'; // Import pino-pretty

import AWS from 'aws-sdk';

interface IJSONColors {
  [codeLement: string]: keyof Chalk
}

class ConsoleService extends TheService {
  private isEnabled: boolean = true;
  private originalLogMethods?: any = null;

  constructor() {
    super();

    this.log = this.log.bind(this);
    this.error = this.error.bind(this);
    this.warn = this.warn.bind(this);

    this.isEnabled = true;
    this.originalLogMethods = this.getOriginalLogFunctions();
  }


  color(): any {
    return chalk;
  }

  log(...obj: any[]): void {
    if (!this.isEnabled) {
      return;
    }

    const _self = this;

    let typeBucket: any[] = [];
    let lastType: string = null;

    obj.forEach((elem: any, index: number) => {
      const elemType = typeof elem;
      const isLast: boolean = index == obj.length - 1;

      if (((lastType === null && obj.length === 1) || (lastType !== null && lastType !== elemType)) || isLast) {
        if (lastType === 'string') {
          console.log(typeBucket.join(' '));
        } else {

          typeBucket.forEach((bucketElement) => {
            _self.prettyPrintObject(bucketElement)
          })
        }

        typeBucket = [];

        if (isLast) {
          if (elemType === 'string') {
            console.log(elem);
          } else {
            _self.prettyPrintObject(elem)
          }
          return;
        }
      }

      typeBucket.push(elem);

      lastType = elemType; // Update the lastType for the next iteration
    });
  } 


  colorObject(obj: any): string {
    const _JSON_COLORS: IJSONColors = {
        'keys': 'green',
        'objectValue': 'magenta',
        'braces': 'blue',
        'arrayBraces': 'yellow',
        'colons': 'white', // Color for colons
        'default': 'reset' // Default color to reset to default chalk color
    }

    const getCodeColor = (chalkKey: string, textValue: string): string => {
        return (chalk as any)[chalkKey](textValue);
    }

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

    console.log(...obj.map((txt) => chalk.yellowBright('[RWS CLI WARNING] ' + txt)));
  }

  sanitizeObject(obj: any): any {
    const sensitiveKeys = ["mongo_url", "mongo_db", "ssl_cert", "ssl_key", "secret_key", "aws_access_key", "aws_secret_key"];
    
    const sanitizedObj = { ...obj }; // Create a shallow copy of the object

    for (const key of sensitiveKeys) {
        if (sanitizedObj.hasOwnProperty(key)) {
            sanitizedObj[key] = "<VALUE HIDDEN>";
        }
    }

      return sanitizedObj;
  }

  getPino(): PinoLogger
  {
    return pino(pinoPretty());
  }

  prettyPrintObject(obj: any): void {
    this.getPino().info(this.colorObject(this.sanitizeObject(obj)));
  }

  error(...obj: any[]): void {
    if (!this.isEnabled) {
      return;
    }

    console.log(...obj.map((txt) => chalk.red('[RWS CLI ERROR] ' + txt)));
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
    }
  }

  private disableOriginalLogFunctions = () => {
    console.log = (...args: string[]) => { }
    console.warn = (...args: string[]) => { }
    console.error = (...args: string[]) => { }
  }

  private restoreOriginalLogFunctions = () => {
    const originalF = this.originalLogMethods;

    console.log = originalF.log;
    console.warn = originalF.warn;
    console.error = originalF.error;
  }

  updateLogLine(message: string) {
    process.stdout.write('\r' + message);
  }

  rwsLog(logCat: string | any[], logString: string | null | any = null): void {
    const logName = logString ? `[${logCat}]` : '[RWS CLI]';
    const logData = logString ? logString : logCat;

    console.log(chalk.green(logName), logData);
  }
}

export default ConsoleService.getSingleton();