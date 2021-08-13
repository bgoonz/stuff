import { getMetadataArgsStorage } from "../../index";
/**
 * Sets what kind of table-inheritance table will use.
 */
export function TableInheritance(type) {
    return function (target) {
        var args = {
            target: target,
            type: type
        };
        getMetadataArgsStorage().inheritances.push(args);
    };
}

//# sourceMappingURL=TableInheritance.js.map
