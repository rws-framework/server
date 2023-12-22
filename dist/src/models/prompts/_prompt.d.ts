/// <reference types="node" />
import { Readable } from 'stream';
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
    private hyperParameters;
    constructor(params: IPromptParams);
    listen(source: string | Readable): Promise<RWSPrompt>;
    addEnchantment(enchantment: IPromptEnchantment): void;
    getEnchantedInput(): string | null;
    readSentInput(): string;
    readInput(): string;
    readOutput(): string;
    getHyperParameters(base?: any): IPromptHyperParameters;
    getModelMetadata(): [string, string];
    sendWith(promptSender: IPromptSender): Promise<void>;
    readStream(stream: Readable, react: (chunk: string) => void): Promise<void>;
}
export default RWSPrompt;
export { IPromptSender, IPromptEnchantment, IPromptParams, IPromptHyperParameters };
