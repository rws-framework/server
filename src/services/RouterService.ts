import 'reflect-metadata'
import express, { Request, Response } from 'express';
import TheService from "./_service";
import Controller, { IRequestParams, IHTTProuteMethod } from "../controllers/_controller";
import { IHTTProute } from "../routing/routes";
import { IHTTProuteParams } from "../routing/annotations/Route";

type RouteEntry = {[key: string]: [IHTTProuteMethod, CallableFunction, IHTTProuteParams]};

interface IControllerRoutes {
  get: RouteEntry;
  post: RouteEntry;
  put: RouteEntry;
  delete: RouteEntry;
}


class RouterService extends TheService{
    constructor() {
        super();
    }

    static responseTypeToMIME(responseType: string){
      switch (responseType){
        case 'html': return 'text/html';
        default: return 'application/json';
      }    
    }

    getRouterAnnotations(constructor: typeof Controller): Record<string, {annotationType: string, metadata: any}> {    
        const annotationsData: Record<string, {annotationType: string, metadata: any}> = {};
  
        const propertyKeys: string[] = Reflect.getMetadataKeys(constructor.prototype).map((item: string): string => {
          return item.split(':')[1];
        });
        
        propertyKeys.forEach(key => {
          const annotations: string[] = ['Route'];
  
          annotations.forEach(annotation => {
            const metadataKey = `${annotation}:${String(key)}`;
          
            const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
            
            if (meta) {
              annotationsData[String(key)] = {annotationType: annotation, metadata: meta};
            }
          });                 
        });
  
        return annotationsData;
    }

    async assignRoutes(app: express.Express, routes: IHTTProute[], controllerList: Controller[]): Promise<void>
    {                
        const controllerRoutes: IControllerRoutes = {
          get: {}, post: {}, put: {}, delete: {}
        }

        controllerList.forEach((controllerInstance: Controller) => {          
          const controllerMetadata: Record<string, {annotationType: string, metadata: any}> = this.getRouterAnnotations(controllerInstance.constructor as typeof Controller); // Pass the class constructor      
          
          if(controllerMetadata){            
            Object.keys(controllerMetadata).forEach((key: string) => {
              if(controllerMetadata[key].annotationType !== 'Route'){
                return;    
              }

              const action: IHTTProuteMethod = (controllerInstance as any)[key];
              const meta = controllerMetadata[key].metadata;                                        
              switch(meta.method) {
                case 'GET':
                  controllerRoutes.get[meta.name] = [action, app.get.bind(app), meta.params]; 
                  break;

                case 'POST':
                  controllerRoutes.post[meta.name] = [action, app.post.bind(app), meta.params]; 
                  break;

                case 'PUT':
                  controllerRoutes.put[meta.name] = [action, app.put.bind(app), meta.params]; 
                  break;

                case 'DELETE':
                  controllerRoutes.delete[meta.name] = [action, app.delete.bind(app), meta.params]; 
                  break;  
              }              
            });
          }
        });      

        routes.forEach((route: IHTTProute) => {          
            Object.keys(controllerRoutes).forEach((_method: string) => {
              const actions = controllerRoutes[_method as keyof IControllerRoutes];              
              if(!actions[route.name]){
                return;
              }
        
              const [routeMethod, appMethod, routeParams] = actions[route.name];                                

              if(!appMethod){
                return;
              }                                        

              appMethod(route.path, async (req: Request, res: Response) => {
                const controllerMethodReturn = await routeMethod({
                  query: req.query,
                  params: req.params,
                  data: req.body,
                  res: res
                });      

                res.setHeader('Content-Type', RouterService.responseTypeToMIME(routeParams.responseType));        

                if(routeParams.responseType === 'json' || !routeParams.responseType){                
                  res.send(Controller.toJSON(controllerMethodReturn));
                  return;
                }                                
                
                if(routeParams.responseType === 'html'){
                  res.render(controllerMethodReturn.template_name, controllerMethodReturn.template_params);
                  return;
                }

                res.send(controllerMethodReturn);
                return;
              });              
            });
        });
    }
}

export default RouterService.getSingleton();