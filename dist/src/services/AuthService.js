"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const _service_1 = __importDefault(require("./_service"));
/**
 * @notExported
 */
class AuthService extends _service_1.default {
    constructor() {
        super();
    }
    async authorize(token, constructor) {
        const secretKey = (0, AppConfigService_1.default)().get('secret_key');
        try {
            return await new Promise((approve, reject) => {
                jsonwebtoken_1.default.verify(token, secretKey, (error, tokenData) => {
                    if (error) {
                        reject(error);
                        return;
                    }
                    approve(new constructor(tokenData));
                });
            });
        }
        catch (e) {
            throw e;
        }
    }
}
exports.default = AuthService.getSingleton();
//# sourceMappingURL=AuthService.js.map