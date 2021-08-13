"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Special decorator used to extract relation id into separate entity property.
 */
function RelationId(relation, alias, queryBuilderFactory) {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            relation: relation,
            alias: alias,
            queryBuilderFactory: queryBuilderFactory
        };
        index_1.getMetadataArgsStorage().relationIds.push(args);
    };
}
exports.RelationId = RelationId;

//# sourceMappingURL=RelationId.js.map
