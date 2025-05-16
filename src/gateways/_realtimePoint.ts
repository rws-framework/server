import { StaticRealtimePoint } from '../types/ITheGateway';
import {  Socket } from 'socket.io';

import { RWSGateway } from './_gateway';

import { BlackLogger, Injectable } from '../../nest';
import { ModuleRef } from '@nestjs/core';
import { OnModuleInit } from '@nestjs/common';
import { REALTIME_ROUTES_MAP_KEY, RealtimeRouteMetadata } from '../../nest/decorators/RWSRealtimeRoute';


@Injectable()
export abstract class RealtimePoint implements OnModuleInit {
  protected logger = new BlackLogger(this.constructor.name);
  protected static moduleRef: ModuleRef;
  private static gatewayClass: typeof RWSGateway;
  private static pointName: string;
  protected routesMap: Map<string | symbol, RealtimeRouteMetadata> = new Map();

  private gateway: RWSGateway;

  onModuleInit() {
    const parentClass = this.constructor as unknown as StaticRealtimePoint;
    this.gateway = parentClass.getModuleRef().get(parentClass.gatewayClass, { strict: false });

    const routes = Reflect.getMetadata(REALTIME_ROUTES_MAP_KEY, this.constructor);      

    if (routes) {
      this.routesMap = routes;
      this.logger.log(`Initialized ${this.routesMap.size} routes for point ${this.getPointName()}`);
      
      // Debug info
      this.routesMap.forEach((metadata, methodName) => {
        this.logger.debug(`Route: ${metadata.eventName} -> ${String(methodName)}`);
      });
    }
  }

  public static getPointName(): string 
  {
    return this.pointName;
  }

  public getPointName(): string 
  {
    return (this.constructor as unknown as StaticRealtimePoint).getPointName();
  }

  public static setPointName(pointName: string)
  {
    this.pointName = pointName;
  }

  public static setGateway(gatewayClass: typeof RWSGateway) {
    this.gatewayClass = gatewayClass;
  }

  getGateway(): RWSGateway
  {
    return this.gateway;
  }

  static getModuleRef(): ModuleRef {
    return this.moduleRef;
  }

  static setModuleRef(moduleRef: ModuleRef) {
    this.moduleRef = moduleRef;
  }  

  getRoutes(): Map<string | symbol, RealtimeRouteMetadata>
  {
    return this.routesMap;
  }

  emitMessage<T>(method: string, socket: Socket, data?: T, success: boolean = true): void
    {
        this.getGateway().emitMessage(this.getPointName(), method, socket, data, success);          
    }
}