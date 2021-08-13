import { getMetadataArgsStorage } from "../../index";
/**
 * Special type of the table used in the single-table inherited tables.
 */
export function SingleEntityChild() {
    return function (target) {
        var args = {
            target: target,
            name: undefined,
            type: "single-table-child",
            orderBy: undefined
        };
        getMetadataArgsStorage().tables.push(args);
    };
}

//# sourceMappingURL=SingleEntityChild.js.map
