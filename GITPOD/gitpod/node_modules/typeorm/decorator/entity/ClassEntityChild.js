"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Special type of the entity used in the class-table inherited tables.
 */
function ClassEntityChild(tableName, options) {
    return function (target) {
        var args = {
            target: target,
            name: tableName,
            type: "class-table-child",
            orderBy: options && options.orderBy ? options.orderBy : undefined,
            skipSync: !!(options && options.skipSync === true)
        };
        index_1.getMetadataArgsStorage().tables.push(args);
    };
}
exports.ClassEntityChild = ClassEntityChild;

//# sourceMappingURL=ClassEntityChild.js.map
