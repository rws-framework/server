import { IControllerRoutes } from '../services/RouterService';
import { IInitOpts } from '../interfaces/ServerTypes';
import { IHTTProuteParams } from '../routing/annotations/Route';
import appConfig from '../services/AppConfigService';
import path from 'path';
import { IRequestParams } from '../controllers/_controller';

export type MiddleWareType = (req: any, res: any, next: () => void) => void;

export interface RWSCorsOptions { //cors opts interface @TODO: impement in configs
    origin?: string | undefined;
    methods?: string | string[] | undefined;
    allowedHeaders?: string | string[] | undefined;
    exposedHeaders?: string | string[] | undefined;
    credentials?: boolean | undefined;
    maxAge?: number | undefined;
    preflightContinue?: boolean | undefined;
    optionsSuccessStatus?: number | undefined;
}

export type RWSServerHttpHandlerType = {
    [key: string]: any
};
//Application<Record<string, any>>
export type ExchangeEventType<ParentServerClass> = (parent: ParentServerClass) => void;

export interface IRWSAbstractServerRequiredParams<ParentServerClass> {
    on: (eventName: string, callback: ExchangeEventType<ParentServerClass>) => void
    options(wildCard: string, optionsHandler: MiddleWareType): void
}

export abstract class AbstractServer<ServerAppClass extends IRWSAbstractServerRequiredParams<ServerAppClass>> {
    protected options: IInitOpts;
    protected webSrv: ServerAppClass;
    protected httpHandler: RWSServerHttpHandlerType;

    constructor(options: IInitOpts) {
        this.options = options;
    }

    public abstract start(port: number, afterInit: () => void): Promise<void>;
    public abstract stop(): Promise<void>;
    public abstract addRoute(controllerRoutes: IControllerRoutes, method: string, handler: (req: any, res: any) => void, routeParams: any, key: string): void;
    public abstract prepare(): Promise<void>;
    public abstract addMiddleWare(onCatch: MiddleWareType): void;
    public abstract getHttpHandler(): RWSServerHttpHandlerType;
    public abstract setPublicDir(pub_dir: string): void;    

    public on(eventName: string, callback: ExchangeEventType<ServerAppClass>): void
    {
        this.webSrv.on(eventName, callback);
    }    

    public getServerAppMethodCall(method: string): (params: IRequestParams) => any
    {
        return ((this.getSrvApp())[method.toLocaleLowerCase() as keyof ServerAppClass]) as (params: IRequestParams) => any;
    }

    public bindAppMethod(appMethod: (params: IRequestParams) => any): (params: IRequestParams) => any
    {
        return appMethod.bind(this.getSrvApp());
    }

    public setOptionsHandling(wildCard: string, optionsHandler: MiddleWareType): void
    {
        this.getSrvApp().options(wildCard, optionsHandler);
    }

    protected sendResponseWithStatus(res: any, status: number, routeParams: IHTTProuteParams, output: any)
    {
        if(routeParams.responseType === 'json' || !routeParams.responseType){                
            res.status(status).send(output);
            return;
        }                                              

        if(routeParams.responseType === 'html' && appConfig().get('pub_dir')){          
            res.status(status).sendFile(path.join(appConfig().get('pub_dir'),  output.template_name + '.html'));
            return;
        }

        res.status(status).send();
    }

    protected getSrvApp(): ServerAppClass
    {
        return this.webSrv;
    }
}