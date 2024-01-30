import { Readable } from 'stream';
import { PromptTemplate } from "@langchain/core/prompts";
import ConvoLoader, { IChainCallOutput } from '../convo/ConvoLoader';
import { IContextToken } from '../../interfaces/IContextToken';

interface IPromptHyperParameters {
    temperature: number,
    top_k?: number,
    top_p?: number,
    [key: string]: number
}

interface IPromptParams {
    hyperParameters?: IPromptHyperParameters;
    input: string;
    modelId: string;
    modelType: string;
}

interface IPromptEnchantment {
    enhancementId: string,
    enhancementName: string,
    enhancementParams: any,
    input: string
    output: string
}

type IPromptSender = (prompt: RWSPrompt) => Promise<void>;

interface IRWSPromptRequestExecutor {
    promptRequest: (prompt: RWSPrompt, contextToken?: IContextToken | null, intruderPrompt?: string | null, debugVars?: any) => Promise<RWSPrompt>
}


interface IRWSSinglePromptRequestExecutor {
    singlePromptRequest: (prompt: RWSPrompt, contextToken?: IContextToken | null, intruderPrompt?: string | null, debugVars?: any) => Promise<RWSPrompt>
}


interface IRWSPromptStreamExecutor {
    promptStream: (prompt: RWSPrompt, read: (size: number) => void, debugVars?: any) => Readable
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
    convo: { id: string };
    hyperParameters: IPromptHyperParameters;
    created_at: string;
    varStorage: any;
}

class RWSPrompt {
    private input: string;
    private enhancedInput: IPromptEnchantment[];
    private sentInput: string;
    private originalInput: string;
    private output: string;
    private modelId: string;
    private modelType: string;
    private multiTemplate: PromptTemplate;
    private convo: ConvoLoader;
    private hyperParameters: IPromptHyperParameters;
    private created_at: Date;

    private varStorage: any = {};

    constructor(params: IPromptParams){
        this.input = params.input;
        this.originalInput = params.input;
        this.hyperParameters = params.hyperParameters;
        this.modelId = params.modelId;
        this.modelType = params.modelType;

        this.created_at = new Date();
    }

    async listen(source: string | Readable): Promise<RWSPrompt>
    {
        if (typeof source === 'string') {
            this.output = source;
        } else if (source instanceof Readable) {
            this.output = ''; // Or any default value
    
            this.readStream(source, (chunk: string) => {
                this.output += source;
            });
        }
        

        return this;
    }

    addEnchantment(enchantment: IPromptEnchantment): void
    {
        this.enhancedInput.push(enchantment);
        this.input = enchantment.input;        
    }

    getEnchantedInput(): string | null
    {
        return this.enhancedInput[this.enhancedInput.length - 1].output;
    }

    getModelId(): string
    {
        return this.modelId;
    }

    readSentInput(): string
    {
        return this.sentInput;
    }

    readInput(): string
    {
        return this.input;
    }

    
    readBaseInput(): string
    {
        return this.originalInput;
    }    

    setBaseInput(input: string): RWSPrompt
    {
        this.originalInput = input;
        
        return this;
    }

    injestOutput(content: string): RWSPrompt
    {
        this.output = content;

        return this;
    }

    readOutput(): string
    {
        return this.output;
    }

    getHyperParameters<T extends IPromptHyperParameters>(base: any = null): T
    {        
        if(base){
            this.hyperParameters = {...base, ...this.hyperParameters};
        }

        return this.hyperParameters as T;
    }

    getHyperParameter<T>(key: keyof IPromptHyperParameters): T
    {        
        if(!this.hyperParameters[key]){
            return null;
        }

        return this.hyperParameters[key] as T;
    }

    setHyperParameter(key: string, value: any): RWSPrompt
    {        
        this.hyperParameters[key] = value;
        
        return this;
    }
    
    setHyperParameters(value: any): RWSPrompt
    {        
        this.hyperParameters = value;
        
        return this;
    }

    setMultiTemplate(template: PromptTemplate): RWSPrompt
    {
        this.multiTemplate = template
        return this;
    }

    getMultiTemplate(): PromptTemplate
    {
        return this.multiTemplate;
    }

    async setConvo(convo: ConvoLoader): Promise<RWSPrompt>
    {
        this.convo = convo.setPrompt(this)        
        
        return this;
    }

    getConvo(): ConvoLoader
    {
        return this.convo;
    }  

    getModelMetadata(): [string, string]
    {
        return [this.modelType, this.modelId];
    }

    async requestWith(executor: IRWSPromptRequestExecutor, intruderPrompt: string = null, debugVars: any = {}): Promise<void>
    {
        this.sentInput = this.input;
        const returnedRWS = await executor.promptRequest(this, null, intruderPrompt, debugVars);
        this.output = returnedRWS.readOutput()        
    }

    async singleRequestWith(executor: IRWSSinglePromptRequestExecutor, intruderPrompt: string = null): Promise<void>
    {
        this.sentInput = this.input;
        await executor.singlePromptRequest(this, null, intruderPrompt);
    }

    streamWith(executor: IRWSPromptStreamExecutor, read: (size: number) => void): Readable
    {
        this.sentInput = this.input;
        return executor.promptStream(this, read);
    }

    getVar<T>(key: string): T
    {
        return Object.keys(this.varStorage).includes(key) ? this.varStorage[key] : null;
    }

    setVar<T>(key: string, val: T): RWSPrompt {
        this.varStorage[key] = val;

        return this;
    }

    async readStream(stream: Readable, react: (chunk: string) => void): Promise<void>    
    {        
        let first = true;
        const chunks: string[] = []; // Replace 'any' with the actual type of your chunks
       
        for await (const event of stream) {            
            // Assuming 'event' has a specific structure. Adjust according to actual event structure.
            if ('chunk' in event && event.chunk.bytes) {
                const chunk = JSON.parse(Buffer.from(event.chunk.bytes).toString("utf-8"));
                if(first){
                    console.log('chunk', chunk);
                    first = false;
                }

                react(chunk.completion);

                chunks.push(chunk.completion || chunk.generation ); // Use the actual property of 'chunk' you're interested in
            } else if (
                'internalServerException' in event ||
                'modelStreamErrorException' in event ||
                'throttlingException' in event ||
                'validationException' in event
            ) {
                console.error(event);
                break;
            }            
        }        
    }

    toJSON(): IRWSPromptJSON
    {
        return {
            input: this.input,            
            enhancedInput: this.enhancedInput,
            sentInput: this.sentInput,
            originalInput: this.originalInput,
            output: this.output,
            modelId: this.modelId,
            modelType: this.modelType,
            multiTemplate: this.multiTemplate,
            convo: {
                id: this.convo.getId()
            },
            hyperParameters: this.hyperParameters,
            varStorage: this.varStorage,
            created_at: this.created_at.toISOString()
        }
    }
}

export default RWSPrompt;

export { IPromptSender, IPromptEnchantment, IPromptParams, IPromptHyperParameters, IRWSPromptRequestExecutor, IRWSPromptStreamExecutor, IRWSSinglePromptRequestExecutor, IRWSPromptJSON, IChainCallOutput }