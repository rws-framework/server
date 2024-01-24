"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const path_1 = __importDefault(require("path"));
const index_1 = require("../errors/index");
const ConsoleService_1 = __importDefault(require("./ConsoleService"));
/**
 *
 */
class RouterService extends _service_1.default {
    constructor() {
        super();
    }
    static responseTypeToMIME(responseType) {
        switch (responseType) {
            case 'html': return 'text/html';
            default: return 'application/json';
        }
    }
    getRouterAnnotations(constructor) {
        const annotationsData = {};
        const propertyKeys = Reflect.getMetadataKeys(constructor.prototype).map((item) => {
            return item.split(':')[1];
        });
        propertyKeys.forEach(key => {
            const annotations = ['Route'];
            annotations.forEach(annotation => {
                const metadataKey = `${annotation}:${String(key)}`;
                const meta = Reflect.getMetadata(metadataKey, constructor.prototype);
                if (meta) {
                    annotationsData[String(key)] = { annotationType: annotation, metadata: meta };
                }
            });
        });
        return annotationsData;
    }
    async assignRoutes(app, routesPackage, controllerList) {
        const controllerRoutes = {
            get: {}, post: {}, put: {}, delete: {}
        };
        controllerList.forEach((controllerInstance) => {
            const controllerMetadata = this.getRouterAnnotations(controllerInstance.constructor);
            if (controllerMetadata) {
                Object.keys(controllerMetadata).forEach((key) => {
                    if (controllerMetadata[key].annotationType !== 'Route') {
                        return;
                    }
                    this.setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app);
                });
            }
        });
        let routes = [];
        routesPackage.forEach((item) => {
            if ('prefix' in item && 'routes' in item && Array.isArray(item.routes)) {
                // Handle the case where item is of type IPrefixedHTTProutes
                routes = [...routes, ...item.routes.map((subRouteItem) => {
                        const subRoute = {
                            path: item.prefix + subRouteItem.path,
                            name: subRouteItem.name
                        };
                        return subRoute;
                    })];
            }
            else {
                // Handle the case where item is of type IHTTProute
                routes.push(item);
            }
        });
        console.log('ROUTES IN ASSIGNMENT', routes);
        routes.forEach((route) => {
            Object.keys(controllerRoutes).forEach((_method) => {
                const actions = controllerRoutes[_method];
                if (!actions[route.name]) {
                    return;
                }
                this.addRouteToServer(actions, route);
            });
        });
        return routes;
    }
    addRouteToServer(actions, route) {
        const [routeMethod, appMethod, routeParams, methodName] = actions[route.name];
        if (!appMethod) {
            return;
        }
        appMethod(route.path, async (req, res) => {
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
                if (controllerMethodReturn instanceof index_1.RWSError) {
                    status = controllerMethodReturn.getCode();
                }
                this.sendResponseWithStatus(res, status, routeParams, controllerMethodReturn);
                return;
            }
            catch (err) {
                let errMsg;
                let stack;
                if (!!err.printFullError) {
                    err.printFullError();
                    errMsg = err.getMessage();
                    stack = err.getStack();
                }
                else {
                    errMsg = err.message;
                    ConsoleService_1.default.error(errMsg);
                    console.log(err.stack);
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
    sendResponseWithStatus(res, status, routeParams, output) {
        if (routeParams.responseType === 'json' || !routeParams.responseType) {
            res.status(status).send(output);
            return;
        }
        if (routeParams.responseType === 'html' && (0, AppConfigService_1.default)().get('pub_dir')) {
            res.status(status).sendFile(path_1.default.join((0, AppConfigService_1.default)().get('pub_dir'), output.template_name + '.html'));
            return;
        }
        res.status(status).send();
    }
    setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app) {
        const action = controllerInstance.callMethod(key);
        const meta = controllerMetadata[key].metadata;
        switch (meta.method) {
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
    hasRoute(routePath, routes) {
        return this.getRoute(routePath, routes) !== null;
    }
    getRoute(routePath, routes) {
        const front_routes = (0, AppConfigService_1.default)().get('front_routes');
        const foundRoute = routes.find((item) => {
            return item.path.indexOf(routePath) > -1 && !item.noParams;
        });
        return !!foundRoute ? foundRoute : null;
    }
}
exports.default = RouterService.getSingleton();
//# sourceMappingURL=RouterService.js.map