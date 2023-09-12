"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RWSTestSuite = exports.RWSannotations = exports.ProcessService = exports.AppDefaultConfig = exports.Socket = exports.TimeSeriesModel = exports.UtilsService = exports.TraversalService = exports.MD5Service = exports.EFSService = exports.AWSService = exports.LambdaService = exports.ConsoleService = exports.AuthService = exports.DBService = exports.RWSServer = exports.RWSModel = exports.RWSCommand = exports.RWSSocket = exports.RWSService = exports.RWSController = exports.getAppConfig = exports.SetupRWS = exports.serverInit = void 0;
const socket_io_1 = require("socket.io");
Object.defineProperty(exports, "Socket", { enumerable: true, get: function () { return socket_io_1.Socket; } });
const AppConfigService_1 = __importDefault(require("./services/AppConfigService"));
exports.getAppConfig = AppConfigService_1.default;
const init_1 = __importDefault(require("./init"));
exports.serverInit = init_1.default;
const install_1 = require("./install");
Object.defineProperty(exports, "SetupRWS", { enumerable: true, get: function () { return install_1.SetupRWS; } });
const TimeSeriesModel_1 = __importDefault(require("./models/types/TimeSeriesModel"));
exports.TimeSeriesModel = TimeSeriesModel_1.default;
const ServerService_1 = __importDefault(require("./services/ServerService"));
exports.RWSServer = ServerService_1.default;
const DBService_1 = __importDefault(require("./services/DBService"));
exports.DBService = DBService_1.default;
const AuthService_1 = __importDefault(require("./services/AuthService"));
exports.AuthService = AuthService_1.default;
const ConsoleService_1 = __importDefault(require("./services/ConsoleService"));
exports.ConsoleService = ConsoleService_1.default;
const ProcessService_1 = __importDefault(require("./services/ProcessService"));
exports.ProcessService = ProcessService_1.default;
const LambdaService_1 = __importDefault(require("./services/LambdaService"));
exports.LambdaService = LambdaService_1.default;
const AWSService_1 = __importDefault(require("./services/AWSService"));
exports.AWSService = AWSService_1.default;
const EFSService_1 = __importDefault(require("./services/EFSService"));
exports.EFSService = EFSService_1.default;
const MD5Service_1 = __importDefault(require("./services/MD5Service"));
exports.MD5Service = MD5Service_1.default;
const TraversalService_1 = __importDefault(require("./services/TraversalService"));
exports.TraversalService = TraversalService_1.default;
const UtilsService_1 = __importDefault(require("./services/UtilsService"));
exports.UtilsService = UtilsService_1.default;
const index_1 = require("./models/annotations/index");
const index_2 = require("./routing/annotations/index");
const AppConfigService_2 = require("./services/AppConfigService");
Object.defineProperty(exports, "AppDefaultConfig", { enumerable: true, get: function () { return AppConfigService_2.AppDefaultConfig; } });
const RWSannotations = {
    modelAnnotations: { InverseRelation: index_1.InverseRelation, InverseTimeSeries: index_1.InverseTimeSeries, Relation: index_1.Relation, TrackType: index_1.TrackType },
    routingAnnotations: { Route: index_2.Route }
};
exports.RWSannotations = RWSannotations;
const _command_1 = __importDefault(require("./commands/_command"));
exports.RWSCommand = _command_1.default;
const _model_1 = __importDefault(require("./models/_model"));
exports.RWSModel = _model_1.default;
const _controller_1 = __importDefault(require("./controllers/_controller"));
exports.RWSController = _controller_1.default;
const _service_1 = __importDefault(require("./services/_service"));
exports.RWSService = _service_1.default;
const _socket_1 = __importDefault(require("./sockets/_socket"));
exports.RWSSocket = _socket_1.default;
const RWSTestSuite = __importStar(require("./tests/index"));
exports.RWSTestSuite = RWSTestSuite;
//# sourceMappingURL=index.js.map