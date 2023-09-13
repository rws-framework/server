"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class TheCommand {
    constructor(name, childModule) {
        this.name = name;
        const moduleCfgDir = path_1.default.resolve(process.cwd(), 'node_modules', '.rws');
        const cmdDirFile = `${moduleCfgDir}/_cli_cmd_dir`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        const filePath = childModule.id;
        const cmdDir = filePath.replace('./', '').replace(/\/[^/]*\.ts$/, '');
        if (!fs_1.default.existsSync(cmdDirFile)) {
            fs_1.default.writeFileSync(cmdDirFile, cmdDir);
        }
    }
    getSourceFilePath() {
        const err = new Error();
        if (err.stack) {
            const match = err.stack.match(/at [^\s]+ \((.*):\d+:\d+\)/);
            if (match && match[1]) {
                return match[1];
            }
        }
        return '';
    }
    async execute(params = null) {
        throw new Error('Implement method.');
    }
    getName() {
        return this.name;
    }
}
exports.default = TheCommand;
//# sourceMappingURL=_command.js.map