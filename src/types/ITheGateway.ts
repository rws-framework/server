import { Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { RWSGateway } from '../gateways/_gateway';
import { ModuleRef } from '@nestjs/core';

export interface ITheGateway extends OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    socket: Socket<any, any, any, any>    
}

export interface StaticRealtimePoint {   
    gatewayClass: typeof RWSGateway;        
    getModuleRef(): ModuleRef    
    setModuleRef(moduleRef: ModuleRef): void
    setGateway(gateway: typeof RWSGateway): void
    setPointName(pointName: string): void
    getPointName(): string
}