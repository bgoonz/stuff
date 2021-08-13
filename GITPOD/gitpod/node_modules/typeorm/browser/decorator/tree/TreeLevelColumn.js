import { getMetadataArgsStorage } from "../../index";
/**
 * Creates a "level"/"length" column to the table that holds a closure table.
 */
export function TreeLevelColumn() {
    return function (object, propertyName) {
        // create and register a new column metadata
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "treeLevel",
            options: {}
        };
        getMetadataArgsStorage().columns.push(args);
    };
}

//# sourceMappingURL=TreeLevelColumn.js.map
