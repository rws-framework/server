import IAppConfig from "../interfaces/IAppConfig";
import path from 'path';
import fs from 'fs';
import ProcessService from "../services/ProcessService";
interface ICmdParams {
    [key: string]: any
    verbose?: boolean
    _rws_config?: IAppConfig
}

export default abstract class TheCommand {
    private name: string;

    constructor(name: string, childModule: {id: string, loaded: boolean, exports: any, paths: any[], children: any[]}){
        this.name = name;

        const moduleCfgDir = path.resolve(process.cwd(), 'node_modules', '.rws');
        const cmdDirFile = `${moduleCfgDir}/_cli_cmd_dir`;       
        

        if(!fs.existsSync(moduleCfgDir)){
            fs.mkdirSync(moduleCfgDir);
        }
        
        const filePath:string = childModule.id;
        
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        
        if(!fs.existsSync(cmdDirFile)){
            fs.writeFileSync(cmdDirFile, cmdDir);
        }     
    }

    getSourceFilePath() {
        const err = new Error();
        if (err.stack) {
          const match = err.stack.match(/at [^\s]+ \((.*):\d+:\d+\)/);
          if (match && match[1]) {
            return match[1];
          }
        }
        return '';
    }

    execute(params: ICmdParams = null): void
    {
        throw new Error('Implement method.');
    }

    getName(): string
    {
        return this.name;
    }
}

export {ICmdParams}