import { Socket } from 'socket.io';
import IDbUser from './IDbUser';

export type TheSocketParams = {
    user: IDbUser | null
}

export default interface ITheSocket {

    handleConnection(socket: Socket, routeName: string, params?: TheSocketParams): void;
    middlewareImplementation?(next: any): void
 
 }