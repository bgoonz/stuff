"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Injects transaction's repository into the method wrapped with @Transaction decorator.
 */
function TransactionRepository(entityType) {
    return function (object, methodName, index) {
        var repositoryType;
        try {
            repositoryType = Reflect.getOwnMetadata("design:paramtypes", object, methodName)[index];
        }
        catch (err) {
            throw new Error("Cannot get reflected type for a \"" + methodName + "\" method's parameter of " + object.constructor.name + " class. " +
                "Make sure you have turned on an \"emitDecoratorMetadata\": true, option in tsconfig.json. " +
                "Also make sure you have imported \"reflect-metadata\" on top of the main entry file in your application.");
        }
        var args = {
            target: object.constructor,
            methodName: methodName,
            index: index,
            repositoryType: repositoryType,
            entityType: entityType,
        };
        index_1.getMetadataArgsStorage().transactionRepositories.push(args);
    };
}
exports.TransactionRepository = TransactionRepository;

//# sourceMappingURL=TransactionRepository.js.map
