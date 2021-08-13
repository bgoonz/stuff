"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * This column will store a number - version of the entity.
 * Every time your entity will be persisted, this number will be increased by one -
 * so you can organize visioning and update strategies of your entity.
 */
function VersionColumn(options) {
    return function (object, propertyName) {
        // if column options are not given then create a new empty options
        if (!options)
            options = {};
        // create and register a new column metadata
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "version",
            options: options
        };
        index_1.getMetadataArgsStorage().columns.push(args);
    };
}
exports.VersionColumn = VersionColumn;

//# sourceMappingURL=VersionColumn.js.map
