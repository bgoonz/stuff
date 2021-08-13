import { getMetadataArgsStorage } from "../../index";
/**
 * Used on a entities that stores its children in a tree using closure design pattern.
 */
export function ClosureEntity(name, options) {
    return function (target) {
        var args = {
            target: target,
            name: name,
            type: "closure",
            orderBy: options && options.orderBy ? options.orderBy : undefined,
            skipSync: !!(options && options.skipSync === true)
        };
        getMetadataArgsStorage().tables.push(args);
    };
}

//# sourceMappingURL=ClosureEntity.js.map
