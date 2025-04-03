import 'reflect-metadata';
import { Socket } from 'socket.io';
// import { RWSHTTPRoutingEntry, IPrefixedHTTProutes, IHTTProute, WsRoutes, ITheSocket } from './helpers/ServerBuilder';

import runNest from './runNest';
import {setupPrisma, setupRWS} from './install';

import { RWSModel, IRWSModel, ITimeSeries, TimeSeriesModel, InverseRelation, InverseTimeSeries, Relation, TrackType } from '@rws-framework/db';

// import ServerService, { ServerControlSet, RWSServerPair, RWSServerStarter } from './helpers/ServerBuilder';
import { RWSCliBootstrap } from '../exec/src/rws';
import { CLIModule } from '../exec/src/application/cli.module';
import { NestDBService } from './services/NestDBService';
import { AuthService } from './services/AuthService';
import { ConsoleService } from './services/ConsoleService';
import { ProcessService }from './services/ProcessService';
import { MD5Service } from './services/MD5Service';
import { TraversalService } from './services/TraversalService';
import { UtilsService }  from './services/UtilsService';
import { RWSAutoApiController } from './controller/_autoApi';
import { RWSResource, IRWSResourceMeta, IRWSResourceOpts } from './decorators/resource';
import IAppConfig from './types/IAppConfig';
import IDbUser from './types/IDbUser';

import { RWSFillService } from './services/RWSFillService';

import {RWSCommand} from './commands/_command';
import { RWSGateway, JSONMessage, BaseWsResponse, ErrorWsResponse } from './gateways/_gateway';

import * as RWSErrorCodes from './errors';
import * as NEST from '../nest';
import { RWSModule, } from './runNest';
import { InjectServices } from './services/_inject';
import { RWSConfigService } from './services/RWSConfigService';
import { Helper } from './helpers/_helper';

export {    
    RWSCommand,
    RWSFillService,
    RWSConfigService,
    RWSModule,
    runNest as serverInit,
    setupRWS,
    setupPrisma,         
    RWSGateway,    
    RWSModel,
    IRWSModel,
    RWSResource, IRWSResourceMeta, IRWSResourceOpts,

    NestDBService as DBService,        
    AuthService,        
    ConsoleService,             
    MD5Service, 
    TraversalService,    
    UtilsService,     
    ProcessService,

    TimeSeriesModel,

    ITimeSeries,
    IAppConfig,
    IDbUser,
    
    Socket,          
    JSONMessage as RWSJSONMessage,         
    RWSErrorCodes,
    BaseWsResponse, ErrorWsResponse,
    TrackType,
    Helper,

    NEST,
    RWSAutoApiController,
    InjectServices,
    CLIModule, RWSCliBootstrap
};