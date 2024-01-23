"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const faiss_1 = require("@langchain/community/vectorstores/faiss");
class RWSVectorStore {
    constructor(docs, embeddings) {
        this.docs = docs;
        this.embeddings = embeddings;
    }
    async init() {
        this.faiss = await faiss_1.FaissStore.fromDocuments(this.docs, this.embeddings);
        return this;
    }
    getFaiss() {
        return this.faiss;
    }
}
exports.default = RWSVectorStore;
//# sourceMappingURL=VectorStore.js.map