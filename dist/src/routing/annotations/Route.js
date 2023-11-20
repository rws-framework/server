"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function Route(name, method = 'GET', params = { responseType: 'json' }) {
    let metaOpts = { name, method, params };
    return function (target, key) {
        Reflect.defineMetadata(`Route:${key}`, metaOpts, target);
    };
}
exports.default = Route;
//# sourceMappingURL=Route.js.map