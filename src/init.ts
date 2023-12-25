


import IAppConfig from "./interfaces/IAppConfig";
import getConfigService from "./services/AppConfigService";
import ServerService from "./services/ServerService";
import ConsoleService from "./services/ConsoleService";
import UtilsService from "./services/UtilsService";

import fs from "fs";
import ProcessService from "./services/ProcessService";


async function init(cfg: IAppConfig){    
    const AppConfigService = getConfigService(cfg);
    const port = await AppConfigService.get('port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    const pub_dir = await AppConfigService.get('pub_dir');

    const sslCert = AppConfigService.get('ssl_cert');
    const sslKey = AppConfigService.get('ssl_key');      

    let https = true;

    if(!sslCert || !sslKey){
        https = false;
    }

    const executeDir: string = process.cwd();
    const packageRootDir = UtilsService.findRootWorkspacePath(executeDir)
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    const moduleCfgFile = `${moduleCfgDir}/_cfg_path`;

    if(!fs.existsSync(moduleCfgFile )){        
        ConsoleService.log(ConsoleService.color().yellow('No config path generated for CLI. Trying to initialize with "yarn rws init config/config"'));
        await ProcessService.runShellCommand('yarn rws init config/config');
    }

    (await ServerService.initializeApp({
        port: port,
        wsRoutes: wsRoutes,
        httpRoutes: httpRoutes,
        controllerList: controler_list,
        pub_dir: pub_dir,
    })).webServer().listen(port, () => {    
        ConsoleService.log(ConsoleService.color().green('Server' + ` is working on port ${port} using HTTP${https ? 'S' : ''} protocol`));
    });
}

export default init;
