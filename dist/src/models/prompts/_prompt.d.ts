/// <reference types="node" />
import { Readable } from 'stream';
import { PromptTemplate } from "@langchain/core/prompts";
import ConvoLoader, { IChainCallOutput } from '../convo/ConvoLoader';
import { SimpleChatModel } from "@langchain/core/language_models/chat_models";
import { IterableReadableStream } from "@langchain/core/utils/stream";
import { ChainValues } from "@langchain/core/utils/types";
import { IContextToken } from '../../interfaces/IContextToken';
interface IPromptHyperParameters {
    temperature: number;
    top_k?: number;
    top_p?: number;
    [key: string]: number;
}
interface ILLMChunk {
    content: string;
    status: string;
}
interface IPromptParams {
    hyperParameters?: IPromptHyperParameters;
    input?: string;
    modelId: string;
    modelType: string;
}
interface IPromptEnchantment {
    enhancementId: string;
    enhancementName: string;
    enhancementParams: any;
    input: string;
    output: string;
}
type IPromptSender = (prompt: RWSPrompt) => Promise<void>;
interface IRWSPromptRequestExecutor {
    promptRequest: (prompt: RWSPrompt, contextToken?: IContextToken | null, intruderPrompt?: string | null, debugVars?: any) => Promise<RWSPrompt>;
}
interface IRWSSinglePromptRequestExecutor {
    singlePromptRequest: (prompt: RWSPrompt, contextToken?: IContextToken | null, intruderPrompt?: string | null, ensureJson?: boolean, debugVars?: any) => Promise<RWSPrompt>;
}
interface IRWSPromptStreamExecutor {
    promptStream: (prompt: RWSPrompt, read: (chunk: ILLMChunk) => void, end: () => void, debugVars?: any) => Promise<RWSPrompt>;
}
interface IRWSPromptJSON {
    input: string;
    enhancedInput: IPromptEnchantment[];
    sentInput: string;
    originalInput: string;
    output: string;
    modelId: string;
    modelType: string;
    multiTemplate: PromptTemplate;
    convo: {
        id: string;
    };
    hyperParameters: IPromptHyperParameters;
    created_at: string;
    varStorage: any;
}
type ChainStreamType = AsyncGenerator<IterableReadableStream<ChainValues>>;
declare class RWSPrompt {
    _stream: ChainStreamType;
    private input;
    private enhancedInput;
    private sentInput;
    private originalInput;
    private output;
    private modelId;
    private modelType;
    private multiTemplate;
    private convo;
    private hyperParameters;
    private created_at;
    private varStorage;
    private onStream;
    constructor(params: IPromptParams);
    listen(source: string, stream?: boolean): RWSPrompt;
    setStreamCallback(callback: (chunk: string) => void): void;
    addEnchantment(enchantment: IPromptEnchantment): void;
    getEnchantedInput(): string | null;
    getModelId(): string;
    readSentInput(): string;
    readInput(): string;
    readBaseInput(): string;
    setBaseInput(input: string): RWSPrompt;
    injestOutput(content: string): RWSPrompt;
    readOutput(): string;
    getHyperParameters<T extends IPromptHyperParameters>(base?: any): T;
    getHyperParameter<T>(key: keyof IPromptHyperParameters): T;
    setHyperParameter(key: string, value: any): RWSPrompt;
    setHyperParameters(value: any): RWSPrompt;
    setMultiTemplate(template: PromptTemplate): RWSPrompt;
    getMultiTemplate(): PromptTemplate;
    setConvo(convo: ConvoLoader<SimpleChatModel>): RWSPrompt;
    getConvo<T extends SimpleChatModel>(): ConvoLoader<T>;
    replacePromptVar(key: string, val: string): void;
    getModelMetadata(): [string, string];
    requestWith(executor: IRWSPromptRequestExecutor, intruderPrompt?: string, debugVars?: any): Promise<void>;
    singleRequestWith(executor: IRWSSinglePromptRequestExecutor, intruderPrompt?: string, ensureJson?: boolean): Promise<void>;
    streamWith(executor: IRWSPromptStreamExecutor, read: (chunk: ILLMChunk) => void, end?: () => void, debugVars?: any): Promise<RWSPrompt>;
    setInput(content: string): RWSPrompt;
    getVar<T>(key: string): T;
    setVar<T>(key: string, val: T): RWSPrompt;
    _oldreadStream(stream: Readable, react: (chunk: string) => void): Promise<void>;
    private isChainStreamType;
    readStreamAsText(readableStream: ReadableStream, callback: (txt: string) => void): Promise<void>;
    toJSON(): IRWSPromptJSON;
}
export default RWSPrompt;
export { IPromptSender, IPromptEnchantment, IPromptParams, IPromptHyperParameters, IRWSPromptRequestExecutor, IRWSPromptStreamExecutor, IRWSSinglePromptRequestExecutor, IRWSPromptJSON, IChainCallOutput, ChainStreamType, ILLMChunk };
