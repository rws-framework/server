import TheService from "./_service";
import chalk from 'chalk';
import ProgressBar from 'progress';
import AWS from 'aws-sdk';

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

      console.warn(...obj.map((txt) => chalk.yellowBright(txt)));
    }

    error(...obj: any[]): void
    {
      if(!this.isEnabled){
        return;
      }

      console.error(...obj.map((txt) => chalk.red(txt)));
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

    AWSProgressBar(managedUpload: AWS.S3.ManagedUpload): ProgressBar
    {

      const _self = this;

      try {        
        const bar = new ProgressBar('Uploading [:bar] :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 40,
          total: 100
        });                   
      
        managedUpload.on('httpUploadProgress', function (event) {          
          const percent = Math.floor((event.loaded / event.total) * 100);
           console.log(percent + '%');

          bar.update(percent / 100);
          bar.render();
        });           
        
        return bar;
      } catch (err: Error | any) {
        throw err;
      }
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
}

export default ConsoleService.getSingleton();