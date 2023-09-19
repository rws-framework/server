import TheService from "./_service";
import IAppConfig from "../interfaces/IAppConfig";
declare class AppConfigService extends TheService {
    private data;
    private cfgString;
    constructor(cfg: IAppConfig);
    get(key: keyof IAppConfig): any;
    reloadConfig(cfgString: string): AppConfigService;
    static getConfigSingleton<T extends new (...args: any[]) => TheService>(this: T, cfg?: IAppConfig): AppConfigService;
}
declare const _default: (cfg?: IAppConfig) => AppConfigService;
export default _default;
export { IAppConfig };
