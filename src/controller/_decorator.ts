import 'reflect-metadata';

import { Controller as NestController, Logger } from '@nestjs/common';
import { BootstrapRegistry } from '../../nest/decorators/RWSConfigInjector';
import { RWSHTTPRoutingEntry, IHTTProute, IPrefixedHTTProutes } from '../routing/routes';
import { OpModelType } from '@rws-framework/db';
import { RWSAutoApiController } from './_autoApi';

export type RWSControllerOptions = {}

function isPrefixedRoutes(entry: RWSHTTPRoutingEntry): entry is IPrefixedHTTProutes {
  return 'prefix' in entry && 'routes' in entry;
}

export type RWSControllerMetadata = {
  name: string;
  dbModel?: OpModelType<any>
}

export const RWSCONTROLLER_METADATA_KEY = 'rws:controller';

export function RWSControllerDecorator(
    controllerName: string,
    dbModel?: () => OpModelType<any>
  ): ClassDecorator {    
    
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];
    
    return (target: any) => {      
      const isAutoApiController = target.prototype && 
        Object.getPrototypeOf(target.prototype).constructor === RWSAutoApiController;      

      if(dbModel && !isAutoApiController){
        (new Logger('@RWSController()')).error(`@RWSController(name, dbModel) decorated class "${target.name}" needs to extend: require { RWSAutoApiController } from '@rws-framework/server'`);
        throw new Error('RWSAutoApiController not extended.')
      }

      // Find the matching route configuration
      for (const entry of routes) {
        if (isPrefixedRoutes(entry)) {
          if((entry as IPrefixedHTTProutes).controllerName === controllerName){
            const ControllerDecorator: ClassDecorator = NestController(entry.prefix);
            Reflect.defineMetadata(RWSCONTROLLER_METADATA_KEY, { name: controllerName, dbModel: dbModel ? dbModel() : null }, target);

            return ControllerDecorator(target);
          }       
        }
      }
    
      throw new Error(`No controller "${controllerName}" defined in routes`);
    }
}