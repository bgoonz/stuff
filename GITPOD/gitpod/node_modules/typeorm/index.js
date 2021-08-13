"use strict";
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
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
/*!
 */
var ConnectionManager_1 = require("./connection/ConnectionManager");
var MetadataArgsStorage_1 = require("./metadata-args/MetadataArgsStorage");
var container_1 = require("./container");
var PlatformTools_1 = require("./platform/PlatformTools");
var ConnectionOptionsReader_1 = require("./connection/ConnectionOptionsReader");
var PromiseUtils_1 = require("./util/PromiseUtils");
// -------------------------------------------------------------------------
// Commonly Used exports
// -------------------------------------------------------------------------
__export(require("./container"));
__export(require("./error/QueryFailedError"));
__export(require("./decorator/columns/Column"));
__export(require("./decorator/columns/CreateDateColumn"));
__export(require("./decorator/columns/DiscriminatorColumn"));
__export(require("./decorator/columns/PrimaryGeneratedColumn"));
__export(require("./decorator/columns/PrimaryColumn"));
__export(require("./decorator/columns/UpdateDateColumn"));
__export(require("./decorator/columns/VersionColumn"));
__export(require("./decorator/columns/ObjectIdColumn"));
__export(require("./decorator/listeners/AfterInsert"));
__export(require("./decorator/listeners/AfterLoad"));
__export(require("./decorator/listeners/AfterRemove"));
__export(require("./decorator/listeners/AfterUpdate"));
__export(require("./decorator/listeners/BeforeInsert"));
__export(require("./decorator/listeners/BeforeRemove"));
__export(require("./decorator/listeners/BeforeUpdate"));
__export(require("./decorator/listeners/EventSubscriber"));
__export(require("./decorator/relations/JoinColumn"));
__export(require("./decorator/relations/JoinTable"));
__export(require("./decorator/relations/ManyToMany"));
__export(require("./decorator/relations/ManyToOne"));
__export(require("./decorator/relations/OneToMany"));
__export(require("./decorator/relations/OneToOne"));
__export(require("./decorator/relations/RelationCount"));
__export(require("./decorator/relations/RelationId"));
__export(require("./decorator/entity/Entity"));
__export(require("./decorator/entity/ClassEntityChild"));
__export(require("./decorator/entity/ClosureEntity"));
__export(require("./decorator/entity/SingleEntityChild"));
__export(require("./decorator/entity/TableInheritance"));
__export(require("./decorator/transaction/Transaction"));
__export(require("./decorator/transaction/TransactionManager"));
__export(require("./decorator/transaction/TransactionRepository"));
__export(require("./decorator/tree/TreeLevelColumn"));
__export(require("./decorator/tree/TreeParent"));
__export(require("./decorator/tree/TreeChildren"));
__export(require("./decorator/Index"));
__export(require("./decorator/Generated"));
__export(require("./decorator/DiscriminatorValue"));
__export(require("./decorator/EntityRepository"));
__export(require("./logger/AdvancedConsoleLogger"));
__export(require("./logger/SimpleConsoleLogger"));
__export(require("./logger/FileLogger"));
__export(require("./metadata/EntityMetadataUtils"));
__export(require("./entity-manager/EntityManager"));
__export(require("./repository/AbstractRepository"));
__export(require("./repository/Repository"));
__export(require("./repository/BaseEntity"));
__export(require("./repository/TreeRepository"));
__export(require("./repository/MongoRepository"));
__export(require("./schema-builder/schema/TableColumn"));
__export(require("./schema-builder/schema/TableForeignKey"));
__export(require("./schema-builder/schema/TableIndex"));
__export(require("./schema-builder/schema/TablePrimaryKey"));
__export(require("./schema-builder/schema/Table"));
__export(require("./driver/mongodb/typings"));
__export(require("./driver/sqlserver/MssqlParameter"));
var ConnectionOptionsReader_2 = require("./connection/ConnectionOptionsReader");
exports.ConnectionOptionsReader = ConnectionOptionsReader_2.ConnectionOptionsReader;
var Connection_1 = require("./connection/Connection");
exports.Connection = Connection_1.Connection;
var ConnectionManager_2 = require("./connection/ConnectionManager");
exports.ConnectionManager = ConnectionManager_2.ConnectionManager;
var QueryBuilder_1 = require("./query-builder/QueryBuilder");
exports.QueryBuilder = QueryBuilder_1.QueryBuilder;
var SelectQueryBuilder_1 = require("./query-builder/SelectQueryBuilder");
exports.SelectQueryBuilder = SelectQueryBuilder_1.SelectQueryBuilder;
var DeleteQueryBuilder_1 = require("./query-builder/DeleteQueryBuilder");
exports.DeleteQueryBuilder = DeleteQueryBuilder_1.DeleteQueryBuilder;
var InsertQueryBuilder_1 = require("./query-builder/InsertQueryBuilder");
exports.InsertQueryBuilder = InsertQueryBuilder_1.InsertQueryBuilder;
var UpdateQueryBuilder_1 = require("./query-builder/UpdateQueryBuilder");
exports.UpdateQueryBuilder = UpdateQueryBuilder_1.UpdateQueryBuilder;
var RelationQueryBuilder_1 = require("./query-builder/RelationQueryBuilder");
exports.RelationQueryBuilder = RelationQueryBuilder_1.RelationQueryBuilder;
var Brackets_1 = require("./query-builder/Brackets");
exports.Brackets = Brackets_1.Brackets;
var EntityManager_1 = require("./entity-manager/EntityManager");
exports.EntityManager = EntityManager_1.EntityManager;
var MongoEntityManager_1 = require("./entity-manager/MongoEntityManager");
exports.MongoEntityManager = MongoEntityManager_1.MongoEntityManager;
var DefaultNamingStrategy_1 = require("./naming-strategy/DefaultNamingStrategy");
exports.DefaultNamingStrategy = DefaultNamingStrategy_1.DefaultNamingStrategy;
var Repository_1 = require("./repository/Repository");
exports.Repository = Repository_1.Repository;
var TreeRepository_1 = require("./repository/TreeRepository");
exports.TreeRepository = TreeRepository_1.TreeRepository;
var MongoRepository_1 = require("./repository/MongoRepository");
exports.MongoRepository = MongoRepository_1.MongoRepository;
var BaseEntity_1 = require("./repository/BaseEntity");
exports.BaseEntity = BaseEntity_1.BaseEntity;
var PromiseUtils_2 = require("./util/PromiseUtils");
exports.PromiseUtils = PromiseUtils_2.PromiseUtils;
// -------------------------------------------------------------------------
// Deprecated
// -------------------------------------------------------------------------
// -------------------------------------------------------------------------
// Commonly used functionality
// -------------------------------------------------------------------------
/**
 * Gets metadata args storage.
 */
function getMetadataArgsStorage() {
    // we should store metadata storage in a global variable otherwise it brings too much problems
    // one of the problem is that if any entity (or any other) will be imported before consumer will call
    // useContainer method with his own container implementation, that entity will be registered in the
    // old old container (default one post probably) and consumer will his entity.
    // calling useContainer before he imports any entity (or any other) is not always convenient.
    // another reason is that when we run migrations typeorm is being called from a global package
    // and it may load entities which register decorators in typeorm of local package
    // this leads to impossibility of usage of entities in migrations and cli related operations
    var globalScope = PlatformTools_1.PlatformTools.getGlobalVariable();
    if (!globalScope.typeormMetadataArgsStorage)
        globalScope.typeormMetadataArgsStorage = new MetadataArgsStorage_1.MetadataArgsStorage();
    return globalScope.typeormMetadataArgsStorage;
}
exports.getMetadataArgsStorage = getMetadataArgsStorage;
/**
 * Reads connection options stored in ormconfig configuration file.
 */
function getConnectionOptions(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new ConnectionOptionsReader_1.ConnectionOptionsReader().get(connectionName)];
        });
    });
}
exports.getConnectionOptions = getConnectionOptions;
/**
 * Gets a ConnectionManager which creates connections.
 */
function getConnectionManager() {
    return container_1.getFromContainer(ConnectionManager_1.ConnectionManager);
}
exports.getConnectionManager = getConnectionManager;
/**
 * Creates a new connection and registers it in the manager.
 *
 * If connection options were not specified, then it will try to create connection automatically,
 * based on content of ormconfig (json/js/yml/xml/env) file or environment variables.
 * Only one connection from ormconfig will be created (name "default" or connection without name).
 */
function createConnection(optionsOrName) {
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
exports.createConnection = createConnection;
/**
 * Creates new connections and registers them in the manager.
 *
 * If connection options were not specified, then it will try to create connection automatically,
 * based on content of ormconfig (json/js/yml/xml/env) file or environment variables.
 * All connections from the ormconfig will be created.
 */
function createConnections(options) {
    return __awaiter(this, void 0, void 0, function () {
        var connections;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!!options) return [3 /*break*/, 2];
                    return [4 /*yield*/, new ConnectionOptionsReader_1.ConnectionOptionsReader().all()];
                case 1:
                    options = _a.sent();
                    _a.label = 2;
                case 2:
                    connections = options.map(function (options) { return getConnectionManager().create(options); });
                    return [2 /*return*/, PromiseUtils_1.PromiseUtils.runInSequence(connections, function (connection) { return connection.connect(); })];
            }
        });
    });
}
exports.createConnections = createConnections;
/**
 * Gets connection from the connection manager.
 * If connection name wasn't specified, then "default" connection will be retrieved.
 */
function getConnection(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName);
}
exports.getConnection = getConnection;
/**
 * Gets entity manager from the connection.
 * If connection name wasn't specified, then "default" connection will be retrieved.
 */
function getManager(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).manager;
}
exports.getManager = getManager;
/**
 * Gets MongoDB entity manager from the connection.
 * If connection name wasn't specified, then "default" connection will be retrieved.
 */
function getMongoManager(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).manager;
}
exports.getMongoManager = getMongoManager;
function getSqljsManager(connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).manager;
}
exports.getSqljsManager = getSqljsManager;
/**
 * Gets repository for the given entity class.
 */
function getRepository(entityClass, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getRepository(entityClass);
}
exports.getRepository = getRepository;
/**
 * Gets tree repository for the given entity class.
 */
function getTreeRepository(entityClass, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getTreeRepository(entityClass);
}
exports.getTreeRepository = getTreeRepository;
/**
 * Gets tree repository for the given entity class.
 */
function getCustomRepository(customRepository, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getCustomRepository(customRepository);
}
exports.getCustomRepository = getCustomRepository;
/**
 * Gets mongodb repository for the given entity class or name.
 */
function getMongoRepository(entityClass, connectionName) {
    if (connectionName === void 0) { connectionName = "default"; }
    return getConnectionManager().get(connectionName).getMongoRepository(entityClass);
}
exports.getMongoRepository = getMongoRepository;

//# sourceMappingURL=index.js.map
