"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("langchain/document_loaders/fs/text");
const text_splitter_1 = require("langchain/text_splitter");
const VectorStoreService_1 = __importDefault(require("../../services/VectorStoreService"));
const uuid_1 = require("uuid");
const chains_1 = require("langchain/chains");
class ConvoLoader {
    constructor(pathToTextFile, embeddings) {
        this._initiated = false;
        this.embeddings = embeddings;
        this.convo_id = (0, uuid_1.v4)();
        this.init(pathToTextFile);
    }
    async init(pathToTextFile) {
        this.loader = new text_1.TextLoader(pathToTextFile);
        this.docSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize: 2000, // The size of the chunk that should be split.
            chunkOverlap: 200, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
            separators: ["/n/n", "."] // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
        });
        this.docs = await this.docSplitter.splitDocuments(await this.loader.load());
        this.store = await VectorStoreService_1.default.createStore(this.docs, this.embeddings);
        this._initiated = true;
    }
    getId() {
        return this.convo_id;
    }
    getDocs() {
        return this.docs;
    }
    getStore() {
        return this.store;
    }
    isInitiated() {
        return this._initiated;
    }
    async chain(promptTemplate, promptVars) {
        if (!this.llmChain) {
            this.createChain({
                llm: this.getLLMClient(),
                prompt: promptTemplate
            });
        }
        return this.llmChain;
    }
    async createChain(input) {
        this.llmChain = new chains_1.LLMChain(input);
        return this.llmChain;
    }
    async waitForInit() {
        const _self = this;
        return new Promise((resolve, reject) => {
            let i = 0;
            const interval = setInterval(() => {
                if (this.isInitiated()) {
                    clearInterval(interval);
                    resolve(_self);
                }
                if (i > 9) {
                    clearInterval(interval);
                    reject(false);
                }
                i++;
            }, 300);
        });
    }
    setLLMClient(client) {
        this.llmClient = client;
        return this;
    }
    getLLMClient() {
        return this.llmClient;
    }
}
exports.default = ConvoLoader;
//# sourceMappingURL=ConvoLoader.js.map