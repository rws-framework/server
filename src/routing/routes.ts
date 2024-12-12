import { IRouteParams } from "../../nest/decorators/RWSRoute";

interface IHTTProute {
    name: string;
    path: string;  
    method: string;
    noParams?: boolean;
    options?: IRouteParams;
}

interface IPrefixedHTTProutes {
    prefix: string;
    controllerName: string;
    routes: IHTTProute[];
}

type RWSHTTPRoutingEntry = IHTTProute | IPrefixedHTTProutes;

export { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry };
