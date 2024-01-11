import path from 'path';
import { Socket } from 'socket.io';

import { RWSHTTPRoutingEntry, IPrefixedHTTProutes, IHTTProute, WsRoutes, ITheSocket } from './services/ServerService';

import init from './init';
import {SetupRWS} from './install';

import ITimeSeries from './models/interfaces/ITimeSeries';
import TimeSeriesModel from './models/types/TimeSeriesModel';

import ServerService from './services/ServerService';
import DBService from './services/DBService';
import AuthService from './services/AuthService';
import S3Service from './services/S3Service';
import ConsoleService from './services/ConsoleService';
import ProcessService from './services/ProcessService';
import LambdaService from './services/LambdaService';
import AWSService from './services/AWSService';
import EFSService from './services/EFSService';
import MD5Service from './services/MD5Service';
import TraversalService from './services/TraversalService';
import UtilsService from './services/UtilsService';
import RWSPrompt from './models/prompts/_prompt';
import { InverseRelation, InverseTimeSeries, Relation, TrackType} from './models/annotations/index';
import { Route } from './routing/annotations/index';
import getAppConfig, { IAppConfig, AppConfigService } from './services/AppConfigService';

const RWSannotations = {
    modelAnnotations: { InverseRelation, InverseTimeSeries, Relation, TrackType },
    routingAnnotations: { Route }
}


import TheCommand, {ICmdParams} from './commands/_command';
import Model, { IModel, TrackType as RWSTrackType } from './models/_model';
import Controller, { IRequestParams} from './controllers/_controller';
import TheService from './services/_service';
import TheSocket, { JSONMessage } from './sockets/_socket';

import RWSAppCommands from './commands/index';
import * as RWSTestSuite from './tests/index';

import * as RWSErrorCodes from './errors/index';

export {
    init as serverInit,
    SetupRWS,
    getAppConfig,    
    AppConfigService,

    Controller as RWSController,
    TheService as RWSService,
    TheSocket as RWSSocket,
    TheCommand as RWSCommand,
    Model as RWSModel,
    IModel as IRWSModel,

    ServerService as RWSServer,
    DBService,
    AuthService,
    S3Service,
    ConsoleService,
    LambdaService,
    AWSService,
    EFSService,
    MD5Service,
    TraversalService,
    UtilsService,

    TimeSeriesModel,

    WsRoutes,
    IRequestParams,
    ITheSocket,    
    ITimeSeries,
    IAppConfig,
            
    Socket,      
    ProcessService,    
    RWSannotations,
    JSONMessage as RWSJSONMessage,
    ICmdParams,      
    IHTTProute,
    IPrefixedHTTProutes,
    RWSHTTPRoutingEntry,
    RWSAppCommands,
    RWSTestSuite,  
    
    RWSPrompt,
    RWSErrorCodes
}