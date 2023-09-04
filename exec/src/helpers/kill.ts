import { ConsoleService, ProcessService } from '@rws-js/server';
const { log, warn, error, color } = ConsoleService;
import path from 'path';
import fs from 'fs';

const executionDir = process.cwd();

const killAction = async (moduleCfgDir: string) => {
    const pidPathFile = `${moduleCfgDir}/pid`; 
    if(fs.existsSync(pidPathFile)){            
        const pids: string[] = fs.readFileSync(pidPathFile, 'utf-8').split(',');

        ConsoleService.warn('Fired kill for pids: ' + pids.join(', '));
        fs.unlinkSync(pidPathFile);

        ProcessService.runShellCommand(`pkill -f webpack`);

        ProcessService.runShellCommand(`pkill -f ${executionDir}/node_modules`);

        for (let pid in pids){
            ProcessService.runShellCommand(`kill ${pid}`);
        }        
        
       
    }      
}

export default killAction;