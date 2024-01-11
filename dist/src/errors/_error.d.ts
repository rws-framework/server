export default class RWSError {
    protected baseError: Error | unknown;
    protected name: string;
    protected message: string;
    protected code: number;
    protected stack?: string;
    constructor(code: number, baseError?: Error | any, params?: any);
    printFullError(): void;
    getMessage(): string;
    getCode(): number;
    getStackTraceString(): string;
}
