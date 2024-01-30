import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import VectorStoreService from '../../services/VectorStoreService';
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { Bedrock as LLMBedrock } from "@langchain/community/llms/bedrock";

import { v4 as uuid } from 'uuid';

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

class ConvoLoader {
    private loader: TextLoader;
    private docSplitter: RecursiveCharacterTextSplitter;    

    private embeddings: EmbeddingsInterface;

    private docs: VectorDocType;
    private _initiated = false;
    private store: RWSVectorStore;
    private convo_id: string;
    private llmClient: LLMBedrock;
    private llmChain: LLMChain;

    private thePrompt: RWSPrompt;
    
    constructor(embeddings: EmbeddingsInterface, convoId: string | null = null){
        this.embeddings = embeddings;
        
        if(convoId === null){
            this.convo_id = ConvoLoader.uuid();
        } else {
            this.convo_id = convoId;
        }                
    }

    static uuid(): string
    {
        return uuid();
    }

    public async init(pathToTextFile: string, chunkSize: number = 2000, chunkOverlap: number = 200, separators: string[] = ["/n/n","."]): Promise<ConvoLoader>
    {
        this.loader = new TextLoader(pathToTextFile);
        this.docSplitter = new RecursiveCharacterTextSplitter({
            chunkSize, // The size of the chunk that should be split.
            chunkOverlap, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
            separators // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
        });

        this.docs = await this.docSplitter.splitDocuments(await this.loader.load());

        this.store = await VectorStoreService.createStore(this.docs, this.embeddings);

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

    setLLMClient(client: LLMBedrock): ConvoLoader
    {
        this.llmClient = client;
        
        return this;
    }

    getLLMClient(): LLMBedrock
    {
        return this.llmClient;
    }

    setPrompt(prompt: RWSPrompt): ConvoLoader
    {
        this.thePrompt = prompt;

        return this;
    }

    async call(values: ChainValues, cfg: Callbacks | BaseCallbackConfig, debugCallback: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData> = null): Promise<RWSPrompt>
    {   
        const output = await (await this.chain()).call(values, cfg) as IChainCallOutput;        
        await this.thePrompt.listen(output.text)        

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

    async waitForInit(): Promise<ConvoLoader | null>
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
export { IChainCallOutput, IConvoDebugXMLData }