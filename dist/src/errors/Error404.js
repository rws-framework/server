"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _error_1 = __importDefault(require("./_error"));
class Error404 extends _error_1.default {
    constructor(baseError, resourcePath, params = null) {
        super(404, baseError, params);
        this.name = '404 Resource not found';
        this.message = `Resource "${resourcePath}" was not found`;
    }
}
exports.default = Error404;
//# sourceMappingURL=Error404.js.map