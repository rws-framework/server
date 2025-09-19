import {ITheGateway} from '../types/ITheGateway';
import { Server, Socket } from 'socket.io';
import { ModuleRef } from '@nestjs/core';

import {
    WebSocketGateway,
    WebSocketServer,
    ConnectedSocket,
    SubscribeMessage,
  } from '@nestjs/websockets';

import { RealtimePoint, RWSFillService, RWSJSONMessage } from '../index';

import { BlackLogger, Injectable } from '../../nest'; 
import {UtilsService, ConsoleService, AuthService } from '../index';
import { ConfigService } from '@nestjs/config';
import { RWSWebsocketRoutingService } from '../services/RWSWebsocketRoutingService';

interface JSONMessage<T = unknown>{
    method: string;
    msg: T;
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
    eventName: string;
    method: string;
}

@WebSocketGateway()
@Injectable()
export abstract class RWSGateway implements ITheGateway{
    private logger = new BlackLogger(this.constructor.name);

    @WebSocketServer() server: Server;
    public utilsService: UtilsService;
    public authService: AuthService;
    public consoleService: ConsoleService;
    protected port: number;

    constructor(
        private readonly moduleRef: ModuleRef,
        public appConfigService: ConfigService,        
        private wsRoutingService: RWSWebsocketRoutingService
    ){
    }

    protected setPortHandler(){
        const port = this.appConfigService.get<number>('ws_port');
        if(port){
            this.port = port;            
        }   
    }

    onModuleInit() {
        const rwsFillService = this.moduleRef.get(RWSFillService, { strict: false });
        rwsFillService.fillBaseServices(this);   
        
        this.setPortHandler();        

        if(this.port){
            this.server.listen(this.port);
            this.setupGlobalEventHandlers();
            console.log(`WebSocket server is running on port ${this.port}`);
        }        
    }

    private async setupGlobalEventHandlers() {

        this.server.on('connection', (socket: Socket) => {
            socket.onAny((eventName: string, ...args: any[]) => {
                this.handleAnyEvent(socket, eventName, args);
            }); 
        });        

        // Łapie błędy na poziomie serwera
        this.server.on('error', (error) => {
            this.logger.error('WebSocket server error:', error);
        });
    }

    protected async handleAnyEvent(socket: Socket, eventName: string, args: any) {
        
        if(!args.length){
            return;
        }

        const parsedArgs: RWSJSONMessage = {
            method: null,
            msg: null,
            user_id: null
        };

        for(const argLine of args){
            try {
                const parsedLine: RWSJSONMessage = JSON.parse(argLine);

                if(parsedLine.method){
                    parsedArgs.method = parsedLine.method;
                }            
    
                if(parsedLine.msg){
                    parsedArgs.msg = parsedLine.msg;
                }            
    
                if(parsedLine.user_id){
                    parsedArgs.user_id = parsedLine.user_id;
                }           
            } catch(e: Error | any){
                console.error('Not RWS Message format: ', argLine);
            }            
        }

        const method = parsedArgs.method;
        const data = parsedArgs.msg;
        const userId = parsedArgs.user_id; 

        
        const foundRtp = Array.from(this.wsRoutingService.getRealtimePoints()).find(point => point[0] === eventName && point[1].getGateway().constructor.name === this.constructor.name);

        if(!foundRtp){
            this.logger.warn(`There is no Realtime Point for event "${eventName}" bound to Gateway "${this.constructor.name}"`);
            return;
        }

        const [pointName, realtimePoint] = foundRtp;   

        const rtPointRoutes = realtimePoint.getRoutes();

        if(rtPointRoutes.has(method)){            
            const pointRoute = rtPointRoutes.get(method);

            await pointRoute.handler.call(realtimePoint, parsedArgs, socket);
        }else{
            this.logger.warn(`There is no "${method}" method in "${pointName}" Realtime Point`);
        }
    }
    

    socket: Socket<any, any, any, any>;

    getJson(input: string): any
    {
        return JSON.parse(input);
    
    }

    sendJson(input: object): string
    {
        return JSON.stringify(input);
    }

    
    handleConnection(@ConnectedSocket() socket: Socket): void {      
        this.logger.log('WSClient connected:', socket.id);        

    }
    
    handleDisconnect(@ConnectedSocket() socket: Socket): void {
        this.logger.log('Client disconnected:', socket.id);
    }

    emitMessage<T>(eventName: string, method: string, socket: Socket, data?: T, success: boolean = true): void
    {
        const payload: SocketWsResponse<T> = { success, eventName, method, data: null };

        if(data){
            payload.data = data;
        }

        socket.emit(eventName, this.sendJson(payload));           
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

    addMessageHandler(eventName: string, handlerName: string, serviceInstance: RealtimePoint) {
        const _self = this;            
        
        const handlerFunction = function (client: Socket, payload: any) {
          if (typeof (serviceInstance as any)[eventName] === 'function') {
            return (serviceInstance as any)[eventName].call(serviceInstance, client, payload);
          }
    
          _self.logger.warn(`There is no ${eventName} realtime route in "${serviceInstance.constructor.name}"`);
    
          return {
            event: `${eventName}_error`,
            data: { status: 'method_not_found' }
          };
        }.bind(serviceInstance);
        
        SubscribeMessage(eventName)(
          this.constructor,
          handlerName,
          {
            value: handlerFunction,
            enumerable: true,
            configurable: true,
            writable: true
          }
        );
    
        this.logger.debug(`Registered handler ${eventName} -> ${serviceInstance.constructor.name}`);
    }
}

export {JSONMessage, BaseResponse as BaseWsResponse, ErrorResponse as ErrorWsResponse, SocketWsResponse};