"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../index");
/**
 * Generated decorator is used to mark a specific class property as a generated table column.
 */
function Generated(strategy) {
    if (strategy === void 0) { strategy = "increment"; }
    return function (object, propertyName) {
        var args = {
            target: object.constructor,
            propertyName: propertyName,
            strategy: strategy
        };
        index_1.getMetadataArgsStorage().generations.push(args);
    };
}
exports.Generated = Generated;

//# sourceMappingURL=Generated.js.map
