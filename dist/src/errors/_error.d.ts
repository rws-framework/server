export default class RWSError {
    protected baseError: Error | unknown;
    protected name: string;
    protected message: string;
    protected stack: string;
    constructor(baseError: Error | unknown, params?: any);
    printFullError(): void;
    getMessage(): string;
}
