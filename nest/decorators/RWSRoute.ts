import { applyDecorators, Get, Post, Put, Delete, SetMetadata, UseGuards, Patch  } from '@nestjs/common';
import 'reflect-metadata';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';

import { AuthGuard, RWS_PROTECTED_KEY } from './guards/auth.guard';
import { RWS_IGNORE_ANTIFLOOD_KEY } from './IgnoreAntiflood';

export const appliedRWSControllers = new Set<any>();

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

    // Resolve route configs and sort by priority (higher first) before applying NestJS decorators
    const resolvedEntries: { propertyKey: string; meta: { routeName: string; options: IRouteParams }; routeConfig: IHTTProute; routePrefix: string }[] = [];

    for (const [propertyKey, meta] of Object.entries(deferredRoutes) as [string, { routeName: string; options: IRouteParams }][]) {
        const { routeName } = meta;

        let routeConfig: IHTTProute | undefined;
        let routePrefix = '';
        for (const entry of routes) {
            if (isPrefixedRoutes(entry)) {
                const route = entry.routes.find(r => r.name === routeName);
                if (route) {
                    routeConfig = route;
                    routePrefix = entry.prefix;
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

        resolvedEntries.push({ propertyKey, meta, routeConfig, routePrefix });
    }

    // Sort by priority descending — higher priority routes get registered first
    resolvedEntries.sort((a, b) => (b.routeConfig.priority ?? 0) - (a.routeConfig.priority ?? 0));

    for (const { propertyKey, meta, routeConfig, routePrefix } of resolvedEntries) {
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey);
        if (!descriptor) continue;

        const { routeName, options } = meta;

        // Store route metadata for RouterService to read
        const existingRoutes = Reflect.getMetadata('routes', target) || {};
        const ignoreAntiflood = Reflect.getMetadata(RWS_IGNORE_ANTIFLOOD_KEY, descriptor.value) === true;
        const paths = Array.isArray(routeConfig.path) ? routeConfig.path : [routeConfig.path];
        const fullPaths = paths.map(p => (routePrefix + p).replace(/\/+/g, '/'));

        existingRoutes[propertyKey] = {
            annotationType: 'Route',
            metadata: {
                name: routeName,
                method: routeConfig.method.toUpperCase(),
                path: routeConfig.path,
                fullPath: fullPaths.length === 1 ? fullPaths[0] : fullPaths,
                params: options,
                ignoreAntiflood
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

    // Reorder methods on the prototype so NestJS's scanner picks them up in priority order.
    // Object.getOwnPropertyNames() follows insertion order, so delete and re-add in sorted order.
    for (const { propertyKey } of resolvedEntries) {
        const desc = Object.getOwnPropertyDescriptor(target.prototype, propertyKey);
        if (!desc) continue;
        delete target.prototype[propertyKey];
        Object.defineProperty(target.prototype, propertyKey, desc);
    }

    appliedRWSControllers.add(target);
}
