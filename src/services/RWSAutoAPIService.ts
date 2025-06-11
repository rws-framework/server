import 'reflect-metadata';
import { DiscoveryService, Reflector  } from '@nestjs/core';
import { Injectable, Logger, RawBodyRequest } from '@nestjs/common';
import { Module } from '@nestjs/core/injector/module';
import { AUTOAPI_METADATA_KEY, AutoAPIMetadata } from '../controller/autoApi.decorator';
import { RequestMethod } from '@nestjs/common';
import { RWSAutoApiController } from '../controller/_autoApi';
import { ExecutionContext, RouteInfo } from '@nestjs/common/interfaces';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import multer from 'multer';
import { json, urlencoded } from 'express';
import { AuthGuard } from '../../nest/decorators/guards/auth.guard';
import { RWSConfigService } from './RWSConfigService';
import IAppConfig from '../types/IAppConfig';

interface RouteConfig {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  handler: Function;
}

@Injectable()
export class RWSAutoAPIService {
  private logger: Logger = new Logger(this.constructor.name);
  private routerProxy: any;
  private authGuard: AuthGuard;
  private methodMap: { [key: string]: RequestMethod } = {
    'GET': RequestMethod.GET,
    'POST': RequestMethod.POST,
    'PUT': RequestMethod.PUT,
    'DELETE': RequestMethod.DELETE,
    'PATCH': RequestMethod.PATCH,
    'ALL': RequestMethod.ALL,
    'OPTIONS': RequestMethod.OPTIONS,
    'HEAD': RequestMethod.HEAD
  };
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly configService: RWSConfigService<IAppConfig>,
    private readonly reflector: Reflector,
  ) {
    this.authGuard = new AuthGuard(this.configService, this.reflector);
  }

  setRouterProxy(routerProxy: any)
  {
    this.routerProxy = routerProxy;    
  }

  getAutoApiControllers(): Map<string, Module> {    
    const controllers = this.discoveryService.getControllers(); 
    const controllerList: Map<string, Module> = new Map<string, Module>();
 
    for(const wrapper of controllers) {
      if (wrapper.instance) {
        const controller = wrapper.instance;
        const metadata: AutoAPIMetadata | null = Reflect.getMetadata(AUTOAPI_METADATA_KEY, controller);

        if(metadata && metadata.name)
            controllerList.set(metadata.name, controller);
        }
    }

    return controllerList;
  }

  createRoute(config: RouteConfig): void {
    if(this.findRouteByPath(config.path, config.method)){
      throw new Error(`[RWSAutoApi] Route {${config.path}, ${config.method}} already exists!`);
    }

    // Setup middleware for parsing different types of requests
    const multipartMiddleware = multer().any();
    const jsonMiddleware = json();
    const urlencodedMiddleware = urlencoded({ extended: true });

    // Directly register the route using the router proxy
    this.routerProxy[config.method.toLowerCase()](
      config.path,
      (req: any, res: any, next: any) => {
        const contentType = req.headers['content-type'] || '';
        
        if (contentType.includes('multipart/form-data')) {
          multipartMiddleware(req, res, next);
        } else if (contentType.includes('application/json')) {
          jsonMiddleware(req, res, next);
        } else {
          urlencodedMiddleware(req, res, next);
        }
      },
      async (req: any, res: any) => {
        try {
          const controllerMethod = config.handler;        

          const ctx = {
            switchToHttp: () => ({
              getRequest: () => req,
              getResponse: () => res
            }),
            getHandler: () => controllerMethod,
            getClass: () => controllerMethod.constructor
          };

          const error401 = () => res.status(401).json({ message: 'Unauthorized', statusCode: 401 });

          try {
            const canActivate = await this.authGuard.canActivate(ctx as ExecutionContext);
          
            if (!canActivate) {
              error401();
              return;
            }
          } catch(error: Error | any){
            this.logger.debug(`Unauthorized access denied for ${req.url}`)
            error401();
            return;
          }
    
          const result = await controllerMethod(req, res);
          res.json(result);
        } catch (error: Error | any) {
          this.logger.error(error, error.stack);
          res.status(500).json({ error: error.message });
        }
      }
    );
  }

  createCrudRoutes(controllerInstance: RWSAutoApiController, basePath: string = '/'): void {
    this.setRouterProxy(controllerInstance.getHttpAdapter());    

    // Normalize base path
    const normalizedBasePath = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath;

    // Register CRUD routes
    this.createRoute({
      path: normalizedBasePath,
      method: 'GET',
      handler: async (req: any, res: any) => this.serialize(await controllerInstance.findManyAction())
    });

    this.createRoute({
      path: `${normalizedBasePath}/:id`,
      method: 'GET',
      handler: async (req: any, res: any) => this.serialize(await controllerInstance.findOneAction(req.params.id))
    });

    this.createRoute({
      path: normalizedBasePath,
      method: 'POST',
      handler: async (req: any, res: any) => this.serialize(await controllerInstance.createAction(this.getRequestBody(req)))
    });

    this.createRoute({
      path: `${normalizedBasePath}/:id`,
      method: 'PUT',
      handler: async (req: any, res: any) => this.serialize(await controllerInstance.updateAction(req.params.id, this.getRequestBody(req)))
    });

    this.createRoute({
      path: `${normalizedBasePath}/:id`,
      method: 'DELETE',
      handler: async (req: any, res: any) => {
        await controllerInstance.removeAction(req.params.id);
        return { statusCode: 204 };
      }
    });   
  }  

  readRoutes(): RouteInfo[]
  {
    const routes: RouteInfo[] = [];

    if (this.routerProxy && this.routerProxy._router && this.routerProxy._router.stack) {
      const stack = this.routerProxy._router.stack;
      
      stack.forEach((layer: any) => {
        if (layer.route) {
          const path = layer.route.path;
          const methods = Object.keys(layer.route.methods)
            .filter(method => layer.route.methods[method]);
          
          methods.forEach(method => {
            routes.push({
              path,
              method: this.methodMap[method.toUpperCase()]
            });
          });
        }
      });
    }    

    return routes;
  }

  findRouteByPath(path: string, method: string): RouteInfo | null
  {          
    return this.readRoutes().find((item => item.path === path && item.method === this.methodMap[method]))    
  }

  protected serialize(data: any): any {    
    return SerializeInterceptor.serialize(data); 
  }

  private getRequestBody(req: any): any {
    let body: any = {};
    // Handle multipart form data
    if (req.headers['content-type']?.includes('multipart/form-data')) {
      const formData: Map<string, any> = new Map<string, any>();
      
      // Handle regular form fields
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          try {
            // Try to parse nested objects from form data
            const value = req.body[key];
            if (typeof value === 'string' && value.startsWith('{')) {
              formData.set(key, JSON.parse(value));
            } else {
              formData.set(key, value);              
            }
          } catch {
            if(req.body[key]){
              formData.set(key, req.body[key]);      
            }                                
          }
        });
      }

      // Handle files if present
      if (req.files && req.files.length > 0) {        
        formData.set('files', req.files);      
      }      

      body = JSON.parse(JSON.stringify(Object.fromEntries(formData)));
    }

    // Handle regular requests
    body = {
      ...req.body,      
    };

    if(req.files){
      body._files = req.files;
    }

    return body;
  }

  shoutRoutes(): void
  {
    for (const route of this.readRoutes()){
      const routeEntry = Object.entries(this.methodMap).find(([_, val]) => val === route.method);

      this.logger.log(`Mapped {${route.path}, ${routeEntry ? routeEntry[0] : 'UNDEFINED'}} route`);
    }
  }
}