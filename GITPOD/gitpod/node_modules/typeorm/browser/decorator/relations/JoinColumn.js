import { getMetadataArgsStorage } from "../../index";
/**
 * JoinColumn decorator used on one-to-one relations to specify owner side of relationship.
 * It also can be used on both one-to-one and many-to-one relations to specify custom column name
 * or custom referenced column.
 */
export function JoinColumn(optionsOrOptionsArray) {
    return function (object, propertyName) {
        var options = optionsOrOptionsArray instanceof Array ? optionsOrOptionsArray : [optionsOrOptionsArray || {}];
        options.forEach(function (options) {
            var args = {
                target: object.constructor,
                propertyName: propertyName,
                name: options.name,
                referencedColumnName: options.referencedColumnName
            };
            getMetadataArgsStorage().joinColumns.push(args);
        });
    };
}

//# sourceMappingURL=JoinColumn.js.map
