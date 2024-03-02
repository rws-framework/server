import HTTP from 'http';
import HTTPS from 'https';
import expressServer, { Request, Response, Express } from 'express';
import ITheSocket from './ITheSocket';
import IDbUser from './IDbUser';
import Controller from '../controllers/_controller';
import ServerService from '../services/ServerService';
import { IHTTProute } from '../routing/routes';

type WsRoutes = {
    [eventName: string]: new (data: any) => ITheSocket;
};

type UserTokens = {
    [socketId: string]: string;
};

type JWTUsers = {
    [socketId: string]: Partial<IDbUser>;
};

type CookieType = {[key: string]: string};

interface IInitOpts {    
    controllerList?: Controller[];
    wsRoutes?: WsRoutes,
    httpRoutes?: IHTTProute[],
    pub_dir?: string,
    authorization?: boolean
    transport?: 'polling' | 'websocket'
    domain?: string
    cors_domain?: string,
    onAuthorize?: <PassedUser extends IDbUser>(user: PassedUser, authorizationScope: 'ws' | 'http') => Promise<void>,
    port_ws?: number
    port_http?: number
    ssl_enabled?: boolean
}

type RWSServer = HTTP.Server | HTTPS.Server;
type ServerStarter = (callback?: () => void) => Promise<void>;
type RWSServerPair = { instance: ServerService, starter: ServerStarter };
type ServerControlSet = { websocket: RWSServerPair, http: RWSServerPair };

export {
    WsRoutes,
    UserTokens,
    JWTUsers,
    CookieType,
    IInitOpts,
    RWSServer,
    ServerStarter,
    RWSServerPair,
    ServerControlSet
}