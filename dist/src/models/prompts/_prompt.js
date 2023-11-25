"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const stream_1 = require("stream");
class RWSPrompt {
    constructor(params) {
        this.input = params.input;
        this.hyperParameters = params.hyperParameters;
        this.modelId = params.modelId;
        this.modelType = params.modelType;
    }
    async listen(source) {
        if (typeof source === 'string') {
            this.output = source;
        }
        else if (source instanceof stream_1.Readable) {
            this.output = ''; // Or any default value
            this.readStream(source, (chunk) => {
                this.output += source;
            });
        }
        return this;
    }
    addEnchantment(enchantment) {
        this.enhancedInput.push(enchantment);
    }
    getEnchantedInput() {
        return this.enhancedInput[this.enhancedInput.length - 1].output;
    }
    readSentInput() {
        return this.sentInput;
    }
    readInput() {
        return this.input;
    }
    readOutput() {
        return this.output;
    }
    getHyperParameters(override = null) {
        if (override) {
            this.hyperParameters = { ...this.hyperParameters, ...override };
        }
        return this.hyperParameters;
    }
    getModelMetadata() {
        return [this.modelType, this.modelId];
    }
    async sendWith(promptSender) {
        await promptSender(this);
    }
    async readStream(stream, react) {
        let first = true;
        const chunks = []; // Replace 'any' with the actual type of your chunks
        for await (const event of stream) {
            // Assuming 'event' has a specific structure. Adjust according to actual event structure.
            if ('chunk' in event && event.chunk.bytes) {
                const chunk = JSON.parse(Buffer.from(event.chunk.bytes).toString("utf-8"));
                if (first) {
                    console.log('chunk', chunk);
                    first = false;
                }
                react(chunk.completion);
                chunks.push(chunk.completion || chunk.generation); // Use the actual property of 'chunk' you're interested in
            }
            else if ('internalServerException' in event ||
                'modelStreamErrorException' in event ||
                'throttlingException' in event ||
                'validationException' in event) {
                console.error(event);
                break;
            }
        }
    }
}
exports.default = RWSPrompt;
//# sourceMappingURL=_prompt.js.map