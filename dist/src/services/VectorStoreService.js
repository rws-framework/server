"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const rws_js_server_1 = require("rws-js-server");
const VectorStore_1 = __importDefault(require("../models/convo/VectorStore"));
class VectorStoreService extends rws_js_server_1.RWSService {
    async createStore(docs, embeddings) {
        return await (new VectorStore_1.default(docs, embeddings)).init();
    }
}
exports.default = VectorStoreService.getSingleton();
//# sourceMappingURL=VectorStoreService.js.map