"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RWSError {
    constructor(baseError, params = null) {
        this.stack = null;
        this.baseError = baseError;
    }
    printFullError() {
        console.error('[RWS Error]');
        console.log(`[${this.name}] ${this.message}`);
        console.log(this.stack);
        console.error('[/RWS Error]');
    }
    getMessage() {
        return this.message;
    }
}
exports.default = RWSError;
//# sourceMappingURL=_error.js.map