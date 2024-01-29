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
const errors_1 = require("../../errors");
class ConvoLoader {
    constructor(embeddings, convoId = null) {
        this._initiated = false;
        this.embeddings = embeddings;
        if (convoId === null) {
            this.convo_id = ConvoLoader.uuid();
        }
        else {
            this.convo_id = convoId;
        }
    }
    static uuid() {
        return (0, uuid_1.v4)();
    }
    async init(pathToTextFile, chunkSize = 2000, chunkOverlap = 200, separators = ["/n/n", "."]) {
        this.loader = new text_1.TextLoader(pathToTextFile);
        this.docSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
            chunkSize, // The size of the chunk that should be split.
            chunkOverlap, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
            separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
        });
        this.docs = await this.docSplitter.splitDocuments(await this.loader.load());
        this.store = await VectorStoreService_1.default.createStore(this.docs, this.embeddings);
        this._initiated = true;
        return this;
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
    setLLMClient(client) {
        this.llmClient = client;
        return this;
    }
    getLLMClient() {
        return this.llmClient;
    }
    setPrompt(prompt) {
        this.thePrompt = prompt;
        return this;
    }
    async chain(hyperParamsMap = {
        temperature: 'temperature',
        topK: 'top_k',
        topP: 'top_p',
        maxTokens: 'max_tokens_to_sample'
    }) {
        if (!this.thePrompt) {
            throw new errors_1.Error500(new Error('No prompt initialized for conversation'), __filename);
        }
        const hyperParams = {
            temperature: null,
            topK: null,
            topP: null,
            maxTokens: null
        };
        for (const key in hyperParamsMap) {
            const index = key;
            hyperParams[index] = this.thePrompt.getHyperParameter(hyperParamsMap[key]);
        }
        const chainParams = {
            llm: this.getLLMClient(),
            prompt: this.thePrompt.getMultiTemplate(),
            hyperparameters: hyperParams
        };
        if (!this.llmChain) {
            this.createChain(chainParams);
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
                    reject(null);
                }
                i++;
            }, 300);
        });
    }
}
exports.default = ConvoLoader;
//# sourceMappingURL=ConvoLoader.js.map