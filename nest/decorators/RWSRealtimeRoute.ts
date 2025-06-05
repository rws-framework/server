import { Controller, applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';
import { RealtimePoint } from '../../src/gateways/_realtimePoint';

export const REALTIME_ROUTES_MAP_KEY = 'REALTIME_POINT_ROUTES'

export interface RWSRealtimeRouteOptions {
    public?: boolean;
}

export interface RealtimeRouteMetadata {
    eventName: string;
    options?: RWSRealtimeRouteOptions;
    methodName: string | symbol;
    handler?: Function;
}

export function RWSRealtimeRoute(eventName: string, options?: RWSRealtimeRouteOptions) {
    if(!BootstrapRegistry.getConfig()){
      throw new Error('No config');
    }       
    
    return (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {      
      let routesMap: Map<string | symbol, RealtimeRouteMetadata> = 
        Reflect.getMetadata(REALTIME_ROUTES_MAP_KEY, target.constructor) || new Map();
      
      
      routesMap.set(eventName, {
        eventName,
        options,
        methodName: propertyKey,
        handler: descriptor.value
      });
      
      
      Reflect.defineMetadata(REALTIME_ROUTES_MAP_KEY, routesMap, target.constructor);
    };
  }