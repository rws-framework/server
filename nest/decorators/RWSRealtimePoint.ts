import { Controller, applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RWSHTTPRoutingEntry } from '../../src/routing/routes';
import { BootstrapRegistry } from './RWSConfigInjector';
import { AuthGuard, RWS_PROTECTED_KEY } from './guards/auth.guard';
import { RealtimePoint } from '../../src/gateways/_realtimePoint';
import { RWSGateway } from '../../src/gateways/_gateway';

export interface RWSRealtimePointOptions {    
}

export const REALTIME_POINT_META_KEY = 'RWS_REALTIME_POINT';

export function RWSRealtimePoint(name: string, gateway: typeof RWSGateway, options?: RWSRealtimePointOptions) {
    if(!BootstrapRegistry.getConfig()){
        throw new Error('No config');
    }    
    
    return (target: any, propertyKey?: string, descriptor?: any) => {
        target.setGateway(gateway);
        target.setPointName(name);
        
        Reflect.defineMetadata(REALTIME_POINT_META_KEY, {name}, target);        
    };
}