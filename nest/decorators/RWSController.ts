import 'reflect-metadata';
import { Controller } from '@nestjs/common';
import { RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';

export type RWSControllerMetadata = {
    name: string;
}

export const RWSCONTROLLER_METADATA_KEY = 'rws:controller';

export function RWSController(name: string) {
    if(!BootstrapRegistry.getConfig()){
        throw new Error('No config');
    }
    
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
    
    // Find the matching route configuration
    const routeConfig = routes.find(entry => 
        'controllerName' in entry && entry.controllerName === name
    );

    if (!routeConfig || !('prefix' in routeConfig)) {
        throw new Error(`No route configuration found for controller: ${name}`);
    }

    return (target: any) => {
        Reflect.defineMetadata(RWSCONTROLLER_METADATA_KEY, { name: routeConfig.controllerName }, target);

        return Controller(routeConfig.prefix);
    }
}