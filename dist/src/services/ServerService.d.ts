/// <reference types="node" />
/// <reference types="node" />
import { Server as ServerBase, Socket } from "socket.io";
import HTTPS from "https";
import HTTP from "http";
import ITheSocket from "../interfaces/ITheSocket";
import { Request, Response, Express } from "express";
import { AxiosRequestHeaders } from 'axios';
import Controller from "../controllers/_controller";
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from "../routing/routes";
import RWSError from '../errors/_error';
type WsRoutes = {
    [eventName: string]: new (data: any) => ITheSocket;
};
type CookieType = {
    [key: string]: string;
};
interface IInitOpts {
    controllerList?: Controller[];
    wsRoutes?: WsRoutes;
    httpRoutes?: IHTTProute[];
    pub_dir?: string;
    authorization?: boolean;
    transport?: 'polling' | 'websocket';
    domain?: string;
    cors_domain?: string;
}
type RWSServer = HTTP.Server | HTTPS.Server;
type ServerStarter = (callback?: () => void) => Promise<void>;
type RWSServerPair = {
    instance: ServerService;
    starter: ServerStarter;
};
type ServerControlSet = {
    websocket: RWSServerPair;
    http: RWSServerPair;
};
declare class ServerService extends ServerBase {
    private static http_server;
    private static ws_server;
    private server_app;
    private options;
    private srv;
    private tokens;
    private users;
    constructor(webServer: RWSServer, expressApp: Express, opts: IInitOpts);
    static initializeApp(opts: IInitOpts): Promise<ServerControlSet>;
    disconnectClient: (clientSocket: Socket) => void;
    setJWTToken(socketId: string, token: string): void;
    webServer(): RWSServer;
    static createServerInstance(opts: IInitOpts): Promise<[RWSServer, Express]>;
    createServerStarter(port: number, injected?: () => void): ServerStarter;
    configureHTTPServer(): Promise<ServerService>;
    configureWSServer(): Promise<ServerService>;
    setupAuth(): void;
    static on404(req: Request, res: Response): void;
    static processErrorTemplate(error: RWSError): string;
    static cookies: {
        getCookies: (headers: AxiosRequestHeaders) => Promise<CookieType>;
        getCookie: (headers: AxiosRequestHeaders, key: string) => Promise<string | null>;
    };
    getOptions(): IInitOpts;
}
export default ServerService;
export { WsRoutes, IHTTProute, IInitOpts, ITheSocket, IPrefixedHTTProutes, RWSHTTPRoutingEntry, RWSServer, ServerControlSet };
