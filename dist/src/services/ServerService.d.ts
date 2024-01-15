/// <reference types="node" />
/// <reference types="node" />
import { Server as ServerBase, Socket } from "socket.io";
import HTTPS from "https";
import HTTP from "http";
import ITheSocket from "../interfaces/ITheSocket";
import { Request, Response } from "express";
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
    port: number;
    controllerList: Controller[];
    wsRoutes: WsRoutes;
    httpRoutes: IHTTProute[];
    pub_dir?: string;
    authorization?: boolean;
}
declare class ServerService extends ServerBase {
    private static io;
    private srv;
    private tokens;
    private users;
    constructor(webServer: HTTP.Server | HTTPS.Server, opts: IInitOpts);
    static init(webServer: HTTP.Server | HTTPS.Server, opts: IInitOpts): ServerService;
    static initializeApp(opts: IInitOpts): Promise<ServerService>;
    disconnectClient: (clientSocket: Socket) => void;
    setJWTToken(socketId: string, token: string): void;
    webServer(): HTTP.Server | HTTPS.Server;
    private setupAuth;
    static on404(req: Request, res: Response): void;
    static processErrorTemplate(error: RWSError): string;
    static cookies: {
        getCookies: (headers: AxiosRequestHeaders) => Promise<CookieType>;
        getCookie: (headers: AxiosRequestHeaders, key: string) => Promise<string | null>;
    };
}
export default ServerService;
export { WsRoutes, IHTTProute, IInitOpts, ITheSocket, IPrefixedHTTProutes, RWSHTTPRoutingEntry };
