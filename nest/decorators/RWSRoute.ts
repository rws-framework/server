import { applyDecorators, Get, Post, Put, Delete } from '@nestjs/common';
import 'reflect-metadata';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSBootstrap';

export interface IHTTProuteParams {
    name: string;
    responseType?: string;
    options?: {
        public?: boolean;
    };
}

function isPrefixedRoutes(entry: RWSHTTPRoutingEntry): entry is IPrefixedHTTProutes {
    return 'prefix' in entry && 'routes' in entry;
}

export function RWSRoute(params: IHTTProuteParams) {
    return applyDecorators(
        function methodDecorator(target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor): void {
            const existingMetadata = Reflect.getMetadata('routes', target.constructor) || {};            
            const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
            // Find the matching route configuration
            let routeConfig: IHTTProute | undefined;
            for (const entry of routes) {
                if (isPrefixedRoutes(entry)) {
                    const route = entry.routes.find(r => r.name === params.name);
                    if (route) {
                        routeConfig = route;
                        break;
                    }
                } else if (entry.name === params.name) {
                    routeConfig = entry;
                    break;
                }
            }

            if (!routeConfig) {
                throw new Error(`No route configuration found for route name: ${params.name}`);
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
                    name: params.name,
                    params: {
                        responseType: params.responseType || 'json',
                        options: {
                            public: params.options?.public ?? routeConfig.options?.public ?? false
                        }
                    }
                }
            };

            Reflect.defineMetadata('routes', existingMetadata, target.constructor);
        }
    );
}
