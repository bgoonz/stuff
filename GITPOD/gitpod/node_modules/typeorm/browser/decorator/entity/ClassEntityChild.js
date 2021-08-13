import { getMetadataArgsStorage } from "../../index";
/**
 * Special type of the entity used in the class-table inherited tables.
 */
export function ClassEntityChild(tableName, options) {
    return function (target) {
        var args = {
            target: target,
            name: tableName,
            type: "class-table-child",
            orderBy: options && options.orderBy ? options.orderBy : undefined,
            skipSync: !!(options && options.skipSync === true)
        };
        getMetadataArgsStorage().tables.push(args);
    };
}

//# sourceMappingURL=ClassEntityChild.js.map
