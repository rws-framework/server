"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfigService_1 = __importDefault(require("./services/AppConfigService"));
const ServerService_1 = __importDefault(require("./services/ServerService"));
const ConsoleService_1 = __importDefault(require("./services/ConsoleService"));
const UtilsService_1 = __importDefault(require("./services/UtilsService"));
const fs_1 = __importDefault(require("fs"));
const ProcessService_1 = __importDefault(require("./services/ProcessService"));
async function init(cfg, serverOptions = {}, addToConfig = null) {
    var _a;
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const port = await AppConfigService.get('port');
    const ws_port = await AppConfigService.get('ws_port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    const pub_dir = await AppConfigService.get('pub_dir');
    const sslCert = AppConfigService.get('ssl_cert');
    const sslKey = AppConfigService.get('ssl_key');
    if (addToConfig !== null) {
        await addToConfig(AppConfigService);
    }
    let https = true;
    if (!sslCert || !sslKey) {
        https = false;
    }
    const executeDir = process.cwd();
    const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executeDir);
    const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
    const moduleCfgFile = `${moduleCfgDir}/_cfg_path`;
    if (!fs_1.default.existsSync(moduleCfgFile)) {
        ConsoleService_1.default.log(ConsoleService_1.default.color().yellow('No config path generated for CLI. Trying to initialize with "yarn rws init config/config"'));
        await ProcessService_1.default.runShellCommand('yarn rws init config/config');
    }
    const theServer = await ServerService_1.default.initializeApp({ ...{
            wsRoutes: wsRoutes,
            httpRoutes: httpRoutes,
            controllerList: controler_list,
            pub_dir: pub_dir,
            domain: `http${(await ((_a = AppConfigService.get('features')) === null || _a === void 0 ? void 0 : _a.ssl) ? 's' : '')}://${await AppConfigService.get('domain')}`
        }, ...serverOptions });
    const wsStart = async () => {
        return (await theServer.websocket.starter());
    };
    const httpStart = async () => {
        return (await theServer.http.starter());
    };
    wsStart();
    await httpStart();
}
exports.default = init;
//# sourceMappingURL=init.js.map