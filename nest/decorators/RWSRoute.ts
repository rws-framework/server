import { applyDecorators, Get, Post, Put, Delete, SetMetadata, UseGuards  } from '@nestjs/common';
import 'reflect-metadata';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';

import { AuthGuard, RWS_PROTECTED_KEY } from './guards/auth.guard';


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
}): MethodDecorator {   
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        if(!BootstrapRegistry.getConfig()){
            return descriptor;
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

        // First apply the metadata
        SetMetadata(RWS_PROTECTED_KEY, !options.public)(target, propertyKey, descriptor);

        // Then apply the guard
        UseGuards(AuthGuard)(target, propertyKey, descriptor);

        // Finally apply the HTTP method decorator
        switch (routeConfig.method.toUpperCase()) {
            case 'GET':                        
                Get(routeConfig.path)(target, propertyKey, descriptor);
                break;
            case 'POST':
                Post(routeConfig.path)(target, propertyKey, descriptor);
                break;
            case 'PUT':
                Put(routeConfig.path)(target, propertyKey, descriptor);
                break;
            case 'DELETE':
                Delete(routeConfig.path)(target, propertyKey, descriptor);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${routeConfig.method}`);
        }

        return descriptor;
    };
}