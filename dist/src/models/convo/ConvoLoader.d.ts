import { RunnableConfig, Runnable } from "@langchain/core/runnables";
import { BaseMessage } from "@langchain/core/messages";
import { BaseLanguageModelInput } from "@langchain/core/language_models/base";
import RWSVectorStore, { VectorDocType } from '../convo/VectorStore';
import { BaseChain } from "langchain/chains";
import RWSPrompt, { IRWSPromptJSON, ILLMChunk } from "../prompts/_prompt";
import { ChainValues } from "@langchain/core/utils/types";
interface ISplitterParams {
    chunkSize: number;
    chunkOverlap: number;
    separators: string[];
}
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
interface IEmbeddingsHandler<T extends object = {}> {
    generateEmbeddings: (text?: string) => Promise<T>;
    storeEmbeddings: (embeddings: any, convoId: string) => Promise<void>;
}
declare class ConvoLoader<LLMChat extends Runnable<BaseLanguageModelInput, BaseMessage, RunnableConfig>> {
    private loader;
    private docSplitter;
    private embeddings;
    private docs;
    private _initiated;
    private store;
    private convo_id;
    private llmChain;
    private llmChat;
    private chatConstructor;
    private thePrompt;
    _baseSplitterParams: ISplitterParams;
    constructor(chatConstructor: new (config: any) => LLMChat, embeddings: IEmbeddingsHandler, convoId?: string | null, baseSplitterParams?: ISplitterParams);
    static uuid(): string;
    splitDocs(filePath: string, params: ISplitterParams): Promise<void>;
    getId(): string;
    getDocs(): VectorDocType;
    getStore(): RWSVectorStore;
    isInitiated(): boolean;
    setPrompt(prompt: RWSPrompt): ConvoLoader<LLMChat>;
    getChat(): LLMChat;
    private avgDocLength;
    call(values: ChainValues, cfg: Partial<RunnableConfig>, debugCallback?: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData>): Promise<RWSPrompt>;
    callStreamGenerator(this: ConvoLoader<LLMChat>, values: ChainValues, cfg: Partial<RunnableConfig>, debugCallback?: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData>): AsyncGenerator<string>;
    callStream(values: ChainValues, callback: (streamChunk: ILLMChunk) => void, end?: () => void, cfg?: Partial<RunnableConfig>, debugCallback?: (debugData: IConvoDebugXMLData) => Promise<IConvoDebugXMLData>): Promise<RWSPrompt>;
    similaritySearch(query: string, splitCount: number): Promise<string>;
    private debugCall;
    chain(): BaseChain;
    private createChain;
    waitForInit(): Promise<ConvoLoader<LLMChat> | null>;
    private parseXML;
    static debugConvoDir(id: string): string;
    static debugSplitDir(id: string): string;
    debugConvoFile(): string;
    debugSplitFile(i: number): string;
    private initDebugFile;
    private debugSave;
}
export default ConvoLoader;
export { IChainCallOutput, IConvoDebugXMLData, IEmbeddingsHandler, ISplitterParams };
