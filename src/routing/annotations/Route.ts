import 'reflect-metadata';

type RequestMethodType = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface IHTTPRouteOpts{
    name: string;
    method: RequestMethodType;
}
  
function Route(name: string, method: RequestMethodType = 'GET') {
    let metaOpts: IHTTPRouteOpts = {name, method};

    return function(target: any, key: string) {          
        Reflect.defineMetadata(`Route:${key}`, metaOpts, target);
};
}

export default Route;
export {IHTTPRouteOpts, RequestMethodType}