import RWSError from './_error';
export default class Error404 extends RWSError {
    name: string;
    constructor(baseError: Error | unknown, resourcePath: string, params?: any);
}
