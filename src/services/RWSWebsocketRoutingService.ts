import 'reflect-metadata';
import { DiscoveryService, Reflector  } from '@nestjs/core';
import { Injectable, Logger, RawBodyRequest } from '@nestjs/common';
import { Module } from '@nestjs/core/injector/module';
import { RWSConfigService } from './RWSConfigService';
import IAppConfig from '../types/IAppConfig';
import { REALTIME_POINT_META_KEY } from '../../nest/decorators/RWSRealtimePoint';
import { RealtimePoint } from '../gateways/_realtimePoint';

@Injectable()
export class RWSWebsocketRoutingService {
  private logger: Logger = new Logger(this.constructor.name);
 
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly configService: RWSConfigService<IAppConfig>,
    private readonly reflector: Reflector,
  ) {
  }

  setRouterProxy(routerProxy: any)
  {
  }

  getRealtimePoints(): Map<string, RealtimePoint> {    
    const providers = this.discoveryService.getProviders(); 
    const providersList: Map<string, RealtimePoint> = new Map<string, RealtimePoint>();
 
    for(const wrapper of providers) {
      if (wrapper.instance && wrapper.instance.constructor) {
        // Tutaj jest zmiana - bierzemy konstruktor klasy
        // console.log('REALTIME POINT check:', wrapper);

        const metadata = this.reflector.get(
          REALTIME_POINT_META_KEY, 
          wrapper.instance.constructor // To jest konstruktor klasy
        );

        if(metadata && metadata.name) {
          providersList.set(metadata.name, wrapper.instance as RealtimePoint);
        }
      }
    }

    return providersList;
  }

  assignRoutes() {
    const realtimePoints = this.getRealtimePoints();

    for (const [rtPointName, rtPoint] of realtimePoints){
      const gateway = rtPoint.getGateway();

      for (const [rtRouteName, rtRoute] of rtPoint.getRoutes()){
        gateway.addMessageHandler(rtRoute.eventName, rtRoute.methodName as string, rtPoint);
      }
    }
  }
}