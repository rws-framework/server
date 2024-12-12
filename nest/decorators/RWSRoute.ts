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
}) {
    return applyDecorators(
        function methodDecorator(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
            const existingMetadata = Reflect.getMetadata('routes', target.constructor) || {};            
            const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
            // Find the matching route configuration
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

            // Apply the appropriate HTTP method decorator based on the route configuration
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
            })();

            // Apply the HTTP method decorator
            methodDecorator(target, propertyKey, descriptor);
            
            existingMetadata[propertyKey] = {
                annotationType: 'Route',
                metadata: {
                    name: routeName,
                    params: {
                        responseType: options.responseType || 'json',
                        options: {
                            public: options?.public ?? routeConfig.options?.public ?? false
                        }
                    }
                }
            };

            Reflect.defineMetadata('routes', existingMetadata, target.constructor);
        }
    );
}
