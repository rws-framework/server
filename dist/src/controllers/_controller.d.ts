import { Response } from "express";
import RWSService from "../services/_service";
type IHTTProuteMethod = (params: IRequestParams) => any;
interface IRequestParams {
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
}
export { IRequestParams, IHTTProuteMethod };
/**
 * @category Core extendable objects
 */
export default class Controller extends RWSService {
    constructor();
}
