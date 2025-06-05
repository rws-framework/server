import { Controller, applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';
import { AuthGuard, RWS_PROTECTED_KEY } from './guards/auth.guard';

export interface RWSControllerOptions {
    public?: boolean;
}

export function RWSController(name: string, options: RWSControllerOptions = {}) {
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

    // Use applyDecorators to combine the Controller decorator with the protection metadata
    return applyDecorators(
        Controller(routeConfig.prefix),
        SetMetadata(RWS_PROTECTED_KEY, !options.public), // Protected by default unless explicitly set to public,
        UseGuards(AuthGuard) // Explicitly apply the AuthGuard
    );
}