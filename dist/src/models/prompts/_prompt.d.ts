/// <reference types="node" />
import { Readable } from 'stream';
import { PromptTemplate } from "@langchain/core/prompts";
import ConvoLoader from '../convo/ConvoLoader';
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
    constructor(params: IPromptParams);
    listen(source: string | Readable): Promise<RWSPrompt>;
    addEnchantment(enchantment: IPromptEnchantment): void;
    getEnchantedInput(): string | null;
    getModelId(): string;
    readSentInput(): string;
    readInput(): string;
    readOutput(): string;
    getHyperParameters(base?: any): IPromptHyperParameters;
    setHyperParameter(key: string, value: any): RWSPrompt;
    setHyperParameters(value: any): RWSPrompt;
    setMultiTemplate(template: PromptTemplate): RWSPrompt;
    getMultiTemplate(): PromptTemplate;
    setConvo(convo: ConvoLoader): Promise<RWSPrompt>;
    getConvo(): ConvoLoader;
    getModelMetadata(): [string, string];
    sendWith(promptSender: IPromptSender): Promise<void>;
    readStream(stream: Readable, react: (chunk: string) => void): Promise<void>;
}
export default RWSPrompt;
export { IPromptSender, IPromptEnchantment, IPromptParams, IPromptHyperParameters };
