import { EmbeddingsInterface } from "@langchain/core/embeddings";
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { Bedrock as LLMBedrock } from "@langchain/community/llms/bedrock";
import { LLMChain } from "langchain/chains";
import RWSPrompt, { IRWSPromptJSON } from "../prompts/_prompt";
import { ChainValues } from "@langchain/core/utils/types";
import { Callbacks, BaseCallbackConfig } from "langchain/callbacks";
interface IConvoDebugXMLData {
    conversation: {
        $: {
            id: string;
            [key: string]: string;
        };
        message: IRWSPromptJSON[];
    };
}
interface IChainCallOutput {
    text: string;
}
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
    private thePrompt;
    constructor(embeddings: EmbeddingsInterface, convoId?: string | null);
    static uuid(): string;
    init(pathToTextFile: string, chunkSize?: number, chunkOverlap?: number, separators?: string[]): Promise<ConvoLoader>;
    getId(): string;
    getDocs(): VectorDocType;
    getStore(): RWSVectorStore;
    isInitiated(): boolean;
    setLLMClient(client: LLMBedrock): ConvoLoader;
    getLLMClient(): LLMBedrock;
    setPrompt(prompt: RWSPrompt): ConvoLoader;
    call(values: ChainValues, cfg: Callbacks | BaseCallbackConfig, debugCallback?: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData>): Promise<RWSPrompt>;
    private debugCall;
    chain(hyperParamsMap?: {
        [key: string]: string;
    }): Promise<LLMChain>;
    private createChain;
    waitForInit(): Promise<ConvoLoader | null>;
    private parseXML;
    static debugConvoDir(): string;
    debugConvoFile(): string;
    private initDebugFile;
    private debugSave;
}
export default ConvoLoader;
export { IChainCallOutput, IConvoDebugXMLData };
