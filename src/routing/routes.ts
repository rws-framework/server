interface IHTTProute {
    name: string;
    path: string;  
    method: string;
    noParams?: boolean;
    options?: {
        public?: boolean;
    };
}

interface IPrefixedHTTProutes {
    prefix: string;
    controllerName: string;
    routes: IHTTProute[];
}

type RWSHTTPRoutingEntry = IHTTProute | IPrefixedHTTProutes;

export { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry };
