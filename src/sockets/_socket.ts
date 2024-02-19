import { Socket } from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import ITheSocket from '../interfaces/ITheSocket';
import ServerService from '../services/ServerService';

interface JSONMessage{
    method: string,
    msg: any,
    user_id: string
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

    sendJson(input: Object): string
    {
        return JSON.stringify(input);
    }

    emitMessage<T>(method: string, socket: Socket, data: T = null) : void
    {
        socket.emit(method, this.sendJson({ success: true, data, method }));               
    }

}

export default TheSocket;
export {JSONMessage};