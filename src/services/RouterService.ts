import 'reflect-metadata';
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
import { INestApplication, Type } from '@nestjs/common';
import { Get, Post, Put, Delete, Controller as NestController } from '@nestjs/common';
import { RWSConfigService } from './RWSConfigService';

type RouteEntry = {[key: string]: [any, string, IHTTProuteParams, string]};

interface IControllerRoutes {
  get: RouteEntry;
  post: RouteEntry;
  put: RouteEntry;
  delete: RouteEntry;
}

@Injectable()
class RouterService {  
    constructor(
        private configService: RWSConfigService, 
        private consoleService: ConsoleService
    ) {}

    generateRoutesFromResources(resources: IRWSResource[]): RWSHTTPRoutingEntry[] {    
        return [];
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

    async assignRoutes(app: INestApplication, routesPackage: RWSHTTPRoutingEntry[], controllerList: Controller[]): Promise<IHTTProute[]> {
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
                    this.setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key);
                });
            }
        });      

        const routes = this.flattenRoutes(routesPackage);

        // Create dynamic controllers for each route
        routes.forEach((route: IHTTProute) => {          
            Object.keys(controllerRoutes).forEach((_method: string) => {
                const actions = controllerRoutes[_method as keyof IControllerRoutes];                           
                if(!actions[route.name]) {
                    return;
                }        
                this.createRouteController(app, actions, route);
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

    getRouterAnnotations(constructor: Controller): Record<string, {annotationType: string, metadata: any}> {    
        return Reflect.getMetadata('routes', constructor) || {};
    }

    private createRouteController(app: INestApplication, actions: RouteEntry, route: IHTTProute) {
        const [routeMethod, methodType, routeParams] = actions[route.name];
        const configService = this.configService;
        const consoleService = this.consoleService;

        // Create a dynamic controller class
        @NestController(route.path)
        class DynamicController {
            constructor(
                private readonly configService: RWSConfigService,
                private readonly consoleService: ConsoleService
            ) {}

            private prepareResponse(res: any, status: number, routeParams: IHTTProuteParams, output: any) {
                if(routeParams.responseType === 'json' || !routeParams.responseType){                
                    return { statusCode: status, ...output };
                }                                              

                if(routeParams.responseType === 'html' && this.configService.get('pub_dir')){          
                    const filePath = path.join(this.configService.get('pub_dir'), output.template_name + '.html');
                    return res.sendFile(filePath);
                }

                return { statusCode: status };
            }

            async handler(req: any, res: any) {
                try {
                    const controllerMethodReturn = await routeMethod({
                        req,
                        query: req.query,
                        params: route.noParams ? [] : req.params,
                        data: req.body,
                        res
                    });     

                    const contentType = RouterService.responseTypeToMIME(routeParams.responseType);
                    res.type(contentType);

                    let status = 200;
                    if(controllerMethodReturn instanceof RWSError){
                        status = controllerMethodReturn.getCode();
                    }

                    return this.prepareResponse(res, status, routeParams, controllerMethodReturn);          
                } catch(err: Error | RWSError | any) {   
                    let errMsg;          
                    let stack;

                    if(err.printFullError){
                        err.printFullError();
                        errMsg = err.getMessage();
                        stack = err.getStack();
                    } else {
                        errMsg = err.message;
                        this.consoleService.error(errMsg);
                        this.consoleService.log(err.stack); 
                        stack = err.stack;      
                        err.message = errMsg;     
                    }                 

                    const code = err.getCode ? err.getCode() : 500;
              
                    return this.prepareResponse(res, code, routeParams, {
                        success: false,
                        data: {
                            error: {
                                code,
                                message: errMsg,
                                stack
                            }
                        }
                    });          
                }
            }
        }

        // Apply the appropriate method decorator
        switch (route.method.toUpperCase()) {
            case 'GET':
                Get()(DynamicController.prototype, 'handler', Object.getOwnPropertyDescriptor(DynamicController.prototype, 'handler'));
                break;
            case 'POST':
                Post()(DynamicController.prototype, 'handler', Object.getOwnPropertyDescriptor(DynamicController.prototype, 'handler'));
                break;
            case 'PUT':
                Put()(DynamicController.prototype, 'handler', Object.getOwnPropertyDescriptor(DynamicController.prototype, 'handler'));
                break;
            case 'DELETE':
                Delete()(DynamicController.prototype, 'handler', Object.getOwnPropertyDescriptor(DynamicController.prototype, 'handler'));
                break;
        }

        // Register the controller with the application
        const moduleRef = app.select(DynamicController);
        moduleRef.get(DynamicController);
    }

    private setControllerRoutes(
        controllerInstance: Controller, 
        controllerMetadata: Record<string, {annotationType: string, metadata: any}>, 
        controllerRoutes: IControllerRoutes, 
        key: string
    ): void {
        const action: any = () => {}; // (controllerInstance as Controller).callMethod(key);
        const meta = controllerMetadata[key].metadata;                                        
        
        switch(meta.method) {
        case 'GET':
            controllerRoutes.get[meta.name] = [action.bind(controllerInstance), 'get', meta.params, key]; 
            break;

        case 'POST':
            controllerRoutes.post[meta.name] = [action.bind(controllerInstance), 'post', meta.params, key];
            break;

        case 'PUT':
            controllerRoutes.put[meta.name] = [action.bind(controllerInstance), 'put', meta.params, key]; 
            break;

        case 'DELETE':
            controllerRoutes.delete[meta.name] = [action.bind(controllerInstance), 'delete', meta.params, key];
            break;  
        }
    }
    
    hasRoute(routePath: string, routes: IHTTProute[]): boolean {
        return this.getRoute(routePath, routes) !== null;
    }

    getRoute(routePath: string, routes: IHTTProute[]): IHTTProute | null {
        const foundRoute = routes.find((item: IHTTProute) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });      

        return foundRoute ? foundRoute : null;
    }
}

export {
    RouterService
};
