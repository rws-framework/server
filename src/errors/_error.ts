export default abstract class RWSError{
    protected baseError: Error | any;
    protected name: string;
    protected message: string;
    protected code: number;
    protected stack?: string = null;

    constructor(code: number, baseError: Error | any = null, params: any = null){        
        if(!baseError){
            baseError = new Error('Error code ' + code);
        }

        this.code = code;
        if(typeof baseError === 'string'){            
            this.baseError = new Error(baseError as string);            
        }else {
            this.baseError = baseError;
        }        

        if(this.baseError.stack){
            this.stack = baseError.stack;
        }
    }

    static make(error: Error)
    {
        console.log(this);    
    }

    printFullError(): void
    {
        console.error('[RWS Error]');
        console.log(`[${this.name}] ${this.message}`);
        console.log('Stack:', this.stack);
        console.error('[/RWS Error]');
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