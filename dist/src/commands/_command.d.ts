import IAppConfig from "../interfaces/IAppConfig";
interface ICmdParams {
    [key: string]: any;
    verbose?: boolean;
    _rws_config?: IAppConfig;
}
export default abstract class TheCommand {
    private name;
    constructor(name: string, childModule: {
        id: string;
        loaded: boolean;
        exports: any;
        paths: any[];
        children: any[];
    });
    getSourceFilePath(): string;
    execute(params?: ICmdParams): void;
    getName(): string;
}
export { ICmdParams };
