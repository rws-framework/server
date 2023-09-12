"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDefaultConfig = void 0;
const _service_1 = __importDefault(require("./_service"));
const fs_1 = __importDefault(require("fs"));
const AppDefaultConfig = {
    mongo_url: null,
    mongo_db: null,
    port: null,
    test_port: null,
    domain: null,
    ssl_cert: null,
    ssl_key: null,
    secret_key: null,
    user_class: null,
    user_models: [],
    controller_list: [],
    ws_routes: {},
    http_routes: [],
    commands: [],
    aws_lambda_region: null,
    aws_access_key: null,
    aws_secret_key: null,
    aws_lambda_role: null,
    aws_lambda_bucket: null
};
exports.AppDefaultConfig = AppDefaultConfig;
class AppConfigService extends _service_1.default {
    constructor(cfg) {
        super();
        this.data = cfg;
    }
    get(key) {
        return this.data[key];
    }
    reloadConfig(cfgString) {
        const cfg = (require(cfgString)).defaults;
        this.data = cfg();
        return this;
    }
    static getConfigSingleton(cfg) {
        const className = this.name;
        const instanceExists = _service_1.default._instances[className];
        if (cfg) {
            _service_1.default._instances[className] = new this(cfg);
        }
        else if (!instanceExists && !cfg) {
            _service_1.default._instances[className] = new this(AppDefaultConfig);
        }
        return _service_1.default._instances[className];
    }
    setRWSVar(fileName, value) {
        const executionDir = process.cwd();
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        fs_1.default.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
    getRWSVar(fileName) {
        const executionDir = process.cwd();
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    }
}
exports.default = (cfg) => AppConfigService.getConfigSingleton(cfg);
//# sourceMappingURL=AppConfigService.js.map