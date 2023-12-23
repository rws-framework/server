"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const crypto_1 = __importDefault(require("crypto"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const TraversalService_1 = __importDefault(require("./TraversalService"));
class MD5Service extends _service_1.default {
    async calculateFileMD5(filePath) {
        return new Promise((resolve, reject) => {
            const hash = crypto_1.default.createHash('md5');
            const input = fs_1.default.createReadStream(filePath);
            input.on('readable', () => {
                const data = input.read();
                if (data) {
                    hash.update(data);
                }
                else {
                    resolve(hash.digest('hex'));
                }
            });
            input.on('error', reject);
        });
    }
    async generateCliHashes(fileNames) {
        const md5Pack = [];
        for (const key in fileNames) {
            const fileName = fileNames[key];
            const md5 = await this.calculateFileMD5(fileName);
            md5Pack.push(md5);
        }
        return md5Pack;
    }
    async cliClientHasChanged(consoleClientHashFile, tsFilename) {
        const generatedHash = fs_1.default.readFileSync(consoleClientHashFile, 'utf-8');
        const cmdFiles = this.batchGenerateCommandFileMD5(path_1.default.resolve(process.cwd(), 'node_modules', '.rws'));
        const currentSumHashes = (await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/');
        if (generatedHash !== currentSumHashes) {
            return true;
        }
        return false;
    }
    batchGenerateCommandFileMD5(moduleCfgDir) {
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        if (!fs_1.default.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)) {
            return [];
        }
        const cmdDirPath = fs_1.default.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8');
        return TraversalService_1.default.getAllFilesInFolder(path_1.default.resolve(process.cwd()) + '/' + cmdDirPath, [
            process.cwd() + '/' + cmdDirPath + '/index.ts'
        ]);
        ;
    }
}
exports.default = MD5Service.getSingleton();
//# sourceMappingURL=MD5Service.js.map