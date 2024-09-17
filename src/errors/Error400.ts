import RWSError from './_error';

export default class Error400 extends RWSError{
    name = '400 Bad Request';

    constructor(baseError: Error | unknown = null, resourcePath: string = null, params: any = null){
        super(400, baseError, params);

        this.message = `Bad request was sent: ${JSON.stringify(params)} for resource${resourcePath ? (' $' + resourcePath) : '' }`;
    }
}