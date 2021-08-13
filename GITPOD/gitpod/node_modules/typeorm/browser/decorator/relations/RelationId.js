import { getMetadataArgsStorage } from "../../index";
/**
 * Special decorator used to extract relation id into separate entity property.
 */
export function RelationId(relation, alias, queryBuilderFactory) {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            relation: relation,
            alias: alias,
            queryBuilderFactory: queryBuilderFactory
        };
        getMetadataArgsStorage().relationIds.push(args);
    };
}

//# sourceMappingURL=RelationId.js.map
