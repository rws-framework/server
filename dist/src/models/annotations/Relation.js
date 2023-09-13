"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
function Relation(relatedTo, required = false, relationField = null, relatedToField = 'id') {
    let metaOpts = { required };
    metaOpts.relatedToField = relatedToField;
    metaOpts.relatedTo = relatedTo;
    if (!relationField) {
        metaOpts.relationField = relatedTo + '_id';
    }
    else {
        metaOpts.relationField = relationField;
    }
    return function (target, key) {
        Reflect.defineMetadata(`Relation:${key}`, metaOpts, target);
    };
}
exports.default = Relation;
//# sourceMappingURL=Relation.js.map