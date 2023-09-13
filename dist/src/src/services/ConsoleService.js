"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const chalk_1 = __importDefault(require("chalk"));
const progress_1 = __importDefault(require("progress"));
class ConsoleService extends _service_1.default {
    constructor() {
        super();
        this.isEnabled = true;
        this.originalLogMethods = null;
        this.getOriginalLogFunctions = () => {
            return {
                log: console.log,
                warn: console.warn,
                error: console.error,
            };
        };
        this.disableOriginalLogFunctions = () => {
            console.log = (...args) => { };
            console.warn = (...args) => { };
            console.error = (...args) => { };
        };
        this.restoreOriginalLogFunctions = () => {
            const originalF = this.originalLogMethods;
            console.log = originalF.log;
            console.warn = originalF.warn;
            console.error = originalF.error;
        };
        this.log = this.log.bind(this);
        this.error = this.error.bind(this);
        this.warn = this.warn.bind(this);
        this.isEnabled = true;
        this.originalLogMethods = this.getOriginalLogFunctions();
    }
    color() {
        return chalk_1.default;
    }
    log(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.log(...obj);
    }
    warn(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.warn(...obj.map((txt) => chalk_1.default.yellowBright(txt)));
    }
    error(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.error(...obj.map((txt) => chalk_1.default.red(txt)));
    }
    stopLogging() {
        this.isEnabled = false;
        this.disableOriginalLogFunctions();
    }
    startLogging() {
        this.isEnabled = true;
        this.restoreOriginalLogFunctions();
    }
    AWSProgressBar(managedUpload) {
        const _self = this;
        try {
            const bar = new progress_1.default('Uploading [:bar] :percent :etas', {
                complete: '=',
                incomplete: ' ',
                width: 40,
                total: 100
            });
            managedUpload.on('httpUploadProgress', function (event) {
                const percent = Math.floor((event.loaded / event.total) * 100);
                console.log(percent + '%');
                bar.update(percent / 100);
                bar.render();
            });
            return bar;
        }
        catch (err) {
            throw err;
        }
    }
    updateLogLine(message) {
        process.stdout.write('\r' + message);
    }
    rwsLog(logCat, logString = null) {
        const logName = logString ? logCat : '[RWS CLI]';
        const logData = logString ? logString : logCat;
        console.log(chalk_1.default.green(logName) + ' ' + logData);
    }
}
exports.default = ConsoleService.getSingleton();
//# sourceMappingURL=ConsoleService.js.map