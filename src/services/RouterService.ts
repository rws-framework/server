import 'reflect-metadata';
import TheService from './_service';
import Controller, { IHTTProuteMethod } from '../controllers/_controller';
import { IHTTProute, RWSHTTPRoutingEntry } from '../routing/routes';
import { IHTTProuteParams } from '../routing/annotations/Route';
import { AbstractServer } from '../servers/AbstractServer';


type RouteEntry = {[key: string]: [IHTTProuteMethod, CallableFunction, IHTTProuteParams, string]};

interface IControllerRoutes {
  get: RouteEntry;
  post: RouteEntry;
  put: RouteEntry;
  delete: RouteEntry;
}

/**
 * 
 */
class RouterService extends TheService{
    constructor() {
        super();
    }

    static responseTypeToMIME(responseType: string){
        switch (responseType){
        case 'html': return 'text/html';
        default: return 'application/json';
        }    
    }

    getRouterAnnotations(constructor: typeof Controller): Record<string, {annotationType: string, metadata: any}> {    
        const annotationsData: Record<string, {annotationType: string, metadata: any}> = {};
  
        const propertyKeys: string[] = Reflect.getMetadataKeys(constructor.prototype).map((item: string): string => {
            return item.split(':')[1];
        });
        
        propertyKeys.forEach(key => {
            const annotations: string[] = ['Route'];
  
            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;
          
                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
            
                if (meta) {
                    annotationsData[String(key)] = {annotationType: annotation, metadata: meta};
                }
            });                 
        });
  
        return annotationsData;
    }

    async assignRoutes(app: AbstractServer, routesPackage: RWSHTTPRoutingEntry[], controllerList: Controller[]): Promise<IHTTProute[]>
    {                
        const controllerRoutes: IControllerRoutes = {
            get: {}, post: {}, put: {}, delete: {}
        };        

        controllerList.forEach((controllerInstance: Controller) => {          
            const controllerMetadata: Record<string, {annotationType: string, metadata: any}> = this.getRouterAnnotations(controllerInstance.constructor as typeof Controller);
          
            if(controllerMetadata){            
                Object.keys(controllerMetadata).forEach((key: string) => {
                    if(controllerMetadata[key].annotationType !== 'Route'){
                        return;    
                    }

                    this.setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app);
                });
            }
        });      

        let routes: IHTTProute[] = [];

        routesPackage.forEach((item: RWSHTTPRoutingEntry) => {   
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                // Handle the case where item is of type IPrefixedHTTProutes
                routes = [...routes, ...item.routes.map((subRouteItem: IHTTProute): IHTTProute => {
                    const subRoute: IHTTProute = {
                        path: item.prefix + subRouteItem.path,
                        name: subRouteItem.name
                    };
          
                    return subRoute;
                })];
            } else {
                // Handle the case where item is of type IHTTProute
                routes.push(item as IHTTProute);
            }        
        });          
      
        routes.forEach((route: IHTTProute) => {          
            Object.keys(controllerRoutes).forEach((_method: string) => {
                const actions = controllerRoutes[_method as keyof IControllerRoutes];                           

                if(!actions[route.name]){
                    return;
                }        
                                          
                this.addRouteToServer(actions, route);
            });
        });

        return routes;
    }

    private addRouteToServer(actions: RouteEntry, route: IHTTProute){
 
        const [routeMethod, appMethod, routeParams] = actions[route.name];                                
      
        if(!appMethod){
            return;
        }        

        
    }

    
    private setControllerRoutes(
        controllerInstance: Controller, 
        controllerMetadata: Record<string, {annotationType: string, metadata: any}>, 
        controllerRoutes: IControllerRoutes, key: string, app: AbstractServer): void
    {
        const action: IHTTProuteMethod = (controllerInstance as Controller).callMethod(key);
        const meta = controllerMetadata[key].metadata; 
        
        controllerRoutes.get[meta.name] = [action.bind(controllerInstance), app.getSrvApp()[meta.name].bind(app), meta.params, key];
    }
    
    hasRoute(routePath: string, routes: IHTTProute[]): boolean
    {
        return this.getRoute(routePath, routes) !== null;
    }

    getRoute(routePath: string, routes: IHTTProute[]): IHTTProute | null
    {

        // const front_routes = appConfig().get('front_routes');

        const foundRoute = routes.find((item: IHTTProute) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });      

        return foundRoute ? foundRoute : null;
    }
}

export default RouterService.getSingleton();
export {
    RouterService as RouterServiceInstance,
    IControllerRoutes
};