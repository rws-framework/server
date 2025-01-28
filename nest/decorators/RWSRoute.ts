import { applyDecorators, Get, Post, Put, Delete } from '@nestjs/common';
import 'reflect-metadata';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';

export interface IRouteParams {
    public?: boolean;
    responseType?: string;
};

function isPrefixedRoutes(entry: RWSHTTPRoutingEntry): entry is IPrefixedHTTProutes {
    return 'prefix' in entry && 'routes' in entry;
}

export function RWSRoute(routeName: string, options: IRouteParams = {
    public: false,
    responseType: 'json'
}): MethodDecorator
{   
    if(!BootstrapRegistry.getConfig()){
        return (): null => null;
    }

    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];

    let routeConfig: IHTTProute | undefined;
    for (const entry of routes) {
        if (isPrefixedRoutes(entry)) {
            const route = entry.routes.find(r => r.name === routeName);
            if (route) {
                routeConfig = route;
                break;
            }
        } else if (entry.name === routeName) {
            routeConfig = entry;
            break;
        }
    }

    if (!routeConfig) {
        throw new Error(`No route configuration found for route name: ${routeName}`);
    }

    const methodDecorator = (() => {
        switch (routeConfig.method.toUpperCase()) {
            case 'GET':                        
                return Get(routeConfig.path);
            case 'POST':
                return Post(routeConfig.path);
            case 'PUT':
                return Put(routeConfig.path);
            case 'DELETE':
                return Delete(routeConfig.path);
            default:
                throw new Error(`Unsupported HTTP method: ${routeConfig.method}`);
        }
    });

    return methodDecorator();
}
