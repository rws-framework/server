"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const cors_1 = __importDefault(require("cors"));
const http_1 = require("http");
const AuthService_1 = __importDefault(require("./AuthService"));
const fs_1 = __importDefault(require("fs"));
const https_1 = require("https");
const express_1 = __importDefault(require("express"));
const RouterService_1 = __importDefault(require("./RouterService"));
const ProcessService_1 = __importDefault(require("./ProcessService"));
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
const _DOMAIN = '*'; //'https://' + AppConfigService.get('nginx', 'domain');
const WEBSOCKET_CORS = {
    origin: _DOMAIN,
    methods: ["GET", "POST"]
};
class ServerService extends socket_io_1.Server {
    constructor(webServer, opts) {
        super(webServer, {
            cors: WEBSOCKET_CORS
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
        this.sockets.on('connection', (socket) => {
            ConsoleService_1.default.log('[WS] connection recieved');
            socket.on('__PING__', () => {
                socket.emit('__PONG__', '__PONG__');
            });
            Object.keys(opts.wsRoutes).forEach((eventName) => {
                const SocketClass = opts.wsRoutes[eventName];
                new SocketClass(_a.io).handleConnection(socket, eventName);
            });
        });
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
    setJWTToken(socketId, token) {
        if (token.indexOf('Bearer') > -1) {
            this.tokens[socketId] = token.split(' ')[1];
        }
        else {
            this.tokens[socketId] = token;
        }
    }
    static init(webServer, opts) {
        if (!_a.io) {
            _a.io = new _a(webServer, opts);
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
        return _a.io;
    }
    webServer() {
        return this.srv;
    }
    static async initializeApp(opts) {
        const AppConfigService = (0, AppConfigService_1.default)();
        const app = (0, express_1.default)();
        app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });
        const sslCert = await AppConfigService.get('ssl_cert');
        const sslKey = await AppConfigService.get('ssl_key');
        const options = {
            key: fs_1.default.readFileSync(sslKey),
            cert: fs_1.default.readFileSync(sslCert)
        };
        await RouterService_1.default.assignRoutes(app, opts.httpRoutes, opts.controllerList);
        const webServer = (0, https_1.createServer)(options, app);
        return _a.init(webServer, opts);
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
        const cookiesBin = await _a.cookies.getCookies(headers);
        if (!cookiesBin[key]) {
            return null;
        }
        return cookiesBin[key];
    }
};
exports.default = ServerService;
//# sourceMappingURL=ServerService.js.map