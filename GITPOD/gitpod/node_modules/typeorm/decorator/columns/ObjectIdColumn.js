"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Special type of column that is available only for MongoDB database.
 * Marks your entity's column to be an object id.
 */
function ObjectIdColumn(options) {
    return function (object, propertyName) {
        // if column options are not given then create a new empty options
        if (!options)
            options = {};
        options = Object.assign(options, {
            primary: true,
            name: options.name ? options.name : "_id"
        });
        // create and register a new column metadata
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "objectId",
            options: options
        };
        index_1.getMetadataArgsStorage().columns.push(args);
    };
}
exports.ObjectIdColumn = ObjectIdColumn;

//# sourceMappingURL=ObjectIdColumn.js.map
