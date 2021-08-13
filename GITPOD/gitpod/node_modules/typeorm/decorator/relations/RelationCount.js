"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Holds a number of children in the closure table of the column.
 */
function RelationCount(relation, alias, queryBuilderFactory) {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            relation: relation,
            alias: alias,
            queryBuilderFactory: queryBuilderFactory
        };
        index_1.getMetadataArgsStorage().relationCounts.push(args);
    };
}
exports.RelationCount = RelationCount;

//# sourceMappingURL=RelationCount.js.map
