


import IAppConfig from "./interfaces/IAppConfig";
import getConfigService from "./services/AppConfigService";
import ServerService from "./services/ServerService";
import ConsoleService from "./services/ConsoleService";


async function init(cfg: IAppConfig){    
    const AppConfigService = getConfigService(cfg);
    const port = await AppConfigService.get('port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');

    (await ServerService.initializeApp({
        port: port,
        wsRoutes: wsRoutes,
        httpRoutes: httpRoutes,
        controllerList: controler_list    
    })).webServer().listen(port, () => {    
        ConsoleService.log(ConsoleService.color().green('Server' + ` is working in port ${port}`));
    });
}

export default init;
