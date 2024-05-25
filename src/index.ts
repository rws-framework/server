import { Socket } from 'socket.io';

import { RWSHTTPRoutingEntry, IPrefixedHTTProutes, IHTTProute, WsRoutes, ITheSocket } from './helpers/ServerBuilder';

import init from './init';
import {setupPrisma, setupRWS} from './install';

import ITimeSeries from './models/types/ITimeSeries';
import TimeSeriesModel from './models/types/TimeSeriesModel';

import ServerService, { ServerControlSet, RWSServerPair, RWSServerStarter } from './helpers/ServerBuilder';

import { DBService } from './services/DBService';
import { AuthService } from './services/AuthService';
import { ConsoleService } from './services/ConsoleService';
import { ProcessService }from './services/ProcessService';
import { MD5Service } from './services/MD5Service';
import { TraversalService } from './services/TraversalService';
import { UtilsService }  from './services/UtilsService';
import { VectorStoreService } from './services/VectorStoreService';


import RWSPrompt, { ILLMChunk, IRWSPromptRequestExecutor, IRWSSinglePromptRequestExecutor, IRWSPromptStreamExecutor, IChainCallOutput, IRWSPromptJSON, ChainStreamType } from './models/prompts/_prompt';
import RWSConvo, { IConvoDebugXMLData, IEmbeddingsHandler, ISplitterParams } from './models/convo/ConvoLoader';
import RWSVectorStore from './models/convo/VectorStore';

import { InverseRelation, InverseTimeSeries, Relation, TrackType as RWSTrackType} from './models/annotations/index';
import { Route } from './routing/annotations/index';

import { IAppConfig, AppConfigService, AppConfigModule } from './services/AppConfigService';

import { IContextToken } from './types/IContextToken';
import IAuthUser from './types/IAuthUser';
import IDbUser from './types/IDbUser';

const RWSannotations = {
    modelAnnotations: { InverseRelation, InverseTimeSeries, Relation, RWSTrackType },
    routingAnnotations: { Route }
};

import TheCommand, {ICmdParams} from './commands/_command';
import TheService from './services/_service';
import TheSocket, { JSONMessage, BaseWsResponse, ErrorWsResponse } from './sockets/_socket';
import { RWSController } from './controller';
import RWSAppCommands from './commands';

import * as RWSErrorCodes from './errors';
import * as NEST from '../nest';
import Model, { IModel } from './models/_model';
import { ZipService } from './services/ZipService';

export {    
    init as serverInit,
    setupRWS,
    setupPrisma,
    AppConfigModule,    
    AppConfigService,            
    TheSocket as RWSSocket,
    TheCommand as RWSCommand,
    Model as RWSModel,
    IModel as IRWSModel,

    ServerService as RWSServer,    
    DBService,        
    AuthService,        
    ConsoleService,             
    MD5Service,
    ZipService,    
    TraversalService,    
    UtilsService,    
    VectorStoreService,    
    ProcessService,

    TimeSeriesModel,

    WsRoutes,
    ITheSocket,    
    ITimeSeries,
    IAppConfig,
    IContextToken,
    ServerControlSet,
    IAuthUser,
    IDbUser,
    
    Socket,          
    RWSannotations,
    JSONMessage as RWSJSONMessage,
    ICmdParams,      
    IHTTProute,
    IPrefixedHTTProutes,
    RWSHTTPRoutingEntry,
    RWSAppCommands,
    
    RWSVectorStore,
    RWSConvo,
    RWSPrompt,    
    RWSErrorCodes,
    ChainStreamType,

    BaseWsResponse, ErrorWsResponse,

    IRWSPromptRequestExecutor,
    IRWSSinglePromptRequestExecutor,
    IRWSPromptStreamExecutor,
    IChainCallOutput,
    IConvoDebugXMLData,
    IEmbeddingsHandler,
    IRWSPromptJSON,
    ISplitterParams,
    ILLMChunk,
    RWSTrackType,
    RWSServerPair,
    RWSServerStarter,

    NEST,
    RWSController
};