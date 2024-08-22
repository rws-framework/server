import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';

export interface ITheGateway extends OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>
}