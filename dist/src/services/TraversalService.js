"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
class TraversalService extends _service_1.default {
    getAllFilesInFolder(folderPath, ignoreFilenames = [], recursive = false) {
        const files = [];
        function traverseDirectory(currentPath) {
            const entries = fs_1.default.readdirSync(currentPath, { withFileTypes: true });
            entries.forEach(entry => {
                const entryPath = path_1.default.join(currentPath, entry.name);
                if (entry.isFile()) {
                    if (!ignoreFilenames.includes(entryPath)) {
                        files.push(entryPath);
                    }
                }
                else if (entry.isDirectory() && recursive) {
                    traverseDirectory(entryPath);
                }
            });
        }
        traverseDirectory(folderPath);
        return files;
    }
}
exports.default = TraversalService.getSingleton();
//# sourceMappingURL=TraversalService.js.map