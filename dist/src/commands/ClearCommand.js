"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _command_1 = __importDefault(require("./_command"));
const ConsoleService_1 = __importDefault(require("../services/ConsoleService"));
const promises_1 = require("fs/promises");
const path_1 = __importDefault(require("path"));
const UtilsService_1 = __importDefault(require("../services/UtilsService"));
const { log, warn, error, color } = ConsoleService_1.default;
const executionDir = process.cwd();
const packageRootDir = UtilsService_1.default.findRootWorkspacePath(executionDir);
const moduleCfgDir = `${packageRootDir}/node_modules/.rws`;
const cfgPathFile = `${moduleCfgDir}/_cfg_path`;
const moduleDir = path_1.default.resolve(path_1.default.dirname(module.id), '..', '..').replace('dist', '');
class ClearCommand extends _command_1.default {
    constructor() {
        super('clear', module);
    }
    async removeDirRecursively(path) {
        try {
            await (0, promises_1.rmdir)(path, { recursive: true });
            console.log(`Directory at ${path} removed successfully`);
        }
        catch (error) {
            console.error(`Error while removing directory: ${error}`);
        }
    }
    async execute(params) {
        ConsoleService_1.default.log('clearing systems...');
        await this.removeDirRecursively(moduleCfgDir);
        ConsoleService_1.default.log(color().green('[RWS]') + ' systems cleared. Use npx rws init to reinitialize.');
    }
}
exports.default = ClearCommand.createCommand();
//# sourceMappingURL=ClearCommand.js.map