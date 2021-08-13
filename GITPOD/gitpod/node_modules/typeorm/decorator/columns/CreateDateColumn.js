"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * This column will store a creation date of the inserted object.
 * Creation date is generated and inserted only once,
 * at the first time when you create an object, the value is inserted into the table, and is never touched again.
 */
function CreateDateColumn(options) {
    return function (object, propertyName) {
        // const reflectedType = ColumnTypes.typeToString((Reflect as any).getMetadata("design:type", object, propertyName));
        // if column options are not given then create a new empty options
        if (!options)
            options = {};
        // implicitly set a type, because this column's type cannot be anything else except date
        // options = Object.assign({ type: Date } as ColumnOptions, options);
        // create and register a new column metadata
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            // propertyType: reflectedType,
            mode: "createDate",
            options: options
        };
        index_1.getMetadataArgsStorage().columns.push(args);
    };
}
exports.CreateDateColumn = CreateDateColumn;

//# sourceMappingURL=CreateDateColumn.js.map
