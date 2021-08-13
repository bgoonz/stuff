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
var TransactionAlreadyStartedError_1 = require("../../error/TransactionAlreadyStartedError");
var TransactionNotStartedError_1 = require("../../error/TransactionNotStartedError");
var TableColumn_1 = require("../../schema-builder/schema/TableColumn");
var ColumnMetadata_1 = require("../../metadata/ColumnMetadata");
var Table_1 = require("../../schema-builder/schema/Table");
var TableIndex_1 = require("../../schema-builder/schema/TableIndex");
var TableForeignKey_1 = require("../../schema-builder/schema/TableForeignKey");
var TablePrimaryKey_1 = require("../../schema-builder/schema/TablePrimaryKey");
var RandomGenerator_1 = require("../../util/RandomGenerator");
/**
 * Runs queries on a single sqlite database connection.
 *
 * Does not support compose primary keys with autoincrement field.
 * todo: need to throw exception for this case.
 */
var AbstractSqliteQueryRunner = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function AbstractSqliteQueryRunner(driver) {
        /**
         * Indicates if connection for this query runner is released.
         * Once its released, query runner cannot run queries anymore.
         */
        this.isReleased = false;
        /**
         * Indicates if transaction is in progress.
         */
        this.isTransactionActive = false;
        /**
         * Stores temporarily user data.
         * Useful for sharing data with subscribers.
         */
        this.data = {};
        // -------------------------------------------------------------------------
        // Protected Properties
        // -------------------------------------------------------------------------
        /**
         * Indicates if special query runner mode in which sql queries won't be executed is enabled.
         */
        this.sqlMemoryMode = false;
        /**
         * Sql-s stored if "sql in memory" mode is enabled.
         */
        this.sqlsInMemory = [];
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    AbstractSqliteQueryRunner.prototype.connect = function () {
        return Promise.resolve(this.driver.databaseConnection);
    };
    /**
     * Releases used database connection.
     * We don't do anything here because sqlite do not support multiple connections thus query runners.
     */
    AbstractSqliteQueryRunner.prototype.release = function () {
        return Promise.resolve();
    };
    /**
     * Starts transaction.
     */
    AbstractSqliteQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isTransactionActive)
                            throw new TransactionAlreadyStartedError_1.TransactionAlreadyStartedError();
                        this.isTransactionActive = true;
                        return [4 /*yield*/, this.query("BEGIN TRANSACTION")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    AbstractSqliteQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isTransactionActive)
                            throw new TransactionNotStartedError_1.TransactionNotStartedError();
                        return [4 /*yield*/, this.query("COMMIT")];
                    case 1:
                        _a.sent();
                        this.isTransactionActive = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Rollbacks transaction.
     * Error will be thrown if transaction was not started.
     */
    AbstractSqliteQueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isTransactionActive)
                            throw new TransactionNotStartedError_1.TransactionNotStartedError();
                        return [4 /*yield*/, this.query("ROLLBACK")];
                    case 1:
                        _a.sent();
                        this.isTransactionActive = false;
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes a given SQL query.
     */
    AbstractSqliteQueryRunner.prototype.query = function (query, parameters) {
        throw new Error("Do not use AbstractSqlite directly, it has to be used with one of the sqlite drivers");
    };
    /**
     * Returns raw data stream.
     */
    AbstractSqliteQueryRunner.prototype.stream = function (query, parameters, onEnd, onError) {
        throw new Error("Stream is not supported by sqlite driver.");
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    AbstractSqliteQueryRunner.prototype.insert = function (tableName, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Do not use AbstractSqlite directly, it has to be used with one of the sqlite drivers");
            });
        });
    };
    /**
     * Updates rows that match given conditions in the given table.
     */
    AbstractSqliteQueryRunner.prototype.update = function (tableName, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            var updateValues, conditionString, query, updateParams, conditionParams, allParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateValues = this.parametrize(valuesMap).join(", ");
                        conditionString = this.parametrize(conditions, Object.keys(valuesMap).length).join(" AND ");
                        query = "UPDATE \"" + tableName + "\" SET " + updateValues + " " + (conditionString ? (" WHERE " + conditionString) : "");
                        updateParams = Object.keys(valuesMap).map(function (key) { return valuesMap[key]; });
                        conditionParams = Object.keys(conditions).map(function (key) { return conditions[key]; });
                        allParameters = updateParams.concat(conditionParams);
                        return [4 /*yield*/, this.query(query, allParameters)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes from the given table by a given conditions.
     */
    AbstractSqliteQueryRunner.prototype.delete = function (tableName, conditions, maybeParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var conditionString, parameters, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditionString = typeof conditions === "string" ? conditions : this.parametrize(conditions).join(" AND ");
                        parameters = conditions instanceof Object ? Object.keys(conditions).map(function (key) { return conditions[key]; }) : maybeParameters;
                        sql = "DELETE FROM \"" + tableName + "\" WHERE " + conditionString;
                        return [4 /*yield*/, this.query(sql, parameters)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Inserts rows into closure table.
     */
    AbstractSqliteQueryRunner.prototype.insertIntoClosureTable = function (tableName, newEntityId, parentId, hasLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "";
                        if (hasLevel) {
                            sql = "INSERT INTO \"" + tableName + "\"(\"ancestor\", \"descendant\", \"level\") " +
                                ("SELECT \"ancestor\", " + newEntityId + ", \"level\" + 1 FROM \"" + tableName + "\" WHERE \"descendant\" = " + parentId + " ") +
                                ("UNION ALL SELECT " + newEntityId + ", " + newEntityId + ", 1");
                        }
                        else {
                            sql = "INSERT INTO \"" + tableName + "\"(\"ancestor\", \"descendant\") " +
                                ("SELECT \"ancestor\", " + newEntityId + " FROM \"" + tableName + "\" WHERE \"descendant\" = " + parentId + " ") +
                                ("UNION ALL SELECT " + newEntityId + ", " + newEntityId);
                        }
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        if (!hasLevel) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.query("SELECT MAX(level) as level FROM " + tableName + " WHERE descendant = " + parentId)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results && results[0] && results[0]["level"] ? parseInt(results[0]["level"]) + 1 : 1];
                    case 3: return [2 /*return*/, -1];
                }
            });
        });
    };
    /**
     * Loads given table's data from the database.
     */
    AbstractSqliteQueryRunner.prototype.getTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var tables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTables([tableName])];
                    case 1:
                        tables = _a.sent();
                        return [2 /*return*/, tables.length > 0 ? tables[0] : undefined];
                }
            });
        });
    };
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    AbstractSqliteQueryRunner.prototype.getTables = function (tableNames) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tableNamesString, dbTables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if no tables given then no need to proceed
                        if (!tableNames || !tableNames.length)
                            return [2 /*return*/, []];
                        tableNamesString = tableNames.map(function (tableName) { return "'" + tableName + "'"; }).join(", ");
                        return [4 /*yield*/, this.query("SELECT * FROM sqlite_master WHERE type = 'table' AND name IN (" + tableNamesString + ")")];
                    case 1:
                        dbTables = _a.sent();
                        // if tables were not found in the db, no need to proceed
                        if (!dbTables || !dbTables.length)
                            return [2 /*return*/, []];
                        // create table schemas for loaded tables
                        return [2 /*return*/, Promise.all(dbTables.map(function (dbTable) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                var table, _a, dbColumns, dbIndices, dbForeignKeys, autoIncrementColumnName, tableSql, comma, bracket, indicesPromises, indices;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            table = new Table_1.Table(dbTable["name"]);
                                            return [4 /*yield*/, Promise.all([
                                                    this.query("PRAGMA table_info(\"" + dbTable["name"] + "\")"),
                                                    this.query("PRAGMA index_list(\"" + dbTable["name"] + "\")"),
                                                    this.query("PRAGMA foreign_key_list(\"" + dbTable["name"] + "\")"),
                                                ])];
                                        case 1:
                                            _a = _b.sent(), dbColumns = _a[0], dbIndices = _a[1], dbForeignKeys = _a[2];
                                            autoIncrementColumnName = undefined;
                                            tableSql = dbTable["sql"];
                                            if (tableSql.indexOf("AUTOINCREMENT") !== -1) {
                                                autoIncrementColumnName = tableSql.substr(0, tableSql.indexOf("AUTOINCREMENT"));
                                                comma = autoIncrementColumnName.lastIndexOf(",");
                                                bracket = autoIncrementColumnName.lastIndexOf("(");
                                                if (comma !== -1) {
                                                    autoIncrementColumnName = autoIncrementColumnName.substr(comma);
                                                    autoIncrementColumnName = autoIncrementColumnName.substr(0, autoIncrementColumnName.lastIndexOf("\""));
                                                    autoIncrementColumnName = autoIncrementColumnName.substr(autoIncrementColumnName.indexOf("\"") + 1);
                                                }
                                                else if (bracket !== -1) {
                                                    autoIncrementColumnName = autoIncrementColumnName.substr(bracket);
                                                    autoIncrementColumnName = autoIncrementColumnName.substr(0, autoIncrementColumnName.lastIndexOf("\""));
                                                    autoIncrementColumnName = autoIncrementColumnName.substr(autoIncrementColumnName.indexOf("\"") + 1);
                                                }
                                            }
                                            // create columns from the loaded columns
                                            table.columns = dbColumns.map(function (dbColumn) {
                                                var tableColumn = new TableColumn_1.TableColumn();
                                                tableColumn.name = dbColumn["name"];
                                                tableColumn.type = dbColumn["type"].toLowerCase();
                                                tableColumn.default = dbColumn["dflt_value"] !== null && dbColumn["dflt_value"] !== undefined ? dbColumn["dflt_value"] : undefined;
                                                tableColumn.isNullable = dbColumn["notnull"] === 0;
                                                // primary keys are numbered starting with 1, columns that aren't primary keys are marked with 0
                                                tableColumn.isPrimary = dbColumn["pk"] > 0;
                                                tableColumn.comment = ""; // todo later
                                                tableColumn.isGenerated = autoIncrementColumnName === dbColumn["name"];
                                                if (tableColumn.isGenerated) {
                                                    tableColumn.generationStrategy = "increment";
                                                }
                                                // parse datatype and attempt to retrieve length
                                                var pos = tableColumn.type.indexOf("(");
                                                if (pos !== -1) {
                                                    var dataType_1 = tableColumn.type.substr(0, pos);
                                                    if (!!_this.driver.withLengthColumnTypes.find(function (col) { return col === dataType_1; })) {
                                                        var len = parseInt(tableColumn.type.substring(pos + 1, tableColumn.type.length - 1));
                                                        if (len) {
                                                            tableColumn.length = len.toString();
                                                            tableColumn.type = dataType_1; // remove the length part from the datatype
                                                        }
                                                    }
                                                }
                                                var columnForeignKeys = dbForeignKeys
                                                    .filter(function (foreignKey) { return foreignKey["from"] === dbColumn["name"]; })
                                                    .map(function (foreignKey) {
                                                    // const keyName = this.driver.namingStrategy.foreignKeyName(dbTable["name"], [foreignKey["from"]], foreignKey["table"], [foreignKey["to"]]);
                                                    // todo: figure out solution here, name should be same as naming strategy generates!
                                                    var key = dbTable["name"] + "_" + [foreignKey["from"]].join("_") + "_" + foreignKey["table"] + "_" + [foreignKey["to"]].join("_");
                                                    var keyName = "fk_" + RandomGenerator_1.RandomGenerator.sha1(key).substr(0, 27);
                                                    return new TableForeignKey_1.TableForeignKey(keyName, [foreignKey["from"]], [foreignKey["to"]], foreignKey["table"], foreignKey["on_delete"]); // todo: how sqlite return from and to when they are arrays? (multiple column foreign keys)
                                                });
                                                table.addForeignKeys(columnForeignKeys);
                                                return tableColumn;
                                            });
                                            // create primary key schema
                                            return [4 /*yield*/, Promise.all(dbIndices
                                                    .filter(function (index) { return index["origin"] === "pk"; })
                                                    .map(function (index) { return __awaiter(_this, void 0, void 0, function () {
                                                    var indexInfos, indexColumns;
                                                    return __generator(this, function (_a) {
                                                        switch (_a.label) {
                                                            case 0: return [4 /*yield*/, this.query("PRAGMA index_info(\"" + index["name"] + "\")")];
                                                            case 1:
                                                                indexInfos = _a.sent();
                                                                indexColumns = indexInfos.map(function (indexInfo) { return indexInfo["name"]; });
                                                                indexColumns.forEach(function (indexColumn) {
                                                                    table.primaryKeys.push(new TablePrimaryKey_1.TablePrimaryKey(index["name"], indexColumn));
                                                                });
                                                                return [2 /*return*/];
                                                        }
                                                    });
                                                }); }))];
                                        case 2:
                                            // create primary key schema
                                            _b.sent();
                                            indicesPromises = dbIndices
                                                .filter(function (dbIndex) {
                                                return dbIndex["origin"] !== "pk" &&
                                                    (!table.foreignKeys.find(function (foreignKey) { return foreignKey.name === dbIndex["name"]; })) &&
                                                    (!table.primaryKeys.find(function (primaryKey) { return primaryKey.name === dbIndex["name"]; }));
                                            })
                                                .map(function (dbIndex) { return dbIndex["name"]; })
                                                .filter(function (value, index, self) { return self.indexOf(value) === index; }) // unqiue
                                                .map(function (dbIndexName) { return __awaiter(_this, void 0, void 0, function () {
                                                var dbIndex, indexInfos, indexColumns, isUnique;
                                                return __generator(this, function (_a) {
                                                    switch (_a.label) {
                                                        case 0:
                                                            dbIndex = dbIndices.find(function (dbIndex) { return dbIndex["name"] === dbIndexName; });
                                                            return [4 /*yield*/, this.query("PRAGMA index_info(\"" + dbIndex["name"] + "\")")];
                                                        case 1:
                                                            indexInfos = _a.sent();
                                                            indexColumns = indexInfos
                                                                .sort(function (indexInfo1, indexInfo2) { return parseInt(indexInfo1["seqno"]) - parseInt(indexInfo2["seqno"]); })
                                                                .map(function (indexInfo) { return indexInfo["name"]; });
                                                            // check if db index is generated by sqlite itself and has special use case
                                                            if (dbIndex["name"].substr(0, "sqlite_autoindex".length) === "sqlite_autoindex") {
                                                                if (dbIndex["unique"] === 1) { // this means we have a special index generated for a column
                                                                    // so we find and update the column
                                                                    indexColumns.forEach(function (columnName) {
                                                                        var column = table.columns.find(function (column) { return column.name === columnName; });
                                                                        if (column)
                                                                            column.isUnique = true;
                                                                    });
                                                                }
                                                                return [2 /*return*/, Promise.resolve(undefined)];
                                                            }
                                                            else {
                                                                isUnique = dbIndex["unique"] === "1" || dbIndex["unique"] === 1;
                                                                return [2 /*return*/, new TableIndex_1.TableIndex(dbTable["name"], dbIndex["name"], indexColumns, isUnique)];
                                                            }
                                                            return [2 /*return*/];
                                                    }
                                                });
                                            }); });
                                            return [4 /*yield*/, Promise.all(indicesPromises)];
                                        case 3:
                                            indices = _b.sent();
                                            table.indices = indices.filter(function (index) { return !!index; });
                                            return [2 /*return*/, table];
                                    }
                                });
                            }); }))];
                }
            });
        });
    };
    /**
     * Checks if database with the given name exist.
     */
    AbstractSqliteQueryRunner.prototype.hasDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve(false)];
            });
        });
    };
    /**
     * Checks if table with the given name exist in the database.
     */
    AbstractSqliteQueryRunner.prototype.hasTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "SELECT * FROM sqlite_master WHERE type = 'table' AND name = '" + tableName + "'";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length ? true : false];
                }
            });
        });
    };
    /**
     * Creates a database if it's not created.
     */
    AbstractSqliteQueryRunner.prototype.createDatabase = function (database) {
        return Promise.resolve([]);
    };
    /**
     * Creates a schema if it's not created.
     */
    AbstractSqliteQueryRunner.prototype.createSchema = function (schemas) {
        return Promise.resolve([]);
    };
    /**
     * Creates a new table from the given table metadata and column metadatas.
     */
    AbstractSqliteQueryRunner.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var columnDefinitions, sql, primaryKeyColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnDefinitions = table.columns.map(function (column) { return _this.buildCreateColumnSql(column); }).join(", ");
                        sql = "CREATE TABLE \"" + table.name + "\" (" + columnDefinitions;
                        primaryKeyColumns = table.columns.filter(function (column) { return column.isPrimary && !column.isGenerated; });
                        if (primaryKeyColumns.length > 0)
                            sql += ", PRIMARY KEY(" + primaryKeyColumns.map(function (column) { return "" + column.name; }).join(", ") + ")"; // for some reason column escaping here generates a wrong schema
                        sql += ")";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops the table.
     */
    AbstractSqliteQueryRunner.prototype.dropTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "DROP TABLE \"" + tableName + "\"";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Checks if column with the given name exist in the given table.
     */
    AbstractSqliteQueryRunner.prototype.hasColumn = function (tableName, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, columns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "PRAGMA table_info(\"" + tableName + "\")";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        columns = _a.sent();
                        return [2 /*return*/, !!columns.find(function (column) { return column["name"] === columnName; })];
                }
            });
        });
    };
    /**
     * Creates a new column from the column in the table.
     */
    AbstractSqliteQueryRunner.prototype.addColumn = function (tableOrName, column) {
        return __awaiter(this, void 0, void 0, function () {
            var table, newTableSchema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTableSchema(tableOrName)];
                    case 1:
                        table = _a.sent();
                        newTableSchema = table.clone();
                        newTableSchema.addColumns([column]);
                        return [4 /*yield*/, this.recreateTable(newTableSchema, table)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new columns from the column in the table.
     */
    AbstractSqliteQueryRunner.prototype.addColumns = function (tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var table, newTableSchema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTableSchema(tableOrName)];
                    case 1:
                        table = _a.sent();
                        newTableSchema = table.clone();
                        newTableSchema.addColumns(columns);
                        return [4 /*yield*/, this.recreateTable(newTableSchema, table)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Renames column in the given table.
     */
    AbstractSqliteQueryRunner.prototype.renameColumn = function (tableOrName, oldTableColumnOrName, newTableColumnOrName) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn, newColumn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        if (!(tableOrName instanceof Table_1.Table)) return [3 /*break*/, 1];
                        table = tableOrName;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getTable(tableOrName)];
                    case 2:
                        table = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!table)
                            throw new Error("Table " + tableOrName + " was not found.");
                        oldColumn = undefined;
                        if (oldTableColumnOrName instanceof TableColumn_1.TableColumn) {
                            oldColumn = oldTableColumnOrName;
                        }
                        else {
                            oldColumn = table.columns.find(function (column) { return column.name === oldTableColumnOrName; });
                        }
                        if (!oldColumn)
                            throw new Error("Column \"" + oldTableColumnOrName + "\" was not found in the \"" + tableOrName + "\" table.");
                        newColumn = undefined;
                        if (newTableColumnOrName instanceof TableColumn_1.TableColumn) {
                            newColumn = newTableColumnOrName;
                        }
                        else {
                            newColumn = oldColumn.clone();
                            newColumn.name = newTableColumnOrName;
                        }
                        return [2 /*return*/, this.changeColumn(table, oldColumn, newColumn)];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    AbstractSqliteQueryRunner.prototype.changeColumn = function (tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        if (!(tableOrName instanceof Table_1.Table)) return [3 /*break*/, 1];
                        table = tableOrName;
                        return [3 /*break*/, 3];
                    case 1: return [4 /*yield*/, this.getTable(tableOrName)];
                    case 2:
                        table = _a.sent();
                        _a.label = 3;
                    case 3:
                        if (!table)
                            throw new Error("Table " + tableOrName + " was not found.");
                        oldColumn = undefined;
                        if (oldTableColumnOrName instanceof TableColumn_1.TableColumn) {
                            oldColumn = oldTableColumnOrName;
                        }
                        else {
                            oldColumn = table.columns.find(function (column) { return column.name === oldTableColumnOrName; });
                        }
                        if (!oldColumn)
                            throw new Error("Column \"" + oldTableColumnOrName + "\" was not found in the \"" + tableOrName + "\" table.");
                        // todo: fix it. it should not depend on table
                        return [2 /*return*/, this.recreateTable(table)];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     * Changed column looses all its keys in the db.
     */
    AbstractSqliteQueryRunner.prototype.changeColumns = function (table, changedColumns) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // todo: fix it. it should not depend on table
                return [2 /*return*/, this.recreateTable(table)];
            });
        });
    };
    /**
     * Drops column in the table.
     */
    AbstractSqliteQueryRunner.prototype.dropColumn = function (table, column) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.dropColumns(table, [column])];
            });
        });
    };
    /**
     * Drops the columns in the table.
     */
    AbstractSqliteQueryRunner.prototype.dropColumns = function (table, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var updatingTableSchema;
            return __generator(this, function (_a) {
                updatingTableSchema = table.clone();
                updatingTableSchema.removeColumns(columns);
                return [2 /*return*/, this.recreateTable(updatingTableSchema)];
            });
        });
    };
    /**
     * Updates table's primary keys.
     */
    AbstractSqliteQueryRunner.prototype.updatePrimaryKeys = function (dbTable) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.recreateTable(dbTable)];
            });
        });
    };
    /**
     * Creates a new foreign key.
     */
    AbstractSqliteQueryRunner.prototype.createForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.createForeignKeys(tableOrName, [foreignKey])];
            });
        });
    };
    /**
     * Creates a new foreign keys.
     */
    AbstractSqliteQueryRunner.prototype.createForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var table, changedTableSchema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTableSchema(tableOrName)];
                    case 1:
                        table = _a.sent();
                        changedTableSchema = table.clone();
                        changedTableSchema.addForeignKeys(foreignKeys);
                        return [2 /*return*/, this.recreateTable(changedTableSchema)];
                }
            });
        });
    };
    /**
     * Drops a foreign key from the table.
     */
    AbstractSqliteQueryRunner.prototype.dropForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.dropForeignKeys(tableOrName, [foreignKey])];
            });
        });
    };
    /**
     * Drops a foreign keys from the table.
     */
    AbstractSqliteQueryRunner.prototype.dropForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var table, changedTableSchema;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTableSchema(tableOrName)];
                    case 1:
                        table = _a.sent();
                        changedTableSchema = table.clone();
                        changedTableSchema.removeForeignKeys(foreignKeys);
                        return [2 /*return*/, this.recreateTable(changedTableSchema)];
                }
            });
        });
    };
    /**
     * Creates a new index.
     */
    AbstractSqliteQueryRunner.prototype.createIndex = function (table, index) {
        return __awaiter(this, void 0, void 0, function () {
            var columnNames, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnNames = index.columnNames.map(function (columnName) { return "\"" + columnName + "\""; }).join(",");
                        sql = "CREATE " + (index.isUnique ? "UNIQUE " : "") + "INDEX \"" + index.name + "\" ON \"" + (table instanceof Table_1.Table ? table.name : table) + "\"(" + columnNames + ")";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops an index from the table.
     */
    AbstractSqliteQueryRunner.prototype.dropIndex = function (tableSchemeOrName, indexName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "DROP INDEX \"" + indexName + "\"";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Truncates table.
     */
    AbstractSqliteQueryRunner.prototype.truncate = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("DELETE FROM \"" + tableName + "\"")];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Removes all tables from the currently connected database.
     */
    AbstractSqliteQueryRunner.prototype.clearDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var selectDropsQuery, dropQueries, error_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("PRAGMA foreign_keys = OFF;")];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.startTransaction()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 7, 12, 14]);
                        selectDropsQuery = "select 'drop table \"' || name || '\";' as query from sqlite_master where type = 'table' and name != 'sqlite_sequence'";
                        return [4 /*yield*/, this.query(selectDropsQuery)];
                    case 4:
                        dropQueries = _a.sent();
                        return [4 /*yield*/, Promise.all(dropQueries.map(function (q) { return _this.query(q["query"]); }))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.commitTransaction()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 7:
                        error_1 = _a.sent();
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.rollbackTransaction()];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        rollbackError_1 = _a.sent();
                        return [3 /*break*/, 11];
                    case 11: throw error_1;
                    case 12: return [4 /*yield*/, this.query("PRAGMA foreign_keys = ON;")];
                    case 13:
                        _a.sent();
                        return [7 /*endfinally*/];
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    AbstractSqliteQueryRunner.prototype.enableSqlMemory = function () {
        this.sqlMemoryMode = true;
    };
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    AbstractSqliteQueryRunner.prototype.disableSqlMemory = function () {
        this.sqlsInMemory = [];
        this.sqlMemoryMode = false;
    };
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    AbstractSqliteQueryRunner.prototype.getMemorySql = function () {
        return this.sqlsInMemory;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Parametrizes given object of values. Used to create column=value queries.
     */
    AbstractSqliteQueryRunner.prototype.parametrize = function (objectLiteral, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        return Object.keys(objectLiteral).map(function (key, index) { return "\"" + key + "\"" + "=$" + (startIndex + index + 1); });
    };
    /**
     * Builds a query for create column.
     */
    AbstractSqliteQueryRunner.prototype.buildCreateColumnSql = function (column) {
        var c = "\"" + column.name + "\"";
        if (column instanceof ColumnMetadata_1.ColumnMetadata) {
            c += " " + this.driver.normalizeType(column);
        }
        else {
            c += " " + this.connection.driver.createFullType(column);
        }
        if (column.collation)
            c += " COLLATE " + column.collation;
        if (column.isNullable !== true)
            c += " NOT NULL";
        if (column.isUnique === true)
            c += " UNIQUE";
        if (column.isGenerated === true && column.generationStrategy === "increment") { // don't use skipPrimary here since updates can update already exist primary without auto inc.
            c += " PRIMARY KEY AUTOINCREMENT";
        }
        else if (column.isPrimary === true && column.isGenerated === true) {
            c += " PRIMARY KEY";
        }
        if (column.default !== undefined && column.default !== null) { // todo: same code in all drivers. make it DRY
            c += " DEFAULT (" + column.default + ")";
        }
        return c;
    };
    AbstractSqliteQueryRunner.prototype.recreateTable = function (table, oldTableSchema, migrateData) {
        if (migrateData === void 0) { migrateData = true; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var columnDefinitions, columnNames, sql1, primaryKeyColumns, oldColumnNames, sql2, sql3, sql4, indexPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnDefinitions = table.columns.map(function (dbColumn) { return _this.buildCreateColumnSql(dbColumn); }).join(", ");
                        columnNames = table.columns.map(function (column) { return "\"" + column.name + "\""; }).join(", ");
                        sql1 = "CREATE TABLE \"temporary_" + table.name + "\" (" + columnDefinitions;
                        // if (options && options.createForeignKeys) {
                        table.foreignKeys.forEach(function (foreignKey) {
                            var columnNames = foreignKey.columnNames.map(function (name) { return "\"" + name + "\""; }).join(", ");
                            var referencedColumnNames = foreignKey.referencedColumnNames.map(function (name) { return "\"" + name + "\""; }).join(", ");
                            sql1 += ", FOREIGN KEY(" + columnNames + ") REFERENCES \"" + foreignKey.referencedTableName + "\"(" + referencedColumnNames + ")";
                            if (foreignKey.onDelete)
                                sql1 += " ON DELETE " + foreignKey.onDelete;
                        });
                        primaryKeyColumns = table.columns.filter(function (column) { return column.isPrimary && !column.isGenerated; });
                        if (primaryKeyColumns.length > 0)
                            sql1 += ", PRIMARY KEY(" + primaryKeyColumns.map(function (column) { return "" + column.name; }).join(", ") + ")"; // for some reason column escaping here generate a wrong schema
                        sql1 += ")";
                        // todo: need also create uniques and indices?
                        // recreate a table with a temporary name
                        return [4 /*yield*/, this.query(sql1)];
                    case 1:
                        // todo: need also create uniques and indices?
                        // recreate a table with a temporary name
                        _a.sent();
                        oldColumnNames = oldTableSchema ? oldTableSchema.columns.map(function (column) { return "\"" + column.name + "\""; }).join(", ") : columnNames;
                        if (!migrateData) return [3 /*break*/, 3];
                        sql2 = "INSERT INTO \"temporary_" + table.name + "\"(" + oldColumnNames + ") SELECT " + oldColumnNames + " FROM \"" + table.name + "\"";
                        return [4 /*yield*/, this.query(sql2)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        sql3 = "DROP TABLE \"" + table.name + "\"";
                        return [4 /*yield*/, this.query(sql3)];
                    case 4:
                        _a.sent();
                        sql4 = "ALTER TABLE \"temporary_" + table.name + "\" RENAME TO \"" + table.name + "\"";
                        return [4 /*yield*/, this.query(sql4)];
                    case 5:
                        _a.sent();
                        indexPromises = table.indices.map(function (index) { return _this.createIndex(table.name, index); });
                        // const uniquePromises = table.uniqueKeys.map(key => this.createIndex(key));
                        return [4 /*yield*/, Promise.all(indexPromises /*.concat(uniquePromises)*/)];
                    case 6:
                        // const uniquePromises = table.uniqueKeys.map(key => this.createIndex(key));
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * If given value is a table name then it loads its table schema representation from the database.
     */
    AbstractSqliteQueryRunner.prototype.getTableSchema = function (tableOrName) {
        return __awaiter(this, void 0, void 0, function () {
            var table;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(tableOrName instanceof Table_1.Table)) return [3 /*break*/, 1];
                        return [2 /*return*/, tableOrName];
                    case 1: return [4 /*yield*/, this.getTable(tableOrName)];
                    case 2:
                        table = _a.sent();
                        if (!table)
                            throw new Error("Table named " + tableOrName + " was not found in the database.");
                        return [2 /*return*/, table];
                }
            });
        });
    };
    return AbstractSqliteQueryRunner;
}());
exports.AbstractSqliteQueryRunner = AbstractSqliteQueryRunner;

//# sourceMappingURL=AbstractSqliteQueryRunner.js.map
