export default class RWSError{
    protected baseError: Error | unknown;
    protected name: string;
    protected message: string;
    protected stack: string = null;

    constructor(baseError: Error | unknown, params: any = null){        
        this.baseError = baseError;
    }

    printFullError(): void
    {
        console.error('[RWS Error]')
        console.log(`[${this.name}] ${this.message}`);
        console.log(this.stack);
        console.error('[/RWS Error]')
    }

    getMessage(): string
    {
        return this.message;
    }
}