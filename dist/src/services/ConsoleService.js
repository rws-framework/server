"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const chalk_1 = __importDefault(require("chalk"));
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
        console.warn(...obj.map((elem) => '[RWS CLI] ' + (typeof elem === 'object' && elem !== null ? this.prettyPrintObject(elem) : elem)));
    }
    prettyPrintObject(obj) {
        const _JSON_COLORS = {
            'keys': 'green'
        };
        const objString = JSON.stringify(obj, null, 2);
        const lines = objString.split('\n');
        for (const line of lines) {
            if (line.includes('{') || line.includes('}')) {
                console.log(chalk_1.default.blue(line)); // Colorize braces in blue
            }
            else if (line.includes(':')) {
                const [key, value] = line.split(':');
                console.log(chalk_1.default[_JSON_COLORS.keys](key) + ':' + chalk_1.default.yellow(value)); // Colorize keys in green and values in yellow
            }
            else {
                console.log(line); // Log other lines without colorization
            }
        }
    }
    error(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.log(...obj.map((txt) => chalk_1.default.red('[RWS CLI ERROR] ' + txt)));
    }
    stopLogging() {
        this.isEnabled = false;
        this.disableOriginalLogFunctions();
    }
    startLogging() {
        this.isEnabled = true;
        this.restoreOriginalLogFunctions();
    }
    updateLogLine(message) {
        process.stdout.write('\r' + message);
    }
    rwsLog(logCat, logString = null) {
        const logName = logString ? `[${logCat}]` : '[RWS CLI]';
        const logData = logString ? logString : logCat;
        console.log(chalk_1.default.green(logName), logData);
    }
}
exports.default = ConsoleService.getSingleton();
//# sourceMappingURL=ConsoleService.js.map