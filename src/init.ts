


import IAppConfig from './interfaces/IAppConfig';
import getConfigService, { AppConfigService } from './services/AppConfigService';
import ServerService, { IInitOpts, ServerControlSet } from './services/ServerService';
import ConsoleService from './services/ConsoleService';
import UtilsService from './services/UtilsService';

import fs from 'fs';
import ProcessService from './services/ProcessService';
import IAuthUser from './interfaces/IAuthUser';
import IDbUser from './interfaces/IDbUser';

async function init<PassedUser extends IDbUser>(cfg: IAppConfig, serverOptions: IInitOpts = {}, addToConfig: (configService: AppConfigService) => Promise<void> = null){    
    const AppConfigService = getConfigService(cfg);    
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    const pub_dir = await AppConfigService.get('pub_dir');
    const cors_domain = await AppConfigService.get('cors_domain');

    // const sslCert = AppConfigService.get('ssl_cert');
    // const sslKey = AppConfigService.get('ssl_key');      

    if(addToConfig !== null){
        await addToConfig(AppConfigService);
    }

    // let https = true;

    // if(!sslCert || !sslKey){
    //     https = false;
    // }

    const executeDir: string = process.cwd();
    const packageRootDir = UtilsService.findRootWorkspacePath(executeDir);
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    const moduleCfgFile = `${moduleCfgDir}/_rws_installed`;

    if(!fs.existsSync(moduleCfgFile)){        
        ConsoleService.log(ConsoleService.color().yellow('No config path generated for CLI. Trying to initialize with "yarn rws init config/config"'));
        await ProcessService.runShellCommand('yarn rws init config/config');
        UtilsService.setRWSVar('_rws_installed', 'OK');    
    }

    const rwsAppOpts = {...{        
        wsRoutes: wsRoutes,
        httpRoutes: httpRoutes,
        controllerList: controler_list,
        pub_dir: pub_dir,
        domain: `http${(await AppConfigService.get('features')?.ssl ? 's' : '')}://${await AppConfigService.get('domain')}`,
        cors_domain: cors_domain
    },...serverOptions};

    const theServer: ServerControlSet = await ServerService.initializeApp<PassedUser>(rwsAppOpts);

    const wsStart = async () => {
        return (await theServer.websocket.starter());
    };

    const httpStart = async () => {
        return (await theServer.http.starter());
    };

    wsStart();
    await httpStart();    

    return theServer;
}

export default init;
