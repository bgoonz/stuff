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
var Table_1 = require("./schema/Table");
var TableColumn_1 = require("./schema/TableColumn");
var TableForeignKey_1 = require("./schema/TableForeignKey");
var TableIndex_1 = require("./schema/TableIndex");
var TablePrimaryKey_1 = require("./schema/TablePrimaryKey");
var PromiseUtils_1 = require("../util/PromiseUtils");
/**
 * Creates complete tables schemas in the database based on the entity metadatas.
 *
 * Steps how schema is being built:
 * 1. load list of all tables with complete column and keys information from the db
 * 2. drop all (old) foreign keys that exist in the table, but does not exist in the metadata
 * 3. create new tables that does not exist in the db, but exist in the metadata
 * 4. drop all columns exist (left old) in the db table, but does not exist in the metadata
 * 5. add columns from metadata which does not exist in the table
 * 6. update all exist columns which metadata has changed
 * 7. update primary keys - update old and create new primary key from changed columns
 * 8. create foreign keys which does not exist in the table yet
 * 9. create indices which are missing in db yet, and drops indices which exist in the db, but does not exist in the metadata anymore
 */
var RdbmsSchemaBuilder = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RdbmsSchemaBuilder(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates complete schemas for the given entity metadatas.
     */
    RdbmsSchemaBuilder.prototype.build = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, error_1, rollbackError_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.connection.createQueryRunner("master")];
                    case 1:
                        _a.queryRunner = _c.sent();
                        return [4 /*yield*/, this.createNewDatabases()];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, this.queryRunner.startTransaction()];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 10, 15, 17]);
                        _b = this;
                        return [4 /*yield*/, this.loadTableSchemas()];
                    case 5:
                        _b.tables = _c.sent();
                        return [4 /*yield*/, this.executeSchemaSyncOperationsInProperOrder()];
                    case 6:
                        _c.sent();
                        if (!this.connection.queryResultCache) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.connection.queryResultCache.synchronize(this.queryRunner)];
                    case 7:
                        _c.sent();
                        _c.label = 8;
                    case 8: return [4 /*yield*/, this.queryRunner.commitTransaction()];
                    case 9:
                        _c.sent();
                        return [3 /*break*/, 17];
                    case 10:
                        error_1 = _c.sent();
                        _c.label = 11;
                    case 11:
                        _c.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, this.queryRunner.rollbackTransaction()];
                    case 12:
                        _c.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        rollbackError_1 = _c.sent();
                        return [3 /*break*/, 14];
                    case 14: throw error_1;
                    case 15: return [4 /*yield*/, this.queryRunner.release()];
                    case 16:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 17: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Returns sql queries to be executed by schema builder.
     */
    RdbmsSchemaBuilder.prototype.log = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.connection.createQueryRunner("master")];
                    case 1:
                        _a.queryRunner = _c.sent();
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, , 8, 10]);
                        return [4 /*yield*/, this.createNewDatabases()];
                    case 3:
                        _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.loadTableSchemas()];
                    case 4:
                        _b.tables = _c.sent();
                        this.queryRunner.enableSqlMemory();
                        return [4 /*yield*/, this.executeSchemaSyncOperationsInProperOrder()];
                    case 5:
                        _c.sent();
                        if (!this.connection.queryResultCache) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.connection.queryResultCache.synchronize(this.queryRunner)];
                    case 6:
                        _c.sent();
                        _c.label = 7;
                    case 7: return [2 /*return*/, this.queryRunner.getMemorySql()];
                    case 8:
                        // its important to disable this mode despite the fact we are release query builder
                        // because there exist drivers which reuse same query runner. Also its important to disable
                        // sql memory after call of getMemorySql() method because last one flushes sql memory.
                        this.queryRunner.disableSqlMemory();
                        return [4 /*yield*/, this.queryRunner.release()];
                    case 9:
                        _c.sent();
                        return [7 /*endfinally*/];
                    case 10: return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Loads all tables from the database.
     */
    RdbmsSchemaBuilder.prototype.loadTableSchemas = function () {
        var tablePaths = this.entityToSyncMetadatas.map(function (metadata) { return metadata.tablePath; });
        return this.queryRunner.getTables(tablePaths);
    };
    Object.defineProperty(RdbmsSchemaBuilder.prototype, "entityToSyncMetadatas", {
        /**
         * Returns only entities that should be synced in the database.
         */
        get: function () {
            return this.connection.entityMetadatas.filter(function (metadata) { return !metadata.skipSync && metadata.tableType !== "single-table-child"; });
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Creates new databases if they are not exists.
     */
    RdbmsSchemaBuilder.prototype.createNewDatabases = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var databases;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        databases = [];
                        this.connection.entityMetadatas.forEach(function (metadata) {
                            if (metadata.database && databases.indexOf(metadata.database) === -1)
                                databases.push(metadata.database);
                        });
                        return [4 /*yield*/, Promise.all(databases.map(function (database) { return _this.queryRunner.createDatabase(database); }))];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes schema sync operations in a proper order.
     * Order of operations matter here.
     */
    RdbmsSchemaBuilder.prototype.executeSchemaSyncOperationsInProperOrder = function () {
        return __awaiter(this, void 0, void 0, function () {
            var schemaPaths;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        schemaPaths = [];
                        this.connection.entityMetadatas
                            .filter(function (entityMetadata) { return !!entityMetadata.schemaPath; })
                            .forEach(function (entityMetadata) {
                            var existSchemaPath = schemaPaths.find(function (path) { return path === entityMetadata.schemaPath; });
                            if (!existSchemaPath)
                                schemaPaths.push(entityMetadata.schemaPath);
                        });
                        return [4 /*yield*/, this.queryRunner.createSchema(schemaPaths)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.dropOldForeignKeys()];
                    case 2:
                        _a.sent();
                        // await this.dropOldPrimaryKeys(); // todo: need to drop primary column because column updates are not possible
                        return [4 /*yield*/, this.createNewTables()];
                    case 3:
                        // await this.dropOldPrimaryKeys(); // todo: need to drop primary column because column updates are not possible
                        _a.sent();
                        return [4 /*yield*/, this.dropRemovedColumns()];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.addNewColumns()];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.updateExistColumns()];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.updatePrimaryKeys()];
                    case 7:
                        _a.sent();
                        return [4 /*yield*/, this.createIndices()];
                    case 8:
                        _a.sent(); // we need to create indices before foreign keys because foreign keys rely on unique indices
                        return [4 /*yield*/, this.createForeignKeys()];
                    case 9:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops all (old) foreign keys that exist in the tables, but do not exist in the entity metadata.
     */
    RdbmsSchemaBuilder.prototype.dropOldForeignKeys = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
                            var table, tableForeignKeysToDrop;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        table = this.tables.find(function (table) { return table.name === metadata.tableName; });
                                        if (!table)
                                            return [2 /*return*/];
                                        tableForeignKeysToDrop = table.foreignKeys.filter(function (tableForeignKey) {
                                            return !metadata.foreignKeys.find(function (metadataForeignKey) { return metadataForeignKey.name === tableForeignKey.name; });
                                        });
                                        if (tableForeignKeysToDrop.length === 0)
                                            return [2 /*return*/];
                                        this.connection.logger.logSchemaBuild("dropping old foreign keys of " + table.name + ": " + tableForeignKeysToDrop.map(function (dbForeignKey) { return dbForeignKey.name; }).join(", "));
                                        // remove foreign keys from the table
                                        table.removeForeignKeys(tableForeignKeysToDrop);
                                        // drop foreign keys from the database
                                        return [4 /*yield*/, this.queryRunner.dropForeignKeys(table, tableForeignKeysToDrop)];
                                    case 1:
                                        // drop foreign keys from the database
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates tables that do not exist in the database yet.
     * New tables are created without foreign and primary keys.
     * Primary key only can be created in conclusion with auto generated column.
     */
    RdbmsSchemaBuilder.prototype.createNewTables = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
                            var existTableSchema, table;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        existTableSchema = this.tables.find(function (table) {
                                            if (table.name !== metadata.tableName)
                                                return false;
                                            if (metadata.schema && table.schema !== metadata.schema)
                                                return false;
                                            if (metadata.database && table.database !== metadata.database)
                                                return false;
                                            return true;
                                        });
                                        if (existTableSchema)
                                            return [2 /*return*/];
                                        this.connection.logger.logSchemaBuild("creating a new table: " + metadata.tableName);
                                        table = new Table_1.Table(metadata.tableName, this.metadataColumnsToTableColumns(metadata.columns), true, metadata.engine, metadata.database, metadata.schema);
                                        this.tables.push(table);
                                        return [4 /*yield*/, this.queryRunner.createTable(table)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops all columns that exist in the table, but does not exist in the metadata (left old).
     * We drop their keys too, since it should be safe.
     */
    RdbmsSchemaBuilder.prototype.dropRemovedColumns = function () {
        var _this = this;
        return PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var table, droppedTableColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === metadata.tableName; });
                        if (!table)
                            return [2 /*return*/];
                        droppedTableColumns = table.columns.filter(function (tableColumn) {
                            return !metadata.columns.find(function (columnMetadata) { return columnMetadata.databaseName === tableColumn.name; });
                        });
                        if (droppedTableColumns.length === 0)
                            return [2 /*return*/];
                        // drop all foreign keys that has column to be removed in its columns
                        return [4 /*yield*/, Promise.all(droppedTableColumns.map(function (droppedTableColumn) {
                                return _this.dropColumnReferencedForeignKeys(metadata.tableName, droppedTableColumn.name);
                            }))];
                    case 1:
                        // drop all foreign keys that has column to be removed in its columns
                        _a.sent();
                        // drop all indices that point to this column
                        return [4 /*yield*/, Promise.all(droppedTableColumns.map(function (droppedTableColumn) {
                                return _this.dropColumnReferencedIndices(metadata.tableName, droppedTableColumn.name);
                            }))];
                    case 2:
                        // drop all indices that point to this column
                        _a.sent();
                        this.connection.logger.logSchemaBuild("columns dropped in " + table.name + ": " + droppedTableColumns.map(function (column) { return column.name; }).join(", "));
                        // remove columns from the table and primary keys of it if its used in the primary keys
                        table.removeColumns(droppedTableColumns);
                        table.removePrimaryKeysOfColumns(droppedTableColumns);
                        // drop columns from the database
                        return [4 /*yield*/, this.queryRunner.dropColumns(table, droppedTableColumns)];
                    case 3:
                        // drop columns from the database
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Adds columns from metadata which does not exist in the table.
     * Columns are created without keys.
     */
    RdbmsSchemaBuilder.prototype.addNewColumns = function () {
        var _this = this;
        return PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var table, newColumnMetadatas, newTableColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === metadata.tableName; });
                        if (!table)
                            return [2 /*return*/];
                        newColumnMetadatas = metadata.columns.filter(function (columnMetadata) {
                            return !table.columns.find(function (tableColumn) { return tableColumn.name === columnMetadata.databaseName; });
                        });
                        if (newColumnMetadatas.length === 0)
                            return [2 /*return*/];
                        this.connection.logger.logSchemaBuild("new columns added: " + newColumnMetadatas.map(function (column) { return column.databaseName; }).join(", "));
                        newTableColumns = this.metadataColumnsToTableColumns(newColumnMetadatas);
                        return [4 /*yield*/, this.queryRunner.addColumns(table, newTableColumns)];
                    case 1:
                        _a.sent();
                        table.addColumns(newTableColumns);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Update all exist columns which metadata has changed.
     * Still don't create keys. Also we don't touch foreign keys of the changed columns.
     */
    RdbmsSchemaBuilder.prototype.updateExistColumns = function () {
        var _this = this;
        return PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var table, updatedTableColumns, dropRelatedForeignKeysPromises, dropRelatedIndicesPromises, newAndOldTableColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === metadata.tableName; });
                        if (!table)
                            return [2 /*return*/];
                        updatedTableColumns = table.findChangedColumns(this.connection.driver, metadata.columns);
                        if (updatedTableColumns.length === 0)
                            return [2 /*return*/];
                        this.connection.logger.logSchemaBuild("columns changed in " + table.name + ". updating: " + updatedTableColumns.map(function (column) { return column.name; }).join(", "));
                        dropRelatedForeignKeysPromises = updatedTableColumns
                            .filter(function (changedTableColumn) { return !!metadata.columns.find(function (columnMetadata) { return columnMetadata.databaseName === changedTableColumn.name; }); })
                            .map(function (changedTableColumn) { return _this.dropColumnReferencedForeignKeys(metadata.tableName, changedTableColumn.name); });
                        // wait until all related foreign keys are dropped
                        return [4 /*yield*/, Promise.all(dropRelatedForeignKeysPromises)];
                    case 1:
                        // wait until all related foreign keys are dropped
                        _a.sent();
                        dropRelatedIndicesPromises = updatedTableColumns
                            .filter(function (changedTableColumn) { return !!metadata.columns.find(function (columnMetadata) { return columnMetadata.databaseName === changedTableColumn.name; }); })
                            .map(function (changedTableColumn) { return _this.dropColumnReferencedIndices(metadata.tableName, changedTableColumn.name); });
                        // wait until all related indices are dropped
                        return [4 /*yield*/, Promise.all(dropRelatedIndicesPromises)];
                    case 2:
                        // wait until all related indices are dropped
                        _a.sent();
                        newAndOldTableColumns = updatedTableColumns.map(function (changedTableColumn) {
                            var columnMetadata = metadata.columns.find(function (column) { return column.databaseName === changedTableColumn.name; });
                            var newTableColumn = TableColumn_1.TableColumn.create(columnMetadata, _this.connection.driver.normalizeType(columnMetadata), _this.connection.driver.normalizeDefault(columnMetadata), _this.connection.driver.getColumnLength(columnMetadata));
                            table.replaceColumn(changedTableColumn, newTableColumn);
                            return {
                                newColumn: newTableColumn,
                                oldColumn: changedTableColumn
                            };
                        });
                        return [2 /*return*/, this.queryRunner.changeColumns(table, newAndOldTableColumns)];
                }
            });
        }); });
    };
    /**
     * Creates primary keys which does not exist in the table yet.
     */
    RdbmsSchemaBuilder.prototype.updatePrimaryKeys = function () {
        var _this = this;
        return PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var table, metadataPrimaryColumns, addedKeys, droppedKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === metadata.tableName && !table.justCreated; });
                        if (!table)
                            return [2 /*return*/];
                        metadataPrimaryColumns = metadata.columns.filter(function (column) { return column.isPrimary; });
                        addedKeys = metadataPrimaryColumns
                            .filter(function (primaryKey) {
                            return !table.primaryKeys.find(function (dbPrimaryKey) { return dbPrimaryKey.columnName === primaryKey.databaseName; });
                        })
                            .map(function (primaryKey) { return new TablePrimaryKey_1.TablePrimaryKey("", primaryKey.databaseName); });
                        droppedKeys = table.primaryKeys.filter(function (primaryKeySchema) {
                            return !metadataPrimaryColumns.find(function (primaryKeyMetadata) { return primaryKeyMetadata.databaseName === primaryKeySchema.columnName; });
                        });
                        if (addedKeys.length === 0 && droppedKeys.length === 0)
                            return [2 /*return*/];
                        this.connection.logger.logSchemaBuild("primary keys of " + table.name + " has changed: dropped - " + (droppedKeys.map(function (key) { return key.columnName; }).join(", ") || "nothing") + "; added - " + (addedKeys.map(function (key) { return key.columnName; }).join(", ") || "nothing"));
                        table.addPrimaryKeys(addedKeys);
                        table.removePrimaryKeys(droppedKeys);
                        return [4 /*yield*/, this.queryRunner.updatePrimaryKeys(table)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Creates foreign keys which does not exist in the table yet.
     */
    RdbmsSchemaBuilder.prototype.createForeignKeys = function () {
        var _this = this;
        return PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var table, newKeys, dbForeignKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === metadata.tableName; });
                        if (!table)
                            return [2 /*return*/];
                        newKeys = metadata.foreignKeys.filter(function (foreignKey) {
                            return !table.foreignKeys.find(function (dbForeignKey) { return dbForeignKey.name === foreignKey.name; });
                        });
                        if (newKeys.length === 0)
                            return [2 /*return*/];
                        dbForeignKeys = newKeys.map(function (foreignKeyMetadata) { return TableForeignKey_1.TableForeignKey.create(foreignKeyMetadata); });
                        this.connection.logger.logSchemaBuild("creating a foreign keys: " + newKeys.map(function (key) { return key.name; }).join(", "));
                        return [4 /*yield*/, this.queryRunner.createForeignKeys(table, dbForeignKeys)];
                    case 1:
                        _a.sent();
                        table.addForeignKeys(dbForeignKeys);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Creates indices which are missing in db yet, and drops indices which exist in the db,
     * but does not exist in the metadata anymore.
     */
    RdbmsSchemaBuilder.prototype.createIndices = function () {
        var _this = this;
        // return Promise.all(this.connection.entityMetadatas.map(metadata => this.createIndices(metadata.table, metadata.indices)));
        return PromiseUtils_1.PromiseUtils.runInSequence(this.entityToSyncMetadatas, function (metadata) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var table, dropQueries, addQueries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === metadata.tableName; });
                        if (!table)
                            return [2 /*return*/];
                        dropQueries = table.indices
                            .filter(function (tableIndex) {
                            var metadataIndex = metadata.indices.find(function (indexMetadata) { return indexMetadata.name === tableIndex.name; });
                            if (!metadataIndex)
                                return true;
                            if (metadataIndex.isUnique !== tableIndex.isUnique)
                                return true;
                            if (metadataIndex.columns.length !== tableIndex.columnNames.length)
                                return true;
                            if (metadataIndex.columns.findIndex(function (col, i) { return col.databaseName !== tableIndex.columnNames[i]; }) !== -1)
                                return true;
                            return false;
                        })
                            .map(function (tableIndex) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.connection.logger.logSchemaBuild("dropping an index: " + tableIndex.name);
                                        table.removeIndex(tableIndex);
                                        return [4 /*yield*/, this.queryRunner.dropIndex(metadata.tablePath, tableIndex.name)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(dropQueries)];
                    case 1:
                        _a.sent();
                        addQueries = metadata.indices
                            .filter(function (indexMetadata) { return !table.indices.find(function (tableIndex) { return tableIndex.name === indexMetadata.name; }); })
                            .map(function (indexMetadata) { return __awaiter(_this, void 0, void 0, function () {
                            var tableIndex;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        tableIndex = TableIndex_1.TableIndex.create(indexMetadata);
                                        table.indices.push(tableIndex);
                                        this.connection.logger.logSchemaBuild("adding new index: " + tableIndex.name);
                                        return [4 /*yield*/, this.queryRunner.createIndex(table, tableIndex)];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(addQueries)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Drops all indices where given column of the given table is being used.
     */
    RdbmsSchemaBuilder.prototype.dropColumnReferencedIndices = function (tableName, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var table, dependIndicesInTable, dropPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = this.tables.find(function (table) { return table.name === tableName; });
                        if (!table)
                            return [2 /*return*/];
                        dependIndicesInTable = table.indices.filter(function (tableIndex) {
                            return tableIndex.tableName === tableName && !!tableIndex.columnNames.find(function (columnDatabaseName) { return columnDatabaseName === columnName; });
                        });
                        if (dependIndicesInTable.length === 0)
                            return [2 /*return*/];
                        this.connection.logger.logSchemaBuild("dropping related indices of " + tableName + "#" + columnName + ": " + dependIndicesInTable.map(function (index) { return index.name; }).join(", "));
                        dropPromises = dependIndicesInTable.map(function (index) {
                            table.removeIndex(index);
                            return _this.queryRunner.dropIndex(table, index.name);
                        });
                        return [4 /*yield*/, Promise.all(dropPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops all foreign keys where given column of the given table is being used.
     */
    RdbmsSchemaBuilder.prototype.dropColumnReferencedForeignKeys = function (tableName, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            var allForeignKeyMetadatas, table, dependForeignKeys, dependForeignKeyInTable, tableForeignKeys;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        allForeignKeyMetadatas = this.connection.entityMetadatas.reduce(function (all, metadata) { return all.concat(metadata.foreignKeys); }, []);
                        table = this.tables.find(function (table) { return table.name === tableName; });
                        if (!table)
                            return [2 /*return*/];
                        dependForeignKeys = allForeignKeyMetadatas.filter(function (foreignKey) {
                            if (foreignKey.tableName === tableName) {
                                return !!foreignKey.columns.find(function (fkColumn) {
                                    return fkColumn.databaseName === columnName;
                                });
                            }
                            else if (foreignKey.referencedTableName === tableName) {
                                return !!foreignKey.referencedColumns.find(function (fkColumn) {
                                    return fkColumn.databaseName === columnName;
                                });
                            }
                            return false;
                        });
                        if (!dependForeignKeys.length)
                            return [2 /*return*/];
                        dependForeignKeyInTable = dependForeignKeys.filter(function (fk) {
                            return !!table.foreignKeys.find(function (dbForeignKey) { return dbForeignKey.name === fk.name; });
                        });
                        if (dependForeignKeyInTable.length === 0)
                            return [2 /*return*/];
                        this.connection.logger.logSchemaBuild("dropping related foreign keys of " + tableName + "#" + columnName + ": " + dependForeignKeyInTable.map(function (foreignKey) { return foreignKey.name; }).join(", "));
                        tableForeignKeys = dependForeignKeyInTable.map(function (foreignKeyMetadata) { return TableForeignKey_1.TableForeignKey.create(foreignKeyMetadata); });
                        table.removeForeignKeys(tableForeignKeys);
                        return [4 /*yield*/, this.queryRunner.dropForeignKeys(table, tableForeignKeys)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates new columns from the given column metadatas.
     */
    RdbmsSchemaBuilder.prototype.metadataColumnsToTableColumns = function (columns) {
        var _this = this;
        return columns.map(function (columnMetadata) {
            return TableColumn_1.TableColumn.create(columnMetadata, _this.connection.driver.normalizeType(columnMetadata), _this.connection.driver.normalizeDefault(columnMetadata), _this.connection.driver.getColumnLength(columnMetadata));
        });
    };
    return RdbmsSchemaBuilder;
}());
exports.RdbmsSchemaBuilder = RdbmsSchemaBuilder;

//# sourceMappingURL=RdbmsSchemaBuilder.js.map
