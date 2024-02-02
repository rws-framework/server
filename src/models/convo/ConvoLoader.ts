import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import { RunnableConfig } from "@langchain/core/runnables";
import type { BaseLanguageModelInterface } from "@langchain/core/language_models/base";
import VectorStoreService from '../../services/VectorStoreService';
import ConsoleService from "../../services/ConsoleService";
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { HumanMessage } from "@langchain/core/messages";
import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessageChunk } from "@langchain/core/messages";
import { Document } from "langchain/document";
import { v4 as uuid } from 'uuid';
import getAppConfig from '../../services/AppConfigService';
import { BaseChain, LLMChain, LLMChainInput, RetrievalQAChain, loadQAStuffChain } from "langchain/chains";
import RWSPrompt, { IRWSPromptJSON } from "../prompts/_prompt";
import { IterableReadableStream } from "@langchain/core/utils/stream";


import { Error500 } from "../../errors";

import { ChainValues } from "@langchain/core/utils/types";
import { Callbacks , BaseCallbackConfig } from "langchain/callbacks";

import xml2js from 'xml2js'
import fs from "fs";
import path from "path";

const logConvo = (txt: string) => {
    ConsoleService.rwsLog(ConsoleService.color().blueBright(txt));
}

interface IBaseLangchainHyperParams {
    temperature: number;
    topK: number;
    topP: number;
    maxTokens:number;
}

interface IConvoDebugXMLData {
    conversation: {
        $ : {
            id: string
            [key: string]: string
        },
        message: IRWSPromptJSON[]        
    }
}

interface IConvoDebugXMLOutput {
    xml : IConvoDebugXMLData,
    path: string
}

interface IChainCallOutput {
    text: string
}

interface IEmbeddingsHandler<T extends object = {}> {
    generateEmbeddings: (text?: string) => Promise<T>
    storeEmbeddings: (embeddings: any, convoId: string) => Promise<void>
}

class ConvoLoader<LLMClient extends BaseLanguageModelInterface, LLMChat extends SimpleChatModel> {
    private loader: TextLoader;
    private docSplitter: RecursiveCharacterTextSplitter;    

    private embeddings: IEmbeddingsHandler<any>;

    private docs: VectorDocType;
    private _initiated = false;
    private store: RWSVectorStore;
    private convo_id: string;
    private llmClient: LLMClient;
    private llmChain: BaseChain;
    private llmChat: LLMChat;
    private chatConstructor: new (config: any) => LLMChat;
    private thePrompt: RWSPrompt;
    
    constructor(chatConstructor: new (config: any) => LLMChat, embeddings: IEmbeddingsHandler, convoId: string | null = null){
        this.embeddings = embeddings;
        
        if(convoId === null){
            this.convo_id = ConvoLoader.uuid();
        } else {
            this.convo_id = convoId;
        }                        

        this.chatConstructor = chatConstructor;       
    }

    static uuid(): string
    {
        return uuid();
    }

    public async init(pathToTextFile: string, chunkSize: number = 400, chunkOverlap: number = 80, separators: string[] = ["/n/n","."]): Promise<ConvoLoader<LLMClient, LLMChat>>
    {
        this.loader = new TextLoader(pathToTextFile);
        this.docSplitter = new RecursiveCharacterTextSplitter({
            chunkSize, // The size of the chunk that should be split.
            chunkOverlap, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
            separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
        });

        const orgDocs =await this.loader.load();
        const splitDocs = await this.docSplitter.splitDocuments(orgDocs);

        const avgCharCountPre = this.avgDocLength(orgDocs);
        const avgCharCountPost = this.avgDocLength(splitDocs);

        logConvo(`Average length among ${orgDocs.length} documents loaded is ${avgCharCountPre} characters.`);
        logConvo(`After the split we have ${splitDocs.length} documents more than the original ${orgDocs.length}.`);
        logConvo(`Average length among ${orgDocs.length} documents (after split) is ${avgCharCountPost} characters.`);

        this.docs = splitDocs;
        this.store = await VectorStoreService.createStore(this.docs, await this.embeddings.generateEmbeddings());
        
        this._initiated = true;

        return this;
    }

    getId(): string {
        return this.convo_id;
    }

    getDocs(): VectorDocType
    {
        return this.docs;
    }
    getStore(): RWSVectorStore
    {
        return this.store;
    }

    isInitiated(): boolean 
    {
        return this._initiated;
    }

    setLLMClient(client: LLMClient): ConvoLoader<LLMClient, LLMChat>
    {
        this.llmClient = client;
        
        return this;
    }

    getLLMClient(): LLMClient
    {
        return this.llmClient;
    }

    setPrompt(prompt: RWSPrompt): ConvoLoader<LLMClient, LLMChat>
    {
        this.thePrompt = prompt;        

        this.llmChat = new this.chatConstructor({
            region: getAppConfig().get('aws_bedrock_region'),  
            credentials: {  
              accessKeyId: getAppConfig().get('aws_access_key'),  
              secretAccessKey: getAppConfig().get('aws_secret_key'),  
            },  
            model: "anthropic.claude-v2",            
            maxTokens: prompt.getHyperParameter<number>('max_tokens_to_sample'),
            temperature: prompt.getHyperParameter<number>('temperature'),
            modelKwargs: {
                top_p: prompt.getHyperParameter<number>('top_p'),
                top_k: prompt.getHyperParameter<number>('top_k'),
            }
        });        

        return this;
    }

    getChat(): LLMChat
    {
        return this.llmChat;
    }

    private avgDocLength = (documents: Document[]): number => {
        return documents.reduce((sum, doc: Document) => sum + doc.pageContent.length, 0) / documents.length;
    };

    async call(values: ChainValues, cfg: RunnableConfig, debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null): Promise<RWSPrompt>
    {   
        const output = await (await this.chain()).invoke(values, cfg) as IChainCallOutput;        
        await this.thePrompt.listen(output.text)        

        await this.debugCall(debugCallback);

        return this.thePrompt;
    }

    async *callStreamGenerator(this: ConvoLoader<LLMClient, LLMChat>, values: ChainValues, cfg: RunnableConfig, debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null): AsyncGenerator<IterableReadableStream<ChainValues>>
    {   
        yield (await this.chain() as RetrievalQAChain).stream(values, cfg);
    }

    async callStream(values: ChainValues, callback: (streamChunk: string) => void, cfg: RunnableConfig = {}, debugCallback?: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData>): Promise<RWSPrompt>
    {
        const callGenerator = this.callStreamGenerator.bind(this);

        this.thePrompt.setStreamCallback(callback);
        
        for await (const chunk of callGenerator(values, cfg, debugCallback)) {
           await this.thePrompt.listen(chunk)
        }

        return this.thePrompt;
    };

    async callChat(content: string, embeddingsEnabled: boolean = false, debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null): Promise<RWSPrompt>
    {
        if(embeddingsEnabled){
            const embeddings = await this.embeddings.generateEmbeddings(content);
            await this.embeddings.storeEmbeddings(embeddings, this.getId());
        }

        const response: BaseMessageChunk = await this.llmChat.invoke([
            new HumanMessage({ content }),
        ]);

        await this.thePrompt.listen(response.content as string)        

        await this.debugCall(debugCallback);

        return this.thePrompt;
    }

    
    private async debugCall(debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null)
    {
        try {
        const debug = this.initDebugFile();

        let callData: IConvoDebugXMLData = debug.xml;

        callData.conversation.message.push(this.thePrompt.toJSON());

        if(debugCallback){
            callData = await debugCallback(callData);
        }

        this.debugSave(callData);
        
        }catch(error: Error | unknown){
            console.log(error);
        }
    }

    async chain(hyperParamsMap: { [key: string]: string} = {
        temperature: 'temperature',
        topK: 'top_k',
        topP: 'top_p',
        maxTokens: 'max_tokens_to_sample'
    }): Promise<BaseChain>
    {        
        if(this.llmChain){
            return this.llmChain;
        }

        if(!this.thePrompt){
            throw new Error500(new Error('No prompt initialized for conversation'), __filename);
        }        

        const hyperParams: IBaseLangchainHyperParams = {
            temperature: null,
            topK: null,
            topP: null,
            maxTokens: null
        }

        for (const key in hyperParamsMap){
            const index: keyof IBaseLangchainHyperParams = key as keyof IBaseLangchainHyperParams;

            hyperParams[index] = this.thePrompt.getHyperParameter<number>(hyperParamsMap[key]);
        }

        const chainParams: { prompt: PromptTemplate, hyperparameters?: any } = {            
            prompt: this.thePrompt.getMultiTemplate(),
            hyperparameters: hyperParams    
        };      

        this.createChain(chainParams);

        return this.llmChain;
    }

    private async createChain(input: { prompt: PromptTemplate, hyperparameters?: any }): Promise<BaseChain>
    {
        this.llmChain = new RetrievalQAChain({
            combineDocumentsChain: loadQAStuffChain(this.getLLMClient(), input),
            retriever: this.getStore().getFaiss().asRetriever(1),
            returnSourceDocuments: true
        });

        return this.llmChain;
    }

    async waitForInit(): Promise<ConvoLoader<LLMClient, LLMChat> | null>
    {
        const _self = this;
        return new Promise((resolve, reject)=>{
            let i = 0;

            const interval: NodeJS.Timeout = setInterval(() => {
                if(this.isInitiated()){
                    clearInterval(interval);
                    resolve(_self);
                }

                if(i>9){
                    clearInterval(interval);
                    reject(null)
                }

                i++;
            }, 300);            
        })
    }  

    private parseXML(xml: string, callback: (err: Error, result: any) => void): xml2js.Parser
    {
        const parser = new xml2js.Parser();        

        parser.parseString(xml, callback);
        return parser;
    }

    static debugConvoDir(){
        return path.resolve(process.cwd(), 'debug', 'conversations');
    }

    public debugConvoFile(){
        return `${ConvoLoader.debugConvoDir()}/${this.getId()}.xml`
    }

    private initDebugFile(): IConvoDebugXMLOutput
    {
        let xmlContent: string;
        let debugXML: IConvoDebugXMLData = null;

        const convoDir = ConvoLoader.debugConvoDir();

        if(!fs.existsSync(convoDir)){
            fs.mkdirSync(convoDir, { recursive: true });
        }

        const convoFilePath = this.debugConvoFile();

        if(!fs.existsSync(convoFilePath)){
            xmlContent = `<conversation id="${this.getId()}"></conversation>`;

            fs.writeFileSync(convoFilePath, xmlContent);
        }else{
            xmlContent = fs.readFileSync(convoFilePath, 'utf-8');
        }

        this.parseXML(xmlContent, (error: Error, result) => {            
            debugXML = result;
        });

        if(!debugXML.conversation.message){
            debugXML.conversation.message = [];
        }

        return { xml: debugXML, path: convoFilePath };
    }

    private debugSave(xml: IConvoDebugXMLData): void
    {        
        const builder = new xml2js.Builder();
        fs.writeFileSync(this.debugConvoFile(), builder.buildObject(xml), 'utf-8')
    }

}

export default ConvoLoader;
export { IChainCallOutput, IConvoDebugXMLData, IEmbeddingsHandler }