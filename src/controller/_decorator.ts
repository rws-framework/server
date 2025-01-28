import { Controller as NestController, ControllerOptions as NestControllerOptions } from '@nestjs/common';
import { BootstrapRegistry } from '../../nest/decorators/RWSConfigInjector';
import { RWSHTTPRoutingEntry, IHTTProute, IPrefixedHTTProutes } from '../routing/routes';

export type RWSControllerOptions = {}

function isPrefixedRoutes(entry: RWSHTTPRoutingEntry): entry is IPrefixedHTTProutes {
  return 'prefix' in entry && 'routes' in entry;
}

export function RWSControllerDecorator(
    controllerName: string,
  ): ClassDecorator {    
    
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
    
    // Find the matching route configuration
    let routeConfig: IHTTProute | undefined;
    for (const entry of routes) {
      if (isPrefixedRoutes(entry)) {
        if((entry as IPrefixedHTTProutes).controllerName === controllerName){
          const ControllerDecorator: ClassDecorator = NestController(entry.prefix);
          return ControllerDecorator;
        }       
      }
    }
  
    throw new Error(`No controller "${controllerName}" defined in routes`);
}