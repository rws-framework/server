import { Socket } from 'socket.io';

export default interface ITheSocket {

    handleConnection(socket: Socket, routeName: string): void;
    middlewareImplementation?(next: any): void
 
 }