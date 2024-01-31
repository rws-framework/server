import 'reflect-metadata';
import express from 'express';
import TheService from "./_service";
import Controller from "../controllers/_controller";
import { IHTTProute, RWSHTTPRoutingEntry } from "../routing/routes";
/**
 *
 */
declare class RouterService extends TheService {
    constructor();
    static responseTypeToMIME(responseType: string): "application/json" | "text/html";
    getRouterAnnotations(constructor: typeof Controller): Record<string, {
        annotationType: string;
        metadata: any;
    }>;
    assignRoutes(app: express.Express, routesPackage: RWSHTTPRoutingEntry[], controllerList: Controller[]): Promise<IHTTProute[]>;
    private addRouteToServer;
    private sendResponseWithStatus;
    private setControllerRoutes;
    hasRoute(routePath: string, routes: IHTTProute[]): boolean;
    getRoute(routePath: string, routes: IHTTProute[]): IHTTProute | null;
}
declare const _default: RouterService;
export default _default;
