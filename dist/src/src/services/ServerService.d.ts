import { Server as ServerBase } from "socket.io";
import https from "https";
import http from "http";
import ITheSocket from "../interfaces/ITheSocket";
import Controller from "../controllers/_controller";
import { IHTTPRoute } from "../routing/routes";
type WsRoutes = {
    [eventName: string]: new (data: any) => ITheSocket;
};
type CookieType = {
    [key: string]: string;
};
interface IInitOpts {
    port: number;
    controllerList: Controller[];
    wsRoutes: WsRoutes;
    httpRoutes: IHTTPRoute[];
}
declare class ServerService extends ServerBase {
    private static io;
    private srv;
    private tokens;
    private users;
    constructor(webServer: http.Server | https.Server, opts: IInitOpts);
    disconnectClient: (clientSocket: Socket) => void;
    setJWTToken(socketId: string, token: string): void;
    static init(webServer: http.Server | https.Server, opts: IInitOpts): ServerService;
    webServer(): http.Server | https.Server;
    static initializeApp(opts: IInitOpts): Promise<ServerService>;
    static cookies: {
        getCookies: (headers: AxiosRequestHeaders) => Promise<CookieType>;
        getCookie: (headers: AxiosRequestHeaders, key: string) => Promise<string | null>;
    };
}
export default ServerService;
export { WsRoutes, IHTTPRoute, IInitOpts, ITheSocket };
