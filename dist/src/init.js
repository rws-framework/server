"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfigService_1 = __importDefault(require("./services/AppConfigService"));
const ServerService_1 = __importDefault(require("./services/ServerService"));
const ConsoleService_1 = __importDefault(require("./services/ConsoleService"));
async function init(cfg) {
    const AppConfigService = (0, AppConfigService_1.default)(cfg);
    const port = await AppConfigService.get('port');
    const wsRoutes = await AppConfigService.get('ws_routes');
    const httpRoutes = await AppConfigService.get('http_routes');
    const controler_list = await AppConfigService.get('controller_list');
    (await ServerService_1.default.initializeApp({
        port: port,
        wsRoutes: wsRoutes,
        httpRoutes: httpRoutes,
        controllerList: controler_list
    })).webServer().listen(port, () => {
        ConsoleService_1.default.log(ConsoleService_1.default.color().green('Server' + ` is working in port ${port}`));
    });
}
exports.default = init;
//# sourceMappingURL=init.js.map