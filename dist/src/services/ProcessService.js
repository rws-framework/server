"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const child_process_1 = require("child_process");
const child_process_2 = require("child_process");
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const readline_1 = __importDefault(require("readline"));
const os_1 = __importDefault(require("os"));
const { log, warn, error, color } = ConsoleService_1.default;
const totalMemoryBytes = os_1.default.totalmem();
const totalMemoryKB = totalMemoryBytes / 1024;
const totalMemoryMB = totalMemoryKB / 1024;
const totalMemoryGB = totalMemoryMB / 1024;
class ProcessService extends _service_1.default {
    getParentPID(pid) {
        const command = `ps -o ppid= -p ${pid} | awk '{print $1}'`;
        return parseInt((0, child_process_1.execSync)(command).toString().trim(), 10);
    }
    getAllProcessesIds() {
        const startingPID = process.pid;
        return [startingPID, this.getParentPID(startingPID)];
    }
    async runShellCommand(command, cwd = null, silent = false) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            if (!cwd) {
                cwd = process.cwd();
            }
            const spawned = (0, child_process_2.spawn)(cmd, args, { stdio: silent ? 'ignore' : 'inherit', cwd });
            spawned.on('exit', (code) => {
                if (code !== 0) {
                    return reject(new Error(`Command failed with exit code ${code}`));
                }
                resolve();
            });
            spawned.on('error', (error) => {
                reject(error);
            });
        });
    }
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async getInput(prompt) {
        const rl = readline_1.default.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        return new Promise((resolve) => {
            rl.question(color().red('[RWS CLI Input Prompt] ' + prompt), (answer) => {
                resolve(answer);
                rl.close();
            });
        });
    }
}
exports.default = ProcessService.getSingleton();
//# sourceMappingURL=ProcessService.js.map