export default class RWSError{
    protected baseError: Error | unknown;
    protected name: string;
    protected message: string;
    protected code: number;
    protected stack?: string = null;

    constructor(code: number, baseError: Error | any = null, params: any = null){        
        if(!baseError){
            baseError = new Error('Error code ' + code);
        }

        this.code = code;
        this.baseError = baseError;
        this.stack = baseError.stack;
    }

    printFullError(): void
    {
        console.error('[RWS Error]')
        console.log(`[${this.name}] ${this.message}`);
        console.log('Stack:', this.stack);
        console.error('[/RWS Error]')
    }

    getMessage(): string
    {
        return this.message;
    }

    getCode(): number
    {
        return this.code;
    }  
    
    getStackTraceString(): string
    {
        return this.stack;
    }
}