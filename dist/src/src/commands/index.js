"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const LambdaCommand_1 = __importDefault(require("./LambdaCommand"));
const KillCommand_1 = __importDefault(require("./KillCommand"));
const InitCommand_1 = __importDefault(require("./InitCommand"));
exports.default = [
    InitCommand_1.default,
    KillCommand_1.default,
    LambdaCommand_1.default
];
//# sourceMappingURL=index.js.map