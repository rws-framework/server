import HTTP from 'http';
import HTTPS from 'https';
import { ITheGateway } from './ITheGateway';
import IDbUser from './IDbUser';
import { IHTTProute } from '../routing/routes';

type WsRoutes = {
    [eventName: string]: new (data: any) => ITheGateway;
};

type UserTokens = {
    [socketId: string]: string;
};

type JWTUsers = {
    [socketId: string]: Partial<IDbUser>;
};

type CookieType = {[key: string]: string};

interface IInitOpts {        
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
type RWSServerPair<T> = { instance: T, starter: ServerStarter };
type ServerControlSet<T> = { websocket: RWSServerPair<T>, http: RWSServerPair<T> };

type ServerOpts = {
    authorization?: boolean, 
    transport?: string, 
    onAuthorize?: <T extends IDbUser>(user: T, authorizationScope: 'ws' | 'http') => Promise<void>
  }

export {
    WsRoutes,
    UserTokens,
    JWTUsers,
    CookieType,
    IInitOpts,
    RWSServer,
    ServerStarter,
    RWSServerPair,
    ServerControlSet,
    ServerOpts
}