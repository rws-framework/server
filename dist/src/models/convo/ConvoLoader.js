"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("langchain/document_loaders/fs/text");
const text_splitter_1 = require("langchain/text_splitter");
const VectorStoreService_1 = __importDefault(require("../../services/VectorStoreService"));
const messages_1 = require("@langchain/core/messages");
const uuid_1 = require("uuid");
const AppConfigService_1 = __importDefault(require("../../services/AppConfigService"));
const chains_1 = require("langchain/chains");
const errors_1 = require("../../errors");
const xml2js_1 = __importDefault(require("xml2js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class ConvoLoader {
    constructor(chatConstructor, embeddings, convoId = null) {
        this._initiated = false;
        this.embeddings = embeddings;
        if (convoId === null) {
            this.convo_id = ConvoLoader.uuid();
        }
        else {
            this.convo_id = convoId;
        }
        this.chatConstructor = chatConstructor;
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
        this.store = await VectorStoreService_1.default.createStore(this.docs, await this.embeddings.generateEmbeddings());
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
        this.llmChat = new this.chatConstructor({
            region: (0, AppConfigService_1.default)().get('aws_bedrock_region'),
            credentials: {
                accessKeyId: (0, AppConfigService_1.default)().get('aws_access_key'),
                secretAccessKey: (0, AppConfigService_1.default)().get('aws_secret_key'),
            },
            model: "anthropic.claude-v2",
            maxTokens: prompt.getHyperParameter('max_tokens_to_sample'),
            temperature: prompt.getHyperParameter('temperature'),
            modelKwargs: {
                top_p: prompt.getHyperParameter('top_p'),
                top_k: prompt.getHyperParameter('top_k'),
            }
        });
        return this;
    }
    getChat() {
        return this.llmChat;
    }
    async call(values, cfg, debugCallback = null) {
        const output = await (await this.chain()).call(values, cfg);
        await this.thePrompt.listen(output.text);
        await this.debugCall(debugCallback);
        return this.thePrompt;
    }
    async callChat(content, embeddingsEnabled = true, debugCallback = null) {
        if (embeddingsEnabled) {
            const embeddings = await this.embeddings.generateEmbeddings(content);
            await this.embeddings.storeEmbeddings(embeddings, this.getId());
        }
        const response = await this.llmChat.invoke([
            new messages_1.HumanMessage({ content }),
        ]);
        await this.thePrompt.listen(response.content);
        await this.debugCall(debugCallback);
        return this.thePrompt;
    }
    async debugCall(debugCallback = null) {
        try {
            const debug = this.initDebugFile();
            let callData = debug.xml;
            callData.conversation.message.push(this.thePrompt.toJSON());
            if (debugCallback) {
                callData = await debugCallback(callData);
            }
            this.debugSave(callData);
        }
        catch (error) {
            console.log(error);
        }
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
    parseXML(xml, callback) {
        const parser = new xml2js_1.default.Parser();
        parser.parseString(xml, callback);
        return parser;
    }
    static debugConvoDir() {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations');
    }
    debugConvoFile() {
        return `${ConvoLoader.debugConvoDir()}/${this.getId()}.xml`;
    }
    initDebugFile() {
        let xmlContent;
        let debugXML = null;
        const convoDir = ConvoLoader.debugConvoDir();
        if (!fs_1.default.existsSync(convoDir)) {
            fs_1.default.mkdirSync(convoDir, { recursive: true });
        }
        const convoFilePath = this.debugConvoFile();
        if (!fs_1.default.existsSync(convoFilePath)) {
            xmlContent = `<conversation id="${this.getId()}"></conversation>`;
            fs_1.default.writeFileSync(convoFilePath, xmlContent);
        }
        else {
            xmlContent = fs_1.default.readFileSync(convoFilePath, 'utf-8');
        }
        this.parseXML(xmlContent, (error, result) => {
            debugXML = result;
        });
        if (!debugXML.conversation.message) {
            debugXML.conversation.message = [];
        }
        return { xml: debugXML, path: convoFilePath };
    }
    debugSave(xml) {
        const builder = new xml2js_1.default.Builder();
        fs_1.default.writeFileSync(this.debugConvoFile(), builder.buildObject(xml), 'utf-8');
    }
}
exports.default = ConvoLoader;
//# sourceMappingURL=ConvoLoader.js.map