import { PromptTemplate } from "@langchain/core/prompts";
import { EmbeddingsInterface } from "@langchain/core/embeddings";
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { Bedrock as LLMBedrock } from "langchain/llms/bedrock";
import { LLMChain } from "langchain/chains";
declare class ConvoLoader {
    private loader;
    private docSplitter;
    private embeddings;
    private docs;
    private _initiated;
    private store;
    private convo_id;
    private llmClient;
    private llmChain;
    constructor(pathToTextFile: string, embeddings: EmbeddingsInterface);
    private init;
    getId(): string;
    getDocs(): VectorDocType;
    getStore(): RWSVectorStore;
    isInitiated(): boolean;
    chain(promptTemplate: PromptTemplate): Promise<LLMChain>;
    private createChain;
    waitForInit(): Promise<ConvoLoader>;
    setLLMClient(client: LLMBedrock): ConvoLoader;
    getLLMClient(): LLMBedrock;
}
export default ConvoLoader;
