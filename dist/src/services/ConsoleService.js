"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
const chalk_1 = __importDefault(require("chalk"));
const pino_1 = __importDefault(require("pino"));
const pino_pretty_1 = __importDefault(require("pino-pretty")); // Import pino-pretty
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
        const _self = this;
        let typeBucket = [];
        let lastType = null;
        obj.forEach((elem, index) => {
            const elemType = typeof elem;
            const isLast = index == obj.length - 1;
            if (((lastType === null && obj.length === 1) || (lastType !== null && lastType !== elemType)) || isLast) {
                if (lastType === 'string') {
                    console.log(typeBucket.join(' '));
                }
                else {
                    typeBucket.forEach((bucketElement) => {
                        _self.prettyPrintObject(bucketElement);
                    });
                }
                typeBucket = [];
                if (isLast) {
                    if (elemType === 'string') {
                        console.log(elem);
                    }
                    else {
                        _self.prettyPrintObject(elem);
                    }
                    return;
                }
            }
            typeBucket.push(elem);
            lastType = elemType; // Update the lastType for the next iteration
        });
    }
    colorObject(obj) {
        const _JSON_COLORS = {
            'keys': 'green',
            'objectValue': 'magenta',
            'braces': 'blue',
            'arrayBraces': 'yellow',
            'colons': 'white', // Color for colons
            'default': 'reset' // Default color to reset to default chalk color
        };
        const getCodeColor = (chalkKey, textValue) => {
            return chalk_1.default[chalkKey](textValue);
        };
        const objString = JSON.stringify(this.sanitizeObject(obj), null, 2);
        const lines = objString.split('\n');
        const coloredLines = [];
        for (const line of lines) {
            const parts = line.split(/("[^"]*"\s*:\s*)|("[^"]*":\s*)|([{}[\],])/); // Split the line into parts around keys, colons, commas, braces, and brackets
            // Process each part and colorize accordingly
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (part !== undefined) {
                    const trimmedPart = part.trim();
                    if (trimmedPart === ':') {
                        // This part is a colon, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ':');
                    }
                    else if (trimmedPart === ',') {
                        // This part is a comma, colorize it with white
                        parts[i] = getCodeColor(_JSON_COLORS.colons, ',');
                    }
                    else if (trimmedPart === '[' || trimmedPart === ']') {
                        // This part is a bracket, colorize it with the arrayBraces color
                        parts[i] = getCodeColor(_JSON_COLORS.arrayBraces, part);
                    }
                    else if (i % 4 === 1) {
                        // This part is a key, colorize it with the keys color
                        const key = trimmedPart;
                        if (key === ':') {
                            parts[i] = getCodeColor(_JSON_COLORS.colons, key);
                        }
                        else {
                            parts[i] = getCodeColor(_JSON_COLORS.keys, key);
                        }
                    }
                    else if (i % 4 === 3) {
                        // This part is a value, colorize it with objectValue
                        const value = trimmedPart;
                        parts[i] = getCodeColor(_JSON_COLORS.objectValue, value);
                    }
                }
            }
            coloredLines.push(parts.join('')); // Join and add the modified line to the result
        }
        return coloredLines.join('\n'); // Join the colored lines and return as a single string
    }
    warn(...obj) {
        if (!this.isEnabled) {
            return;
        }
        console.log(...obj.map((txt) => chalk_1.default.yellowBright('[RWS CLI WARNING] ' + txt)));
    }
    sanitizeObject(obj) {
        const sensitiveKeys = ["mongo_url", "mongo_db", "ssl_cert", "ssl_key", "secret_key", "aws_access_key", "aws_secret_key"];
        const sanitizedObj = { ...obj }; // Create a shallow copy of the object
        for (const key of sensitiveKeys) {
            if (sanitizedObj.hasOwnProperty(key)) {
                sanitizedObj[key] = "<VALUE HIDDEN>";
            }
        }
        return sanitizedObj;
    }
    getPino() {
        return (0, pino_1.default)((0, pino_pretty_1.default)());
    }
    prettyPrintObject(obj) {
        this.getPino().info(this.colorObject(this.sanitizeObject(obj)));
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