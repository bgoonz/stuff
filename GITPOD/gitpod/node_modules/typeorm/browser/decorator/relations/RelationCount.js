import { getMetadataArgsStorage } from "../../index";
/**
 * Holds a number of children in the closure table of the column.
 */
export function RelationCount(relation, alias, queryBuilderFactory) {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            relation: relation,
            alias: alias,
            queryBuilderFactory: queryBuilderFactory
        };
        getMetadataArgsStorage().relationCounts.push(args);
    };
}

//# sourceMappingURL=RelationCount.js.map
