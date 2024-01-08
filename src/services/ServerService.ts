import { Server as ServerBase, Socket } from "socket.io";
import HTTPS from "https";
import getConfigService from "./AppConfigService";
import cors from 'cors';
import HTTP, { IncomingMessage, ServerResponse } from "http";
import ITheSocket from "../interfaces/ITheSocket";
import AuthService from "./AuthService";
import fs from 'fs';
import express from "express";
import RouterService from "./RouterService";
import { AxiosRequestHeaders } from 'axios';
import Controller from "../controllers/_controller";
import { IHTTProute, IPrefixedHTTProutes, RWSHTTPRoutingEntry } from "../routing/routes";
import ProcessService from "./ProcessService";
import ConsoleService from "./ConsoleService";
import path from 'path';
import bodyParser from 'body-parser';


const fileUpload = require('express-fileupload');

const _DOMAIN: string =  '*';//'https://' + AppConfigService.get('nginx', 'domain');



const WEBSOCKET_CORS = {
    origin: _DOMAIN,
    methods: ["GET", "POST"]
 }

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
    port: number
    controllerList: Controller[];
    wsRoutes: WsRoutes,
    httpRoutes: IHTTProute[],
    pub_dir?: string,
    authorization?: boolean
}

class ServerService extends ServerBase {    
    private static io: ServerService;
    private srv: HTTP.Server | HTTPS.Server;
    private tokens: UserTokens = {};
    private users: JWTUsers<any> = {};

    constructor(webServer: HTTP.Server | HTTPS.Server, opts: IInitOpts){ 
        super(webServer, {
            cors: WEBSOCKET_CORS,
            //transports: ['websocket']
        }); 
        const _self: ServerService = this;

        this.srv = webServer;

        this.srv.on("options", (req, res) => {
            res.writeHead(200, {
              "Access-Control-Allow-Origin": _DOMAIN, // Replace with your frontend domain
              "Access-Control-Allow-Methods": "GET, POST",
              "Access-Control-Allow-Headers": "Content-Type"
            });
            res.end();
        });

        const corsMiddleware = cors({
            origin: _DOMAIN, // Replace with the appropriate origins or set it to '*'
            methods: ['GET', 'POST'],
        });        
    
        //socket stuff

        this.sockets.on('connection', (socket: Socket) => {            
            ConsoleService.log('[WS] connection recieved');
            

            socket.on('__PING__', () => {
                socket.emit('__PONG__', '__PONG__');
            });

            Object.keys(opts.wsRoutes).forEach((eventName) => {                
                const SocketClass = opts.wsRoutes[eventName];                
                new SocketClass(ServerService.io).handleConnection(socket, eventName);
            });
        });

        this.use(async (socket, next) => {
            const request: HTTP.IncomingMessage = socket.request;
            const response: ServerResponse = new ServerResponse(request);
            corsMiddleware(request, response, next);            
        });

        if(opts.authorization){
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

    static init(webServer: HTTP.Server | HTTPS.Server, opts: IInitOpts): ServerService {
        if (!ServerService.io) {
            ServerService.io = new ServerService(webServer, opts);                
        }

        const allProcessesIds = ProcessService.getAllProcessesIds();

        const executeDir = process.cwd();        
        const rwsDir = `${executeDir}/node_modules/.rws`;

        if(!fs.existsSync(rwsDir)){
            fs.mkdirSync(rwsDir);
        }

        fs.writeFileSync(`${rwsDir}/pid`, allProcessesIds.join(','));

        process.on('exit', (code) => {
            if(fs.existsSync(`${rwsDir}/pid`)){
                fs.unlink(`${rwsDir}/pid`, () => {});
            }
        });
 
        return ServerService.io;
    }

    public webServer(): HTTP.Server | HTTPS.Server
    { 
        return this.srv 
    }  

    public static async initializeApp(opts: IInitOpts): Promise<ServerService>
    {
        const AppConfigService = getConfigService();
        const app = express();
             
        let https: boolean = true;

        if(opts.pub_dir){
            app.use(express.static(opts.pub_dir));
        }

        app.set('view engine', 'ejs');                             
        
        app.use(fileUpload());

        app.use((req, res, next) => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
            next();
        });

        // app.use(express.json({ limit: '200mb' }));
        app.use(bodyParser.json({ limit: '200mb' }));


        const sslCert = AppConfigService.get('ssl_cert');
        const sslKey = AppConfigService.get('ssl_key');  

        const options: {key?: Buffer, cert?: Buffer} = {}

        if(!sslCert || !sslKey){
            https = false;            
        }else{
            options.key = fs.readFileSync(sslKey);
            options.cert = fs.readFileSync(sslCert);
        }        

        if(AppConfigService.get('features') && AppConfigService.get('features').routing_enabled){
            await RouterService.assignRoutes(app, opts.httpRoutes, opts.controllerList);
        }

        const webServer = https ? HTTPS.createServer(options, app) : HTTP.createServer(app);    

        return ServerService.init(webServer, opts);         
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
}

export default ServerService
export { WsRoutes, IHTTProute, IInitOpts, ITheSocket, IPrefixedHTTProutes, RWSHTTPRoutingEntry }