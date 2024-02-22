import IAppConfig from '../interfaces/IAppConfig';
import path from 'path';
import fs from 'fs';
import UtilsService from '../services/UtilsService';

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

    public static cmdDescription: string | null = null;

    protected static _instances: { [key: string]: TheCommand } | null = {};


    constructor(name: string, childModule: {id: string, loaded: boolean, exports: any, paths: any[], children: any[]}){
        this.name = name;

        const rootPackageDir = UtilsService.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = path.resolve(rootPackageDir, 'node_modules', '.rws');
        const cmdDirFile = `${moduleCfgDir}/_cli_cmd_dir`;       
        const cmdDirFileContents: string[] = fs.existsSync(cmdDirFile) ? fs.readFileSync(cmdDirFile, 'utf-8').split('\n') : [];
        const startLength = cmdDirFileContents.length;


        if(!fs.existsSync(moduleCfgDir)){
            fs.mkdirSync(moduleCfgDir);
        }
        
        const filePath: string = childModule.id;
        
        const cmdDir = `${path.dirname(filePath)}`;        

        let finalCmdDir = path.resolve(cmdDir);        

        if(!cmdDirFileContents.includes(finalCmdDir)){
            cmdDirFileContents.push(finalCmdDir);
        }        
        
        if(startLength < cmdDirFileContents.length){
            fs.writeFileSync(cmdDirFile, cmdDirFileContents.join('\n'));
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
        };
    }
}

export {ICmdParams, ICmdParamsReturn};