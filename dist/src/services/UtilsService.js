"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const source_map_1 = require("source-map");
class UtilsService extends _service_1.default {
    filterNonEmpty(arr) {
        return arr.filter((argElement) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
    }
    isInterface(func) {
        return typeof func === 'function';
    }
    getRWSVar(fileName) {
        const packageDir = this.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(`${moduleCfgDir}/${fileName}`)) {
            return;
        }
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    }
    setRWSVar(fileName, value) {
        const packageDir = this.findRootWorkspacePath(process.cwd());
        const moduleCfgDir = `${packageDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        fs_1.default.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
    findRootWorkspacePath(currentPath) {
        const parentPackageJsonPath = path_1.default.join(currentPath + '/..', 'package.json');
        const parentPackageDir = path_1.default.dirname(parentPackageJsonPath);
        if (fs_1.default.existsSync(parentPackageJsonPath)) {
            const packageJson = JSON.parse(fs_1.default.readFileSync(parentPackageJsonPath, 'utf-8'));
            if (packageJson.workspaces) {
                return this.findRootWorkspacePath(parentPackageDir);
            }
        }
        return currentPath;
    }
    async getCurrentLineNumber(error = null) {
        if (!error) {
            error = new Error();
        }
        const stack = error.stack || '';
        const stackLines = stack.split('\n');
        const relevantLine = stackLines[1];
        // Extract file path from the stack line
        const match = relevantLine.match(/\((.*?):\d+:\d+\)/);
        if (!match)
            return -1;
        const filePath = match[1];
        // Assuming the source map is in the same directory with '.map' extension
        const sourceMapPath = `${filePath}.map`;
        // Read the source map
        const sourceMapContent = fs_1.default.readFileSync(sourceMapPath, 'utf-8');
        const sourceMap = JSON.parse(sourceMapContent);
        const consumer = await new source_map_1.SourceMapConsumer(sourceMap);
        // Extract line and column number
        const lineMatch = relevantLine.match(/:(\d+):(\d+)/);
        if (!lineMatch)
            return -1;
        const originalPosition = consumer.originalPositionFor({
            line: parseInt(lineMatch[1]),
            column: parseInt(lineMatch[2]),
        });
        return originalPosition.line;
    }
}
exports.default = UtilsService.getSingleton();
//# sourceMappingURL=UtilsService.js.map