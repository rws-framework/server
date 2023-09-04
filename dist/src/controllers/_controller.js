"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("../services/_service"));
/**
 * @category Core extendable objects
 */
class Controller extends _service_1.default {
    constructor() {
        super();
    }
    static prepareResponse(data) {
        return JSON.stringify(data);
    }
}
exports.default = Controller;
//# sourceMappingURL=_controller.js.map