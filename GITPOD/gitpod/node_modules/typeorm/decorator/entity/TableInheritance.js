"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Sets what kind of table-inheritance table will use.
 */
function TableInheritance(type) {
    return function (target) {
        var args = {
            target: target,
            type: type
        };
        index_1.getMetadataArgsStorage().inheritances.push(args);
    };
}
exports.TableInheritance = TableInheritance;

//# sourceMappingURL=TableInheritance.js.map
