import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import ITheSocket, { TheSocketParams } from '../interfaces/ITheSocket';
import ServerService from '../services/ServerService';

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

abstract class TheSocket implements ITheSocket{
    protected server: any;

    constructor(server: ServerService) {        
        this.server = server;
    }

    handleConnection(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, routeName: string, params: TheSocketParams = null): Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
        throw new Error('Method not implemented.');
    }
    middlewareImplementation?(next: any): void {
        throw new Error('Method not implemented.');
    }

    getJson(input: string): any
    {
        return JSON.parse(input);
    
    }

    sendJson(input: object): string
    {
        return JSON.stringify(input);
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

export default TheSocket;
export {JSONMessage, BaseResponse as BaseWsResponse, ErrorResponse as ErrorWsResponse};