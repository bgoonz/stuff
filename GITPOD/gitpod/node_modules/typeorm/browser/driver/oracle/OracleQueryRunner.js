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
import { TransactionAlreadyStartedError } from "../../error/TransactionAlreadyStartedError";
import { TransactionNotStartedError } from "../../error/TransactionNotStartedError";
import { TableColumn } from "../../schema-builder/schema/TableColumn";
import { Table } from "../../schema-builder/schema/Table";
import { TableForeignKey } from "../../schema-builder/schema/TableForeignKey";
import { TablePrimaryKey } from "../../schema-builder/schema/TablePrimaryKey";
import { TableIndex } from "../../schema-builder/schema/TableIndex";
import { QueryRunnerAlreadyReleasedError } from "../../error/QueryRunnerAlreadyReleasedError";
import { QueryFailedError } from "../../error/QueryFailedError";
/**
 * Runs queries on a single oracle database connection.
 *
 * todo: this driver is not 100% finished yet, need to fix all issues that are left
 */
var OracleQueryRunner = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function OracleQueryRunner(driver, mode) {
        if (mode === void 0) { mode = "master"; }
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
        /**
         * Indicates if special query runner mode in which sql queries won't be executed is enabled.
         */
        this.sqlMemoryMode = false;
        /**
         * Sql-s stored if "sql in memory" mode is enabled.
         */
        this.sqlsInMemory = [];
        this.driver = driver;
        this.connection = driver.connection;
        this.mode = mode;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    OracleQueryRunner.prototype.connect = function () {
        var _this = this;
        if (this.databaseConnection)
            return Promise.resolve(this.databaseConnection);
        if (this.databaseConnectionPromise)
            return this.databaseConnectionPromise;
        if (this.mode === "slave" && this.driver.isReplicated) {
            this.databaseConnectionPromise = this.driver.obtainSlaveConnection().then(function (connection) {
                _this.databaseConnection = connection;
                return _this.databaseConnection;
            });
        }
        else { // master
            this.databaseConnectionPromise = this.driver.obtainMasterConnection().then(function (connection) {
                _this.databaseConnection = connection;
                return _this.databaseConnection;
            });
        }
        return this.databaseConnectionPromise;
    };
    /**
     * Releases used database connection.
     * You cannot use query runner methods once its released.
     */
    OracleQueryRunner.prototype.release = function () {
        var _this = this;
        return new Promise(function (ok, fail) {
            _this.isReleased = true;
            if (_this.databaseConnection) {
                _this.databaseConnection.close(function (err) {
                    if (err)
                        return fail(err);
                    ok();
                });
            }
        });
    };
    /**
     * Starts transaction.
     */
    OracleQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (this.isTransactionActive)
                    throw new TransactionAlreadyStartedError();
                // await this.query("START TRANSACTION");
                this.isTransactionActive = true;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    OracleQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isTransactionActive)
                            throw new TransactionNotStartedError();
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
    OracleQueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isTransactionActive)
                            throw new TransactionNotStartedError();
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
    OracleQueryRunner.prototype.query = function (query, parameters) {
        var _this = this;
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError();
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var queryStartTime_1, handler, executionOptions, databaseConnection, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        queryStartTime_1 = +new Date();
                        handler = function (err, result) {
                            // log slow queries if maxQueryExecution time is set
                            var maxQueryExecutionTime = _this.driver.connection.options.maxQueryExecutionTime;
                            var queryEndTime = +new Date();
                            var queryExecutionTime = queryEndTime - queryStartTime_1;
                            if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime)
                                _this.driver.connection.logger.logQuerySlow(queryExecutionTime, query, parameters, _this);
                            if (err) {
                                _this.driver.connection.logger.logQueryError(err, query, parameters, _this);
                                return fail(new QueryFailedError(query, parameters, err));
                            }
                            ok(result.rows || result.outBinds);
                        };
                        executionOptions = {
                            autoCommit: this.isTransactionActive ? false : true
                        };
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        databaseConnection = _a.sent();
                        databaseConnection.execute(query, parameters || {}, executionOptions, handler);
                        return [3 /*break*/, 3];
                    case 2:
                        err_1 = _a.sent();
                        fail(err_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns raw data stream.
     */
    OracleQueryRunner.prototype.stream = function (query, parameters, onEnd, onError) {
        throw new Error("Stream is not supported by Oracle driver.");
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    OracleQueryRunner.prototype.insert = function (tableName, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var generatedColumn, keys, columns, values, parameters, generatedColumns, insertSql, sql2, saveResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(keyValues);
                        columns = keys.map(function (key) { return "\"" + key + "\""; }).join(", ");
                        values = keys.map(function (key) { return ":" + key; }).join(", ");
                        parameters = keys.map(function (key) { return keyValues[key]; });
                        generatedColumns = this.connection.hasMetadata(tableName) ? this.connection.getMetadata(tableName).generatedColumns : [];
                        if (generatedColumns.length > 0)
                            generatedColumn = generatedColumns.find(function (column) { return column.isPrimary && column.isGenerated; });
                        insertSql = columns.length > 0
                            ? "INSERT INTO \"" + tableName + "\" (" + columns + ") VALUES (" + values + ")"
                            : "INSERT INTO \"" + tableName + "\" DEFAULT VALUES";
                        if (!generatedColumn) return [3 /*break*/, 2];
                        sql2 = "declare lastId number; begin " + insertSql + " returning \"" + generatedColumn.databaseName + "\" into lastId; dbms_output.enable; dbms_output.put_line(lastId); dbms_output.get_line(:ln, :st); end;";
                        return [4 /*yield*/, this.query(sql2, parameters.concat([
                                { dir: this.driver.oracle.BIND_OUT, type: this.driver.oracle.STRING, maxSize: 32767 },
                                { dir: this.driver.oracle.BIND_OUT, type: this.driver.oracle.NUMBER }
                            ]))];
                    case 1:
                        saveResult = _a.sent();
                        return [2 /*return*/, parseInt(saveResult[0])];
                    case 2: return [2 /*return*/, this.query(insertSql, parameters)];
                }
            });
        });
    };
    /**
     * Updates rows that match given conditions in the given table.
     */
    OracleQueryRunner.prototype.update = function (tableName, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            var updateValues, conditionString, sql, conditionParams, updateParams, allParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateValues = this.parametrize(valuesMap).join(", ");
                        conditionString = this.parametrize(conditions).join(" AND ");
                        sql = "UPDATE \"" + tableName + "\" SET " + updateValues + " " + (conditionString ? (" WHERE " + conditionString) : "");
                        conditionParams = Object.keys(conditions).map(function (key) { return conditions[key]; });
                        updateParams = Object.keys(valuesMap).map(function (key) { return valuesMap[key]; });
                        allParameters = updateParams.concat(conditionParams);
                        return [4 /*yield*/, this.query(sql, allParameters)];
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
    OracleQueryRunner.prototype.delete = function (tableName, conditions, maybeParameters) {
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
     * Inserts rows into the closure table.
     */
    OracleQueryRunner.prototype.insertIntoClosureTable = function (tableName, newEntityId, parentId, hasLevel) {
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
                            sql = "INSERT INTO \"" + tableName + "\" (\"ancestor\", \"descendant\") " +
                                ("SELECT \"ancestor\", " + newEntityId + " FROM \"" + tableName + "\" WHERE \"descendant\" = " + parentId + " ") +
                                ("UNION ALL SELECT " + newEntityId + ", " + newEntityId);
                        }
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.query("SELECT MAX(\"level\") as \"level\" FROM \"" + tableName + "\" WHERE \"descendant\" = " + parentId)];
                    case 2:
                        results = _a.sent();
                        return [2 /*return*/, results && results[0] && results[0]["level"] ? parseInt(results[0]["level"]) + 1 : 1];
                }
            });
        });
    };
    /**
     * Loads given table's data from the database.
     */
    OracleQueryRunner.prototype.getTable = function (tableName) {
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
    OracleQueryRunner.prototype.getTables = function (tableNames) {
        return __awaiter(this, void 0, void 0, function () {
            var tableNamesString, tablesSql, columnsSql, indicesSql, constraintsSql, _a, dbTables, dbColumns, dbIndices, constraints;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // if no tables given then no need to proceed
                        if (!tableNames || !tableNames.length)
                            return [2 /*return*/, []];
                        tableNamesString = tableNames.map(function (name) { return "'" + name + "'"; }).join(", ");
                        tablesSql = "SELECT TABLE_NAME FROM user_tables WHERE TABLE_NAME IN (" + tableNamesString + ")";
                        columnsSql = "SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE, DATA_LENGTH, DATA_PRECISION, DATA_SCALE, NULLABLE, IDENTITY_COLUMN FROM all_tab_cols WHERE TABLE_NAME IN (" + tableNamesString + ")";
                        indicesSql = "SELECT ind.INDEX_NAME, ind.TABLE_NAME, ind.UNIQUENESS, LISTAGG(cols.COLUMN_NAME, ',') WITHIN GROUP (ORDER BY cols.COLUMN_NAME) AS COLUMN_NAMES\n                                FROM USER_INDEXES ind, USER_IND_COLUMNS cols \n                                WHERE ind.INDEX_NAME = cols.INDEX_NAME AND ind.TABLE_NAME IN (" + tableNamesString + ")\n                                GROUP BY ind.INDEX_NAME, ind.TABLE_NAME, ind.UNIQUENESS";
                        constraintsSql = "SELECT cols.table_name, cols.column_name, cols.position, cons.constraint_type, cons.constraint_name\nFROM all_constraints cons, all_cons_columns cols WHERE cols.table_name IN (" + tableNamesString + ") \nAND cons.constraint_name = cols.constraint_name AND cons.owner = cols.owner ORDER BY cols.table_name, cols.position";
                        return [4 /*yield*/, Promise.all([
                                this.query(tablesSql),
                                this.query(columnsSql),
                                this.query(indicesSql),
                                // this.query(foreignKeysSql),
                                // this.query(uniqueKeysSql),
                                this.query(constraintsSql),
                            ])];
                    case 1:
                        _a = _b.sent(), dbTables = _a[0], dbColumns = _a[1], dbIndices = _a[2], constraints = _a[3];
                        // if tables were not found in the db, no need to proceed
                        if (!dbTables.length)
                            return [2 /*return*/, []];
                        // create tables for loaded tables
                        return [2 /*return*/, dbTables.map(function (dbTable) {
                                var table = new Table(dbTable["TABLE_NAME"]);
                                // create columns from the loaded columns
                                table.columns = dbColumns
                                    .filter(function (dbColumn) { return dbColumn["TABLE_NAME"] === table.name; })
                                    .map(function (dbColumn) {
                                    var isPrimary = !!constraints
                                        .find(function (constraint) {
                                        return constraint["TABLE_NAME"] === table.name &&
                                            constraint["CONSTRAINT_TYPE"] === "P" &&
                                            constraint["COLUMN_NAME"] === dbColumn["COLUMN_NAME"];
                                    });
                                    // TODO fix
                                    var columnType = dbColumn["DATA_TYPE"].toLowerCase();
                                    if (dbColumn["DATA_TYPE"].toLowerCase() === "varchar2" && dbColumn["DATA_LENGTH"] !== null) {
                                        columnType += "(" + dbColumn["DATA_LENGTH"] + ")";
                                    }
                                    else if (dbColumn["DATA_PRECISION"] !== null && dbColumn["DATA_SCALE"] !== null) {
                                        columnType += "(" + dbColumn["DATA_PRECISION"] + "," + dbColumn["DATA_SCALE"] + ")";
                                    }
                                    else if (dbColumn["DATA_SCALE"] !== null) {
                                        columnType += "(0," + dbColumn["DATA_SCALE"] + ")";
                                    }
                                    else if (dbColumn["DATA_PRECISION"] !== null) {
                                        columnType += "(" + dbColumn["DATA_PRECISION"] + ")";
                                    }
                                    var tableColumn = new TableColumn();
                                    tableColumn.name = dbColumn["COLUMN_NAME"];
                                    tableColumn.type = columnType;
                                    tableColumn.default = dbColumn["COLUMN_DEFAULT"] !== null && dbColumn["COLUMN_DEFAULT"] !== undefined ? dbColumn["COLUMN_DEFAULT"] : undefined;
                                    tableColumn.isNullable = dbColumn["NULLABLE"] !== "N";
                                    tableColumn.isPrimary = isPrimary;
                                    tableColumn.isGenerated = dbColumn["IDENTITY_COLUMN"] === "YES"; // todo
                                    tableColumn.comment = ""; // todo
                                    return tableColumn;
                                });
                                // create primary key schema
                                table.primaryKeys = constraints
                                    .filter(function (constraint) {
                                    return constraint["TABLE_NAME"] === table.name && constraint["CONSTRAINT_TYPE"] === "P";
                                })
                                    .map(function (constraint) {
                                    return new TablePrimaryKey(constraint["CONSTRAINT_NAME"], constraint["COLUMN_NAME"]);
                                });
                                // create foreign key schemas from the loaded indices
                                table.foreignKeys = constraints
                                    .filter(function (constraint) { return constraint["TABLE_NAME"] === table.name && constraint["CONSTRAINT_TYPE"] === "R"; })
                                    .map(function (constraint) { return new TableForeignKey(constraint["CONSTRAINT_NAME"], [], [], "", ""); }); // todo: fix missing params
                                // create index schemas from the loaded indices
                                table.indices = dbIndices
                                    .filter(function (dbIndex) {
                                    return dbIndex["TABLE_NAME"] === table.name &&
                                        (!table.foreignKeys.find(function (foreignKey) { return foreignKey.name === dbIndex["INDEX_NAME"]; })) &&
                                        (!table.primaryKeys.find(function (primaryKey) { return primaryKey.name === dbIndex["INDEX_NAME"]; }));
                                })
                                    .map(function (dbIndex) {
                                    return new TableIndex(dbTable["TABLE_NAME"], dbIndex["INDEX_NAME"], dbIndex["COLUMN_NAMES"], !!(dbIndex["COLUMN_NAMES"] === "UNIQUE"));
                                });
                                return table;
                            })];
                }
            });
        });
    };
    /**
     * Checks if database with the given name exist.
     */
    OracleQueryRunner.prototype.hasDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve(false)];
            });
        });
    };
    /**
     * Checks if table with the given name exist in the database.
     */
    OracleQueryRunner.prototype.hasTable = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "SELECT TABLE_NAME FROM user_tables WHERE TABLE_NAME = '" + tableName + "'";
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
    OracleQueryRunner.prototype.createDatabase = function (database) {
        return this.query("CREATE DATABASE IF NOT EXISTS " + database);
    };
    /**
     * Creates a schema if it's not created.
     */
    OracleQueryRunner.prototype.createSchema = function (schemas) {
        return Promise.resolve([]);
    };
    /**
     * Creates a new table from the given table metadata and column metadatas.
     */
    OracleQueryRunner.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var columnDefinitions, sql, primaryKeyColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnDefinitions = table.columns.map(function (column) { return _this.buildCreateColumnSql(column); }).join(", ");
                        sql = "CREATE TABLE \"" + table.name + "\" (" + columnDefinitions;
                        primaryKeyColumns = table.columns.filter(function (column) { return column.isPrimary; });
                        if (primaryKeyColumns.length > 0)
                            sql += ", PRIMARY KEY(" + primaryKeyColumns.map(function (column) { return "\"" + column.name + "\""; }).join(", ") + ")";
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
    OracleQueryRunner.prototype.dropTable = function (tableName) {
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
    OracleQueryRunner.prototype.hasColumn = function (tableName, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "SELECT COLUMN_NAME FROM all_tab_cols WHERE TABLE_NAME = '" + tableName + "' AND COLUMN_NAME = '" + columnName + "'";
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.length ? true : false];
                }
            });
        });
    };
    /**
     * Creates a new column from the column in the table.
     */
    OracleQueryRunner.prototype.addColumn = function (tableOrName, column) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sql;
            return __generator(this, function (_a) {
                tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;
                sql = "ALTER TABLE \"" + tableName + "\" ADD " + this.buildCreateColumnSql(column);
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Creates a new columns from the column in the table.
     */
    OracleQueryRunner.prototype.addColumns = function (tableOrName, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var queries;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queries = columns.map(function (column) { return _this.addColumn(tableOrName, column); });
                        return [4 /*yield*/, Promise.all(queries)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Renames column in the given table.
     */
    OracleQueryRunner.prototype.renameColumn = function (tableOrName, oldTableColumnOrName, newTableColumnOrName) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn, newColumn;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        if (!(tableOrName instanceof Table)) return [3 /*break*/, 1];
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
                        if (oldTableColumnOrName instanceof TableColumn) {
                            oldColumn = oldTableColumnOrName;
                        }
                        else {
                            oldColumn = table.columns.find(function (column) { return column.name === oldTableColumnOrName; });
                        }
                        if (!oldColumn)
                            throw new Error("Column \"" + oldTableColumnOrName + "\" was not found in the \"" + tableOrName + "\" table.");
                        newColumn = undefined;
                        if (newTableColumnOrName instanceof TableColumn) {
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
    OracleQueryRunner.prototype.changeColumn = function (tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn, dropPrimarySql, dropSql, createSql, sql, sql, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        if (!(tableOrName instanceof Table)) return [3 /*break*/, 1];
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
                        if (oldTableColumnOrName instanceof TableColumn) {
                            oldColumn = oldTableColumnOrName;
                        }
                        else {
                            oldColumn = table.columns.find(function (column) { return column.name === oldTableColumnOrName; });
                        }
                        if (!oldColumn)
                            throw new Error("Column \"" + oldTableColumnOrName + "\" was not found in the \"" + tableOrName + "\" table.");
                        if (!(newColumn.isGenerated !== oldColumn.isGenerated)) return [3 /*break*/, 10];
                        if (!newColumn.isGenerated) return [3 /*break*/, 8];
                        if (!(table.primaryKeys.length > 0 && oldColumn.isPrimary)) return [3 /*break*/, 5];
                        dropPrimarySql = "ALTER TABLE \"" + table.name + "\" DROP CONSTRAINT \"" + table.primaryKeys[0].name + "\"";
                        return [4 /*yield*/, this.query(dropPrimarySql)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        dropSql = "ALTER TABLE \"" + table.name + "\" DROP COLUMN \"" + newColumn.name + "\"";
                        return [4 /*yield*/, this.query(dropSql)];
                    case 6:
                        _a.sent();
                        createSql = "ALTER TABLE \"" + table.name + "\" ADD " + this.buildCreateColumnSql(newColumn);
                        return [4 /*yield*/, this.query(createSql)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 8:
                        sql = "ALTER TABLE \"" + table.name + "\" MODIFY \"" + newColumn.name + "\" DROP IDENTITY";
                        return [4 /*yield*/, this.query(sql)];
                    case 9:
                        _a.sent();
                        _a.label = 10;
                    case 10:
                        if (!(newColumn.isNullable !== oldColumn.isNullable)) return [3 /*break*/, 12];
                        sql = "ALTER TABLE \"" + table.name + "\" MODIFY \"" + newColumn.name + "\" " + this.connection.driver.createFullType(newColumn) + " " + (newColumn.isNullable ? "NULL" : "NOT NULL");
                        return [4 /*yield*/, this.query(sql)];
                    case 11:
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 12:
                        if (!(this.connection.driver.createFullType(newColumn) !== this.connection.driver.createFullType(oldColumn))) return [3 /*break*/, 14];
                        sql = "ALTER TABLE \"" + table.name + "\" MODIFY \"" + newColumn.name + "\" " + this.connection.driver.createFullType(newColumn);
                        return [4 /*yield*/, this.query(sql)];
                    case 13:
                        _a.sent();
                        _a.label = 14;
                    case 14: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    OracleQueryRunner.prototype.changeColumns = function (table, changedColumns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var updatePromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updatePromises = changedColumns.map(function (changedColumn) { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                return [2 /*return*/, this.changeColumn(table, changedColumn.oldColumn, changedColumn.newColumn)];
                            });
                        }); });
                        return [4 /*yield*/, Promise.all(updatePromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops column in the table.
     */
    OracleQueryRunner.prototype.dropColumn = function (table, column) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.query("ALTER TABLE \"" + table.name + "\" DROP COLUMN \"" + column.name + "\"")];
            });
        });
    };
    /**
     * Drops the columns in the table.
     */
    OracleQueryRunner.prototype.dropColumns = function (table, columns) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var dropPromises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        dropPromises = columns.map(function (column) { return _this.dropColumn(table, column); });
                        return [4 /*yield*/, Promise.all(dropPromises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Updates table's primary keys.
     */
    OracleQueryRunner.prototype.updatePrimaryKeys = function (dbTable) {
        return __awaiter(this, void 0, void 0, function () {
            var primaryColumnNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        primaryColumnNames = dbTable.primaryKeys.map(function (primaryKey) { return "\"" + primaryKey.columnName + "\""; });
                        if (!(dbTable.primaryKeys.length > 0 && dbTable.primaryKeys[0].name)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.query("ALTER TABLE \"" + dbTable.name + "\" DROP CONSTRAINT \"" + dbTable.primaryKeys[0].name + "\"")];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!(primaryColumnNames.length > 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.query("ALTER TABLE \"" + dbTable.name + "\" ADD PRIMARY KEY (" + primaryColumnNames.join(", ") + ")")];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new foreign key.
     */
    OracleQueryRunner.prototype.createForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, columnNames, referencedColumnNames, sql;
            return __generator(this, function (_a) {
                tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;
                columnNames = foreignKey.columnNames.map(function (column) { return "\"" + column + "\""; }).join(", ");
                referencedColumnNames = foreignKey.referencedColumnNames.map(function (column) { return "\"" + column + "\""; }).join(",");
                sql = "ALTER TABLE \"" + tableName + "\" ADD CONSTRAINT \"" + foreignKey.name + "\" " +
                    ("FOREIGN KEY (" + columnNames + ") ") +
                    ("REFERENCES \"" + foreignKey.referencedTableName + "\"(" + referencedColumnNames + ")");
                if (foreignKey.onDelete)
                    sql += " ON DELETE " + foreignKey.onDelete;
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Creates a new foreign keys.
     */
    OracleQueryRunner.prototype.createForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = foreignKeys.map(function (foreignKey) { return _this.createForeignKey(tableOrName, foreignKey); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops a foreign key from the table.
     */
    OracleQueryRunner.prototype.dropForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sql;
            return __generator(this, function (_a) {
                tableName = tableOrName instanceof Table ? tableOrName.name : tableOrName;
                sql = "ALTER TABLE \"" + tableName + "\" DROP CONSTRAINT \"" + foreignKey.name + "\"";
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Drops a foreign keys from the table.
     */
    OracleQueryRunner.prototype.dropForeignKeys = function (tableOrName, foreignKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = foreignKeys.map(function (foreignKey) { return _this.dropForeignKey(tableOrName, foreignKey); });
                        return [4 /*yield*/, Promise.all(promises)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new index.
     */
    OracleQueryRunner.prototype.createIndex = function (table, index) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columns = index.columnNames.map(function (columnName) { return "\"" + columnName + "\""; }).join(", ");
                        sql = "CREATE " + (index.isUnique ? "UNIQUE" : "") + " INDEX \"" + index.name + "\" ON \"" + (table instanceof Table ? table.name : table) + "\"(" + columns + ")";
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
    OracleQueryRunner.prototype.dropIndex = function (tableSchemeOrName, indexName) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tableName = tableSchemeOrName instanceof Table ? tableSchemeOrName.name : tableSchemeOrName;
                        sql = "ALTER TABLE \"" + tableName + "\" DROP INDEX \"" + indexName + "\"";
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
    OracleQueryRunner.prototype.truncate = function (tableName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("TRUNCATE TABLE \"" + tableName + "\"")];
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
    OracleQueryRunner.prototype.clearDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var disableForeignKeysCheckQuery, dropTablesQuery, enableForeignKeysCheckQuery, dropQueries, error_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.startTransaction()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 8, , 13]);
                        disableForeignKeysCheckQuery = "SET FOREIGN_KEY_CHECKS = 0;";
                        dropTablesQuery = "SELECT concat('DROP TABLE IF EXISTS \"', table_name, '\";') AS query FROM information_schema.tables WHERE table_schema = '" + this.dbName + "'";
                        enableForeignKeysCheckQuery = "SET FOREIGN_KEY_CHECKS = 1;";
                        return [4 /*yield*/, this.query(disableForeignKeysCheckQuery)];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, this.query(dropTablesQuery)];
                    case 4:
                        dropQueries = _a.sent();
                        return [4 /*yield*/, Promise.all(dropQueries.map(function (query) { return _this.query(query["query"]); }))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, this.query(enableForeignKeysCheckQuery)];
                    case 6:
                        _a.sent();
                        return [4 /*yield*/, this.commitTransaction()];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 13];
                    case 8:
                        error_1 = _a.sent();
                        _a.label = 9;
                    case 9:
                        _a.trys.push([9, 11, , 12]);
                        return [4 /*yield*/, this.rollbackTransaction()];
                    case 10:
                        _a.sent();
                        return [3 /*break*/, 12];
                    case 11:
                        rollbackError_1 = _a.sent();
                        return [3 /*break*/, 12];
                    case 12: throw error_1;
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    OracleQueryRunner.prototype.enableSqlMemory = function () {
        this.sqlMemoryMode = true;
    };
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    OracleQueryRunner.prototype.disableSqlMemory = function () {
        this.sqlsInMemory = [];
        this.sqlMemoryMode = false;
    };
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    OracleQueryRunner.prototype.getMemorySql = function () {
        return this.sqlsInMemory;
    };
    Object.defineProperty(OracleQueryRunner.prototype, "dbName", {
        // -------------------------------------------------------------------------
        // Protected Methods
        // -------------------------------------------------------------------------
        /**
         * Database name shortcut.
         */
        get: function () {
            return this.driver.options.schema;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Parametrizes given object of values. Used to create column=value queries.
     */
    OracleQueryRunner.prototype.parametrize = function (objectLiteral) {
        return Object.keys(objectLiteral).map(function (key) { return "\"" + key + "\"=:" + key; });
    };
    /**
     * Builds a query for create column.
     */
    OracleQueryRunner.prototype.buildCreateColumnSql = function (column) {
        var c = "\"" + column.name + "\" " + this.connection.driver.createFullType(column);
        if (column.charset)
            c += " CHARACTER SET " + column.charset;
        if (column.collation)
            c += " COLLATE " + column.collation;
        if (column.isNullable !== true && !column.isGenerated) // NOT NULL is not supported with GENERATED
            c += " NOT NULL";
        // if (column.isPrimary === true && addPrimary)
        //     c += " PRIMARY KEY";
        if (column.isGenerated === true) // don't use skipPrimary here since updates can update already exist primary without auto inc.
            c += " GENERATED BY DEFAULT ON NULL AS IDENTITY";
        // if (column.comment) // todo: less priority, fix it later
        //     c += " COMMENT '" + column.comment + "'";
        if (column.default !== undefined && column.default !== null) { // todo: same code in all drivers. make it DRY
            c += " DEFAULT " + column.default;
        }
        return c;
    };
    return OracleQueryRunner;
}());
export { OracleQueryRunner };

//# sourceMappingURL=OracleQueryRunner.js.map
