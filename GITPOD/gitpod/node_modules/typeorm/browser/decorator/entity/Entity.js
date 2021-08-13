import { getMetadataArgsStorage } from "../../index";
/**
 * This decorator is used to mark classes that will be an entity (table or document depend on database type).
 * Database schema will be created for all classes decorated with it, and Repository can be retrieved and used for it.
 */
export function Entity(nameOrOptions, maybeOptions) {
    var options = (typeof nameOrOptions === "object" ? nameOrOptions : maybeOptions) || {};
    var name = typeof nameOrOptions === "string" ? nameOrOptions : options.name;
    return function (target) {
        var args = {
            target: target,
            name: name,
            type: "regular",
            orderBy: options && options.orderBy ? options.orderBy : undefined,
            engine: options && options.engine ? options.engine : undefined,
            database: options && options.database ? options.database : undefined,
            schema: options && options.schema ? options.schema : undefined,
            skipSync: !!(options && options.skipSync === true)
        };
        getMetadataArgsStorage().tables.push(args);
    };
}

//# sourceMappingURL=Entity.js.map
