interface IHTTProute {
    name: string;
    path: string;
}
interface IPrefixedHTTProutes {
    prefix: string;
    routes: IHTTProute[];
}
type RWSHTTPRoutingEntry = IHTTProute | IPrefixedHTTProutes;
export { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry };
