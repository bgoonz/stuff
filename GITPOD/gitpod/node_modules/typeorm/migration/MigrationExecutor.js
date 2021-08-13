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
var Table_1 = require("../schema-builder/schema/Table");
var TableColumn_1 = require("../schema-builder/schema/TableColumn");
var Migration_1 = require("./Migration");
var PromiseUtils_1 = require("../util/PromiseUtils");
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var MssqlParameter_1 = require("../driver/sqlserver/MssqlParameter");
/**
 * Executes migrations: runs pending and reverts previously executed migrations.
 */
var MigrationExecutor = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function MigrationExecutor(connection, queryRunner) {
        this.connection = connection;
        this.queryRunner = queryRunner;
        this.migrationsTableName = "migrations";
        if (connection.options.migrationsTableName) {
            this.migrationsTableName = connection.options.migrationsTableName;
        }
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Executes all pending migrations. Pending migrations are migrations that are not yet executed,
     * thus not saved in the database.
     */
    MigrationExecutor.prototype.executePendingMigrations = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var queryRunner, executedMigrations, lastTimeExecutedMigration, allMigrations, pendingMigrations, transactionStartedByUs, err_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.queryRunner || this.connection.createQueryRunner("master");
                        // create migrations table if its not created yet
                        return [4 /*yield*/, this.createMigrationsTableIfNotExist(queryRunner)];
                    case 1:
                        // create migrations table if its not created yet
                        _a.sent();
                        return [4 /*yield*/, this.loadExecutedMigrations(queryRunner)];
                    case 2:
                        executedMigrations = _a.sent();
                        lastTimeExecutedMigration = this.getLatestMigration(executedMigrations);
                        allMigrations = this.getMigrations();
                        pendingMigrations = allMigrations.filter(function (migration) {
                            // check if we already have executed migration
                            var executedMigration = executedMigrations.find(function (executedMigration) { return executedMigration.name === migration.name; });
                            if (executedMigration)
                                return false;
                            // migration is new and not executed. now check if its timestamp is correct
                            if (lastTimeExecutedMigration && migration.timestamp < lastTimeExecutedMigration.timestamp)
                                throw new Error("New migration found: " + migration.name + ", however this migration's timestamp is not valid. Migration's timestamp should not be older then migrations already executed in the database.");
                            // every check is passed means that migration was not run yet and we need to run it
                            return true;
                        });
                        // if no migrations are pending then nothing to do here
                        if (!pendingMigrations.length) {
                            this.connection.logger.logSchemaBuild("No migrations are pending");
                            return [2 /*return*/];
                        }
                        // log information about migration execution
                        this.connection.logger.logSchemaBuild(executedMigrations.length + " migrations are already loaded in the database.");
                        this.connection.logger.logSchemaBuild(allMigrations.length + " migrations were found in the source code.");
                        if (lastTimeExecutedMigration)
                            this.connection.logger.logSchemaBuild(lastTimeExecutedMigration.name + " is the last executed migration. It was executed on " + new Date(lastTimeExecutedMigration.timestamp * 1000).toString() + ".");
                        this.connection.logger.logSchemaBuild(pendingMigrations.length + " migrations are new migrations that needs to be executed.");
                        transactionStartedByUs = false;
                        if (!!queryRunner.isTransactionActive) return [3 /*break*/, 4];
                        return [4 /*yield*/, queryRunner.startTransaction()];
                    case 3:
                        _a.sent();
                        transactionStartedByUs = true;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 8, 13, 16]);
                        return [4 /*yield*/, PromiseUtils_1.PromiseUtils.runInSequence(pendingMigrations, function (migration) {
                                return migration.instance.up(queryRunner)
                                    .then(function () {
                                    return _this.insertExecutedMigration(queryRunner, migration);
                                })
                                    .then(function () {
                                    _this.connection.logger.logSchemaBuild("Migration " + migration.name + " has been executed successfully.");
                                });
                            })];
                    case 5:
                        _a.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 7];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 6:
                        _a.sent();
                        _a.label = 7;
                    case 7: return [3 /*break*/, 16];
                    case 8:
                        err_1 = _a.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 12];
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        rollbackError_1 = _a.sent();
                        return [3 /*break*/, 12];
                    case 12: throw err_1;
                    case 13:
                        if (!!this.queryRunner) return [3 /*break*/, 15];
                        return [4 /*yield*/, queryRunner.release()];
                    case 14:
                        _a.sent();
                        _a.label = 15;
                    case 15: return [7 /*endfinally*/];
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Reverts last migration that were run.
     */
    MigrationExecutor.prototype.undoLastMigration = function () {
        return __awaiter(this, void 0, void 0, function () {
            var queryRunner, executedMigrations, lastTimeExecutedMigration, allMigrations, migrationToRevert, transactionStartedByUs, err_2, rollbackError_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.queryRunner || this.connection.createQueryRunner("master");
                        // create migrations table if its not created yet
                        return [4 /*yield*/, this.createMigrationsTableIfNotExist(queryRunner)];
                    case 1:
                        // create migrations table if its not created yet
                        _a.sent();
                        return [4 /*yield*/, this.loadExecutedMigrations(queryRunner)];
                    case 2:
                        executedMigrations = _a.sent();
                        lastTimeExecutedMigration = this.getLatestMigration(executedMigrations);
                        // if no migrations found in the database then nothing to revert
                        if (!lastTimeExecutedMigration) {
                            this.connection.logger.logSchemaBuild("No migrations was found in the database. Nothing to revert!");
                            return [2 /*return*/];
                        }
                        allMigrations = this.getMigrations();
                        migrationToRevert = allMigrations.find(function (migration) { return migration.name === lastTimeExecutedMigration.name; });
                        // if no migrations found in the database then nothing to revert
                        if (!migrationToRevert)
                            throw new Error("No migration " + lastTimeExecutedMigration.name + " was found in the source code. Make sure you have this migration in your codebase and its included in the connection options.");
                        // log information about migration execution
                        this.connection.logger.logSchemaBuild(executedMigrations.length + " migrations are already loaded in the database.");
                        this.connection.logger.logSchemaBuild(lastTimeExecutedMigration.name + " is the last executed migration. It was executed on " + new Date(lastTimeExecutedMigration.timestamp * 1000).toString() + ".");
                        this.connection.logger.logSchemaBuild("Now reverting it...");
                        transactionStartedByUs = false;
                        if (!!queryRunner.isTransactionActive) return [3 /*break*/, 4];
                        return [4 /*yield*/, queryRunner.startTransaction()];
                    case 3:
                        _a.sent();
                        transactionStartedByUs = true;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 9, 14, 17]);
                        return [4 /*yield*/, migrationToRevert.instance.down(queryRunner)];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.deleteExecutedMigration(queryRunner, migrationToRevert)];
                    case 6:
                        _a.sent();
                        this.connection.logger.logSchemaBuild("Migration " + migrationToRevert.name + " has been reverted successfully.");
                        if (!transactionStartedByUs) return [3 /*break*/, 8];
                        return [4 /*yield*/, queryRunner.commitTransaction()];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8: return [3 /*break*/, 17];
                    case 9:
                        err_2 = _a.sent();
                        if (!transactionStartedByUs) return [3 /*break*/, 13];
                        _a.label = 10;
                    case 10:
                        _a.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, queryRunner.rollbackTransaction()];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        rollbackError_2 = _a.sent();
                        return [3 /*break*/, 13];
                    case 13: throw err_2;
                    case 14:
                        if (!!this.queryRunner) return [3 /*break*/, 16];
                        return [4 /*yield*/, queryRunner.release()];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16: return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Creates table "migrations" that will store information about executed migrations.
     */
    MigrationExecutor.prototype.createMigrationsTableIfNotExist = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var tableExist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, queryRunner.hasTable(this.migrationsTableName)];
                    case 1:
                        tableExist = _a.sent();
                        if (!!tableExist) return [3 /*break*/, 3];
                        return [4 /*yield*/, queryRunner.createTable(new Table_1.Table(this.migrationsTableName, [
                                new TableColumn_1.TableColumn({
                                    name: "timestamp",
                                    type: this.connection.driver.normalizeType({ type: this.connection.driver.mappedDataTypes.migrationTimestamp }),
                                    isPrimary: true,
                                    isNullable: false
                                }),
                                new TableColumn_1.TableColumn({
                                    name: "name",
                                    type: this.connection.driver.normalizeType({ type: this.connection.driver.mappedDataTypes.migrationName }),
                                    isNullable: false
                                }),
                            ]))];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Loads all migrations that were executed and saved into the database.
     */
    MigrationExecutor.prototype.loadExecutedMigrations = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var migrationsRaw;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connection.manager
                            .createQueryBuilder(queryRunner)
                            .select()
                            .from(this.migrationsTableName, "migrations")
                            .getRawMany()];
                    case 1:
                        migrationsRaw = _a.sent();
                        return [2 /*return*/, migrationsRaw.map(function (migrationRaw) {
                                return new Migration_1.Migration(parseInt(migrationRaw["timestamp"]), migrationRaw["name"]);
                            })];
                }
            });
        });
    };
    /**
     * Gets all migrations that setup for this connection.
     */
    MigrationExecutor.prototype.getMigrations = function () {
        var migrations = this.connection.migrations.map(function (migration) {
            var migrationClassName = migration.constructor.name;
            var migrationTimestamp = parseInt(migrationClassName.substr(-13));
            if (!migrationTimestamp)
                throw new Error(migrationClassName + " migration name is wrong. Migration class name should have a UNIX timestamp appended. ");
            return new Migration_1.Migration(migrationTimestamp, migrationClassName, migration);
        });
        // sort them by timestamp
        return migrations.sort(function (a, b) { return a.timestamp - b.timestamp; });
    };
    /**
     * Finds the latest migration (sorts by timestamp) in the given array of migrations.
     */
    MigrationExecutor.prototype.getLatestMigration = function (migrations) {
        var sortedMigrations = migrations.map(function (migration) { return migration; }).sort(function (a, b) { return (a.timestamp - b.timestamp) * -1; });
        return sortedMigrations.length > 0 ? sortedMigrations[0] : undefined;
    };
    /**
     * Inserts new executed migration's data into migrations table.
     */
    MigrationExecutor.prototype.insertExecutedMigration = function (queryRunner, migration) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver)) return [3 /*break*/, 2];
                        return [4 /*yield*/, queryRunner.insert(this.migrationsTableName, {
                                timestamp: new MssqlParameter_1.MssqlParameter(migration.timestamp, this.connection.driver.normalizeType({ type: this.connection.driver.mappedDataTypes.migrationTimestamp })),
                                name: new MssqlParameter_1.MssqlParameter(migration.name, this.connection.driver.normalizeType({ type: this.connection.driver.mappedDataTypes.migrationName })),
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, queryRunner.insert(this.migrationsTableName, {
                            timestamp: migration.timestamp,
                            name: migration.name,
                        })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Delete previously executed migration's data from the migrations table.
     */
    MigrationExecutor.prototype.deleteExecutedMigration = function (queryRunner, migration) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver)) return [3 /*break*/, 2];
                        return [4 /*yield*/, queryRunner.delete(this.migrationsTableName, {
                                timestamp: new MssqlParameter_1.MssqlParameter(migration.timestamp, this.connection.driver.normalizeType({ type: this.connection.driver.mappedDataTypes.migrationTimestamp })),
                                name: new MssqlParameter_1.MssqlParameter(migration.name, this.connection.driver.normalizeType({ type: this.connection.driver.mappedDataTypes.migrationName })),
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, queryRunner.delete(this.migrationsTableName, {
                            timestamp: migration.timestamp,
                            name: migration.name,
                        })];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return MigrationExecutor;
}());
exports.MigrationExecutor = MigrationExecutor;

//# sourceMappingURL=MigrationExecutor.js.map
