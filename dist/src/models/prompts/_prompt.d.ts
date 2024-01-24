/// <reference types="node" />
import { Readable } from 'stream';
import { PromptTemplate } from "@langchain/core/prompts";
import ConvoLoader from '../convo/ConvoLoader';
import { IContextToken } from '../../interfaces/IContextToken';
interface IPromptHyperParameters {
    temperature: number;
    top_k?: number;
    top_p?: number;
    [key: string]: string | number | boolean | null;
}
interface IPromptParams {
    hyperParameters?: IPromptHyperParameters;
    input: string;
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
    promptRequest: (prompt: RWSPrompt, contextToken?: IContextToken | null, intruderPrompt?: string | null) => Promise<RWSPrompt>;
}
interface IRWSSinglePromptRequestExecutor {
    singlePromptRequest: (prompt: RWSPrompt, contextToken?: IContextToken | null, intruderPrompt?: string | null) => Promise<RWSPrompt>;
}
interface IRWSPromptStreamExecutor {
    promptStream: (prompt: RWSPrompt, read: (size: number) => void) => Readable;
}
declare class RWSPrompt {
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
    private varStorage;
    constructor(params: IPromptParams);
    listen(source: string | Readable): Promise<RWSPrompt>;
    addEnchantment(enchantment: IPromptEnchantment): void;
    getEnchantedInput(): string | null;
    getModelId(): string;
    readSentInput(): string;
    readInput(): string;
    readBaseInput(): string;
    setBaseInput(input: string): RWSPrompt;
    readOutput(): string;
    getHyperParameters(base?: any): IPromptHyperParameters;
    setHyperParameter(key: string, value: any): RWSPrompt;
    setHyperParameters(value: any): RWSPrompt;
    setMultiTemplate(template: PromptTemplate): RWSPrompt;
    getMultiTemplate(): PromptTemplate;
    setConvo(convo: ConvoLoader): Promise<RWSPrompt>;
    getConvo(): ConvoLoader;
    getModelMetadata(): [string, string];
    requestWith(executor: IRWSPromptRequestExecutor, intruderPrompt?: string): Promise<void>;
    singleRequestWith(executor: IRWSSinglePromptRequestExecutor, intruderPrompt?: string): Promise<void>;
    streamWith(executor: IRWSPromptStreamExecutor, read: (size: number) => void): Readable;
    getVar<T>(key: string): T;
    setVar<T>(key: string, val: T): RWSPrompt;
    readStream(stream: Readable, react: (chunk: string) => void): Promise<void>;
}
export default RWSPrompt;
export { IPromptSender, IPromptEnchantment, IPromptParams, IPromptHyperParameters, IRWSPromptRequestExecutor, IRWSPromptStreamExecutor, IRWSSinglePromptRequestExecutor };
