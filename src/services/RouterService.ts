import 'reflect-metadata';
import express, { Request, Response } from 'express';
import TheService from './_service';

import { IHTTProute, RWSHTTPRoutingEntry } from '../routing/routes';
import { IHTTProuteParams } from '../routing/annotations/Route';

import path from 'path';
import { RWSError } from '../errors/index';
import { ConsoleService } from './ConsoleService';
import { Injectable } from '../../nest';  
import { ConfigService } from '@nestjs/config';
import { Controller } from '@nestjs/common/interfaces';
import { IRWSResource } from '../types/IRWSResource';


type RouteEntry = {[key: string]: [any, CallableFunction, IHTTProuteParams, string]};

interface IControllerRoutes {
  get: RouteEntry;
  post: RouteEntry;
  put: RouteEntry;
  delete: RouteEntry;
}

@Injectable()
class RouterService{  
    constructor(
        private configService: ConfigService, 
        private consoleService: ConsoleService
    ) {}

    generateRoutesFromResources(resources: IRWSResource[]): RWSHTTPRoutingEntry[] {
        const routes: RWSHTTPRoutingEntry[] = [];

        resources.forEach(resource => {
            const resourceRoutes = this.generateResourceRoutes(resource);
            routes.push({
                prefix: `/api/${resource.name}`,
                routes: resourceRoutes
            });
        });

        return routes;
    }

    private generateResourceRoutes(resource: IRWSResource): IHTTProute[] {
        const routes: IHTTProute[] = [];
        const endpoints = resource.endpoints || {
            create: true,
            read: true,
            update: true,
            delete: true,
            list: true
        };

        // Standard CRUD routes
        if (endpoints.create) {
            routes.push({
                name: `${resource.name}:create`,
                path: '/',
                method: 'POST'
            });
        }

        if (endpoints.read) {
            routes.push({
                name: `${resource.name}:read`,
                path: '/:id',
                method: 'GET'
            });
        }

        if (endpoints.update) {
            routes.push({
                name: `${resource.name}:update`,
                path: '/:id',
                method: 'PUT'
            });
        }

        if (endpoints.delete) {
            routes.push({
                name: `${resource.name}:delete`,
                path: '/:id',
                method: 'DELETE'
            });
        }

        if (endpoints.list) {
            routes.push({
                name: `${resource.name}:list`,
                path: '/list',
                method: 'GET'
            });
        }

        // Custom routes
        if (resource.custom_routes) {
            resource.custom_routes.forEach(customRoute => {
                routes.push({
                    name: `${resource.name}:${customRoute.handler}`,
                    path: customRoute.path,
                    method: customRoute.method
                });
            });
        }

        return routes;
    }

    async assignRoutes(app: express.Express, routesPackage: RWSHTTPRoutingEntry[], controllerList: Controller[]): Promise<IHTTProute[]> {
        const controllerRoutes: IControllerRoutes = {
            get: {}, post: {}, put: {}, delete: {}
        };        

        controllerList.forEach((controllerInstance: Controller) => {          
            const controllerMetadata = this.getRouterAnnotations(controllerInstance.constructor as Controller);
          
            if(controllerMetadata) {            
                Object.keys(controllerMetadata).forEach((key: string) => {
                    if(controllerMetadata[key].annotationType !== 'Route') {
                        return;    
                    }
                    this.setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app);
                });
            }
        });      

        const routes = this.flattenRoutes(routesPackage);

        routes.forEach((route: IHTTProute) => {          
            Object.keys(controllerRoutes).forEach((_method: string) => {
                const actions = controllerRoutes[_method as keyof IControllerRoutes];                           
                if(!actions[route.name]) {
                    return;
                }        
                this.addRouteToServer(actions, route);
            });
        });

        return routes;
    }

    private flattenRoutes(routesPackage: RWSHTTPRoutingEntry[]): IHTTProute[] {
        let routes: IHTTProute[] = [];

        routesPackage.forEach((item: RWSHTTPRoutingEntry) => {   
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                routes = [...routes, ...item.routes.map((subRouteItem: IHTTProute): IHTTProute => ({
                    path: item.prefix + subRouteItem.path,
                    name: subRouteItem.name,
                    method: subRouteItem.method
                }))];
            } else {
                routes.push(item as IHTTProute);
            }        
        });  

        return routes;
    }

    static responseTypeToMIME(responseType: string){
        switch (responseType){
        case 'html': return 'text/html';
        default: return 'application/json';
        }    
    }

    getRouterAnnotations(constructor:  Controller): Record<string, {annotationType: string, metadata: any}> {    
        const annotationsData: Record<string, {annotationType: string, metadata: any}> = {};
  
        return annotationsData;
    }

    private addRouteToServer(actions: RouteEntry, route: IHTTProute){
 
        const [routeMethod, appMethod, routeParams] = actions[route.name];                                
      
        if(!appMethod){
            return;
        }        

        appMethod(route.path, async (req: Request, res: Response) => {
            try {
                const controllerMethodReturn = await routeMethod({
                    req: req,
                    query: req.query,
                    params: route.noParams ? [] : req.params,
                    data: req.body,
                    res: res       
                });     

                res.setHeader('Content-Type', RouterService.responseTypeToMIME(routeParams.responseType));  

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
                    this.consoleService.error(errMsg);
                    this.consoleService.log(err.stack); 
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

    private sendResponseWithStatus(res: Response, status: number, routeParams: IHTTProuteParams, output: any)
    {
        if(routeParams.responseType === 'json' || !routeParams.responseType){                
            res.status(status).send(output);
            return;
        }                                              

        if(routeParams.responseType === 'html' && this.configService.get('pub_dir')){          
            res.status(status).sendFile(path.join(this.configService.get('pub_dir'),  output.template_name + '.html'));
            return;
        }

        res.status(status).send();
    }

    private setControllerRoutes(
        controllerInstance: Controller, 
        controllerMetadata: Record<string, {annotationType: string, metadata: any}>, 
        controllerRoutes: IControllerRoutes, key: string, app: express.Express): void
    {
        const action: any = (params: any) => {}//(controllerInstance as Controller).callMethod(key);
        const meta = controllerMetadata[key].metadata;                                        
        switch(meta.method) {
        case 'GET':
            controllerRoutes.get[meta.name] = [action.bind(controllerInstance), app.get.bind(app), meta.params, key]; 
            break;

        case 'POST':
            controllerRoutes.post[meta.name] = [action.bind(controllerInstance), app.post.bind(app), meta.params, key];
            break;

        case 'PUT':
            controllerRoutes.put[meta.name] = [action.bind(controllerInstance), app.put.bind(app), meta.params, key]; 
            break;

        case 'DELETE':
            controllerRoutes.delete[meta.name] = [action.bind(controllerInstance), app.delete.bind(app), meta.params, key];
            break;  
        }
    }
    
    hasRoute(routePath: string, routes: IHTTProute[]): boolean
    {
        return this.getRoute(routePath, routes) !== null;
    }

    getRoute(routePath: string, routes: IHTTProute[]): IHTTProute | null
    {
        const foundRoute = routes.find((item: IHTTProute) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });      

        return foundRoute ? foundRoute : null;
    }
}

export {
    RouterService
};
