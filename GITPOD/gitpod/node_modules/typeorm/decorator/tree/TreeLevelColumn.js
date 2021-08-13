"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Creates a "level"/"length" column to the table that holds a closure table.
 */
function TreeLevelColumn() {
    return function (object, propertyName) {
        // create and register a new column metadata
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "treeLevel",
            options: {}
        };
        index_1.getMetadataArgsStorage().columns.push(args);
    };
}
exports.TreeLevelColumn = TreeLevelColumn;

//# sourceMappingURL=TreeLevelColumn.js.map
