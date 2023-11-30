"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const _service_1 = __importDefault(require("./_service"));
const AppConfigService_1 = __importDefault(require("./AppConfigService"));
const path_1 = __importDefault(require("path"));
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
            const controllerMetadata = this.getRouterAnnotations(controllerInstance.constructor); // Pass the class constructor      
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
        routes.forEach((route) => {
            Object.keys(controllerRoutes).forEach((_method) => {
                const actions = controllerRoutes[_method];
                if (!actions[route.name]) {
                    return;
                }
                this.addRouteToServer(actions, route);
            });
        });
    }
    addRouteToServer(actions, route) {
        const [routeMethod, appMethod, routeParams] = actions[route.name];
        if (!appMethod) {
            return;
        }
        appMethod(route.path, async (req, res) => {
            const controllerMethodReturn = await routeMethod({
                query: req.query,
                params: req.params,
                data: req.body,
                res: res
            });
            res.setHeader('Content-Type', RouterService.responseTypeToMIME(routeParams.responseType));
            if (routeParams.responseType === 'json' || !routeParams.responseType) {
                res.send(controllerMethodReturn);
                return;
            }
            if (routeParams.responseType === 'html') {
                res.sendFile(path_1.default.join((0, AppConfigService_1.default)().get('pub_dir'), controllerMethodReturn.template_name + '.html'));
                return;
            }
            res.send(controllerMethodReturn);
            return;
        });
    }
    setControllerRoutes(controllerInstance, controllerMetadata, controllerRoutes, key, app) {
        const action = controllerInstance[key];
        const meta = controllerMetadata[key].metadata;
        switch (meta.method) {
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
    }
}
exports.default = RouterService.getSingleton();
//# sourceMappingURL=RouterService.js.map