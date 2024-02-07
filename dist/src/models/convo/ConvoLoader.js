"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const text_1 = require("langchain/document_loaders/fs/text");
const text_splitter_1 = require("langchain/text_splitter");
const VectorStoreService_1 = __importDefault(require("../../services/VectorStoreService"));
const ConsoleService_1 = __importDefault(require("../../services/ConsoleService"));
const messages_1 = require("@langchain/core/messages");
const document_1 = require("langchain/document");
const uuid_1 = require("uuid");
const AppConfigService_1 = __importDefault(require("../../services/AppConfigService"));
const chains_1 = require("langchain/chains");
const errors_1 = require("../../errors");
const xml2js_1 = __importDefault(require("xml2js"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logConvo = (txt) => {
    ConsoleService_1.default.rwsLog(ConsoleService_1.default.color().blueBright(txt));
};
class ConvoLoader {
    constructor(chatConstructor, embeddings, convoId = null, baseSplitterParams = {
        chunkSize: 400, chunkOverlap: 80, separators: ["/n/n", "."]
    }) {
        this.docs = [];
        this._initiated = false;
        this.avgDocLength = (documents) => {
            return documents.reduce((sum, doc) => sum + doc.pageContent.length, 0) / documents.length;
        };
        this.embeddings = embeddings;
        if (convoId === null) {
            this.convo_id = ConvoLoader.uuid();
        }
        else {
            this.convo_id = convoId;
        }
        this.chatConstructor = chatConstructor;
        this._baseSplitterParams = baseSplitterParams;
    }
    static uuid() {
        return (0, uuid_1.v4)();
    }
    async splitDocs(filePath, params) {
        const splitDir = ConvoLoader.debugSplitDir(this.getId());
        if (!fs_1.default.existsSync(splitDir)) {
            console.log(`Split dir ${ConsoleService_1.default.color().magentaBright(splitDir)} doesn't exist. Splitting docs...`);
            this.loader = new text_1.TextLoader(filePath);
            this.docSplitter = new text_splitter_1.RecursiveCharacterTextSplitter({
                chunkSize: params.chunkSize,
                chunkOverlap: params.chunkOverlap,
                separators: params.separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
            });
            fs_1.default.mkdirSync(splitDir, { recursive: true });
            const orgDocs = await this.loader.load();
            const splitDocs = await this.docSplitter.splitDocuments(orgDocs);
            const avgCharCountPre = this.avgDocLength(orgDocs);
            const avgCharCountPost = this.avgDocLength(splitDocs);
            logConvo(`Average length among ${orgDocs.length} documents loaded is ${avgCharCountPre} characters.`);
            logConvo(`After the split we have ${splitDocs.length} documents more than the original ${orgDocs.length}.`);
            logConvo(`Average length among ${orgDocs.length} documents (after split) is ${avgCharCountPost} characters.`);
            this.docs = splitDocs;
            let i = 0;
            this.docs.forEach((doc) => {
                fs_1.default.writeFileSync(this.debugSplitFile(i), doc.pageContent);
                i++;
            });
        }
        else {
            const splitFiles = fs_1.default.readdirSync(splitDir);
            for (const filePath of splitFiles) {
                const txt = fs_1.default.readFileSync(splitDir + '/' + filePath, 'utf-8');
                this.docs.push(new document_1.Document({ pageContent: txt }));
            }
            ;
        }
        this.store = await VectorStoreService_1.default.createStore(this.docs, await this.embeddings.generateEmbeddings());
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
            streaming: true,
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
        const output = await (this.chain()).invoke(values, cfg);
        this.thePrompt.listen(output.text);
        await this.debugCall(debugCallback);
        return this.thePrompt;
    }
    async *callStreamGenerator(values, cfg, debugCallback = null) {
        const chain = this.chain();
        console.log('call stream');
        const stream = await chain.stream(values, cfg);
        console.log('got stream');
        // Listen to the stream and yield data chunks as they come
        for await (const chunk of stream) {
            yield chunk.response;
        }
    }
    async callStream(values, callback, end = () => { }, cfg = {}, debugCallback) {
        const callGenerator = this.callStreamGenerator({ query: values.query }, cfg, debugCallback);
        for await (const chunk of callGenerator) {
            callback(chunk);
            this.thePrompt.listen(chunk);
        }
        end();
        this.debugCall(debugCallback);
        return this.thePrompt;
    }
    ;
    async callChat(content, embeddingsEnabled = false, debugCallback = null) {
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
    async similaritySearch(query, splitCount) {
        console.log('Store is ready. Searching for embedds...');
        const texts = await this.getStore().getFaiss().similaritySearchWithScore(`${query}`, splitCount);
        console.log('Found best parts: ' + texts.length);
        return texts.map(([doc, score]) => `${doc["pageContent"]}`).join('\n\n');
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
    chain() {
        if (this.llmChain) {
            return this.llmChain;
        }
        if (!this.thePrompt) {
            throw new errors_1.Error500(new Error('No prompt initialized for conversation'), __filename);
        }
        const chainParams = {
            prompt: this.thePrompt.getMultiTemplate()
        };
        this.createChain(chainParams);
        return this.llmChain;
    }
    async createChain(input) {
        this.llmChain = new chains_1.ConversationChain({
            llm: this.llmChat,
            prompt: input.prompt,
        });
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
    static debugConvoDir(id) {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations', id);
    }
    static debugSplitDir(id) {
        return path_1.default.resolve(process.cwd(), 'debug', 'conversations', id, 'split');
    }
    debugConvoFile() {
        return `${ConvoLoader.debugConvoDir(this.getId())}/conversation.xml`;
    }
    debugSplitFile(i) {
        return `${ConvoLoader.debugSplitDir(this.getId())}/${i}.splitfile`;
    }
    initDebugFile() {
        let xmlContent;
        let debugXML = null;
        const convoDir = ConvoLoader.debugConvoDir(this.getId());
        if (!fs_1.default.existsSync(convoDir)) {
            fs_1.default.mkdirSync(convoDir, { recursive: true });
        }
        const convoFilePath = this.debugConvoFile();
        if (!fs_1.default.existsSync(convoFilePath)) {
            xmlContent = `<conversation id="conversation"></conversation>`;
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