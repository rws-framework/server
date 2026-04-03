import { applyDecorators, Get, Post, Put, Delete, SetMetadata, UseGuards, Patch  } from '@nestjs/common';
import 'reflect-metadata';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';

import { AuthGuard, RWS_PROTECTED_KEY } from './guards/auth.guard';


export interface IRouteParams {
    public?: boolean;
    responseType?: string;
    mimeType?: string;
    fileDisplay?: 'download' | 'inline';
};

function isPrefixedRoutes(entry: RWSHTTPRoutingEntry): entry is IPrefixedHTTProutes {
    return 'prefix' in entry && 'routes' in entry;
}

export function RWSRoute(routeName: string, options: IRouteParams = {
    public: false,
    responseType: 'json'
}): MethodDecorator {   
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        // Store deferred route metadata — actual NestJS decorators applied later via applyRWSRouteMetadata
        const deferredRoutes = Reflect.getMetadata('rws:deferred-routes', target.constructor) || {};
        deferredRoutes[propertyKey as string] = { routeName, options };
        Reflect.defineMetadata('rws:deferred-routes', deferredRoutes, target.constructor);

        return descriptor;
    };
}

export function applyRWSRouteMetadata(target: any): void {
    const deferredRoutes = Reflect.getMetadata('rws:deferred-routes', target) || {};
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];

    for (const [propertyKey, meta] of Object.entries(deferredRoutes) as [string, { routeName: string; options: IRouteParams }][]) {
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey);
        if (!descriptor) continue;

        const { routeName, options } = meta;

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

        // Store route metadata for RouterService to read
        const existingRoutes = Reflect.getMetadata('routes', target) || {};
        existingRoutes[propertyKey] = {
            annotationType: 'Route',
            metadata: {
                name: routeName,
                method: routeConfig.method.toUpperCase(),
                path: routeConfig.path,
                params: options
            }
        };
        Reflect.defineMetadata('routes', existingRoutes, target);

        // Apply the auth metadata and guard
        SetMetadata(RWS_PROTECTED_KEY, !options.public)(target.prototype, propertyKey, descriptor);
        UseGuards(AuthGuard)(target.prototype, propertyKey, descriptor);

        // Apply the standard NestJS HTTP method decorator
        switch (routeConfig.method.toUpperCase()) {
            case 'GET':
                Get(routeConfig.path)(target.prototype, propertyKey, descriptor);
                break;
            case 'POST':
                Post(routeConfig.path)(target.prototype, propertyKey, descriptor);
                break;
            case 'PUT':
                Put(routeConfig.path)(target.prototype, propertyKey, descriptor);
                break;
            case 'DELETE':
                Delete(routeConfig.path)(target.prototype, propertyKey, descriptor);
                break;
            case 'PATCH':
                Patch(routeConfig.path)(target.prototype, propertyKey, descriptor);
                break;
            default:
                throw new Error(`Unsupported HTTP method: ${routeConfig.method}`);
        }

        // Redefine the descriptor since NestJS decorators may have modified it
        Object.defineProperty(target.prototype, propertyKey, descriptor);
    }
}