import { getMetadataArgsStorage } from "../../index";
/**
 * Injects transaction's entity manager into the method wrapped with @Transaction decorator.
 */
export function TransactionManager() {
    return function (object, methodName, index) {
        var args = {
            target: object.constructor,
            methodName: methodName,
            index: index,
        };
        getMetadataArgsStorage().transactionEntityManagers.push(args);
    };
}

//# sourceMappingURL=TransactionManager.js.map
