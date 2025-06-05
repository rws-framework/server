import RWSError from './_error';

export default class Error500 extends RWSError {
    name = '500 internal server error';

    constructor(baseError: Error | unknown, resourcePath?: string, params: any = null){
        super(500, baseError, params);

        if(!resourcePath){
            resourcePath = __filename;
        }

        this.message = `RWS resource "$${resourcePath}" has internal error`;
    }
}