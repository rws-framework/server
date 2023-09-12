"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const _service_1 = __importDefault(require("./_service"));
class UtilsService extends _service_1.default {
    filterNonEmpty(arr) {
        return arr.filter((argElement) => argElement !== '' && typeof argElement !== 'undefined' && argElement !== null);
    }
}
exports.default = UtilsService.getSingleton();
//# sourceMappingURL=UtilsService.js.map