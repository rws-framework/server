import { applyDecorators, Get, Post, Put, Delete, SetMetadata, UseGuards, Patch, Redirect, Req  } from '@nestjs/common';
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

function generateRedirectHandler(target: any, routeConfig: IHTTProute, routePrefix: string, routes: RWSHTTPRoutingEntry[]): void {
    // Find the target route config and prefix.
    let targetConfig: IHTTProute | undefined;
    let targetPrefix = '';
    for (const entry of routes) {
        if (isPrefixedRoutes(entry)) {
            const route = entry.routes.find(r => r.name === routeConfig.redirect);
            if (route) {
                targetConfig = route;
                targetPrefix = entry.prefix;
                break;
            }
        } else if (entry.name === routeConfig.redirect) {
            targetConfig = entry;
            break;
        }
    }

    if (!targetConfig) {
        throw new Error(`Redirect target not found for route ${routeConfig.name}: ${routeConfig.redirect}`);
    }

    const methodName = `__redirect_${routeConfig.name.replace(/[^a-zA-Z0-9]/g, '_')}`;
    const paths = Array.isArray(routeConfig.path) ? routeConfig.path : [routeConfig.path];
    const fullPaths = paths.map(p => (routePrefix + p).replace(/\/+/g, '/'));

    const handler = function(req: any) {
        const targetPaths = Array.isArray(targetConfig.path) ? targetConfig.path : [targetConfig.path];
        const targetPathTemplate = targetPaths[0];
        let targetUrl = (targetPrefix + targetPathTemplate).replace(/\/+/g, '/');

        for (const [key, value] of Object.entries(req.params || {})) {
            targetUrl = targetUrl.replace(`:${key}`, encodeURIComponent(String(value)));
        }

        const queryIndex = req.url.indexOf('?');
        if (queryIndex !== -1) {
            targetUrl += req.url.substring(queryIndex);
        }

        return { url: targetUrl, statusCode: 307 };
    };

    target.prototype[methodName] = handler;
    const descriptor: PropertyDescriptor = {
        value: handler,
        writable: true,
        enumerable: true,
        configurable: true
    };

    const existingRoutes = Reflect.getMetadata('routes', target) || {};
    existingRoutes[methodName] = {
        annotationType: 'Route',
        metadata: {
            name: routeConfig.name,
            method: routeConfig.method.toUpperCase(),
            path: routeConfig.path,
            fullPath: fullPaths.length === 1 ? fullPaths[0] : fullPaths,
            params: { public: false, responseType: 'json' },
            ignoreAntiflood: false
        }
    };
    Reflect.defineMetadata('routes', existingRoutes, target);

    SetMetadata(RWS_PROTECTED_KEY, true)(target.prototype, methodName, descriptor);
    UseGuards(AuthGuard)(target.prototype, methodName, descriptor);
    Req()(target.prototype, methodName, 0);
    Redirect('')(target.prototype, methodName, descriptor);

    switch (routeConfig.method.toUpperCase()) {
        case 'GET':
            Get(routeConfig.path)(target.prototype, methodName, descriptor);
            break;
        case 'POST':
            Post(routeConfig.path)(target.prototype, methodName, descriptor);
            break;
        case 'PUT':
            Put(routeConfig.path)(target.prototype, methodName, descriptor);
            break;
        case 'DELETE':
            Delete(routeConfig.path)(target.prototype, methodName, descriptor);
            break;
        case 'PATCH':
            Patch(routeConfig.path)(target.prototype, methodName, descriptor);
            break;
        default:
            throw new Error(`Unsupported HTTP method: ${routeConfig.method}`);
    }

    Object.defineProperty(target.prototype, methodName, descriptor);
}

export function applyRWSRouteMetadata(target: any): void {
    const deferredRoutes = Reflect.getMetadata('rws:deferred-routes', target) || {};
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
    const controllerMeta = Reflect.getMetadata('rws:deferred-controller', target);
    const controllerName = controllerMeta?.controllerName;

    const resolvedEntries: { propertyKey: string; meta: any; routeConfig: IHTTProute; routePrefix: string }[] = [];

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

        if (routeConfig.redirect) {
            let redirectFound = false;
            for (const entry of routes) {
                if (isPrefixedRoutes(entry)) {
                    if (entry.routes.some(r => r.name === routeConfig.redirect)) {
                        redirectFound = true;
                        break;
                    }
                } else if (entry.name === routeConfig.redirect) {
                    redirectFound = true;
                    break;
                }
            }
            if (!redirectFound) {
                throw new Error(`Redirect target not found for route ${routeName}: ${routeConfig.redirect}`);
            }
        }

        resolvedEntries.push({ propertyKey, meta, routeConfig, routePrefix });
    }

    resolvedEntries.sort((a, b) => (b.routeConfig.priority ?? 0) - (a.routeConfig.priority ?? 0));

    for (const { propertyKey, meta, routeConfig, routePrefix } of resolvedEntries) {
        const descriptor = Object.getOwnPropertyDescriptor(target.prototype, propertyKey);
        if (!descriptor) continue;

        const { routeName, options } = meta;
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

        SetMetadata(RWS_PROTECTED_KEY, !options.public)(target.prototype, propertyKey, descriptor);
        UseGuards(AuthGuard)(target.prototype, propertyKey, descriptor);

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

        Object.defineProperty(target.prototype, propertyKey, descriptor);
    }

    // Auto-generate redirect handlers for routes in this controller's group that have a redirect
    // but no explicit method on the controller.
    if (controllerName) {
        for (const entry of routes) {
            if (isPrefixedRoutes(entry) && entry.controllerName === controllerName) {
                for (const route of entry.routes) {
                    if (route.redirect) {
                        const hasMethod = Object.values(deferredRoutes).some((m: any) => m.routeName === route.name);
                        if (!hasMethod) {
                            generateRedirectHandler(target, route, entry.prefix, routes);
                        }
                    }
                }
            }
        }
    }

    appliedRWSControllers.add(target);
}
