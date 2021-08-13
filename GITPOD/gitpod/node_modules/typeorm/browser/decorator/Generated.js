import { getMetadataArgsStorage } from "../index";
/**
 * Generated decorator is used to mark a specific class property as a generated table column.
 */
export function Generated(strategy) {
    if (strategy === void 0) { strategy = "increment"; }
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            strategy: strategy
        };
        getMetadataArgsStorage().generations.push(args);
    };
}

//# sourceMappingURL=Generated.js.map
