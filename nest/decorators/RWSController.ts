import { Controller } from '@nestjs/common';
import { RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSBootstrap';

export function RWSController(name: string) {
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
    
    // Find the matching route configuration
    const routeConfig = routes.find(entry => 
        'controllerName' in entry && entry.controllerName === name
    );

    if (!routeConfig || !('prefix' in routeConfig)) {
        throw new Error(`No route configuration found for controller: ${name}`);
    }

    // Apply the NestJS Controller decorator with the prefix from the route configuration
    return Controller(routeConfig.prefix);
}
