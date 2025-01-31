import 'reflect-metadata';

import { Controller as NestController } from '@nestjs/common';
import { BootstrapRegistry } from '../../nest/decorators/RWSConfigInjector';
import { RWSHTTPRoutingEntry, IHTTProute, IPrefixedHTTProutes } from '../routing/routes';

export type RWSControllerOptions = {}

function isPrefixedRoutes(entry: RWSHTTPRoutingEntry): entry is IPrefixedHTTProutes {
  return 'prefix' in entry && 'routes' in entry;
}

export type RWSControllerMetadata = {
  name: string;
}

export const RWSCONTROLLER_METADATA_KEY = 'rws:controller';

export function RWSControllerDecorator(
    controllerName: string,
  ): ClassDecorator {    
    
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
    
    return (target: any) => {
      // Find the matching route configuration
      let routeConfig: IHTTProute | undefined;
      for (const entry of routes) {
        if (isPrefixedRoutes(entry)) {
          if((entry as IPrefixedHTTProutes).controllerName === controllerName){
            const ControllerDecorator: ClassDecorator = NestController(entry.prefix);
            Reflect.defineMetadata(RWSCONTROLLER_METADATA_KEY, { name: controllerName }, target);

            return ControllerDecorator(target);
          }       
        }
      }
    
      throw new Error(`No controller "${controllerName}" defined in routes`);
    }
}