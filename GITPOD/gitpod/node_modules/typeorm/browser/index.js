var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
/*!
 */
import { ConnectionManager } from "./connection/ConnectionManager";
import { MetadataArgsStorage } from "./metadata-args/MetadataArgsStorage";
import { getFromContainer } from "./container";
import { PlatformTools } from "./platform/PlatformTools";
import { ConnectionOptionsReader } from "./connection/ConnectionOptionsReader";
import { PromiseUtils } from "./util/PromiseUtils";
// -------------------------------------------------------------------------
// Commonly Used exports
// -------------------------------------------------------------------------
export * from "./container";
export * from "./error/QueryFailedError";
export * from "./decorator/columns/Column";
export * from "./decorator/columns/CreateDateColumn";
export * from "./decorator/columns/DiscriminatorColumn";
export * from "./decorator/columns/PrimaryGeneratedColumn";
export * from "./decorator/columns/PrimaryColumn";
export * from "./decorator/columns/UpdateDateColumn";
export * from "./decorator/columns/VersionColumn";
export * from "./decorator/columns/ObjectIdColumn";
export * from "./decorator/listeners/AfterInsert";
export * from "./decorator/listeners/AfterLoad";
export * from "./decorator/listeners/AfterRemove";
export * from "./decorator/listeners/AfterUpdate";
export * from "./decorator/listeners/BeforeInsert";
export * from "./decorator/listeners/BeforeRemove";
export * from "./decorator/listeners/BeforeUpdate";
export * from "./decorator/listeners/EventSubscriber";
export * from "./decorator/relations/JoinColumn";
export * from "./decorator/relations/JoinTable";
export * from "./decorator/relations/ManyToMany";
export * from "./decorator/relations/ManyToOne";
export * from "./decorator/relations/OneToMany";
export * from "./decorator/relations/OneToOne";
export * from "./decorator/relations/RelationCount";
export * from "./decorator/relations/RelationId";
export * from "./decorator/entity/Entity";
export * from "./decorator/entity/ClassEntityChild";
export * from "./decorator/entity/ClosureEntity";
export * from "./decorator/entity/SingleEntityChild";
export * from "./decorator/entity/TableInheritance";
export * from "./decorator/transaction/Transaction";
export * from "./decorator/transaction/TransactionManager";
export * from "./decorator/transaction/TransactionRepository";
export * from "./decorator/tree/TreeLevelColumn";
export * from "./decorator/tree/TreeParent";
export * from "./decorator/tree/TreeChildren";
export * from "./decorator/Index";
export * from "./decorator/Generated";
export * from "./decorator/DiscriminatorValue";
export * from "./decorator/EntityRepository";
export * from "./logger/AdvancedConsoleLogger";
export * from "./logger/SimpleConsoleLogger";
export * from "./logger/FileLogger";
export * from "./metadata/EntityMetadataUtils";
export * from "./entity-manager/EntityManager";
export * from "./repository/AbstractRepository";
export * from "./repository/Repository";
export * from "./repository/BaseEntity";
export * from "./repository/TreeRepository";
export * from "./repository/MongoRepository";
export * from "./schema-builder/schema/TableColumn";
export * from "./schema-builder/schema/TableForeignKey";
export * from "./schema-builder/schema/TableIndex";
export * from "./schema-builder/schema/TablePrimaryKey";
export * from "./schema-builder/schema/Table";
export * from "./driver/mongodb/typings";
export * from "./driver/sqlserver/MssqlParameter";
export { ConnectionOptionsReader } from "./connection/ConnectionOptionsReader";
export { Connection } from "./connection/Connection";
export { ConnectionManager } from "./connection/ConnectionManager";
export { QueryBuilder } from "./query-builder/QueryBuilder";
export { SelectQueryBuilder } from "./query-builder/SelectQueryBuilder";
export { DeleteQueryBuilder } from "./query-builder/DeleteQueryBuilder";
export { InsertQueryBuilder } from "./query-builder/InsertQueryBuilder";
export { UpdateQueryBuilder } from "./query-builder/UpdateQueryBuilder";
export { RelationQueryBuilder } from "./query-builder/RelationQueryBuilder";
export { Brackets } from "./query-builder/Brackets";
export { EntityManager } from "./entity-manager/EntityManager";
export { MongoEntityManager } from "./entity-manager/MongoEntityManager";
export { DefaultNamingStrategy } from "./naming-strategy/DefaultNamingStrategy";
export { Repository } from "./repository/Repository";
export { TreeRepository } from "./repository/TreeRepository";
export { MongoRepository } from "./repository/MongoRepository";
export { BaseEntity } from "./repository/BaseEntity";
export { PromiseUtils } from "./util/PromiseUtils";
// -------------------------------------------------------------------------
// Deprecated
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// Commonly used functionality
// -------------------------------------------------------------------------
/**
 * Gets metadata args storage.
 */
export function getMetadataArgsStorage() {
    // we should store metadata storage in a global variable otherwise it brings too much problems
    // one of the problem is that if any entity (or any other) will be imported before consumer will call
    // useContainer method with his own container implementation, that entity will be registered in the
    // old old container (default one post probably) and consumer will his entity.
    // calling useContainer before he imports any entity (or any other) is not always convenient.
    // another reason is that when we run migrations typeorm is being called from a global package
    // and it may load entities which register decorators in typeorm of local package
    // this leads to impossibility of usage of entities in migrations and cli related operations
    var globalScope = PlatformTools.getGlobalVariable();
    if (!globalScope.typeormMetadataArgsStorage)
        globalScope.typeormMetadataArgsStorage = new MetadataArgsStorage();
    return globalScope.typeormMetadataArgsStorage;
}
/**
 * Reads connection options stored in ormconfig configuration file.
 */
export function getConnectionOptions(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ConnectionOptionsReader().get(connectionName)];
        });
    });
}
/**
 * Gets a ConnectionManager which creates connections.
 */
export function getConnectionManager() {
    return getFromContainer(ConnectionManager);
}
/**
 * Creates a new connection and registers it in the manager.
 *
 * If connection options were not specified, then it will try to create connection automatically,
 * based on content of ormconfig (json/js/yml/xml/env) file or environment variables.
 * Only one connection from ormconfig will be created (name "default" or connection without name).
 */
export function createConnection(optionsOrName) {
    return __awaiter(this, void 0, void 0, function () {
        var connectionName, options, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    connectionName = typeof optionsOrName === "string" ? optionsOrName : "default";
                    if (!(optionsOrName instanceof Object)) return [3 /*break*/, 1];
                    _a = optionsOrName;
                    return [3 /*break*/, 3];
                case 1: return [4 /*yield*/, getConnectionOptions(connectionName)];
                case 2:
                    _a = _b.sent();
                    _b.label = 3;
                case 3:
                    options = _a;
                    return [2 /*return*/, getConnectionManager().create(options).connect()];
            }
        });
    });
}
/**
 * Creates new connections and registers them in the manager.
 *
 * If connection options were not specified, then it will try to create connection automatically,
 * based on content of ormconfig (json/js/yml/xml/env) file or environment variables.
 * All connections from the ormconfig will be created.
 */
export function createConnections(options) {
    return __awaiter(this, void 0, void 0, function () {
        var connections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!options) return [3 /*break*/, 2];
                    return [4 /*yield*/, new ConnectionOptionsReader().all()];
                case 1:
                    options = _a.sent();
                    _a.label = 2;
                case 2:
                    connections = options.map(function (options) { return getConnectionManager().create(options); });
                    return [2 /*return*/, PromiseUtils.runInSequence(connections, function (connection) { return connection.connect(); })];
            }
        });
    });
}
/**
 * Gets connection from the connection manager.
 * If connection name wasn't specified, then "default" connection will be retrieved.
 */
export function getConnection(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName);
}
/**
 * Gets entity manager from the connection.
 * If connection name wasn't specified, then "default" connection will be retrieved.
 */
export function getManager(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).manager;
}
/**
 * Gets MongoDB entity manager from the connection.
 * If connection name wasn't specified, then "default" connection will be retrieved.
 */
export function getMongoManager(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).manager;
}
export function getSqljsManager(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).manager;
}
/**
 * Gets repository for the given entity class.
 */
export function getRepository(entityClass, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getRepository(entityClass);
}
/**
 * Gets tree repository for the given entity class.
 */
export function getTreeRepository(entityClass, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getTreeRepository(entityClass);
}
/**
 * Gets tree repository for the given entity class.
 */
export function getCustomRepository(customRepository, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getCustomRepository(customRepository);
}
/**
 * Gets mongodb repository for the given entity class or name.
 */
export function getMongoRepository(entityClass, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getMongoRepository(entityClass);
}

//# sourceMappingURL=index.js.map
