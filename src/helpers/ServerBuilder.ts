import { Server as ServerBase, Socket } from 'socket.io';
import HTTPS from 'https';
import cors, {CorsOptions} from 'cors';
import HTTP, { ServerResponse } from 'http';
import ITheSocket from '../types/ITheSocket';
import { AuthService, _DEFAULTS_USER_LIST_MANAGER } from '../services/AuthService';
import fs from 'fs';
import expressServer, { Request, Response, Express } from 'express';
import { AxiosRequestHeaders } from 'axios';
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from '../routing/routes';
import { ConsoleService } from '../services/ConsoleService';
import { UtilsService } from '../services/UtilsService';
import path from 'path';
import bodyParser from 'body-parser';
import Error404 from '../errors/Error404';
import RWSError from '../errors/_error';
import compression from 'compression';
import IAuthUser from '../types/IAuthUser';
import { MD5Service } from '../services/MD5Service';
import IDbUser from '../types/IDbUser';

import fileUpload from 'express-fileupload';

import {
    WsRoutes,
    UserTokens,
    JWTUsers,
    CookieType,
    IInitOpts,
    RWSServer,
    ServerStarter,
    RWSServerPair,
    ServerControlSet
} from '../types/ServerTypes';
import { AppConfigService } from 'src/services/AppConfigService';

const __HTTP_REQ_HISTORY_LIMIT = 50;

const MINUTE = 1000 * 60;

const _DEFAULT_SERVER_OPTS: IInitOpts = {
    ssl_enabled: null,
    port_http: null,
    port_ws: null
};

type ServerBuilderServices = {
    authService: AuthService,
    consoleService: ConsoleService,
    utilsService: UtilsService,
    md5Service: MD5Service,
    configService: AppConfigService, 
}

function wsLog(error: Error, msg: any, wsClientId: string, something: boolean = false){
    console.log(`[RWS Websocket (wsId: ${wsClientId})]`, msg);
}

class ServerBuilder extends ServerBase {    
    private static http_server: RWSServerPair;
    private static ws_server: RWSServerPair;
    private server_app: Express; 
    private options: IInitOpts; 
    private srv: RWSServer;
    private tokens: UserTokens = {};
    private users: JWTUsers = {};
    private corsOptions: CorsOptions;

    constructor(webServer: RWSServer, expressApp: Express, opts: IInitOpts, private services: ServerBuilderServices){ 
        const _DOMAIN: string =  opts.cors_domain || opts.domain;

        const WEBSOCKET_CORS = {
            origin: _DOMAIN,
            methods: ['GET', 'POST']
        };

        const cors_headers: string[] = ['Content-Type', 'x-csrf-token','Accept', 'Authorization', 'x-junctionapi-version'];

        super(webServer, {
            cors: WEBSOCKET_CORS,
            transports: [opts.transport || 'websocket'],
            pingTimeout: 5*MINUTE
        }); 
        

        this.server_app = expressApp;
        this.srv = webServer;
        this.options = opts;

        const corsHeadersSettings = {
            'Access-Control-Allow-Origin': _DOMAIN, // Replace with your frontend domain
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': cors_headers.join(', '),
            'Access-Control-Allow-Credentials': 'true'
        };

        this.srv.on('options', (req: Request, res: Response) => {
            res.writeHead(200, corsHeadersSettings);
            res.end();
        });

        this.server_app.use((req, res, next) => {

            Object.keys(corsHeadersSettings).forEach((key: string) => {
                res.setHeader(key, (corsHeadersSettings as any)[key]);
            });

            next();
        });

        this.corsOptions = {
            origin: _DOMAIN, // Replace with the appropriate origins or set it to '*'
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: cors_headers
        };

        const corsMiddleware = cors(this.corsOptions);                 

        this.use(async (socket, next) => {
            const request: HTTP.IncomingMessage = socket.request;
            const response: ServerResponse = new ServerResponse(request);
            corsMiddleware(request, response, next);            
        });        

        this.server_app.options('*', cors(this.corsOptions)); // Enable pre-flight for all routes                
    }

    public static async initializeApp<PassedUser extends IDbUser>(opts: IInitOpts = _DEFAULT_SERVER_OPTS, UserConstructor: new () => PassedUser = null, services: ServerBuilderServices): Promise<ServerControlSet>
    {                
        opts = Object.assign(_DEFAULT_SERVER_OPTS, opts);
        const isSSL = opts.ssl_enabled !== null || typeof opts.ssl_enabled === 'undefined' ? opts.ssl_enabled : services.configService.get('features')?.ssl;

        if (!ServerBuilder.http_server) { 
            const [baseHttpServer, expressHttpServer] = await ServerBuilder.createServerInstance(opts, services);
           
            const http_instance = new ServerBuilder(baseHttpServer, expressHttpServer, opts, services);
            const httpPort = opts.port_http || services.configService.get('port');
            
            ServerBuilder.http_server = { instance: await http_instance.configureHTTPServer<PassedUser>(UserConstructor), starter: http_instance.createServerStarter(httpPort, () => {
                services.consoleService.log(services.consoleService.color().green('Request/response server' + ` is working on port ${httpPort} using HTTP${isSSL ? 'S' : ''} protocol`));
            })};  
        }

        if (!ServerBuilder.ws_server) {
            const [baseWsServer, expressWsServer] = await ServerBuilder.createServerInstance(opts, services);

            const ws_instance = new ServerBuilder(baseWsServer, expressWsServer, opts, services);
            const wsPort = opts.port_ws || services.configService.get('ws_port');

            ServerBuilder.ws_server = { instance: await ws_instance.configureWSServer<PassedUser>(UserConstructor), starter: ws_instance.createServerStarter(wsPort, () => {
                services.consoleService.log(services.consoleService.color().green('Websocket server' + ` is working on port ${wsPort}. SSL is ${isSSL ? 'enabled' : 'disabled'}.`));
            })};  
        }
        
        const pacakgeDir = services.utilsService.findRootWorkspacePath(process.cwd());   
        const rwsDir = `${pacakgeDir}/node_modules/.rws`;

        if(!fs.existsSync(rwsDir)){
            fs.mkdirSync(rwsDir);
        }          
        
        return {
            websocket: this.ws_server,
            http: this.http_server,
        };
    }

    disconnectClient = (clientSocket: Socket) => {
        clientSocket.disconnect(true);
    };
    
    setJWTToken(socketId: string, token: string): void {
        if(token.indexOf('Bearer') > -1){
            this.tokens[socketId] = token.split(' ')[1];
        }else{
            this.tokens[socketId] = token;
        }
    }    

    public webServer(): RWSServer
    { 
        return this.srv; 
    }  

    static async createServerInstance(opts: IInitOpts, services: any): Promise<[RWSServer, Express]>
    {
        const app = expressServer();       
        const isSSL = services.configService.get('features')?.ssl;
        const options: {key?: Buffer, cert?: Buffer} = {};

        if(isSSL){
            const sslCert = services.configService.get('ssl_cert');
            const sslKey = services.configService.get('ssl_key');  

            if( !sslKey || !sslCert || !fs.existsSync(sslCert) || !fs.existsSync(sslKey)){
                throw new Error('SSL keys set in config do not exist.');
            }

            options.key = fs.readFileSync(sslKey);
            options.cert = fs.readFileSync(sslCert);       
        }       

        const webServer = isSSL ? HTTPS.createServer(options, app) : HTTP.createServer(app);            

        return [webServer, app];
    }

    createServerStarter(port: number, injected: () => void = () => {}): ServerStarter
    {
        return (async (callback: () => void = () => {}) => {            
            this.webServer().listen(port, () => {
                injected();
                callback();
            });
        }).bind(this);
    }

    public async configureHTTPServer<PassedUser extends IDbUser>(UserConstructor:  new (params: any) => PassedUser = null): Promise<ServerBuilder>
    {
        if(this.options.authorization){
            this.server_app.use(async (req: Request, res: Response, next: () => void) => {
                const reqId: string = this.services.md5Service.md5(req.url);
                let theUser: IAuthUser = null;
                let theToken: string = null;

                const setUser = (reqId: string, user: IAuthUser) => {
                    theUser = user;

                    if(UserConstructor){                   
                        this.users[reqId] = new UserConstructor(theUser);
                    }else{
                        this.users[reqId] = theUser;
                    }             
                };

                const setToken = (noneId: string, token: string) => {
                    theToken = token;

                    this.tokens[reqId] = theToken;
                };

                if(Object.keys(this.users).length > __HTTP_REQ_HISTORY_LIMIT){
                    this.users = {};
                    this.tokens = {};
                }

                const authPassed: boolean | null = await this.services.authService.authenticate(reqId, req.headers.authorization, {
                    ..._DEFAULTS_USER_LIST_MANAGER,
                    set: setUser,
                    setToken,
                    getList: () => this.users,
                    get: (reqId: string) => this.users[reqId],     
                    getTokenList: () => this.tokens,
                    getToken: (reqId: string) => this.tokens[reqId]
                });

                const authHeader: string = req.headers.authorization;                        
        
                if(authPassed === null || authHeader === undefined){         
                    this.services.consoleService.warn('RWS AUTH WARNING', this.services.consoleService.color().blue(`[${reqId}]`), 'XHR token is not passed');       
                    res.writeHead(400, 'Bad request: No token passed');
                    res.end();
                
                    return;
                }   

                if(authPassed === false){                            
                    this.services.consoleService.error('RWS AUTH ERROR', this.services.consoleService.color().blue(`[${reqId}]`), 'XHR token unauthorized');
                    res.writeHead(403, 'Token unauthorized');
                    res.end();
                
                    return;
                }   
            
                next();
            });
    

            this.use(async (socket, next ) => {
                if(this.options.onAuthorize){
                    await this.options.onAuthorize<PassedUser>(this.users[socket.id] as any, 'ws');
                }
                next();
            });
        }


        this.server_app.use(fileUpload());
      
        // app.use(express.json({ limit: '200mb' }));
        this.server_app.use(bodyParser.json({ limit: '200mb' }));    
        
        if(this.services.configService.get('features')?.routing_enabled){
            if(this.options.pub_dir){
                this.server_app.use(expressServer.static(this.options.pub_dir));
            }     
    
            this.server_app.set('view engine', 'ejs');           
        }

        this.use(compression);
        

        return this;
    }

    public async configureWSServer<PassedUser extends IDbUser>(UserConstructor:  new (params: any) => PassedUser = null): Promise<ServerBuilder>
    { 
        if(!this.services.configService.get('features')?.ws_enabled){          
            console.error('[RWS] Websocket server is disabled in configuration');
            return this;
        }

        this.sockets.on('connection', async (socket: Socket) => {            
            const socketId: string = socket.id;

            wsLog(new Error(), 'Client connection recieved', socketId);

            socket.on('disconnect',  async (reason: string) => {                    
                wsLog(new Error(), `Client disconnected due to ${reason}`, socketId);
                
                if (reason === 'transport error') {
                    wsLog(new Error(), 'Transport error', socketId, true);
                }                    
            });

            socket.on('error', async (error) => {
                
                wsLog(new Error(), error, socketId, true);                    
            });
            

            socket.on('__PING__', async () => {
                wsLog(new Error(), 'Recieved ping... Emmiting response callback.', socketId);
                socket.emit('__PONG__', '__PONG__');
            });                

            Object.keys(this.options.wsRoutes).forEach((eventName) => {                
                const SocketClass = this.options.wsRoutes[eventName];    
                
                new SocketClass(ServerBuilder.ws_server).handleConnection(socket, eventName);
            });
        });

        if(this.options.authorization){
        
            this.use(async (socket, next ) => {                
                const request: HTTP.IncomingMessage = socket.request;
                const response: ServerResponse = new ServerResponse(request);

                const token = this.tokens[socket.id] || socket.handshake.auth.token;                

                const passedAuth: boolean | null = await this.services.authService.authenticate(socket.id, token, {
                    getList: () => this.users,
                    get: (socketId: string) => this.users[socketId],
                    set: (socketId: string, user: IAuthUser) => {
                        if(UserConstructor){
                            this.users[socketId] = new UserConstructor(user);
                        }else{
                            this.users[socketId] = user;
                        }
                       
                    },
                    getTokenList: () => this.tokens,
                    getToken: (socketId: string) => this.tokens[socketId],
                    setToken: (socketId: string, token: string) => {
                        this.tokens[socketId] = token;
                    },
                    disconnectClient: () => {
                        this.disconnectClient(socket);
                    }
                });

                if(passedAuth === false){                    
                    this.services.consoleService.error('RWS AUTH ERROR', this.services.consoleService.color().blue(`[${socket.id}]`), 'Websockets token unauthorized');
                    response.writeHead(403, 'Token unauthorized');
                    response.end();  
                }else if(passedAuth === null){                                 
                    this.services.consoleService.warn('RWS AUTH WARNING', this.services.consoleService.color().blue(`[${socket.id}]`), 'Websockets token is not passed');
                    response.writeHead(400, 'Bad request: No token');
                    response.end(); 
                }else{                    
                    next();
                }
            });
        }

        this.use(async (socket, next ) => {
            if(this.options.onAuthorize){
                await this.options.onAuthorize<PassedUser>(this.users[socket.id] as any, 'http');
            }
            next();
        });

        return this;
    }

    static on404(req: Request, res: Response): void
    {
        const error =  new Error404(new Error('Sorry, the page you\'re looking for doesn\'t exist.'), req.url);

        error.printFullError();    
        
        let response = error.getMessage();

        if(req.headers.accept.indexOf('text/html') > -1){
            const htmlTemplate = this.processErrorTemplate(error);

            response = htmlTemplate;
        }   
      
        res.status(404).send(response);
    }

    static processErrorTemplate(error: RWSError): string
    {
        return fs.readFileSync( path.resolve(__dirname, '..', '..', '..', 'html') + '/error.html', 'utf-8')
            .replace('{{error_number}}', error.getCode().toString())
            .replace('{{error_message}}', error.getMessage())
            .replace('{{error_stack_trace}}',  error.getStackTraceString() !== '' ? `<h4>Stack trace:</h4><pre>${error.getStackTraceString()}</pre>` : '')
        ;
    }

    static cookies = {                
        getCookies: async(headers: AxiosRequestHeaders): Promise<CookieType> =>
        {
            return new Promise((resolve) => {
                resolve(headers.cookie.split(';').map((cookieEntry: string) => {
                    const [key, value] = cookieEntry.split('=');
        
                    return {
                        [key]: value
                    };
                }));
            }); 
        },        
        getCookie: async (headers: AxiosRequestHeaders, key: string): Promise<string | null> => 
        {
            const cookiesBin: CookieType = await ServerBuilder.cookies.getCookies(headers);
        
            if(!cookiesBin[key]){
                return null;
            }
        
            return cookiesBin[key];
        }        
    };

    public getOptions(): IInitOpts
    {
        return this.options;
    }

    public getCorsOptions(): CorsOptions
    {
        return this.corsOptions;
    }
}

export { 
    ServerBuilder, 
    WsRoutes, 
    IHTTProute, 
    IInitOpts, 
    ITheSocket, 
    IPrefixedHTTProutes, 
    RWSHTTPRoutingEntry, 
    RWSServer, 
    RWSServerPair, 
    ServerControlSet, 
    ServerStarter as RWSServerStarter 
};