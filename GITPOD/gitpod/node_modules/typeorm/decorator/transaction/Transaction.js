"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../../index");
/**
 * Wraps some method into the transaction.
 * Note, method result will return a promise if this decorator applied.
 * Note, all database operations in the wrapped method should be executed using entity managed passed as a first parameter
 * into the wrapped method.
 * If you want to control at what position in your method parameters entity manager should be injected,
 * then use @TransactionEntityManager() decorator.
 * If you want to use repositories instead of bare entity manager,
 * then use @TransactionRepository() decorator.
 */
function Transaction(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return function (target, methodName, descriptor) {
        // save original method - we gonna need it
        var originalMethod = descriptor.value;
        // override method descriptor with proxy method
        descriptor.value = function () {
            var _this = this;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return index_1.getConnection(connectionName)
                .manager
                .transaction(function (entityManager) {
                var argsWithInjectedTransactionManagerAndRepositories;
                // gets all @TransactionEntityManager() decorator usages for this method
                var transactionEntityManagerMetadatas = index_1.getMetadataArgsStorage()
                    .filterTransactionEntityManagers(target.constructor)
                    .filter(function (transactionEntityManagerMetadata) {
                    return transactionEntityManagerMetadata.methodName === methodName;
                })
                    .reverse();
                // gets all @TransactionRepository() decorator usages for this method
                var transactionRepositoryMetadatas = index_1.getMetadataArgsStorage()
                    .filterTransactionRepository(target.constructor)
                    .filter(function (transactionRepositoryMetadata) {
                    return transactionRepositoryMetadata.methodName === methodName;
                })
                    .reverse();
                // if there are @TransactionEntityManager() decorator usages the inject them
                if (transactionEntityManagerMetadatas.length > 0) {
                    argsWithInjectedTransactionManagerAndRepositories = args.slice();
                    // replace method params with injection of transactionEntityManager
                    transactionEntityManagerMetadatas.forEach(function (metadata) {
                        argsWithInjectedTransactionManagerAndRepositories.splice(metadata.index, 0, entityManager);
                    });
                }
                else if (transactionRepositoryMetadatas.length === 0) { // otherwise if there's no transaction repositories in use, inject it as a first parameter
                    argsWithInjectedTransactionManagerAndRepositories = [entityManager].concat(args);
                }
                else {
                    argsWithInjectedTransactionManagerAndRepositories = args.slice();
                }
                // for every usage of @TransactionRepository decorator
                transactionRepositoryMetadatas.forEach(function (metadata) {
                    var repositoryInstance;
                    // detect type of the repository and get instance from transaction entity manager
                    switch (metadata.repositoryType) {
                        case index_1.Repository:
                            repositoryInstance = entityManager.getRepository(metadata.entityType);
                            break;
                        case index_1.MongoRepository:
                            repositoryInstance = entityManager.getMongoRepository(metadata.entityType);
                            break;
                        case index_1.TreeRepository:
                            repositoryInstance = entityManager.getTreeRepository(metadata.entityType);
                            break;
                        // if not the TypeORM's ones, there must be custom repository classes
                        default:
                            repositoryInstance = entityManager.getCustomRepository(metadata.repositoryType);
                    }
                    // replace method param with injection of repository instance
                    argsWithInjectedTransactionManagerAndRepositories.splice(metadata.index, 0, repositoryInstance);
                });
                return originalMethod.apply(_this, argsWithInjectedTransactionManagerAndRepositories);
            });
        };
    };
}
exports.Transaction = Transaction;

//# sourceMappingURL=Transaction.js.map
