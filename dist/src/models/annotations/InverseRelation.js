"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function InverseRelation(inversionModel) {
    let metaOpts = {
        inversionModel: inversionModel
    };
    return function (target, key) {
        Reflect.defineMetadata(`InverseRelation:${key}`, metaOpts, target);
    };
}
exports.default = InverseRelation;
//# sourceMappingURL=InverseRelation.js.map