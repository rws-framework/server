import RWSError from './_error';

export default class Error404 extends RWSError{
    name = '403 not authorized.';

    constructor(baseError: Error | unknown = null, resourcePath: string = null, params: any | null = null){
        super(403, baseError, params);

        this.message = `RWS resource${resourcePath ? (' $' + resourcePath) : '' } was not autorized for current user.`;
    }
}