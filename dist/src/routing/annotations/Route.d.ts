import 'reflect-metadata';
type RequestMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE';
interface IHTTProuteParams {
    responseType: string;
}
interface IHTTProuteOpts {
    name: string;
    method: RequestMethodType;
    params?: IHTTProuteParams;
}
declare function Route(name: string, method?: RequestMethodType, params?: IHTTProuteParams): (target: any, key: string) => void;
export default Route;
export { IHTTProuteOpts, RequestMethodType, IHTTProuteParams };
