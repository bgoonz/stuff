"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Special type of the table used in the single-table inherited tables.
 */
function SingleEntityChild() {
    return function (target) {
        var args = {
            target: target,
            name: undefined,
            type: "single-table-child",
            orderBy: undefined
        };
        index_1.getMetadataArgsStorage().tables.push(args);
    };
}
exports.SingleEntityChild = SingleEntityChild;

//# sourceMappingURL=SingleEntityChild.js.map
