"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RWSPrompt {
    constructor(params) {
        this.output = '';
        this.varStorage = {};
        this.onStream = (chunk) => {
        };
        this.input = params.input;
        this.originalInput = params.input;
        this.hyperParameters = params.hyperParameters;
        this.modelId = params.modelId;
        this.modelType = params.modelType;
        this.created_at = new Date();
    }
    listen(source) {
        if (typeof source === 'string') {
            this.output = source;
        }
        else if (source instanceof ReadableStream) {
            this.output = '';
            let i = 0;
            this.readStreamAsText(source, (chunk) => {
                this.output += chunk;
                console.log('Chunk from readStreamAsText: i =', i);
                this.onStream(chunk);
                i++;
            });
        }
        return this;
    }
    setStreamCallback(callback) {
        this.onStream = callback;
    }
    addEnchantment(enchantment) {
        this.enhancedInput.push(enchantment);
        this.input = enchantment.input;
    }
    getEnchantedInput() {
        return this.enhancedInput[this.enhancedInput.length - 1].output;
    }
    getModelId() {
        return this.modelId;
    }
    readSentInput() {
        return this.sentInput;
    }
    readInput() {
        return this.input;
    }
    readBaseInput() {
        return this.originalInput;
    }
    setBaseInput(input) {
        this.originalInput = input;
        return this;
    }
    injestOutput(content) {
        this.output = content;
        return this;
    }
    readOutput() {
        return this.output;
    }
    getHyperParameters(base = null) {
        if (base) {
            this.hyperParameters = { ...base, ...this.hyperParameters };
        }
        return this.hyperParameters;
    }
    getHyperParameter(key) {
        if (!this.hyperParameters[key]) {
            return null;
        }
        return this.hyperParameters[key];
    }
    setHyperParameter(key, value) {
        this.hyperParameters[key] = value;
        return this;
    }
    setHyperParameters(value) {
        this.hyperParameters = value;
        return this;
    }
    setMultiTemplate(template) {
        this.multiTemplate = template;
        return this;
    }
    getMultiTemplate() {
        return this.multiTemplate;
    }
    setConvo(convo) {
        this.convo = convo.setPrompt(this);
        return this;
    }
    getConvo() {
        return this.convo;
    }
    replacePromptVar(key, val) {
    }
    getModelMetadata() {
        return [this.modelType, this.modelId];
    }
    async requestWith(executor, intruderPrompt = null, debugVars = {}) {
        this.sentInput = this.input;
        const returnedRWS = await executor.promptRequest(this, null, intruderPrompt, debugVars);
        this.output = returnedRWS.readOutput();
    }
    async singleRequestWith(executor, intruderPrompt = null) {
        await executor.singlePromptRequest(this, null, intruderPrompt);
        this.sentInput = this.input;
    }
    async streamWith(executor, read, debugVars = {}) {
        const chainStream = await executor.promptStream(this, read, debugVars);
        if (!this.input && this.multiTemplate.template) {
            this.input = this.multiTemplate.template;
        }
        this.sentInput = this.input;
        return chainStream;
    }
    getVar(key) {
        return Object.keys(this.varStorage).includes(key) ? this.varStorage[key] : null;
    }
    setVar(key, val) {
        this.varStorage[key] = val;
        return this;
    }
    async _oldreadStream(stream, react) {
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
    async isChainStreamType(source) {
        if (source && typeof source[Symbol.asyncIterator] === 'function') {
            const asyncIterator = source[Symbol.asyncIterator]();
            if (typeof asyncIterator.next === 'function' &&
                typeof asyncIterator.throw === 'function' &&
                typeof asyncIterator.return === 'function') {
                try {
                    // Optionally check if the next method yields a value of the expected type
                    const { value, done } = await asyncIterator.next();
                    return !done && value instanceof ReadableStream; // or whatever check makes sense for IterableReadableStream<ChainValues>
                }
                catch (error) {
                    // Handle or ignore error
                }
            }
        }
        return false;
    }
    async readStreamAsText(readableStream, callback) {
        const reader = readableStream.getReader();
        let readResult;
        // Continuously read from the stream
        while (!(readResult = await reader.read()).done) {
            if (readResult.value && readResult.value.response) {
                // Emit each chunk text as it's read
                callback(readResult.value.response);
            }
        }
    }
    toJSON() {
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
        };
    }
}
exports.default = RWSPrompt;
//# sourceMappingURL=_prompt.js.map