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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const https_1 = __importDefault(require("https"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importStar(require("http"));
const AuthService_1 = __importDefault(require("./AuthService"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const RouterService_1 = __importDefault(require("./RouterService"));
const ProcessService_1 = __importDefault(require("./ProcessService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const body_parser_1 = __importDefault(require("body-parser"));
const fileUpload = require('express-fileupload');
const _DOMAIN = '*'; //'https://' + AppConfigService.get('nginx', 'domain');
const WEBSOCKET_CORS = {
    origin: _DOMAIN,
    methods: ["GET", "POST"]
};
class ServerService extends socket_io_1.Server {
    constructor(webServer, opts) {
        super(webServer, {
            cors: WEBSOCKET_CORS,
            //transports: ['websocket']
        });
        this.tokens = {};
        this.users = {};
        this.disconnectClient = (clientSocket) => {
            clientSocket.disconnect(true);
        };
        const _self = this;
        this.srv = webServer;
        this.srv.on("options", (req, res) => {
            res.writeHead(200, {
                "Access-Control-Allow-Origin": _DOMAIN,
                "Access-Control-Allow-Methods": "GET, POST",
                "Access-Control-Allow-Headers": "Content-Type"
            });
            res.end();
        });
        const corsMiddleware = (0, cors_1.default)({
            origin: _DOMAIN,
            methods: ['GET', 'POST'],
        });
        //socket stuff
        this.sockets.on('connection', (socket) => {
            ConsoleService_1.default.log('[WS] connection recieved');
            socket.on('__PING__', () => {
                socket.emit('__PONG__', '__PONG__');
            });
            Object.keys(opts.wsRoutes).forEach((eventName) => {
                const SocketClass = opts.wsRoutes[eventName];
                new SocketClass(ServerService.io).handleConnection(socket, eventName);
            });
        });
        if (opts.authorization) {
            this.use(async (socket, next) => {
                const AppConfigService = (0, AppConfigService_1.default)();
                const request = socket.request;
                const response = new http_1.ServerResponse(request);
                const authHeader = request.headers.authorization;
                const UserClass = await AppConfigService.get('user_class');
                if (!authHeader) {
                    response.writeHead(400, 'No token provided');
                    response.end();
                    return;
                }
                if (!_self.tokens[socket.id]) {
                    _self.setJWTToken(socket.id, authHeader);
                }
                if (!_self.users[socket.id]) {
                    try {
                        _self.users[socket.id] = await AuthService_1.default.authorize(_self.tokens[socket.id], UserClass);
                    }
                    catch (e) {
                        ConsoleService_1.default.error('Token authorization error: ', e.message);
                    }
                }
                if (!_self.users[socket.id]) {
                    _self.disconnectClient(socket);
                    ConsoleService_1.default.error('Token unauthorized');
                    response.writeHead(403, 'Token unauthorized');
                    response.end();
                    return;
                }
                corsMiddleware(request, response, next);
            });
        }
    }
    setJWTToken(socketId, token) {
        if (token.indexOf('Bearer') > -1) {
            this.tokens[socketId] = token.split(' ')[1];
        }
        else {
            this.tokens[socketId] = token;
        }
    }
    static init(webServer, opts) {
        if (!ServerService.io) {
            ServerService.io = new ServerService(webServer, opts);
        }
        const allProcessesIds = ProcessService_1.default.getAllProcessesIds();
        const executeDir = process.cwd();
        const rwsDir = `${executeDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(rwsDir)) {
            fs_1.default.mkdirSync(rwsDir);
        }
        fs_1.default.writeFileSync(`${rwsDir}/pid`, allProcessesIds.join(','));
        process.on('exit', (code) => {
            if (fs_1.default.existsSync(`${rwsDir}/pid`)) {
                fs_1.default.unlink(`${rwsDir}/pid`, () => { });
            }
        });
        return ServerService.io;
    }
    webServer() {
        return this.srv;
    }
    static async initializeApp(opts) {
        const AppConfigService = (0, AppConfigService_1.default)();
        const app = (0, express_1.default)();
        let https = true;
        app.use(express_1.default.static(opts.pub_dir));
        app.set('view engine', 'ejs');
        app.use(fileUpload());
        app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
        // app.use(express.json({ limit: '200mb' }));
        app.use(body_parser_1.default.json({ limit: '200mb' }));
        const sslCert = await AppConfigService.get('ssl_cert');
        const sslKey = await AppConfigService.get('ssl_key');
        const options = {};
        if (!sslCert || !sslKey) {
            https = false;
        }
        else {
            options.key = fs_1.default.readFileSync(sslKey);
            options.cert = fs_1.default.readFileSync(sslCert);
        }
        await RouterService_1.default.assignRoutes(app, opts.httpRoutes, opts.controllerList);
        const webServer = https ? https_1.default.createServer(options, app) : http_1.default.createServer(app);
        return ServerService.init(webServer, opts);
    }
}
_a = ServerService;
ServerService.cookies = {
    getCookies: async (headers) => {
        return new Promise((resolve) => {
            resolve(headers.cookie.split(';').map((cookieEntry) => {
                const [key, value] = cookieEntry.split('=');
                return {
                    [key]: value
                };
            }));
        });
    },
    getCookie: async (headers, key) => {
        const cookiesBin = await ServerService.cookies.getCookies(headers);
        if (!cookiesBin[key]) {
            return null;
        }
        return cookiesBin[key];
    }
};
exports.default = ServerService;
//# sourceMappingURL=ServerService.js.map