import { IControllerRoutes } from '../services/RouterService';
import { IInitOpts } from '../interfaces/ServerTypes';
import { IHTTProuteParams } from '../routing/annotations/Route';
import appConfig from '../services/AppConfigService';
import path from 'path';

export type MiddleWareType = (req: any, res: any, next: () => void) => void;
export type ExchangeEventType = (req: any, res: any) => void;

export abstract class AbstractServer {
    protected options: IInitOpts;
    protected webSrv: any;

    constructor(options: IInitOpts) {
        this.options = options;
    }

    abstract start(port: number, afterInit: () => void): Promise<void>;
    abstract stop(): Promise<void>;
    abstract addRoute(controllerRoutes: IControllerRoutes, method: string, handler: (req: any, res: any) => void, routeParams: any, key: string): void;
    abstract prepare(): Promise<void>;
    abstract addMiddleWare(onCatch: MiddleWareType): void;

    getSrvApp(): any
    {
        return this.webSrv;
    }

    on(eventName: string, callback: ExchangeEventType)
    {
        return this.webSrv.on(eventName, callback);
    }

    sendResponseWithStatus(res: any, status: number, routeParams: IHTTProuteParams, output: any)
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


}