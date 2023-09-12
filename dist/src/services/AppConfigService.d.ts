import TheService from "./_service";
import IAppConfig from "../interfaces/IAppConfig";
declare const AppDefaultConfig: IAppConfig;
declare class AppConfigService extends TheService {
    private data;
    private cfgString;
    constructor(cfg: IAppConfig);
    get(key: keyof IAppConfig): any;
    reloadConfig(cfgString: string): AppConfigService;
    static getConfigSingleton<T extends new (...args: any[]) => TheService>(this: T, cfg?: IAppConfig): AppConfigService;
    setRWSVar(fileName: string, value: string): void;
    getRWSVar(fileName: string): string | null;
}
declare const _default: (cfg?: IAppConfig) => AppConfigService;
export default _default;
export { IAppConfig, AppDefaultConfig };
