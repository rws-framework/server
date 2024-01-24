"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("../services/_service"));
const Error404_1 = __importDefault(require("../errors/Error404"));
const Error500_1 = __importDefault(require("../errors/Error500"));
/**
 * @category Core extendable objects
 */
class Controller extends _service_1.default {
    constructor() {
        super();
    }
    callMethod(methodName) {
        return (params) => {
            if ((!this[methodName])) {
                const error = new Error404_1.default(new Error('The method does not exist in controller.'), `${__filename}::${methodName}`);
                return error;
            }
            try {
                return this[methodName](params);
            }
            catch (e) {
                const error = new Error500_1.default(e, `${__filename}::${methodName}`, params);
                return error;
            }
        };
    }
    hasError() {
        const hasError = this._hasError;
        this._hasError = false;
        return hasError;
    }
    flagError() {
        this._hasError = true;
    }
}
exports.default = Controller;
//# sourceMappingURL=_controller.js.map