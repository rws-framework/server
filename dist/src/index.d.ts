import { Socket } from 'socket.io';
import { IHTTPRoute, WsRoutes, ITheSocket } from './services/ServerService';
import init from './init';
import { SetupRWS } from './install';
import ITimeSeries from './models/interfaces/ITimeSeries';
import TimeSeriesModel from './models/types/TimeSeriesModel';
import ServerService from './services/ServerService';
import DBService from './services/DBService';
import AuthService from './services/AuthService';
import ConsoleService from './services/ConsoleService';
import ProcessService from './services/ProcessService';
import LambdaService from './services/LambdaService';
import AWSService from './services/AWSService';
import EFSService from './services/EFSService';
import MD5Service from './services/MD5Service';
import TraversalService from './services/TraversalService';
import UtilsService from './services/UtilsService';
import { InverseRelation, InverseTimeSeries, Relation, TrackType } from './models/annotations/index';
import { Route } from './routing/annotations/index';
import getAppConfig, { IAppConfig } from './services/AppConfigService';
declare const RWSannotations: {
    modelAnnotations: {
        InverseRelation: typeof InverseRelation;
        InverseTimeSeries: typeof InverseTimeSeries;
        Relation: typeof Relation;
        TrackType: typeof TrackType;
    };
    routingAnnotations: {
        Route: typeof Route;
    };
};
import TheCommand, { ICmdParams } from './commands/_command';
import Model, { IModel } from './models/_model';
import Controller, { IRequestParams } from './controllers/_controller';
import TheService from './services/_service';
import TheSocket, { JSONMessage } from './sockets/_socket';
import RWSAppCommands from './commands/index';
import * as RWSTestSuite from './tests/index';
export { init as serverInit, SetupRWS, getAppConfig, Controller as RWSController, TheService as RWSService, TheSocket as RWSSocket, TheCommand as RWSCommand, Model as RWSModel, IModel as IRWSModel, ServerService as RWSServer, DBService, AuthService, ConsoleService, LambdaService, AWSService, EFSService, MD5Service, TraversalService, UtilsService, TimeSeriesModel, WsRoutes, IRequestParams, ITheSocket, ITimeSeries, IAppConfig, Socket, ProcessService, RWSannotations, JSONMessage as RWSJSONMessage, ICmdParams, IHTTPRoute, RWSAppCommands, RWSTestSuite, };
