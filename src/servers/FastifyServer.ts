// import Fastify, { HTTPMethods, FastifyInstance, FastifyRequest as Request, FastifyReply as Response } from 'fastify';
// import HTTPS from 'https';
// import HTTP from 'http';
// import getConfigService from '../services/AppConfigService';
// import express, { Request, Response, Application as ExpressApp, static as renderStaticFiles } from 'express';
// import { AbstractServer , MiddleWareType, RWSServerHttpHandlerType, ExchangeEventType} from './AbstractServer';
// import { IInitOpts } from '../interfaces/ServerTypes';
// import fs from 'fs';
// import { RouterServiceInstance } from '../services/RouterService';
// import { Error500, RWSError } from '../errors';
// import ConsoleService from '../services/ConsoleService';

// export class FastifyServer extends AbstractServer<any> {
//   private app: FastifyInstance;

//   constructor(options: IInitOpts) {
//     super(options);
//     this.app = Fastify({});              
//     this.webSrv = this.app;     
//   }

//   async start(port: number, afterInit: () => void): Promise<void> {
//     if(!this.webSrv){
//       throw new Error500(new Error('RWSServer instance is not prepared.'), __filename);
//     }

//     this.webSrv.listen(port);
//   }

//   stop(): Promise<void> {
//     console.error('Implement STOP');
//     return Promise.resolve();
//   }

//   addRoute(method: HTTPMethods, path: string, handler: Function): void {
//     this.app.route({
//       method,
//       url: path,
//       handler: async (request: Request, response: Response) => handler(request, response),
//     });
//   }

//   async prepare(): Promise<void> {
//       return new Promise((resolve) => {
//           const options: {key?: Buffer, cert?: Buffer} = {};
//           const isSSL: boolean = getConfigService().get('features')?.ssl;
    
//           if(getConfigService().get('features')?.ssl){
//               const sslCert = getConfigService().get('ssl_cert');
//               const sslKey = getConfigService().get('ssl_key');  

//               if( !sslKey || !sslCert || !fs.existsSync(sslCert) || !fs.existsSync(sslKey)){
//                   throw new Error('SSL keys set in config do not exist.');
//               }

//               options.key = fs.readFileSync(sslKey);
//               options.cert = fs.readFileSync(sslCert);       
//           }   
        
//           //this.httpHandler = isSSL ? HTTPS.createServer(options, this.app) : HTTP.createServer(this.app);
//       });
//   }

//   on(eventName: string, callback: ExchangeEventType<ExpressApp>): void
//   {
//       this.webSrv.on(eventName, callback);
//   }

//   getHttpHandler(): RWSServerHttpHandlerType
//   {
//       return this.httpHandler;
//   }

//   // addRoute(appMethod: any, routeMethod: any, route: any, routeParams: any): void {
//   //     appMethod(route.path, async (req: Request, res: Response) => {
//   //         try {

//   //             const controllerMethodReturn = await routeMethod({
//   //                 req: req,
//   //                 query: req.query,
//   //                 params: route.noParams ? [] : req.params,
//   //                 data: req.body,
//   //                 res: res       
//   //             });     

//   //             res.setHeader('Content-Type', RouterServiceInstance.responseTypeToMIME(routeParams.responseType));  

//   //             let status = 200;

//   //             if(controllerMethodReturn instanceof RWSError){
//   //                 status = controllerMethodReturn.getCode();
//   //             }

//   //             this.sendResponseWithStatus(res, status, routeParams, controllerMethodReturn);          
    
//   //             return;
//   //         }catch(err: Error | RWSError | any){   
//   //             let errMsg;          
//   //             let stack;

//   //             if(err.printFullError){
//   //                 err.printFullError();
//   //                 errMsg = err.getMessage();
      
//   //                 stack = err.getStack();
//   //             }else{
//   //                 errMsg = err.message;
//   //                 ConsoleService.error(errMsg);
//   //                 ConsoleService.log(err.stack); 
//   //                 stack = err.stack;      
//   //                 err.message = errMsg;     
//   //             }                 

//   //             const code = err.getCode ? err.getCode() : 500;
    
//   //             this.sendResponseWithStatus(res, code, routeParams, {
//   //                 success: false,
//   //                 data: {
//   //                     error: {
//   //                         code: code,
//   //                         message: errMsg,
//   //                         stack
//   //                     }
//   //                 }
//   //             });          
//   //         }
//   //     });
//   // }

//   addMiddleWare(onCatch: MiddleWareType): void {
//       this.getSrvApp().use((req: Request, res: Response, next: () => void) => {
//           onCatch(req, res, next);
//       });
//   }

//   setPublicDir(pub_dir: string): void
//   {
//       this.addMiddleWare(renderStaticFiles(pub_dir));
//       this.getSrvApp().set('view engine', 'ejs');
//   }
// }
