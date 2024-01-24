import { Response, Request } from "express";
import RWSService from "../services/_service";
type IHTTProuteMethod = (params: IRequestParams<any>) => any;
interface IRequestParams<T> {
    query: {
        [key: string]: any;
    };
    data: {
        [key: string]: any;
    };
    params: {
        [key: string]: any;
    };
    res: Response;
    req: Request;
}
export { IRequestParams, IHTTProuteMethod };
/**
 * @category Core extendable objects
 */
export default class Controller extends RWSService {
    private _hasError;
    constructor();
    callMethod(methodName: string): (params: IRequestParams<any>) => any;
    hasError(): boolean;
    flagError(): void;
}
