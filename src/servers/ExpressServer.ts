
import getConfigService from '../services/AppConfigService';
import express, { Request, Response } from 'express';
import { AbstractServer , MiddleWareType} from './AbstractServer';
import HTTPS from 'https';
import HTTP from 'http';
import { IInitOpts } from '../interfaces/ServerTypes';
import fs from 'fs';
import { RouterServiceInstance } from '../services/RouterService';
import { RWSError } from '../errors';
import ConsoleService from '../services/ConsoleService';

export class ExpressServer extends AbstractServer {
    private app: express.Application;

    constructor(options: IInitOpts) {
        super(options);
        this.app = express();              
        this.webSrv = this.app;     
    }

    async prepare(): Promise<void> {
        return new Promise((resolve) => {
            const options: {key?: Buffer, cert?: Buffer} = {};
            const isSSL: boolean = getConfigService().get('features')?.ssl;
      
            if(getConfigService().get('features')?.ssl){
                const sslCert = getConfigService().get('ssl_cert');
                const sslKey = getConfigService().get('ssl_key');  

                if( !sslKey || !sslCert || !fs.existsSync(sslCert) || !fs.existsSync(sslKey)){
                    throw new Error('SSL keys set in config do not exist.');
                }

                options.key = fs.readFileSync(sslKey);
                options.cert = fs.readFileSync(sslCert);       
            }   
          
            this.webSrv = isSSL ? HTTPS.createServer(options,this.app) : HTTP.createServer(this.app);
        });
    }

    async start(port: number, afterInit: () => void): Promise<void> {
        this.webSrv.listen(port, () => {
            afterInit();
        });
    }

    stop(): Promise<void> {
        console.error('Implement STOP');
        return Promise.resolve();
    }

    addRoute(appMethod: any, routeMethod: any, route: any, routeParams: any): void {
        appMethod(route.path, async (req: Request, res: Response) => {
            try {

                const controllerMethodReturn = await routeMethod({
                    req: req,
                    query: req.query,
                    params: route.noParams ? [] : req.params,
                    data: req.body,
                    res: res       
                });     

                res.setHeader('Content-Type', RouterServiceInstance.responseTypeToMIME(routeParams.responseType));  

                let status = 200;

                if(controllerMethodReturn instanceof RWSError){
                    status = controllerMethodReturn.getCode();
                }

                this.sendResponseWithStatus(res, status, routeParams, controllerMethodReturn);          
      
                return;
            }catch(err: Error | RWSError | any){   
                let errMsg;          
                let stack;

                if(err.printFullError){
                    err.printFullError();
                    errMsg = err.getMessage();
        
                    stack = err.getStack();
                }else{
                    errMsg = err.message;
                    ConsoleService.error(errMsg);
                    ConsoleService.log(err.stack); 
                    stack = err.stack;      
                    err.message = errMsg;     
                }                 

                const code = err.getCode ? err.getCode() : 500;
      
                this.sendResponseWithStatus(res, code, routeParams, {
                    success: false,
                    data: {
                        error: {
                            code: code,
                            message: errMsg,
                            stack
                        }
                    }
                });          
            }
        });
    }

    addMiddleWare(onCatch: MiddleWareType): void {
        this.getSrvApp().use((req: Request, res: Response, next: () => void) => {
            onCatch(req, res, next);
        });
    }
}