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
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
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
            log(color().green('[RWS]') + ' Checking hashes for file:', fileName, md5);
            md5Pack.push(md5);
        }
        return md5Pack;
    }
    async cliClientHasChanged(consoleClientHashFile, tsFilename) {
        const generatedHash = fs_1.default.readFileSync(consoleClientHashFile, 'utf-8');
        log(color().green('[RWS]') + ' Comparing filesystem MD5 hashes to:', generatedHash);
        const cmdFiles = this.batchGenerateCommandFileMD5(path_1.default.resolve(process.cwd(), 'node_modules', '.rws'));
        const currentSumHashes = (await this.generateCliHashes([tsFilename, ...cmdFiles])).join('/');
        if (generatedHash !== currentSumHashes) {
            return true;
        }
        return false;
    }
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
    batchGenerateCommandFileMD5(moduleCfgDir) {
        if (!fs_1.default.existsSync(moduleCfgDir)) {
            fs_1.default.mkdirSync(moduleCfgDir);
        }
        if (!fs_1.default.existsSync(`${moduleCfgDir}/_cli_cmd_dir`)) {
            return [];
        }
        const cmdDirPath = fs_1.default.readFileSync(`${moduleCfgDir}/_cli_cmd_dir`, 'utf-8');
        return this.getAllFilesInFolder(path_1.default.resolve(process.cwd()) + '/' + cmdDirPath, [
            process.cwd() + '/' + cmdDirPath + '/index.ts'
        ]);
    }
    generatePM2Name(filePath) {
        return 'RWS:' + path_1.default.basename(filePath);
    }
    async PM2RunScript(scriptPath, commandOpts = null, ...args) {
        let theOpts = {
            index: 0,
            exec_mode: 'fork'
        };
        if (commandOpts) {
            theOpts = Object.assign(theOpts, commandOpts);
        }
        const { index, exec_mode } = theOpts;
        const _self = this;
        return new Promise((resolve, reject) => {
            pm2_1.default.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    process.exit(2);
                }
                const processName = _self.generatePM2Name(scriptPath);
                pm2_1.default.start({
                    script: scriptPath,
                    name: processName,
                    args: args,
                    cwd: process.cwd(),
                    exec_mode: exec_mode,
                    autorestart: false,
                    instances: 1,
                    max_memory_restart: `${Math.round(totalMemoryGB * 0.75)}G`,
                    env: {
                        'FORCE_COLOR': '1' // Force colorized output
                    }
                }, function (err, apps) {
                    if (err) {
                        console.error(err);
                        return pm2_1.default.disconnect();
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
                    });
                    const interval = setInterval(() => {
                        pm2_1.default.describe(processName, (err, processDescription) => {
                            if (err) {
                                console.error(err);
                                clearInterval(interval);
                                reject(err);
                                pm2_1.default.disconnect();
                                return;
                            }
                            const procInfo = processDescription[0];
                            if (procInfo && procInfo.pm2_env && procInfo.pm2_env.status === 'stopped') {
                                clearInterval(interval);
                                resolve(processName);
                                pm2_1.default.disconnect();
                            }
                        });
                    }, 1000);
                });
            });
        });
    }
    async PM2ExecCommand(command, commandOpts = null) {
        let theOpts = {
            index: 0,
            exec_mode: 'fork'
        };
        if (commandOpts) {
            theOpts = Object.assign(theOpts, commandOpts);
        }
        const { index, exec_mode } = theOpts;
        return new Promise((resolve, reject) => {
            pm2_1.default.connect((err) => {
                if (err) {
                    console.error(err);
                    reject(err);
                    process.exit(2);
                }
                const totalMemoryBytes = os_1.default.totalmem();
                const totalMemoryGB = totalMemoryBytes / (1024 * 1024 * 1024);
                const [cmd, ...args] = command.split(' ');
                const processName = `RWS:Command_${index}_${command.replace('.', '_')}`;
                const proc = {
                    script: cmd,
                    name: processName,
                    args: args,
                    cwd: process.cwd(),
                    interpreter: 'none',
                    autorestart: false,
                    exec_mode: exec_mode,
                    instances: 1,
                    max_memory_restart: `${Math.round(totalMemoryGB * 0.75)}G`,
                    env: {
                        'FORCE_COLOR': '1' // Force colorized output
                    }
                };
                pm2_1.default.start(proc, (err) => {
                    if (err) {
                        console.error(err);
                        reject(err);
                        process.exit(2);
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
                    });
                    const interval = setInterval(() => {
                        pm2_1.default.describe(processName, (err, processDescription) => {
                            if (err) {
                                console.error(err);
                                clearInterval(interval);
                                reject(err);
                                pm2_1.default.disconnect();
                                return;
                            }
                            const procInfo = processDescription[0];
                            if (procInfo && procInfo.pm2_env && procInfo.pm2_env.status === 'stopped') {
                                clearInterval(interval);
                                resolve(processName);
                                pm2_1.default.disconnect();
                            }
                        });
                    }, 1000);
                });
            });
        });
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
    setRWSVar(fileName, value) {
        const executionDir = process.cwd();
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        fs_1.default.writeFileSync(`${moduleCfgDir}/${fileName}`, value);
    }
    getRWSVar(fileName) {
        const executionDir = process.cwd();
        const moduleCfgDir = `${executionDir}/node_modules/.rws`;
        try {
            return fs_1.default.readFileSync(`${moduleCfgDir}/${fileName}`, 'utf-8');
        }
        catch (e) {
            return null;
        }
    }
}
exports.default = ProcessService.getSingleton();
//# sourceMappingURL=ProcessService.js.map