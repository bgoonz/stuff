"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * This column will store an update date of the updated object.
 * This date is being updated each time you persist the object.
 */
function UpdateDateColumn(options) {
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            mode: "updateDate",
            options: options ? options : {}
        };
        index_1.getMetadataArgsStorage().columns.push(args);
    };
}
exports.UpdateDateColumn = UpdateDateColumn;

//# sourceMappingURL=UpdateDateColumn.js.map
