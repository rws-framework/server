"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _command_1 = __importDefault(require("./_command"));
const ConsoleService_1 = __importDefault(require("../services/ConsoleService"));
const ProcessService_1 = __importDefault(require("../services/ProcessService"));
const path_1 = __importDefault(require("path"));
const { log, warn, error, color } = ConsoleService_1.default;
const executionDir = process.cwd();
const moduleCfgDir = `${executionDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
class KillCommand extends _command_1.default {
    constructor() {
        super('kill', module);
    }
    async execute(params) {
        const scriptKillPath = params.path || params._default || null;
        if (scriptKillPath) {
            await ProcessService_1.default.killProcess(scriptKillPath);
            return;
        }
        await ProcessService_1.default.killRWS();
        return;
    }
}
exports.default = new KillCommand();
//# sourceMappingURL=KillCommand.js.map