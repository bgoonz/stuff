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
Object.defineProperty(exports, "__esModule", { value: true });
var DefaultNamingStrategy_1 = require("../naming-strategy/DefaultNamingStrategy");
var CannotExecuteNotConnectedError_1 = require("../error/CannotExecuteNotConnectedError");
var CannotConnectAlreadyConnectedError_1 = require("../error/CannotConnectAlreadyConnectedError");
var EntityMetadataNotFound_1 = require("../error/EntityMetadataNotFound");
var MigrationExecutor_1 = require("../migration/MigrationExecutor");
var MongoDriver_1 = require("../driver/mongodb/MongoDriver");
var MongoEntityManager_1 = require("../entity-manager/MongoEntityManager");
var EntityMetadataValidator_1 = require("../metadata-builder/EntityMetadataValidator");
var QueryRunnerProviderAlreadyReleasedError_1 = require("../error/QueryRunnerProviderAlreadyReleasedError");
var EntityManagerFactory_1 = require("../entity-manager/EntityManagerFactory");
var DriverFactory_1 = require("../driver/DriverFactory");
var ConnectionMetadataBuilder_1 = require("./ConnectionMetadataBuilder");
var SelectQueryBuilder_1 = require("../query-builder/SelectQueryBuilder");
var LoggerFactory_1 = require("../logger/LoggerFactory");
var QueryResultCacheFactory_1 = require("../cache/QueryResultCacheFactory");
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var MysqlDriver_1 = require("../driver/mysql/MysqlDriver");
var PromiseUtils_1 = require("../util/PromiseUtils");
var SqljsEntityManager_1 = require("../entity-manager/SqljsEntityManager");
/**
 * Connection is a single database ORM connection to a specific database.
 * Its not required to be a database connection, depend on database type it can create connection pool.
 * You can have multiple connections to multiple databases in your application.
 */
var Connection = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function Connection(options) {
        /**
         * Indicates if connection is initialized or not.
         */
        this.isConnected = false;
        /**
         * Migration instances that are registered for this connection.
         */
        this.migrations = [];
        /**
         * Entity subscriber instances that are registered for this connection.
         */
        this.subscribers = [];
        /**
         * All entity metadatas that are registered for this connection.
         */
        this.entityMetadatas = [];
        this.name = options.name || "default";
        this.options = options;
        this.logger = new LoggerFactory_1.LoggerFactory().create(this.options.logger, this.options.logging);
        this.driver = new DriverFactory_1.DriverFactory().create(this);
        this.manager = this.createEntityManager();
        this.namingStrategy = options.namingStrategy || new DefaultNamingStrategy_1.DefaultNamingStrategy();
        this.queryResultCache = options.cache ? new QueryResultCacheFactory_1.QueryResultCacheFactory(this).create() : undefined;
    }
    Object.defineProperty(Connection.prototype, "mongoManager", {
        // -------------------------------------------------------------------------
        // Public Accessors
        // -------------------------------------------------------------------------
        /**
         * Gets the mongodb entity manager that allows to perform mongodb-specific repository operations
         * with any entity in this connection.
         *
         * Available only in mongodb connections.
         */
        get: function () {
            if (!(this.manager instanceof MongoEntityManager_1.MongoEntityManager))
                throw new Error("MongoEntityManager is only available for MongoDB databases.");
            return this.manager;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Connection.prototype, "sqljsManager", {
        /**
         * Gets a sql.js specific Entity Manager that allows to perform special load and save operations
         *
         * Available only in connection with the sqljs driver.
         */
        get: function () {
            if (!(this.manager instanceof SqljsEntityManager_1.SqljsEntityManager))
                throw new Error("SqljsEntityManager is only available for Sqljs databases.");
            return this.manager;
        },
        enumerable: true,
        configurable: true
    });
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Performs connection to the database.
     * This method should be called once on application bootstrap.
     * This method not necessarily creates database connection (depend on database type),
     * but it also can setup a connection pool with database to use.
     */
    Connection.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isConnected)
                            throw new CannotConnectAlreadyConnectedError_1.CannotConnectAlreadyConnectedError(this.name);
                        // connect to the database via its driver
                        return [4 /*yield*/, this.driver.connect()];
                    case 1:
                        // connect to the database via its driver
                        _a.sent();
                        if (!this.queryResultCache) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.queryResultCache.connect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        // set connected status for the current connection
                        Object.assign(this, { isConnected: true });
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 12, , 14]);
                        // build all metadatas registered in the current connection
                        this.buildMetadatas();
                        return [4 /*yield*/, this.driver.afterConnect()];
                    case 5:
                        _a.sent();
                        if (!this.options.dropSchema) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.dropDatabase()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!this.options.synchronize) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.synchronize()];
                    case 8:
                        _a.sent();
                        _a.label = 9;
                    case 9:
                        if (!this.options.migrationsRun) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.runMigrations()];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [3 /*break*/, 14];
                    case 12:
                        error_1 = _a.sent();
                        // if for some reason build metadata fail (for example validation error during entity metadata check)
                        // connection needs to be closed
                        return [4 /*yield*/, this.close()];
                    case 13:
                        // if for some reason build metadata fail (for example validation error during entity metadata check)
                        // connection needs to be closed
                        _a.sent();
                        throw error_1;
                    case 14: return [2 /*return*/, this];
                }
            });
        });
    };
    /**
     * Closes connection with the database.
     * Once connection is closed, you cannot use repositories or perform any operations except opening connection again.
     */
    Connection.prototype.close = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected)
                            throw new CannotExecuteNotConnectedError_1.CannotExecuteNotConnectedError(this.name);
                        return [4 /*yield*/, this.driver.disconnect()];
                    case 1:
                        _a.sent();
                        if (!this.queryResultCache) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.queryResultCache.disconnect()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        Object.assign(this, { isConnected: false });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates database schema for all entities registered in this connection.
     * Can be used only after connection to the database is established.
     *
     * @param dropBeforeSync If set to true then it drops the database with all its tables and data
     */
    Connection.prototype.synchronize = function (dropBeforeSync) {
        if (dropBeforeSync === void 0) { dropBeforeSync = false; }
        return __awaiter(this, void 0, void 0, function () {
            var schemaBuilder;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected)
                            throw new CannotExecuteNotConnectedError_1.CannotExecuteNotConnectedError(this.name);
                        if (!dropBeforeSync) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.dropDatabase()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        schemaBuilder = this.driver.createSchemaBuilder();
                        return [4 /*yield*/, schemaBuilder.build()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops the database and all its data.
     * Be careful with this method on production since this method will erase all your database tables and their data.
     * Can be used only after connection to the database is established.
     */
    Connection.prototype.dropDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, schemas, databases_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.createQueryRunner("master")];
                    case 1:
                        queryRunner = _a.sent();
                        schemas = this.entityMetadatas
                            .filter(function (metadata) { return metadata.schema; })
                            .map(function (metadata) { return metadata.schema; });
                        if (!(this.driver instanceof SqlServerDriver_1.SqlServerDriver || this.driver instanceof MysqlDriver_1.MysqlDriver)) return [3 /*break*/, 3];
                        databases_1 = this.driver.database ? [this.driver.database] : [];
                        this.entityMetadatas.forEach(function (metadata) {
                            if (metadata.database && databases_1.indexOf(metadata.database) === -1)
                                databases_1.push(metadata.database);
                        });
                        return [4 /*yield*/, PromiseUtils_1.PromiseUtils.runInSequence(databases_1, function (database) { return queryRunner.clearDatabase(schemas, database); })];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, queryRunner.clearDatabase(schemas)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, queryRunner.release()];
                    case 6:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Runs all pending migrations.
     * Can be used only after connection to the database is established.
     */
    Connection.prototype.runMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var migrationExecutor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected)
                            throw new CannotExecuteNotConnectedError_1.CannotExecuteNotConnectedError(this.name);
                        migrationExecutor = new MigrationExecutor_1.MigrationExecutor(this);
                        return [4 /*yield*/, migrationExecutor.executePendingMigrations()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reverts last executed migration.
     * Can be used only after connection to the database is established.
     */
    Connection.prototype.undoLastMigration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var migrationExecutor;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isConnected)
                            throw new CannotExecuteNotConnectedError_1.CannotExecuteNotConnectedError(this.name);
                        migrationExecutor = new MigrationExecutor_1.MigrationExecutor(this);
                        return [4 /*yield*/, migrationExecutor.undoLastMigration()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if entity metadata exist for the given entity class, target name or table name.
     */
    Connection.prototype.hasMetadata = function (target) {
        return !!this.findMetadata(target);
    };
    /**
     * Gets entity metadata for the given entity class or schema name.
     */
    Connection.prototype.getMetadata = function (target) {
        var metadata = this.findMetadata(target);
        if (!metadata)
            throw new EntityMetadataNotFound_1.EntityMetadataNotFound(target);
        return metadata;
    };
    /**
     * Gets repository for the given entity.
     */
    Connection.prototype.getRepository = function (target) {
        return this.manager.getRepository(target);
    };
    /**
     * Gets tree repository for the given entity class or name.
     * Only tree-type entities can have a TreeRepository, like ones decorated with @ClosureEntity decorator.
     */
    Connection.prototype.getTreeRepository = function (target) {
        return this.manager.getTreeRepository(target);
    };
    /**
     * Gets mongodb-specific repository for the given entity class or name.
     * Works only if connection is mongodb-specific.
     */
    Connection.prototype.getMongoRepository = function (target) {
        if (!(this.driver instanceof MongoDriver_1.MongoDriver))
            throw new Error("You can use getMongoRepository only for MongoDB connections.");
        return this.manager.getRepository(target);
    };
    /**
     * Gets custom entity repository marked with @EntityRepository decorator.
     */
    Connection.prototype.getCustomRepository = function (customRepository) {
        return this.manager.getCustomRepository(customRepository);
    };
    /**
     * Wraps given function execution (and all operations made there) into a transaction.
     * All database operations must be executed using provided entity manager.
     */
    Connection.prototype.transaction = function (runInTransaction) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.manager.transaction(runInTransaction)];
            });
        });
    };
    /**
     * Executes raw SQL query and returns raw database results.
     */
    Connection.prototype.query = function (query, parameters, queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var usedQueryRunner;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this instanceof MongoEntityManager_1.MongoEntityManager)
                            throw new Error("Queries aren't supported by MongoDB.");
                        if (queryRunner && queryRunner.isReleased)
                            throw new QueryRunnerProviderAlreadyReleasedError_1.QueryRunnerProviderAlreadyReleasedError();
                        usedQueryRunner = queryRunner || this.createQueryRunner("master");
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, , 3, 6]);
                        return [4 /*yield*/, usedQueryRunner.query(query, parameters)];
                    case 2: return [2 /*return*/, _a.sent()]; // await is needed here because we are using finally
                    case 3:
                        if (!!queryRunner) return [3 /*break*/, 5];
                        return [4 /*yield*/, usedQueryRunner.release()];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new query builder that can be used to build a sql query.
     */
    Connection.prototype.createQueryBuilder = function (entityOrRunner, alias, queryRunner) {
        if (this instanceof MongoEntityManager_1.MongoEntityManager)
            throw new Error("Query Builder is not supported by MongoDB.");
        if (alias) {
            var metadata = this.getMetadata(entityOrRunner);
            return new SelectQueryBuilder_1.SelectQueryBuilder(this, queryRunner)
                .select(alias)
                .from(metadata.target, alias);
        }
        else {
            return new SelectQueryBuilder_1.SelectQueryBuilder(this, entityOrRunner);
        }
    };
    /**
     * Creates a query runner used for perform queries on a single database connection.
     * Using query runners you can control your queries to execute using single database connection and
     * manually control your database transaction.
     *
     * Mode is used in replication mode and indicates whatever you want to connect
     * to master database or any of slave databases.
     * If you perform writes you must use master database,
     * if you perform reads you can use slave databases.
     */
    Connection.prototype.createQueryRunner = function (mode) {
        if (mode === void 0) { mode = "master"; }
        var queryRunner = this.driver.createQueryRunner(mode);
        var manager = this.createEntityManager(queryRunner);
        Object.assign(queryRunner, { manager: manager });
        return queryRunner;
    };
    /**
     * Gets entity metadata of the junction table (many-to-many table).
     */
    Connection.prototype.getManyToManyMetadata = function (entityTarget, relationPropertyPath) {
        var relationMetadata = this.getMetadata(entityTarget).findRelationWithPropertyPath(relationPropertyPath);
        if (!relationMetadata)
            throw new Error("Relation \"" + relationPropertyPath + "\" was not found in " + entityTarget + " entity.");
        if (!relationMetadata.isManyToMany)
            throw new Error("Relation \"" + entityTarget + "#" + relationPropertyPath + "\" does not have a many-to-many relationship." +
                "You can use this method only on many-to-many relations.");
        return relationMetadata.junctionEntityMetadata;
    };
    /**
     * Creates an Entity Manager for the current connection with the help of the EntityManagerFactory.
     */
    Connection.prototype.createEntityManager = function (queryRunner) {
        return new EntityManagerFactory_1.EntityManagerFactory().create(this, queryRunner);
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Finds exist entity metadata by the given entity class, target name or table name.
     */
    Connection.prototype.findMetadata = function (target) {
        return this.entityMetadatas.find(function (metadata) {
            if (metadata.target === target)
                return true;
            if (typeof target === "string") {
                if (target.indexOf(".") !== -1) {
                    return metadata.tablePath === target;
                }
                else {
                    return metadata.name === target || metadata.tableName === target;
                }
            }
            return false;
        });
    };
    /**
     * Builds metadatas for all registered classes inside this connection.
     */
    Connection.prototype.buildMetadatas = function () {
        var connectionMetadataBuilder = new ConnectionMetadataBuilder_1.ConnectionMetadataBuilder(this);
        var entityMetadataValidator = new EntityMetadataValidator_1.EntityMetadataValidator();
        // create subscribers instances if they are not disallowed from high-level (for example they can disallowed from migrations run process)
        var subscribers = connectionMetadataBuilder.buildSubscribers(this.options.subscribers || []);
        Object.assign(this, { subscribers: subscribers });
        // build entity metadatas
        var entityMetadatas = connectionMetadataBuilder.buildEntityMetadatas(this.options.entities || [], this.options.entitySchemas || []);
        Object.assign(this, { entityMetadatas: entityMetadatas });
        // create migration instances
        var migrations = connectionMetadataBuilder.buildMigrations(this.options.migrations || []);
        Object.assign(this, { migrations: migrations });
        // validate all created entity metadatas to make sure user created entities are valid and correct
        entityMetadataValidator.validateMany(this.entityMetadatas, this.driver);
    };
    return Connection;
}());
exports.Connection = Connection;

//# sourceMappingURL=Connection.js.map
