import IAppConfig from "./interfaces/IAppConfig";
import { AppConfigService } from "./services/AppConfigService";
import { IInitOpts } from "./services/ServerService";
declare function init(cfg: IAppConfig, serverOptions?: IInitOpts, addToConfig?: (configService: AppConfigService) => Promise<void>): Promise<void>;
export default init;
