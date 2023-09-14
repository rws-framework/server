"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const archiver_1 = __importDefault(require("archiver"));
const { log, warn, error, color, AWSProgressBar } = ConsoleService_1.default;
const defaultZipParams = {
    recursive: true,
    format: 'zip',
    ignore: []
};
class ZipService extends _service_1.default {
    constructor() {
        super();
    }
    async createArchive(outputPath, sourcePath, params = null) {
        if (params) {
            params = Object.assign(defaultZipParams, params);
        }
        else {
            params = defaultZipParams;
        }
        const archive = (0, archiver_1.default)(params.format);
        const output = fs_1.default.createWriteStream(outputPath);
        archive.pipe(output);
        // archive.directory(sourcePath, params.recursive ? false : params.destpath);
        archive.glob('**/*', {
            cwd: sourcePath,
            dot: true,
            ignore: params.ignore
        });
        log(`${color().green('[RWS Lambda Service]')} ZIP params:`);
        log(params);
        return new Promise((resolve, reject) => {
            archive.on('error', reject);
            output.on('close', () => {
                log(`Files in archive: ${archive.pointer()} bytes`);
                resolve(outputPath);
            });
            output.on('error', reject);
            archive.finalize();
        });
    }
    listFilesInDirectory(directoryPath) {
        const files = fs_1.default.readdirSync(directoryPath);
        const filePaths = [];
        files.forEach(file => {
            const fullPath = path_1.default.join(directoryPath, file);
            const stats = fs_1.default.statSync(fullPath);
            if (stats.isFile()) {
                filePaths.push(fullPath);
            }
        });
        return filePaths;
    }
}
exports.default = ZipService.getSingleton();
//# sourceMappingURL=ZipService.js.map