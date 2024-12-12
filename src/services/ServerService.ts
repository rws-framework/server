import { Server as ServerBase, Socket } from 'socket.io';
import { ConfigService as AppConfigService} from '@nestjs/config';

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

import { Injectable } from 'nest';

@Injectable()
class ServerService {    
    constructor(private configService: AppConfigService, private consoleService: ConsoleService, md5Service: MD5Service){}    
}

export { ServerService, WsRoutes, IHTTProute, IInitOpts, IPrefixedHTTProutes, RWSHTTPRoutingEntry, RWSServer, RWSServerPair, ServerControlSet, ServerStarter as RWSServerStarter };
