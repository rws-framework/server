import { Socket } from "socket.io";
import { DefaultEventsMap } from "socket.io/dist/typed-events";
import ITheSocket from "../interfaces/ITheSocket";
import ServerService from "../services/ServerService";
interface JSONMessage {
    method: string;
    msg: any;
    user_id: string;
}
declare abstract class TheSocket implements ITheSocket {
    protected server: any;
    constructor(server: ServerService);
    handleConnection(socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, routeName: string): Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>;
    middlewareImplementation?(next: any): void;
    getJson(input: string): any;
    sendJson(input: Object): string;
    emitMessage(method: string, socket: Socket, data?: any): void;
}
export default TheSocket;
export { JSONMessage };
