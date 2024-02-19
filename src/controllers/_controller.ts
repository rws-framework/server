import { Response, Request } from 'express';
import RWSService from '../services/_service';


import Error404 from '../errors/Error404';
import Error500 from '../errors/Error500';

type IHTTProuteMethod  = (params: IRequestParams) => any;
interface IRequestParams{
    query: {
        [key: string]: any
    },
    data: {
        [key: string]: any
    },
    params: {
        [key: string]: any
    },
    res: Response,
    req: Request
}

export {IRequestParams, IHTTProuteMethod};

/**
 * @category Core extendable objects
 */
export default class Controller extends RWSService {
    private _hasError: boolean;

    constructor() {
        super();        
    }

    callMethod(methodName: string): (params: IRequestParams) => any
    {
        return (params: IRequestParams) => {                            
            if((!(this as any)[methodName])){
                const error = new Error404(new Error('The method does not exist in controller.'), `${__filename}::${methodName}`);

                return error;
            }

            try {              
                return (this as any)[methodName](params);
            }catch(e: Error | unknown){
                const error = new Error500(e, `${__filename}::${methodName}`, params);
                return error;
            }
        };
    }

    hasError(){
        const hasError: boolean = this._hasError;
        this._hasError = false;
        return hasError;
    }

    flagError(){
        this._hasError = true;
    }
}