import RWSError from './_error';
export default class Error500 extends RWSError {
    name: string;
    constructor(baseError: Error | unknown, resourcePath: string, params?: any);
}
