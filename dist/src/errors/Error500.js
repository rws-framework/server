"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _error_1 = __importDefault(require("./_error"));
class Error500 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(500, baseError, params);
        this.name = '500 internal server error';
        this.message = `RWS resource "$${resourcePath}" has internal error`;
    }
}
exports.default = Error500;
//# sourceMappingURL=Error500.js.map