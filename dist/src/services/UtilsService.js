"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class UtilsService extends _service_1.default {
    filterNonEmpty(arr) {
        return arr.filter((argElement) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
    }
    isInterface(func) {
        return typeof func === 'function';
    }
    getRWSVar(fileName) {
        const executionDir = process.cwd();
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
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
        const executionDir = process.cwd();
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
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
}
exports.default = UtilsService.getSingleton();
//# sourceMappingURL=UtilsService.js.map