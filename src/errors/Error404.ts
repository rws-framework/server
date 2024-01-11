import RWSError from './_error';

export default class Error404 extends RWSError{
    name = '404 Resource not found'

    constructor(baseError: Error | unknown, resourcePath: string, params: any = null){
        super(404, baseError, params);

        this.message = `Resource "${resourcePath}" was not found`
    }
}