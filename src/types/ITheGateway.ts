import { Socket } from 'socket.io';
import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';

export interface ITheGateway extends OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    socket: Socket<any, any, any, any>
}