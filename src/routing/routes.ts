import { IRouteParams } from "../../nest/decorators/RWSRoute";

interface IHTTProute<P = {[key: string]: any}> {
    name: string;
    path: string;  
    method: string;
    noParams?: boolean;
    options?: IRouteParams;
    plugins?: P
}

interface IPrefixedHTTProutes<P = {[key: string]: any}> {
    prefix: string;
    exportAutoRoutes?: boolean;
    controllerName: string;
    routes: IHTTProute<P>[];
}

type RWSHTTPRoutingEntry<P = {[key: string]: any}> = IHTTProute<P> | IPrefixedHTTProutes<P>;

export { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry };
