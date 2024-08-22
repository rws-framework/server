import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import {ITheGateway} from '../types/ITheGateway';
import { Server, Socket } from 'socket.io';

import {
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket,
  } from '@nestjs/websockets';

import { RWSFillService } from '../index';

import { Injectable } from '@rws-framework/server/nest'; 
import {UtilsService, ConsoleService, AuthService } from '../index';
import { ConfigService } from '@nestjs/config';

interface JSONMessage{
    method: string;
    msg: any;
    user_id: string;
}

interface BaseResponse<T> {
    data?: T;
    success: boolean;
    error?: Error;
}

interface ErrorResponse extends BaseResponse<any> {
    error: Error;
    success: false;
}

interface SocketWsResponse<T> extends BaseResponse<T> {
    method: string;
}

@WebSocketGateway()
@Injectable()
export abstract class RWSGateway implements ITheGateway{
    @WebSocketServer() server: Server;
    public utilsService: UtilsService;
    public authService: AuthService;
    public consoleService: ConsoleService;

    constructor(
        public appConfigService: ConfigService,
        rwsFillService: RWSFillService
    ){
        rwsFillService.fillBaseServices(this);
    }

    onModuleInit() {
        const port = this.appConfigService.get<number>('ws_port');
        this.server.listen(port);
        console.log(`WebSocket server is running on port ${port}`);
    }
    

    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    getJson(input: string): any
    {
        return JSON.parse(input);
    
    }

    sendJson(input: object): string
    {
        return JSON.stringify(input);
    }

    
    handleConnection(@ConnectedSocket() socket: Socket): void {      
        console.log('Client connected:', socket.id);
    }
    
    handleDisconnect(@ConnectedSocket() socket: Socket): void {
    console.log('Client disconnected:', socket.id);
    }

    emitMessage<T>(method: string, socket: Socket, data?: T): void
    {
        const payload: SocketWsResponse<T> = { success: true, method, data: null };

        if(data){
            payload.data = data;
        }

        socket.emit(method, this.sendJson(payload));              
    }

    getData<T>(input: string): T
    {
        return this.getJson(input).msg as T
    }

    throwError(method: string, socket: Socket, error: Error | any): void
    {        
        console.log(JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))));

        socket.emit(method, this.sendJson({
            error: JSON.parse(JSON.stringify(error, Object.getOwnPropertyNames(error))),
            success: false
        }));
    }
}

export {JSONMessage, BaseResponse as BaseWsResponse, ErrorResponse as ErrorWsResponse};