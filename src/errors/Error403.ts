import RWSError from './_error';

export default class Error404 extends RWSError{
    name = '403 not authorized.';

    constructor(baseError: Error | unknown, resourcePath: string, params: any | null = null){
        super(403, baseError, params);

        this.message = `RWS resource "$${resourcePath}" was not autorized for current user.`;
    }
}