import RWSError from './_error';

export default class Error400 extends RWSError{
    name = '400 bad payload';

    constructor(baseError: Error | unknown, resourcePath: string, params: any = null){
        super(400, baseError, params);

        this.message = `Resource "${resourcePath}" was not found`;
    }
}