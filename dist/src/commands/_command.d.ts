import IAppConfig from "../interfaces/IAppConfig";
interface ICmdParams {
    [key: string]: any;
    verbose?: boolean;
    _rws_config?: IAppConfig;
    _extra_args: {
        [key: string]: any;
    };
}
interface ICmdParamsReturn {
    subCmd: string;
    apiCmd: string;
    apiArg: string;
    extraParams: {
        [key: string]: any;
    };
}
export default abstract class TheCommand {
    name: string;
    protected static _instances: {
        [key: string]: TheCommand;
    } | null;
    constructor(name: string, childModule: {
        id: string;
        loaded: boolean;
        exports: any;
        paths: any[];
        children: any[];
    });
    getSourceFilePath(): string;
    execute(params?: ICmdParams): Promise<void>;
    getName(): string;
    static createCommand<T extends new (...args: any[]) => TheCommand>(this: T): InstanceType<T>;
    getCommandParameters(params: ICmdParams): ICmdParamsReturn;
}
export { ICmdParams, ICmdParamsReturn };
