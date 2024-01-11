"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RWSError {
    constructor(code, baseError = null, params = null) {
        this.stack = null;
        if (!baseError) {
            baseError = new Error('Error code ' + code);
        }
        this.code = code;
        this.baseError = baseError;
        this.stack = baseError.stack;
    }
    printFullError() {
        console.error('[RWS Error]');
        console.log(`[${this.name}] ${this.message}`);
        console.log('Stack:', this.stack);
        console.error('[/RWS Error]');
    }
    getMessage() {
        return this.message;
    }
    getCode() {
        return this.code;
    }
    getStackTraceString() {
        return this.stack;
    }
}
exports.default = RWSError;
//# sourceMappingURL=_error.js.map