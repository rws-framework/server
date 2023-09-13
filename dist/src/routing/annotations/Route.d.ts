import 'reflect-metadata';
type RequestMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE';
interface IHTTPRouteOpts {
    name: string;
    method: RequestMethodType;
}
declare function Route(name: string, method?: RequestMethodType): (target: any, key: string) => void;
export default Route;
export { IHTTPRouteOpts, RequestMethodType };
