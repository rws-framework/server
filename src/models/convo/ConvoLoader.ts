import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import VectorStoreService from '../../services/VectorStoreService';
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { HumanMessage } from "@langchain/core/messages";
import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import { BaseMessageChunk } from "@langchain/core/messages";

import { v4 as uuid } from 'uuid';
import getAppConfig from '../../services/AppConfigService';
import { LLMChain, LLMChainInput } from "langchain/chains";
import RWSPrompt, { IRWSPromptJSON } from "../prompts/_prompt";
import { Error500 } from "../../errors";

import { ChainValues } from "@langchain/core/utils/types";
import { Callbacks , BaseCallbackConfig } from "langchain/callbacks";

import xml2js from 'xml2js'
import fs from "fs";
import path from "path";

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

class ConvoLoader<LLMClient, LLMChat extends SimpleChatModel> {
    private loader: TextLoader;
    private docSplitter: RecursiveCharacterTextSplitter;    

    private embeddings: IEmbeddingsHandler<any>;

    private docs: VectorDocType;
    private _initiated = false;
    private store: RWSVectorStore;
    private convo_id: string;
    private llmClient: LLMClient;
    private llmChain: LLMChain;
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

    public async init(pathToTextFile: string, chunkSize: number = 2000, chunkOverlap: number = 200, separators: string[] = ["/n/n","."]): Promise<ConvoLoader<LLMClient, LLMChat>>
    {
        this.loader = new TextLoader(pathToTextFile);
        this.docSplitter = new RecursiveCharacterTextSplitter({
            chunkSize, // The size of the chunk that should be split.
            chunkOverlap, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
            separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
        });

        this.docs = await this.docSplitter.splitDocuments(await this.loader.load());
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

    async call(values: ChainValues, cfg: Callbacks | BaseCallbackConfig, debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null): Promise<RWSPrompt>
    {   
        const output = await (await this.chain()).call(values, cfg) as IChainCallOutput;        
        await this.thePrompt.listen(output.text)        

        await this.debugCall(debugCallback);

        return this.thePrompt;
    }

    async callChat(content: string, embeddingsEnabled: boolean = true, debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null): Promise<RWSPrompt>
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
    }): Promise<LLMChain>
    {        

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

        const chainParams: { llm: any, prompt: PromptTemplate, hyperparameters?: any } = {
            llm: this.getLLMClient(),
            prompt: this.thePrompt.getMultiTemplate(),
            hyperparameters: hyperParams    
        };      

        if(!this.llmChain){
            this.createChain(chainParams);
        }        

        return this.llmChain;
    }

    private async createChain(input: LLMChainInput): Promise<LLMChain>
    {
        this.llmChain = new LLMChain(input);
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