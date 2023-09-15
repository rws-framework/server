import TheService from "./_service";
import chalk from 'chalk';
import AWS from 'aws-sdk';

interface IJSONColors {
  [codeLement: string]: string
}

class ConsoleService extends TheService
{
    private isEnabled: boolean = true;
    private originalLogMethods?: any = null;    

    constructor()
    {
      super();

      this.log = this.log.bind(this);
      this.error = this.error.bind(this);
      this.warn = this.warn.bind(this);

      this.isEnabled = true;
      this.originalLogMethods = this.getOriginalLogFunctions();   
    }


    color(): any
    {  
      return chalk;
    }

    log(...obj: any[]): void
    {
      if(!this.isEnabled){
        return;
      }

      console.log(...obj);
    }

    warn(...obj: any[]): void
    {
      if(!this.isEnabled){
        return;
      }

      console.warn(...obj.map((elem) => '[RWS CLI] ' + (typeof elem === 'object' && elem !== null ? this.prettyPrintObject(elem) : elem)));
    }

    prettyPrintObject(obj: object): void {
      const _JSON_COLORS: IJSONColors = {
        'keys': 'green'
      }

      const objString = JSON.stringify(obj, null, 2);
      const lines = objString.split('\n');
  
      for (const line of lines) {
          if (line.includes('{') || line.includes('}')) {
              console.log(chalk.blue(line));  // Colorize braces in blue
          } else if (line.includes(':')) {
              const [key, value] = line.split(':');
              console.log(chalk[_JSON_COLORS.keys](key) + ':' + chalk.yellow(value));  // Colorize keys in green and values in yellow
          } else {
              console.log(line);  // Log other lines without colorization
          }
      }
    }

    error(...obj: any[]): void
    {
      if(!this.isEnabled){
        return;
      }
      
      console.log(...obj.map((txt) => chalk.red('[RWS CLI ERROR] ' + txt)));
    }

    stopLogging(): void
    {
      this.isEnabled = false;
      this.disableOriginalLogFunctions();
    }

    startLogging(): void
    {
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
      console.log = (...args: string[]) => {}
      console.warn = (...args: string[]) => {}
      console.error = (...args: string[]) => {}
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

    rwsLog(logCat: string | any[], logString: string | null = null): void
    {    
      const logName = logString ? `[${logCat}]` : '[RWS CLI]';
      const logData = logString ? logString : logCat;

      console.log(chalk.green(logName), logData);
    }
}

export default ConsoleService.getSingleton();