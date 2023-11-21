import IAppConfig from "../interfaces/IAppConfig";
import path from 'path';
import fs from 'fs';

interface ICmdParams {
    [key: string]: any
    verbose?: boolean
    _rws_config?: IAppConfig
    _extra_args: {
        [key: string]: any
    }
}

interface ICmdParamsReturn {
    subCmd: string;
    apiCmd: string;
    apiArg: string;
    extraParams: {
        [key: string]: any
    };
}

export default abstract class TheCommand {
    public name: string;
    protected static _instances: { [key: string]: TheCommand } | null = {};


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

    async execute(params: ICmdParams = null): Promise<void>
    {
        throw new Error('Implement method.');
    }

    getName(): string
    {
        return this.name;
    }

    public static createCommand<T extends new (...args: any[]) => TheCommand>(this: T): InstanceType<T> {
        const className = this.name;        

        if (!TheCommand._instances[className]) {
            TheCommand._instances[className] = new this();
        }

        return TheCommand._instances[className] as InstanceType<T>;
    }

    getCommandParameters(params: ICmdParams): ICmdParamsReturn
    {
        const cmdString: string = params.cmdString || params._default;
        const cmdStringArr: string[] = cmdString.split(':');        
        const subCmd: string = cmdStringArr[0];
        const apiCmd = cmdStringArr[1];    
        const apiArg = cmdStringArr.length > 2 ? cmdStringArr[2] : null;    
        const extraParams = params._extra_args.deploy_loader;

        return {
            subCmd,
            apiCmd,
            apiArg,
            extraParams
        }
    }
}

export {ICmdParams}