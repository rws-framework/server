import { Server as ServerBase, Socket } from 'socket.io';
import { AppConfigService } from '../index';
import {ITheGateway} from '../types/ITheGateway';

import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../routing/routes';
import { ConsoleService } from './ConsoleService';

import {MD5Service} from './MD5Service';

import {
    WsRoutes,
    IInitOpts,
    RWSServer,
    ServerStarter,
    RWSServerPair,
    ServerControlSet
} from '../types/ServerTypes';
import { rwsPath } from '@rws-framework/console';
import { Injectable } from 'nest';

const __HTTP_REQ_HISTORY_LIMIT = 50;
const MINUTE = 1000 * 60;

const _DEFAULT_SERVER_OPTS: IInitOpts = {
    ssl_enabled: null,
    port_http: null,
    port_ws: null
};

@Injectable()
class ServerService {    
    constructor(private configService: AppConfigService, private consoleService: ConsoleService, md5Service: MD5Service){}    
}

export { ServerService, WsRoutes, IHTTProute, IInitOpts, ITheGateway, IPrefixedHTTProutes, RWSHTTPRoutingEntry, RWSServer, RWSServerPair, ServerControlSet, ServerStarter as RWSServerStarter };
