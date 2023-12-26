import IAppConfig from "./interfaces/IAppConfig";
import { AppConfigService } from "./services/AppConfigService";
declare function init(cfg: IAppConfig, addToConfig?: (configService: AppConfigService) => Promise<void>): Promise<void>;
export default init;
