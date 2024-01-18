import { Server as ServerBase, Socket } from "socket.io";
import HTTPS from "https";
import getConfigService from "./AppConfigService";
import cors, {CorsOptions} from 'cors';
import HTTP, { ServerResponse } from "http";
import ITheSocket from "../interfaces/ITheSocket";
import AuthService from "./AuthService";
import fs from 'fs';
import expressServer, { Request, Response, Express } from "express";
import RouterService from "./RouterService";
import { AxiosRequestHeaders } from 'axios';
import Controller from "../controllers/_controller";
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from "../routing/routes";
import ProcessService from "./ProcessService";
import ConsoleService from "./ConsoleService";
import UtilsService from "./UtilsService";
import path from 'path';
import bodyParser from 'body-parser';
import Error404 from '../errors/Error404';
import RWSError from '../errors/_error';
import compression from 'compression';

const fileUpload = require('express-fileupload');

type WsRoutes = {
    [eventName: string]: new (data: any) => ITheSocket;
};

type UserTokens = {
    [socketId: string]: string;
}

type JWTUsers<IUser> = {
    [socketId: string]: IUser;
}

type CookieType = {[key: string] : string};

interface IInitOpts {    
    controllerList?: Controller[];
    wsRoutes?: WsRoutes,
    httpRoutes?: IHTTProute[],
    pub_dir?: string,
    authorization?: boolean
    transport?: 'polling' | 'websocket'
    domain?: string
}

const getCurrentLineNumber = UtilsService.getCurrentLineNumber;

const wsLog = async (fakeError: Error, text: any, socketId: string = null, isError: boolean = false): Promise<void> => {
    const logit = isError ? console.error : console.log;
  
    const filePath = module.id;
    const fileName = filePath.split('/').pop();

    const marker = '[RWS Websocket]'

    logit(isError ? ConsoleService.color().red(marker) : ConsoleService.color().green(marker), `|`,`${filePath}:${await getCurrentLineNumber(fakeError)}`,`|${socketId ? ConsoleService.color().blueBright(` (${socketId})`) : ''}:`,`${text}`);
}

type RWSServer = HTTP.Server | HTTPS.Server;
type ServerStarter = (callback?: () => void) => Promise<void>;
type RWSServerPair = { instance: ServerService, starter: ServerStarter }
type ServerControlSet = { websocket: RWSServerPair, http: RWSServerPair }

const MINUTE = 1000 * 60;

class ServerService extends ServerBase {    
    private static http_server: RWSServerPair;
    private static ws_server: RWSServerPair;
    private server_app: Express; 
    private options: IInitOpts; 
    private srv: RWSServer;
    private tokens: UserTokens = {};
    private users: JWTUsers<any> = {};

    constructor(webServer: RWSServer, expressApp: Express, opts: IInitOpts){ 
        const _DOMAIN: string =  opts.domain;

        const WEBSOCKET_CORS = {
            origin: _DOMAIN,
            methods: ["GET", "POST"]
        }

        super(webServer, {
            cors: WEBSOCKET_CORS,
            transports: [opts.transport || 'websocket'],
            pingTimeout: 5*MINUTE
        }); 
        const _self: ServerService = this;

        this.server_app = expressApp;
        this.srv = webServer;
        this.options = opts;

        const corsHeadersSettings = {
            "Access-Control-Allow-Origin": _DOMAIN, // Replace with your frontend domain
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type"
        };

        this.srv.on("options", (req, res) => {
            res.writeHead(200, corsHeadersSettings);
            res.end();
        });

        this.server_app.use((req, res, next) => {

            Object.keys(corsHeadersSettings).forEach((key: string) => {
                res.setHeader(key, (corsHeadersSettings as any)[key]);
            });

            next();
        });

        const corsOptions: CorsOptions = {
            origin: _DOMAIN, // Replace with the appropriate origins or set it to '*'
            methods: ['GET', 'POST', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
        }

        console.log('cors-options', corsOptions);

        const corsMiddleware = cors(corsOptions);                 

        this.use(async (socket, next) => {
            const request: HTTP.IncomingMessage = socket.request;
            const response: ServerResponse = new ServerResponse(request);
            corsMiddleware(request, response, next);            
        });        

        this.server_app.options('*', cors(corsOptions)); // Enable pre-flight for all routes

        if(opts.authorization){
            this.setupAuth();
        }          
    }

    public static async initializeApp(opts: IInitOpts): Promise<ServerControlSet>
    {                
        if (!ServerService.http_server) { 
            const [baseHttpServer, expressHttpServer] = await ServerService.createServerInstance(opts);
           
            const http_instance = new ServerService(baseHttpServer, expressHttpServer, opts);
            const isSSL = getConfigService().get('features')?.ssl;
            const httpPort = getConfigService().get('port');
            
            ServerService.http_server = { instance: await http_instance.configureHTTPServer(), starter: http_instance.createServerStarter(httpPort, () => {
                ConsoleService.log(ConsoleService.color().green('Request/response server' + ` is working on port ${httpPort} using HTTP${isSSL ? 'S' : ''} protocol`));
            })};  
        }

        if (!ServerService.ws_server) {
            const [baseWsServer, expressWsServer] = await ServerService.createServerInstance(opts);
            const ws_instance = new ServerService(baseWsServer, expressWsServer, opts);
            const isSSL = getConfigService().get('features')?.ssl;

            const wsPort = getConfigService().get('ws_port');

            ServerService.ws_server = { instance: await ws_instance.configureWSServer(), starter: ws_instance.createServerStarter(wsPort, () => {
                ConsoleService.log(ConsoleService.color().green('Websocket server' + ` is working on port ${wsPort}. SSL is ${isSSL ? 'enabled' : 'disabled'}.`));
            })};  
        }

        const allProcessesIds = ProcessService.getAllProcessesIds();

        const executeDir = process.cwd();     
        const pacakgeDir = UtilsService.findRootWorkspacePath(process.cwd());   
        const rwsDir = `${pacakgeDir}/node_modules/.rws`;

        if(!fs.existsSync(rwsDir)){
            fs.mkdirSync(rwsDir);
        }  
        
        return {
            websocket: this.ws_server,
            http: this.http_server,
        }
    }

    disconnectClient = (clientSocket: Socket) => {
        clientSocket.disconnect(true);
    }
    
    setJWTToken(socketId: string, token: string): void {
        if(token.indexOf('Bearer') > -1){
            this.tokens[socketId] = token.split(' ')[1];
        }else{
            this.tokens[socketId] = token;
        }
    }    

    public webServer(): RWSServer
    { 
        return this.srv 
    }  

    static async createServerInstance(opts: IInitOpts): Promise<[RWSServer, Express]>
    {
        const app = expressServer();       
        const isSSL = getConfigService().get('features')?.ssl;
        const options: {key?: Buffer, cert?: Buffer} = {}

        if(isSSL){
            const sslCert = getConfigService().get('ssl_cert');
            const sslKey = getConfigService().get('ssl_key');  

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

    public async configureHTTPServer(): Promise<ServerService>
    {
        this.server_app.use(fileUpload());

      
        // app.use(express.json({ limit: '200mb' }));
        this.server_app.use(bodyParser.json({ limit: '200mb' }));    
        
        if(getConfigService().get('features')?.routing_enabled){
            if(this.options.pub_dir){
                this.server_app.use(expressServer.static(this.options.pub_dir));
            }     
    
            this.server_app.set('view engine', 'ejs');   

            const processed_routes: IHTTProute[] = await RouterService.assignRoutes(this.server_app, this.options.httpRoutes, this.options.controllerList);

            this.server_app.use((req, res, next) => {                              
                if(!RouterService.hasRoute(req.originalUrl, processed_routes)){
                    ServerService.on404(req, res);
                }else{
                    next();
                }            
            });      
        }

        this.use(compression);

        return this;
    }

    public async configureWSServer(): Promise<ServerService>
    { 
        if(getConfigService().get('features')?.ws_enabled){          

            this.sockets.on('connection', async (socket: Socket) => {            
                const socketId: string = socket.id;

                wsLog(new Error(), `Client connection recieved`, socketId);

    

                socket.on("disconnect",  async (reason: string) => {                    
                    wsLog(new Error(), `Client disconnected due to ${reason}`, socketId);
                    
                    if (reason === 'transport error') {
                        wsLog(new Error(), `Transport error`, socketId, true);
                    }                    
                });

                socket.on('error', async (error) => {
                  
                    wsLog(new Error(), error, socketId, true);                    
                });
                

                socket.on('__PING__', async () => {
                    wsLog(new Error(), `Recieved ping... Emmiting response callback.`, socketId)
                    socket.emit('__PONG__', '__PONG__');
                });                

                Object.keys(this.options.wsRoutes).forEach((eventName) => {                
                    const SocketClass = this.options.wsRoutes[eventName];                
                    new SocketClass(ServerService.ws_server).handleConnection(socket, eventName);
                });
            });
        }

        return this;
    }

    public setupAuth()
    {
        const _self = this;
        this.use(async (socket, next) => {
            const AppConfigService = getConfigService();
            const request: HTTP.IncomingMessage = socket.request;
            const response: ServerResponse = new ServerResponse(request);
            const authHeader = request.headers.authorization;            

            const UserClass = await AppConfigService.get('user_class');    

            if(!authHeader){
                response.writeHead(400, 'No token provided');
                response.end();
                return;
            }

            if(!_self.tokens[socket.id]){
                _self.setJWTToken(socket.id, authHeader);
            }

            if(!_self.users[socket.id]){
                try{
                    _self.users[socket.id] = await AuthService.authorize<typeof UserClass>(_self.tokens[socket.id], UserClass);                    
                } catch(e: Error | any){
                    ConsoleService.error('Token authorization error: ', e.message)
                }
            }

            if(!_self.users[socket.id]){

                _self.disconnectClient(socket);
                ConsoleService.error('Token unauthorized')
                response.writeHead(403, 'Token unauthorized');
                response.end();
                return;
            }                    
        });
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
              }
            }))
          }); 
        },        
        getCookie: async (headers: AxiosRequestHeaders, key: string): Promise<string | null> => 
        {
          const cookiesBin: CookieType = await ServerService.cookies.getCookies(headers);
        
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
}

export default ServerService
export { WsRoutes, IHTTProute, IInitOpts, ITheSocket, IPrefixedHTTProutes, RWSHTTPRoutingEntry, RWSServer, ServerControlSet }