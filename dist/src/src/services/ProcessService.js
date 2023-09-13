"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const child_process_1 = require("child_process");
const child_process_2 = require("child_process");
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const pm2_1 = __importDefault(require("pm2"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const UtilsService_1 = __importDefault(require("./UtilsService"));
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
    generatePM2Name(filePath) {
        return 'RWS:' + path_1.default.basename(filePath);
    }
    async PM2ExecCommand(command, commandOpts) {
        let theOpts = {
            index: 0,
            interpreter: 'none',
            exec_mode: 'fork',
            env: {
                FORCE_COLOR: '1'
            }
        };
        if (commandOpts === null || commandOpts === void 0 ? void 0 : commandOpts.options) {
            theOpts = Object.assign(theOpts, commandOpts.options);
        }
        const { index, exec_mode } = theOpts;
        const _self = this;
        return new Promise((resolve, reject) => {
            pm2_1.default.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    _self._PM2KillSelf();
                }
                const totalMemoryBytes = os_1.default.totalmem();
                const totalMemoryGB = totalMemoryBytes / (1024 * 1024 * 1024);
                let cmd;
                let args;
                if (commandOpts === null || commandOpts === void 0 ? void 0 : commandOpts.args) {
                    cmd = command;
                    args = UtilsService_1.default.filterNonEmpty(commandOpts.args);
                }
                else {
                    [cmd, ...args] = UtilsService_1.default.filterNonEmpty(command.split(' '));
                }
                if (cmd.indexOf('.js') > -1) {
                    theOpts.interpreter = 'node';
                }
                let envVars = {
                    FORCE_COLOR: '1'
                };
                const processName = `RWS:Command_${index}_${command.replace('.', '_')}`;
                const proc = {
                    script: cmd,
                    name: processName,
                    args: args,
                    cwd: process.cwd(),
                    interpreter: theOpts.interpreter,
                    autorestart: false,
                    exec_mode: exec_mode,
                    instances: 1,
                    max_memory_restart: `${Math.round(totalMemoryGB * 0.75)}G`,
                    env: envVars
                };
                pm2_1.default.start(proc, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        _self._PM2KillSelf();
                    }
                    pm2_1.default.launchBus((err, bus) => {
                        bus.on('log:out', function (packet) {
                            if (packet.process.name === processName) {
                                console.log(packet.data);
                            }
                        });
                        bus.on('log:err', function (packet) {
                            if (packet.process.name === processName) {
                                console.error(packet.data);
                            }
                        });
                        bus.on('log:warn', function (packet) {
                            if (packet.process.name === processName) {
                                warn(packet.data);
                            }
                        });
                    });
                    _self.isProcessDead(processName).then((isDead) => {
                        if (isDead) {
                            resolve(processName);
                        }
                    }).catch((e) => {
                        reject(e);
                        // _self._PM2KillSelf();
                    });
                });
            });
        });
    }
    async isProcessDead(processName, _interval = 800) {
        const _self = this;
        return new Promise((resolve, reject) => {
            const interval = setInterval(() => {
                pm2_1.default.describe(processName, (err, processDescription) => {
                    if (err) {
                        console.error(err);
                        clearInterval(interval);
                        reject(err);
                        _self._PM2KillSelf();
                        return;
                    }
                    const procInfo = processDescription[0];
                    if (procInfo && procInfo.pm2_env && procInfo.pm2_env.status === 'stopped') {
                        clearInterval(interval);
                        resolve(true);
                        pm2_1.default.disconnect();
                    }
                });
            }, _interval);
        });
    }
    _PM2KillSelf() {
        error(`[RWS PM2] R.I.P. ERROR: because of your bad programming pm2 killed itself...`);
        pm2_1.default.disconnect();
        process.exit(2);
    }
    async PM2RunCommandsInParallel(commands) {
        const _self = this;
        return new Promise(async (resolve, reject) => {
            try {
                const startPromises = commands.map((command) => _self.PM2ExecCommand(command));
                await Promise.all(startPromises);
                resolve();
            }
            catch (err) {
                console.error(err);
                reject(err);
                process.exit(2);
            }
        });
    }
    async killProcess(scriptPath) {
        const _self = this;
        return new Promise((resolve, reject) => {
            pm2_1.default.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    process.exit(2);
                }
                pm2_1.default.delete(_self.generatePM2Name(scriptPath), (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        process.exit(2);
                    }
                    resolve();
                });
            });
        });
    }
    async killRWS() {
        return new Promise((resolve, reject) => {
            pm2_1.default.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    process.exit(2);
                }
                pm2_1.default.list((err, processDescriptionList) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        process.exit(2);
                    }
                    const targetProcesses = processDescriptionList.filter((proc) => proc.name.startsWith("RWS:"));
                    const deletePromises = targetProcesses.map((proc) => new Promise((res, rej) => {
                        pm2_1.default.delete(proc.name, (err) => {
                            if (err) {
                                console.error(err);
                                rej(err);
                            }
                            res();
                        });
                    }));
                    Promise.all(deletePromises)
                        .then(() => resolve())
                        .catch((err) => {
                        console.error(err);
                        reject(err);
                        process.exit(2);
                    });
                });
            });
        });
    }
    async runShellCommand(command) {
        return new Promise((resolve, reject) => {
            const [cmd, ...args] = command.split(' ');
            const spawned = (0, child_process_2.spawn)(cmd, args, { stdio: 'inherit' }); // stdio: 'inherit' allows you to see real-time output
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
}
exports.default = ProcessService.getSingleton();
//# sourceMappingURL=ProcessService.js.map