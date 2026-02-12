import 'reflect-metadata';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../routing/routes';
import { ConsoleService } from './ConsoleService';
import { Injectable } from '../../nest';  
import { Controller } from '@nestjs/common/interfaces';
import { RWSConfigService } from './RWSConfigService';

@Injectable()
class RouterService {  
    constructor(
        private configService: RWSConfigService, 
        private consoleService: ConsoleService
    ) {
    }

    generateRoutesFromResources(httpRoutes: RWSHTTPRoutingEntry[]): RWSHTTPRoutingEntry[] {
        return httpRoutes;
    }

    // Utility method to convert flattened routes - kept for compatibility
    flattenRoutes(routesPackage: RWSHTTPRoutingEntry[]): IHTTProute[] {
        let routes: IHTTProute[] = [];

        routesPackage.forEach((item: RWSHTTPRoutingEntry) => {   
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {                
                for(const itemRoute of item.routes){
                    this.populateByPath(routes, itemRoute, item);
                }
            } else {
                this.populateByPath(routes, item as IHTTProute);
            }        
        });          

        return routes;
    }

    private populateByPath(routes: IHTTProute[], item: IHTTProute, parent?: IPrefixedHTTProutes){        
        if(Array.isArray(item.path)){
            for(const itemRoute of item.path){
                 routes.push({
                    path: parent ? parent.prefix + itemRoute : itemRoute,
                    name: item.name,
                    method: item.method
                });
            }
            return;
        }

        routes.push({
            path: parent ? parent.prefix + item.path : item.path,
            name: item.name,
            method: item.method
        });
    }

    // Utility method for response type conversion - used by interceptor
    static responseTypeToMIME(responseType: string, customMimeType?: string){
        if (customMimeType) {
            return customMimeType;
        }
        
        switch (responseType){
        case 'html': return 'text/html';
        case 'file': return 'application/octet-stream';
        case 'pdf': return 'application/pdf';
        default: return 'application/json';
        }    
    }

    // Method to get RWSRoute metadata from controller - used by interceptor
    getRouterAnnotations(constructor: Controller): Record<string, {annotationType: string, metadata: any}> {    
        return Reflect.getMetadata('routes', constructor) || {};
    }

    // Utility methods kept for compatibility
    hasRoute(routePath: string, routes: IHTTProute[]): boolean {
        return this.getRoute(routePath, routes) !== null;
    }

    getRoute(routePath: string, routes: IHTTProute[]): IHTTProute | null {
        const foundRoute = routes.find((item: IHTTProute) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });      

        return foundRoute ? foundRoute : null;
    }
}

export {
    RouterService
};
