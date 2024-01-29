import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { PromptTemplate } from "@langchain/core/prompts";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import VectorStoreService from '../../services/VectorStoreService';
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { Bedrock as LLMBedrock } from "@langchain/community/llms/bedrock";

import { v4 as uuid } from 'uuid';

import { LLMChain, LLMChainInput } from "langchain/chains";
import RWSPrompt from "../prompts/_prompt";
import { Error500 } from "../../errors";

interface IBaseLangchainHyperParams {
    temperature: number;
    topK: number;
    topP: number;
    maxTokens:number;
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
}

export default ConvoLoader;