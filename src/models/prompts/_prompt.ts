import { Readable } from 'stream';


interface IPromptHyperParameters {
    temperature: number,
    top_k?: number,
    top_p?: number,
    [key: string]: string | number | boolean | null
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

class RWSPrompt {
    private input: string;
    private enhancedInput: IPromptEnchantment[];
    private sentInput: string;
    private originalInput: string;
    private output: string;
    private modelId: string;
    private modelType: string;

    private hyperParameters: IPromptHyperParameters;

    constructor(params: IPromptParams){
        this.input = params.input;
        this.originalInput = params.input;
        this.hyperParameters = params.hyperParameters;
        this.modelId = params.modelId;
        this.modelType = params.modelType;
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

    readSentInput(): string
    {
        return this.sentInput;
    }

    readInput(): string
    {
        return this.input;
    }

    readOutput(): string
    {
        return this.output;
    }

    getHyperParameters(base: any = null): IPromptHyperParameters
    {        
        if(base){
            this.hyperParameters = {...base, ...this.hyperParameters};
        }

        return this.hyperParameters;
    }

    getModelMetadata(): [string, string]
    {
        return [this.modelType, this.modelId];
    }

    async sendWith(promptSender: IPromptSender): Promise<void>
    {
        this.sentInput = this.input;
        await promptSender(this);
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
}

export default RWSPrompt;

export { IPromptSender, IPromptEnchantment, IPromptParams, IPromptHyperParameters }