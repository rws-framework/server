import 'reflect-metadata';
import express from 'express';
import TheService from "./_service";
import Controller from "../controllers/_controller";
import { IHTTProute } from "../routing/routes";
declare class RouterService extends TheService {
    constructor();
    static responseTypeToMIME(responseType: string): "text/html" | "application/json";
    getRouterAnnotations(constructor: typeof Controller): Record<string, {
        annotationType: string;
        metadata: any;
    }>;
    assignRoutes(app: express.Express, routes: IHTTProute[], controllerList: Controller[]): Promise<void>;
}
declare const _default: RouterService;
export default _default;
