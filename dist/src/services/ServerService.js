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
const UtilsService_1 = __importDefault(require("./UtilsService"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
const Error404_1 = __importDefault(require("../errors/Error404"));
const compression_1 = __importDefault(require("compression"));
const fileUpload = require('express-fileupload');
const getCurrentLineNumber = UtilsService_1.default.getCurrentLineNumber;
const wsLog = async (fakeError, text, socketId = null, isError = false) => {
    const logit = isError ? console.error : console.log;
    const filePath = module.id;
    const fileName = filePath.split('/').pop();
    const marker = '[RWS Websocket]';
    logit(isError ? ConsoleService_1.default.color().red(marker) : ConsoleService_1.default.color().green(marker), `|`, `${filePath}:${await getCurrentLineNumber(fakeError)}`, `|${socketId ? ConsoleService_1.default.color().blueBright(` (${socketId})`) : ''}:`, `${text}`);
};
const MINUTE = 1000 * 60;
class ServerService extends socket_io_1.Server {
    constructor(webServer, expressApp, opts) {
        const _DOMAIN = opts.domain;
        const WEBSOCKET_CORS = {
            origin: _DOMAIN,
            methods: ["GET", "POST"]
        };
        super(webServer, {
            cors: WEBSOCKET_CORS,
            transports: [opts.transport || 'websocket'],
            pingTimeout: 5 * MINUTE
        });
        this.tokens = {};
        this.users = {};
        this.disconnectClient = (clientSocket) => {
            clientSocket.disconnect(true);
        };
        const _self = this;
        this.server_app = expressApp;
        this.srv = webServer;
        this.options = opts;
        const corsHeadersSettings = {
            "Access-Control-Allow-Origin": _DOMAIN, // Replace with your frontend domain
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
            "Access-Control-Allow-Credentials": 'true'
        };
        this.srv.on("options", (req, res) => {
            res.writeHead(200, corsHeadersSettings);
            res.end();
        });
        this.server_app.use((req, res, next) => {
            Object.keys(corsHeadersSettings).forEach((key) => {
                res.setHeader(key, corsHeadersSettings[key]);
            });
            next();
        });
        const corsOptions = {
            origin: _DOMAIN, // Replace with the appropriate origins or set it to '*'
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
        };
        console.log('cors-options', corsOptions);
        const corsMiddleware = (0, cors_1.default)(corsOptions);
        this.use(async (socket, next) => {
            const request = socket.request;
            const response = new http_1.ServerResponse(request);
            corsMiddleware(request, response, next);
        });
        this.server_app.options('*', (0, cors_1.default)(corsOptions)); // Enable pre-flight for all routes
        if (opts.authorization) {
            this.setupAuth();
        }
    }
    static async initializeApp(opts) {
        var _b, _c;
        if (!_a.http_server) {
            const [baseHttpServer, expressHttpServer] = await _a.createServerInstance(opts);
            const http_instance = new _a(baseHttpServer, expressHttpServer, opts);
            const isSSL = (_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ssl;
            const httpPort = (0, AppConfigService_1.default)().get('port');
            _a.http_server = { instance: await http_instance.configureHTTPServer(), starter: http_instance.createServerStarter(httpPort, () => {
                    ConsoleService_1.default.log(ConsoleService_1.default.color().green('Request/response server' + ` is working on port ${httpPort} using HTTP${isSSL ? 'S' : ''} protocol`));
                }) };
        }
        if (!_a.ws_server) {
            const [baseWsServer, expressWsServer] = await _a.createServerInstance(opts);
            const ws_instance = new _a(baseWsServer, expressWsServer, opts);
            const isSSL = (_c = (0, AppConfigService_1.default)().get('features')) === null || _c === void 0 ? void 0 : _c.ssl;
            const wsPort = (0, AppConfigService_1.default)().get('ws_port');
            _a.ws_server = { instance: await ws_instance.configureWSServer(), starter: ws_instance.createServerStarter(wsPort, () => {
                    ConsoleService_1.default.log(ConsoleService_1.default.color().green('Websocket server' + ` is working on port ${wsPort}. SSL is ${isSSL ? 'enabled' : 'disabled'}.`));
                }) };
        }
        const allProcessesIds = ProcessService_1.default.getAllProcessesIds();
        const executeDir = process.cwd();
        const pacakgeDir = UtilsService_1.default.findRootWorkspacePath(process.cwd());
        const rwsDir = `${pacakgeDir}/node_modules/.rws`;
        if (!fs_1.default.existsSync(rwsDir)) {
            fs_1.default.mkdirSync(rwsDir);
        }
        return {
            websocket: this.ws_server,
            http: this.http_server,
        };
    }
    setJWTToken(socketId, token) {
        if (token.indexOf('Bearer') > -1) {
            this.tokens[socketId] = token.split(' ')[1];
        }
        else {
            this.tokens[socketId] = token;
        }
    }
    webServer() {
        return this.srv;
    }
    static async createServerInstance(opts) {
        var _b;
        const app = (0, express_1.default)();
        const isSSL = (_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ssl;
        const options = {};
        if (isSSL) {
            const sslCert = (0, AppConfigService_1.default)().get('ssl_cert');
            const sslKey = (0, AppConfigService_1.default)().get('ssl_key');
            if (!sslKey || !sslCert || !fs_1.default.existsSync(sslCert) || !fs_1.default.existsSync(sslKey)) {
                throw new Error('SSL keys set in config do not exist.');
            }
            options.key = fs_1.default.readFileSync(sslKey);
            options.cert = fs_1.default.readFileSync(sslCert);
        }
        const webServer = isSSL ? https_1.default.createServer(options, app) : http_1.default.createServer(app);
        return [webServer, app];
    }
    createServerStarter(port, injected = () => { }) {
        return (async (callback = () => { }) => {
            this.webServer().listen(port, () => {
                injected();
                callback();
            });
        }).bind(this);
    }
    async configureHTTPServer() {
        var _b;
        this.server_app.use(fileUpload());
        // app.use(express.json({ limit: '200mb' }));
        this.server_app.use(body_parser_1.default.json({ limit: '200mb' }));
        if ((_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.routing_enabled) {
            if (this.options.pub_dir) {
                this.server_app.use(express_1.default.static(this.options.pub_dir));
            }
            this.server_app.set('view engine', 'ejs');
            const processed_routes = await RouterService_1.default.assignRoutes(this.server_app, this.options.httpRoutes, this.options.controllerList);
            this.server_app.use((req, res, next) => {
                if (!RouterService_1.default.hasRoute(req.originalUrl, processed_routes)) {
                    _a.on404(req, res);
                }
                else {
                    next();
                }
            });
        }
        this.use(compression_1.default);
        return this;
    }
    async configureWSServer() {
        var _b;
        if ((_b = (0, AppConfigService_1.default)().get('features')) === null || _b === void 0 ? void 0 : _b.ws_enabled) {
            this.sockets.on('connection', async (socket) => {
                const socketId = socket.id;
                wsLog(new Error(), `Client connection recieved`, socketId);
                socket.on("disconnect", async (reason) => {
                    wsLog(new Error(), `Client disconnected due to ${reason}`, socketId);
                    if (reason === 'transport error') {
                        wsLog(new Error(), `Transport error`, socketId, true);
                    }
                });
                socket.on('error', async (error) => {
                    wsLog(new Error(), error, socketId, true);
                });
                socket.on('__PING__', async () => {
                    wsLog(new Error(), `Recieved ping... Emmiting response callback.`, socketId);
                    socket.emit('__PONG__', '__PONG__');
                });
                Object.keys(this.options.wsRoutes).forEach((eventName) => {
                    const SocketClass = this.options.wsRoutes[eventName];
                    new SocketClass(_a.ws_server).handleConnection(socket, eventName);
                });
            });
        }
        return this;
    }
    setupAuth() {
        const _self = this;
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
        });
    }
    static on404(req, res) {
        const error = new Error404_1.default(new Error('Sorry, the page you\'re looking for doesn\'t exist.'), req.url);
        error.printFullError();
        let response = error.getMessage();
        if (req.headers.accept.indexOf('text/html') > -1) {
            const htmlTemplate = this.processErrorTemplate(error);
            response = htmlTemplate;
        }
        res.status(404).send(response);
    }
    static processErrorTemplate(error) {
        return fs_1.default.readFileSync(path_1.default.resolve(__dirname, '..', '..', '..', 'html') + '/error.html', 'utf-8')
            .replace('{{error_number}}', error.getCode().toString())
            .replace('{{error_message}}', error.getMessage())
            .replace('{{error_stack_trace}}', error.getStackTraceString() !== '' ? `<h4>Stack trace:</h4><pre>${error.getStackTraceString()}</pre>` : '');
    }
    getOptions() {
        return this.options;
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