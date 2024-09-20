import { PromptTemplate } from '@langchain/core/prompts';


export interface IPromptHyperParameters {
    temperature: number,
    top_k?: number,
    top_p?: number,
    [key: string]: number
}

export interface IRWSHistoryMessage { 
    content: string, creator: string 
}

export interface ILLMChunk {
    content: string
    status: string
 }

export interface IPromptParams {
    hyperParameters?: IPromptHyperParameters;
    input?: string;
    modelId: string;
    modelType: string;
}

export interface IPromptEnchantment {
    enhancementId: string,
    enhancementName: string,
    enhancementParams: any,
    input: string
    output: string
}

export interface IRWSPromptJSON {
    input: string;
    enhancedInput: IPromptEnchantment[];
    sentInput: string;
    originalInput: string;
    output: string;
    modelId: string;
    modelType: string;
    multiTemplate: PromptTemplate;
    convo: { id: string };
    hyperParameters: IPromptHyperParameters;
    created_at: string;
    var_storage: any;
}