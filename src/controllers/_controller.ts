import { Response, Request } from "express";
import RWSService from "../services/_service";

import Error404 from '../errors/Error404';
import Error500 from '../errors/Error500';

type IHTTProuteMethod  = (params: IRequestParams) => any
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

export {IRequestParams, IHTTProuteMethod}

/**
 * @category Core extendable objects
 */
export default class Controller extends RWSService {
    constructor() {
        super();        
    }

    callMethod(methodName: string): (params: IRequestParams) => any
    {
        return (params: IRequestParams) => {                    
            if((!(this as any)[methodName])){
                throw new Error404(new Error('The method does not exist in controller.'), `${__filename}::${methodName}`);
            }

            try {              
                return (this as any)[methodName](params);
            }catch(e: Error | unknown){
                throw new Error500(e, `${__filename}::${methodName}`, params);
            }
        }
    }
}