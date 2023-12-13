interface IHTTProute {
    name: string;
    path: string;  
    noParams?: boolean;  
}


interface IPrefixedHTTProutes {
    prefix: string;
    routes: IHTTProute[];
}

type RWSHTTPRoutingEntry = IHTTProute | IPrefixedHTTProutes;


export { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry }