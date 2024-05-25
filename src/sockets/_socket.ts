import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import ITheSocket from '../types/ITheSocket';
import ServerService from '../helpers/ServerBuilder';

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

    handleConnection(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, routeName: string): Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any> {
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

    throwError(method: string, socket: Socket, error: Error): void
    {        
        socket.emit(method, this.sendJson({
            error: error,
            success: false
        }));
    }
}

export default TheSocket;
export {JSONMessage, BaseResponse as BaseWsResponse, ErrorResponse as ErrorWsResponse};