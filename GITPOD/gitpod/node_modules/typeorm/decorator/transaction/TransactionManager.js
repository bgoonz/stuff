"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Injects transaction's entity manager into the method wrapped with @Transaction decorator.
 */
function TransactionManager() {
    return function (object, methodName, index) {
        var args = {
            target: object.constructor,
            methodName: methodName,
            index: index,
        };
        index_1.getMetadataArgsStorage().transactionEntityManagers.push(args);
    };
}
exports.TransactionManager = TransactionManager;

//# sourceMappingURL=TransactionManager.js.map
