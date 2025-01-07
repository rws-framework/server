import 'source-map-support/register';
import { Socket } from 'socket.io';


// import { RWSHTTPRoutingEntry, IPrefixedHTTProutes, IHTTProute, WsRoutes, ITheSocket } from './helpers/ServerBuilder';

import runNest from './runNest';
import {setupPrisma, setupRWS} from './install';

import ITimeSeries from './models/types/ITimeSeries';
import TimeSeriesModel from './models/types/TimeSeriesModel';

// import ServerService, { ServerControlSet, RWSServerPair, RWSServerStarter } from './helpers/ServerBuilder';

import { DBService } from './services/DBService';
import { AuthService } from './services/AuthService';
import { ConsoleService } from './services/ConsoleService';
import { ProcessService }from './services/ProcessService';
import { MD5Service } from './services/MD5Service';
import { TraversalService } from './services/TraversalService';
import { UtilsService }  from './services/UtilsService';

import { InverseRelation, InverseTimeSeries, Relation, TrackType as RWSTrackType} from './models/decorators/index';

import IAppConfig from './types/IAppConfig';
import { ConfigService as AppConfigService} from '@nestjs/config';
import IAuthUser from './types/IAuthUser';
import IDbUser from './types/IDbUser';

import { RWSFillService } from './services/RWSFillService';

const RWSannotations = {
    modelAnnotations: { InverseRelation, InverseTimeSeries, Relation, RWSTrackType }};

import TheCommand, {ICmdParams} from './commands/_command';
import { RWSGateway, JSONMessage, BaseWsResponse, ErrorWsResponse } from './gateways/_gateway';
import { RWSController } from './controller';

import * as RWSErrorCodes from './errors';
import * as NEST from '../nest';
import Model, { IModel } from './models/_model';
import { ZipService } from './services/ZipService';
import { RWSModule, } from './runNest';
import { InjectServices } from './helpers/InjectServices';

export {    
    TheCommand as RWSCommand,
    ICmdParams,
    RWSFillService,
    AppConfigService,
    RWSModule,
    runNest as serverInit,
    setupRWS,
    setupPrisma,         
    RWSGateway,    
    Model as RWSModel,
    IModel as IRWSModel,

    // ServerService as RWSServer,    
    DBService,        
    AuthService,        
    ConsoleService,             
    MD5Service,
    ZipService,    
    TraversalService,    
    UtilsService,     
    ProcessService,

    TimeSeriesModel,

    ITimeSeries,
    IAppConfig,
    
    IAuthUser,
    IDbUser,
    
    Socket,          
    RWSannotations,
    JSONMessage as RWSJSONMessage,         
    RWSErrorCodes,
    BaseWsResponse, ErrorWsResponse,
    RWSTrackType,

    NEST,
    RWSController,
    InjectServices
};