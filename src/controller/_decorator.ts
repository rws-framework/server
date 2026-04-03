import 'reflect-metadata';

import { Controller as NestController, Logger } from '@nestjs/common';
import { BootstrapRegistry } from '../../nest/decorators/RWSConfigInjector';
import { RWSHTTPRoutingEntry, IHTTProute, IPrefixedHTTProutes } from '../routing/routes';
import { OpModelType } from '@rws-framework/db';
import { RWSAutoApiController } from './_autoApi';

export type RWSControllerOptions = {}

// Registry of all classes decorated with @RWSController for deferred application
const deferredControllerRegistry: any[] = [];

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
    
    return (target: any) => {
      // Store metadata for deferred application after config is available
      Reflect.defineMetadata('rws:deferred-controller', { controllerName, dbModel }, target);
      deferredControllerRegistry.push(target);
      return target;
    };
}

export function applyDeferredControllerMetadata(target: any): any {
    const meta = Reflect.getMetadata('rws:deferred-controller', target);
    if (!meta) {
        return target;
    }

    const { controllerName, dbModel } = meta;
    const routes = BootstrapRegistry.getConfig().http_routes as RWSHTTPRoutingEntry[];

    const isAutoApiController = target.prototype && 
      Object.getPrototypeOf(target.prototype).constructor === RWSAutoApiController;      

    if(dbModel && !isAutoApiController){
      (new Logger('@RWSController()')).error(`@RWSController(name, dbModel) decorated class "${target.name}" needs to extend: require { RWSAutoApiController } from '@rws-framework/server'`);
      throw new Error('RWSAutoApiController not extended.')
    }

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

export function applyAllDeferredMetadata(): void {
    const { applyRWSRouteMetadata } = require('../../nest/decorators/RWSRoute');

    for (const target of deferredControllerRegistry) {
        applyDeferredControllerMetadata(target);
        applyRWSRouteMetadata(target);
    }
}