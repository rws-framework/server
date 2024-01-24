import { TextLoader } from "langchain/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { BedrockEmbeddings } from "langchain/embeddings/bedrock"
import { PromptTemplate } from "@langchain/core/prompts";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import VectorStoreService from '../../services/VectorStoreService';
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { Bedrock as LLMBedrock } from "langchain/llms/bedrock";

import { v4 as uuid } from 'uuid';

import { LLMChain, LLMChainInput } from "langchain/chains";

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
    
    constructor(pathToTextFile: string, embeddings: EmbeddingsInterface){
        this.embeddings = embeddings;
        this.convo_id = uuid();
        this.init(pathToTextFile);
    }

    private async init(pathToTextFile: string)
    {
        this.loader = new TextLoader(pathToTextFile);
        this.docSplitter = new RecursiveCharacterTextSplitter({
            chunkSize: 2000, // The size of the chunk that should be split.
            chunkOverlap: 200, // Adding overalap so that if a text is broken inbetween, next document may have part of the previous document 
            separators: ["/n/n","."] // In this case we are assuming that /n/n would mean one whole sentence. In case there is no nearing /n/n then "." will be used instead. This can be anything that helps derive a complete sentence .
        });

        this.docs = await this.docSplitter.splitDocuments(await this.loader.load());

        this.store = await VectorStoreService.createStore(this.docs, this.embeddings);

        this._initiated = true;
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

    async chain(promptTemplate: PromptTemplate): Promise<LLMChain>
    {        
        if(!this.llmChain){
            this.createChain({
                llm: this.getLLMClient(),
                prompt: promptTemplate
            });
        }        

        return this.llmChain;
    }

    private async createChain(input: LLMChainInput): Promise<LLMChain>
    {
        this.llmChain = new LLMChain(input);
        return this.llmChain;
    }

    async waitForInit(): Promise<ConvoLoader>
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
                    reject(false)
                }

                i++;
            }, 300);            
        })
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
}

export default ConvoLoader;