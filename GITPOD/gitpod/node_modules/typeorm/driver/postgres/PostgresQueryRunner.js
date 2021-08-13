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
var Table_1 = require("../../schema-builder/schema/Table");
var TableIndex_1 = require("../../schema-builder/schema/TableIndex");
var TableForeignKey_1 = require("../../schema-builder/schema/TableForeignKey");
var TablePrimaryKey_1 = require("../../schema-builder/schema/TablePrimaryKey");
var QueryRunnerAlreadyReleasedError_1 = require("../../error/QueryRunnerAlreadyReleasedError");
var QueryFailedError_1 = require("../../error/QueryFailedError");
var OrmUtils_1 = require("../../util/OrmUtils");
/**
 * Runs queries on a single postgres database connection.
 */
var PostgresQueryRunner = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function PostgresQueryRunner(driver, mode) {
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
    PostgresQueryRunner.prototype.connect = function () {
        var _this = this;
        if (this.databaseConnection)
            return Promise.resolve(this.databaseConnection);
        if (this.databaseConnectionPromise)
            return this.databaseConnectionPromise;
        if (this.mode === "slave" && this.driver.isReplicated) {
            this.databaseConnectionPromise = this.driver.obtainSlaveConnection().then(function (_a) {
                var connection = _a[0], release = _a[1];
                _this.driver.connectedQueryRunners.push(_this);
                _this.databaseConnection = connection;
                _this.releaseCallback = release;
                return _this.databaseConnection;
            });
        }
        else { // master
            this.databaseConnectionPromise = this.driver.obtainMasterConnection().then(function (_a) {
                var connection = _a[0], release = _a[1];
                _this.driver.connectedQueryRunners.push(_this);
                _this.databaseConnection = connection;
                _this.releaseCallback = release;
                return _this.databaseConnection;
            });
        }
        return this.databaseConnectionPromise;
    };
    /**
     * Releases used database connection.
     * You cannot use query runner methods once its released.
     */
    PostgresQueryRunner.prototype.release = function () {
        this.isReleased = true;
        if (this.releaseCallback)
            this.releaseCallback();
        var index = this.driver.connectedQueryRunners.indexOf(this);
        if (index !== -1)
            this.driver.connectedQueryRunners.splice(index);
        return Promise.resolve();
    };
    /**
     * Starts transaction.
     */
    PostgresQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isTransactionActive)
                            throw new TransactionAlreadyStartedError_1.TransactionAlreadyStartedError();
                        this.isTransactionActive = true;
                        return [4 /*yield*/, this.query("START TRANSACTION")];
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
    PostgresQueryRunner.prototype.commitTransaction = function () {
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
    PostgresQueryRunner.prototype.rollbackTransaction = function () {
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
    PostgresQueryRunner.prototype.query = function (query, parameters) {
        var _this = this;
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError_1.QueryRunnerAlreadyReleasedError();
        // console.log("query: ", query);
        // console.log("parameters: ", parameters);
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var databaseConnection, queryStartTime;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        databaseConnection = _a.sent();
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        queryStartTime = +new Date();
                        databaseConnection.query(query, parameters, function (err, result) {
                            // log slow queries if maxQueryExecution time is set
                            var maxQueryExecutionTime = _this.driver.connection.options.maxQueryExecutionTime;
                            var queryEndTime = +new Date();
                            var queryExecutionTime = queryEndTime - queryStartTime;
                            if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime)
                                _this.driver.connection.logger.logQuerySlow(queryExecutionTime, query, parameters, _this);
                            if (err) {
                                _this.driver.connection.logger.logQueryError(err, query, parameters, _this);
                                fail(new QueryFailedError_1.QueryFailedError(query, parameters, err));
                            }
                            else {
                                ok(result.rows);
                            }
                        });
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Returns raw data stream.
     */
    PostgresQueryRunner.prototype.stream = function (query, parameters, onEnd, onError) {
        var _this = this;
        var QueryStream = this.driver.loadStreamDependency();
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError_1.QueryRunnerAlreadyReleasedError();
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var databaseConnection, stream, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        databaseConnection = _a.sent();
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        stream = databaseConnection.query(new QueryStream(query, parameters));
                        if (onEnd)
                            stream.on("end", onEnd);
                        if (onError)
                            stream.on("error", onError);
                        ok(stream);
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
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    PostgresQueryRunner.prototype.insert = function (tablePath, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, columns, values, generatedColumns, generatedColumnNames, generatedColumnSql, sql, parameters, result, generatedMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(keyValues);
                        columns = keys.map(function (key) { return "\"" + key + "\""; }).join(", ");
                        values = keys.map(function (key, index) { return "$" + (index + 1); }).join(",");
                        generatedColumns = this.connection.hasMetadata(tablePath) ? this.connection.getMetadata(tablePath).generatedColumns : [];
                        generatedColumnNames = generatedColumns.map(function (generatedColumn) { return "\"" + generatedColumn.databaseName + "\""; }).join(", ");
                        generatedColumnSql = generatedColumns.length > 0 ? " RETURNING " + generatedColumnNames : "";
                        sql = columns.length > 0
                            ? "INSERT INTO " + this.escapeTablePath(tablePath) + "(" + columns + ") VALUES (" + values + ") " + generatedColumnSql
                            : "INSERT INTO " + this.escapeTablePath(tablePath) + " DEFAULT VALUES " + generatedColumnSql;
                        parameters = keys.map(function (key) { return keyValues[key]; });
                        return [4 /*yield*/, this.query(sql, parameters)];
                    case 1:
                        result = _a.sent();
                        generatedMap = generatedColumns.reduce(function (map, column) {
                            var valueMap = column.createValueMap(result[0][column.databaseName]);
                            return OrmUtils_1.OrmUtils.mergeDeep(map, valueMap);
                        }, {});
                        return [2 /*return*/, {
                                result: result,
                                generatedMap: Object.keys(generatedMap).length > 0 ? generatedMap : undefined
                            }];
                }
            });
        });
    };
    /**
     * Updates rows that match given conditions in the given table.
     */
    PostgresQueryRunner.prototype.update = function (tablePath, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            var updateValues, conditionString, query, updateParams, conditionParams, allParameters;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        updateValues = this.parametrize(valuesMap).join(", ");
                        conditionString = this.parametrize(conditions, Object.keys(valuesMap).length).join(" AND ");
                        query = "UPDATE " + this.escapeTablePath(tablePath) + " SET " + updateValues + (conditionString ? (" WHERE " + conditionString) : "");
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
    PostgresQueryRunner.prototype.delete = function (tablePath, conditions, maybeParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var conditionString, parameters, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditionString = typeof conditions === "string" ? conditions : this.parametrize(conditions).join(" AND ");
                        parameters = conditions instanceof Object ? Object.keys(conditions).map(function (key) { return conditions[key]; }) : maybeParameters;
                        sql = "DELETE FROM " + this.escapeTablePath(tablePath) + " WHERE " + conditionString;
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
     *
     * todo: rethink its place
     */
    PostgresQueryRunner.prototype.insertIntoClosureTable = function (tablePath, newEntityId, parentId, hasLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "";
                        if (hasLevel) {
                            sql = "INSERT INTO " + this.escapeTablePath(tablePath) + "(\"ancestor\", \"descendant\", \"level\") " +
                                ("SELECT \"ancestor\", " + newEntityId + ", \"level\" + 1 FROM " + this.escapeTablePath(tablePath) + " WHERE \"descendant\" = " + parentId + " ") +
                                ("UNION ALL SELECT " + newEntityId + ", " + newEntityId + ", 1");
                        }
                        else {
                            sql = "INSERT INTO " + this.escapeTablePath(tablePath) + "(\"ancestor\", \"descendant\") " +
                                ("SELECT \"ancestor\", " + newEntityId + " FROM " + this.escapeTablePath(tablePath) + " WHERE \"descendant\" = " + parentId + " ") +
                                ("UNION ALL SELECT " + newEntityId + ", " + newEntityId);
                        }
                        return [4 /*yield*/, this.query(sql)];
                    case 1:
                        _a.sent();
                        if (!hasLevel) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.query("SELECT MAX(level) as level FROM " + this.escapeTablePath(tablePath) + " WHERE descendant = " + parentId)];
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
    PostgresQueryRunner.prototype.getTable = function (tablePath) {
        return __awaiter(this, void 0, void 0, function () {
            var tables;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getTables([tablePath])];
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
    PostgresQueryRunner.prototype.getTables = function (tablePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tableNames, currentSchemaQuery, currentSchema, schemaNames, tableNamesString, schemaNamesString, tablesCondition, tablesSql, columnsSql, indicesSql, foreignKeysSql, uniqueKeysSql, primaryKeysSql, _a, dbTables, dbColumns, dbIndices, dbForeignKeys, dbUniqueKeys, primaryKeys;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // if no tables given then no need to proceed
                        if (!tablePaths || !tablePaths.length)
                            return [2 /*return*/, []];
                        tableNames = tablePaths.map(function (tablePath) {
                            return tablePath.indexOf(".") === -1 ? tablePath : tablePath.split(".")[1];
                        });
                        return [4 /*yield*/, this.query("SELECT * FROM current_schema()")];
                    case 1:
                        currentSchemaQuery = _b.sent();
                        currentSchema = currentSchemaQuery[0]["current_schema"];
                        schemaNames = tablePaths
                            .filter(function (tablePath) { return tablePath.indexOf(".") !== -1; })
                            .map(function (tablePath) { return tablePath.split(".")[0]; });
                        schemaNames.push(this.driver.options.schema || currentSchema);
                        tableNamesString = tableNames.map(function (name) { return "'" + name + "'"; }).join(", ");
                        schemaNamesString = schemaNames.map(function (name) { return "'" + name + "'"; }).join(", ");
                        tablesCondition = tablePaths.map(function (tablePath) {
                            var _a = tablePath.split("."), schemaName = _a[0], tableName = _a[1];
                            if (!tableName) {
                                tableName = schemaName;
                                schemaName = _this.driver.options.schema || currentSchema;
                            }
                            return "table_schema = '" + schemaName + "' AND table_name = '" + tableName + "'";
                        }).join(" OR ");
                        tablesSql = "SELECT * FROM information_schema.tables WHERE " + tablesCondition;
                        columnsSql = "SELECT * FROM information_schema.columns WHERE table_schema IN (" + schemaNamesString + ")";
                        indicesSql = "SELECT t.relname AS table_name, i.relname AS index_name, a.attname AS column_name, ix.indisunique AS is_unique, a.attnum, ix.indkey FROM pg_class t, pg_class i, pg_index ix, pg_attribute a, pg_namespace ns\nWHERE t.oid = ix.indrelid AND i.oid = ix.indexrelid AND a.attrelid = t.oid\nAND a.attnum = ANY(ix.indkey) AND t.relkind = 'r' AND t.relname IN (" + tableNamesString + ") AND t.relnamespace = ns.OID AND ns.nspname IN (" + schemaNamesString + ") ORDER BY t.relname, i.relname";
                        foreignKeysSql = "SELECT table_name, constraint_name FROM information_schema.table_constraints WHERE table_schema IN (" + schemaNamesString + ") AND constraint_type = 'FOREIGN KEY'";
                        uniqueKeysSql = "SELECT * FROM information_schema.table_constraints WHERE table_schema IN (" + schemaNamesString + ") AND constraint_type = 'UNIQUE'";
                        primaryKeysSql = "SELECT c.column_name, tc.table_name, tc.constraint_name FROM information_schema.table_constraints tc\nJOIN information_schema.constraint_column_usage AS ccu USING (constraint_schema, constraint_name)\nJOIN information_schema.columns AS c ON c.table_schema = tc.constraint_schema AND tc.table_name = c.table_name AND ccu.column_name = c.column_name\nwhere constraint_type = 'PRIMARY KEY' AND c.table_schema IN (" + schemaNamesString + ")";
                        return [4 /*yield*/, Promise.all([
                                this.query(tablesSql),
                                this.query(columnsSql),
                                this.query(indicesSql),
                                this.query(foreignKeysSql),
                                this.query(uniqueKeysSql),
                                this.query(primaryKeysSql),
                            ])];
                    case 2:
                        _a = _b.sent(), dbTables = _a[0], dbColumns = _a[1], dbIndices = _a[2], dbForeignKeys = _a[3], dbUniqueKeys = _a[4], primaryKeys = _a[5];
                        // if tables were not found in the db, no need to proceed
                        if (!dbTables.length)
                            return [2 /*return*/, []];
                        // create tables for loaded tables
                        return [2 /*return*/, dbTables.map(function (dbTable) {
                                var table = new Table_1.Table(dbTable["table_name"]);
                                table.database = dbTable["table_catalog"];
                                table.schema = dbTable["table_schema"];
                                // create columns from the loaded columns
                                table.columns = dbColumns
                                    .filter(function (dbColumn) { return dbColumn["table_name"] === table.name; })
                                    .map(function (dbColumn) {
                                    var seqName = table.schema === currentSchema
                                        ? dbColumn["table_name"] + "_" + dbColumn["column_name"] + "_seq"
                                        : table.schema + "." + dbColumn["table_name"] + "_" + dbColumn["column_name"] + "_seq";
                                    var isGenerated = !!dbColumn["column_default"]
                                        && (dbColumn["column_default"].replace(/"/gi, "") === "nextval('" + seqName + "'::regclass)" || /^uuid\_generate\_v\d\(\)/.test(dbColumn["column_default"]));
                                    var tableColumn = new TableColumn_1.TableColumn();
                                    tableColumn.name = dbColumn["column_name"];
                                    tableColumn.type = dbColumn["data_type"].toLowerCase();
                                    tableColumn.length = dbColumn["character_maximum_length"] ? dbColumn["character_maximum_length"].toString() : "";
                                    tableColumn.precision = dbColumn["numeric_precision"];
                                    tableColumn.scale = dbColumn["numeric_scale"];
                                    tableColumn.default = dbColumn["column_default"] !== null && dbColumn["column_default"] !== undefined ? dbColumn["column_default"].replace(/::character varying/, "") : undefined;
                                    tableColumn.isNullable = dbColumn["is_nullable"] === "YES";
                                    // tableColumn.isPrimary = dbColumn["column_key"].indexOf("PRI") !== -1;
                                    tableColumn.isGenerated = isGenerated;
                                    tableColumn.comment = ""; // dbColumn["COLUMN_COMMENT"];
                                    tableColumn.charset = dbColumn["character_set_name"];
                                    tableColumn.collation = dbColumn["collation_name"];
                                    tableColumn.isUnique = !!dbUniqueKeys.find(function (key) { return key["constraint_name"] === "uk_" + dbColumn["table_name"] + "_" + dbColumn["column_name"]; });
                                    if (tableColumn.type === "array") {
                                        tableColumn.isArray = true;
                                        var type = dbColumn["udt_name"].substring(1);
                                        tableColumn.type = _this.connection.driver.normalizeType({ type: type });
                                    }
                                    if (tableColumn.type === "time without time zone"
                                        || tableColumn.type === "time with time zone"
                                        || tableColumn.type === "timestamp without time zone"
                                        || tableColumn.type === "timestamp with time zone") {
                                        tableColumn.precision = dbColumn["datetime_precision"];
                                    }
                                    return tableColumn;
                                });
                                // create primary key schema
                                table.primaryKeys = primaryKeys
                                    .filter(function (primaryKey) { return primaryKey["table_name"] === table.name; })
                                    .map(function (primaryKey) { return new TablePrimaryKey_1.TablePrimaryKey(primaryKey["constraint_name"], primaryKey["column_name"]); });
                                // create foreign key schemas from the loaded indices
                                table.foreignKeys = dbForeignKeys
                                    .filter(function (dbForeignKey) { return dbForeignKey["table_name"] === table.name; })
                                    .map(function (dbForeignKey) { return new TableForeignKey_1.TableForeignKey(dbForeignKey["constraint_name"], [], [], "", ""); }); // todo: fix missing params
                                // create unique key schemas from the loaded indices
                                /*table.uniqueKeys = dbUniqueKeys
                                    .filter(dbUniqueKey => dbUniqueKey["table_name"] === table.name)
                                    .map(dbUniqueKey => {
                                        return new UniqueKeySchema(dbUniqueKey["TABLE_NAME"], dbUniqueKey["CONSTRAINT_NAME"], [/!* todo *!/]);
                                    });*/
                                // create index schemas from the loaded indices
                                table.indices = dbIndices
                                    .filter(function (dbIndex) {
                                    return dbIndex["table_name"] === table.name &&
                                        (!table.foreignKeys.find(function (foreignKey) { return foreignKey.name === dbIndex["index_name"]; })) &&
                                        (!table.primaryKeys.find(function (primaryKey) { return primaryKey.name === dbIndex["index_name"]; })) &&
                                        (!dbUniqueKeys.find(function (key) { return key["constraint_name"] === dbIndex["index_name"]; }));
                                })
                                    .map(function (dbIndex) { return dbIndex["index_name"]; })
                                    .filter(function (value, index, self) { return self.indexOf(value) === index; }) // unqiue
                                    .map(function (dbIndexName) {
                                    var dbIndicesInfos = dbIndices
                                        .filter(function (dbIndex) { return dbIndex["table_name"] === table.name && dbIndex["index_name"] === dbIndexName; });
                                    var columnPositions = dbIndicesInfos[0]["indkey"].split(" ")
                                        .map(function (x) { return parseInt(x); });
                                    var columnNames = columnPositions
                                        .map(function (pos) { return dbIndicesInfos.find(function (idx) { return idx.attnum === pos; })["column_name"]; });
                                    return new TableIndex_1.TableIndex(dbTable["table_name"], dbIndexName, columnNames, dbIndicesInfos[0]["is_unique"]);
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
    PostgresQueryRunner.prototype.hasDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Promise.resolve(false)];
            });
        });
    };
    /**
     * Checks if table with the given name exist in the database.
     */
    PostgresQueryRunner.prototype.hasTable = function (tablePath) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedTablePath, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedTablePath = this.parseTablePath(tablePath);
                        sql = "SELECT * FROM information_schema.tables WHERE table_schema = " + parsedTablePath.schema + " AND table_name = " + parsedTablePath.tableName;
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
     * Postgres does not supports database creation inside a transaction block.
     */
    PostgresQueryRunner.prototype.createDatabase = function (database) {
        return Promise.resolve([]);
    };
    /**
     * Creates a schema if it's not created.
     */
    PostgresQueryRunner.prototype.createSchema = function (schemas) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.driver.options.schema)
                    schemas.push(this.driver.options.schema);
                return [2 /*return*/, Promise.all(schemas.map(function (schema) { return _this.query("CREATE SCHEMA IF NOT EXISTS \"" + schema + "\""); }))];
            });
        });
    };
    /**
     * Creates a new table from the given table metadata and column metadatas.
     */
    PostgresQueryRunner.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var schema, columnDefinitions, up, primaryKeyColumns, down;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        schema = table.schema || this.driver.options.schema;
                        columnDefinitions = table.columns.map(function (column) { return _this.buildCreateColumnSql(column, false); }).join(", ");
                        up = "CREATE TABLE " + this.escapeTablePath(table) + " (" + columnDefinitions;
                        up += table.columns
                            .filter(function (column) { return column.isUnique; })
                            .map(function (column) {
                            return schema ? ", CONSTRAINT \"uk_" + schema + "_" + table.name + "_" + column.name + "\" UNIQUE (\"" + column.name + "\")"
                                : ", CONSTRAINT \"uk_" + table.name + "_" + column.name + "\" UNIQUE (\"" + column.name + "\")";
                        }).join(" ");
                        primaryKeyColumns = table.columns.filter(function (column) { return column.isPrimary; });
                        if (primaryKeyColumns.length > 0)
                            up += ", PRIMARY KEY(" + primaryKeyColumns.map(function (column) { return "\"" + column.name + "\""; }).join(", ") + ")";
                        up += ")";
                        down = "DROP TABLE \"" + table.name + "\"";
                        return [4 /*yield*/, this.schemaQuery(up, down)];
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
    PostgresQueryRunner.prototype.dropTable = function (tablePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("DROP TABLE " + this.escapeTablePath(tablePath))];
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
    PostgresQueryRunner.prototype.hasColumn = function (tablePath, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedTablePath, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedTablePath = this.parseTablePath(tablePath);
                        sql = "SELECT * FROM information_schema.columns WHERE table_schema = " + parsedTablePath.schema + " AND table_name = '" + parsedTablePath.tableName + "' AND column_name = '" + columnName + "'";
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
    PostgresQueryRunner.prototype.addColumn = function (tableOrPath, column) {
        return __awaiter(this, void 0, void 0, function () {
            var up, down;
            return __generator(this, function (_a) {
                up = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " ADD " + this.buildCreateColumnSql(column, false);
                down = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " DROP \"" + column.name + "\"";
                return [2 /*return*/, this.schemaQuery(up, down)];
            });
        });
    };
    /**
     * Creates a new columns from the column in the table.
     */
    PostgresQueryRunner.prototype.addColumns = function (tableOrName, columns) {
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
    PostgresQueryRunner.prototype.renameColumn = function (tableOrName, oldTableColumnOrName, newTableColumnOrName) {
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
    PostgresQueryRunner.prototype.changeColumn = function (tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var table, sql, oldColumn, up, up, schema, up, up2, up, up2, up, up, up, up, up;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        table = undefined;
                        sql = [];
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
                        if (this.connection.driver.createFullType(oldColumn) !== this.connection.driver.createFullType(newColumn) ||
                            oldColumn.name !== newColumn.name) {
                            up = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " ALTER COLUMN \"" + oldColumn.name + "\"";
                            if (this.connection.driver.createFullType(oldColumn) !== this.connection.driver.createFullType(newColumn)) {
                                up += " TYPE " + this.connection.driver.createFullType(newColumn);
                            }
                            if (oldColumn.name !== newColumn.name) { // todo: make rename in a separate query too. Need also change sequences and their defaults
                                up += " RENAME TO " + newColumn.name;
                            }
                            sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                        }
                        if (oldColumn.isNullable !== newColumn.isNullable) {
                            up = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " ALTER COLUMN \"" + oldColumn.name + "\"";
                            if (newColumn.isNullable) {
                                up += " DROP NOT NULL";
                            }
                            else {
                                up += " SET NOT NULL";
                            }
                            sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                        }
                        // update sequence generation
                        if (oldColumn.isGenerated !== newColumn.isGenerated) {
                            schema = table.schema || this.driver.options.schema;
                            if (!oldColumn.isGenerated && newColumn.type !== "uuid") {
                                up = schema
                                    ? "CREATE SEQUENCE \"" + schema + "\".\"" + table.name + "_" + oldColumn.name + "_seq\" OWNED BY " + this.escapeTablePath(table) + ".\"" + oldColumn.name + "\""
                                    : "CREATE SEQUENCE \"" + table.name + "_" + oldColumn.name + "_seq\" OWNED BY " + this.escapeTablePath(table) + ".\"" + oldColumn.name + "\"";
                                sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                                up2 = schema
                                    ? "ALTER TABLE " + this.escapeTablePath(table) + " ALTER COLUMN \"" + oldColumn.name + "\" SET DEFAULT nextval('\"" + schema + "." + table.name + "_" + oldColumn.name + "_seq\"')"
                                    : "ALTER TABLE " + this.escapeTablePath(table) + " ALTER COLUMN \"" + oldColumn.name + "\" SET DEFAULT nextval('\"" + table.name + "_" + oldColumn.name + "_seq\"')";
                                sql.push({ up: up2, down: "-- TODO: revert " + up2 }); // TODO: Add revert logic
                            }
                            else {
                                up = "ALTER TABLE " + this.escapeTablePath(table) + " ALTER COLUMN \"" + oldColumn.name + "\" DROP DEFAULT";
                                sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                                up2 = schema
                                    ? "DROP SEQUENCE \"" + schema + "\".\"" + table.name + "_" + oldColumn.name + "_seq\""
                                    : "DROP SEQUENCE \"" + table.name + "_" + oldColumn.name + "_seq\"";
                                sql.push({ up: up2, down: "-- TODO: revert " + up2 }); // TODO: Add revert logic
                            }
                        }
                        if (oldColumn.comment !== newColumn.comment) {
                            up = "COMMENT ON COLUMN " + this.escapeTablePath(tableOrName) + ".\"" + oldColumn.name + "\" is '" + newColumn.comment + "'";
                            sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                        }
                        if (oldColumn.isUnique !== newColumn.isUnique) {
                            if (newColumn.isUnique === true) {
                                up = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " ADD CONSTRAINT \"uk_" + table.name + "_" + newColumn.name + "\" UNIQUE (\"" + newColumn.name + "\")";
                                sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                            }
                            else if (newColumn.isUnique === false) {
                                up = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " DROP CONSTRAINT \"uk_" + table.name + "_" + newColumn.name + "\"";
                                sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                            }
                        }
                        if (newColumn.default !== oldColumn.default) {
                            if (newColumn.default !== null && newColumn.default !== undefined) {
                                up = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " ALTER COLUMN \"" + newColumn.name + "\" SET DEFAULT " + newColumn.default;
                                sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                            }
                            else if (oldColumn.default !== null && oldColumn.default !== undefined) {
                                up = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " ALTER COLUMN \"" + newColumn.name + "\" DROP DEFAULT";
                                sql.push({ up: up, down: "-- TODO: revert " + up }); // TODO: Add revert logic
                            }
                        }
                        return [4 /*yield*/, Promise.all(sql.map(function (_a) {
                                var up = _a.up, down = _a.down;
                                return _this.schemaQuery(up, down);
                            }))];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    PostgresQueryRunner.prototype.changeColumns = function (table, changedColumns) {
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
    PostgresQueryRunner.prototype.dropColumn = function (table, column) {
        return __awaiter(this, void 0, void 0, function () {
            var up, down;
            return __generator(this, function (_a) {
                up = "ALTER TABLE " + this.escapeTablePath(table) + " DROP \"" + column.name + "\"";
                down = "ALTER TABLE " + this.escapeTablePath(table) + " ADD " + this.buildCreateColumnSql(column, false);
                return [2 /*return*/, this.schemaQuery(up, down)];
            });
        });
    };
    /**
     * Drops the columns in the table.
     */
    PostgresQueryRunner.prototype.dropColumns = function (table, columns) {
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
    PostgresQueryRunner.prototype.updatePrimaryKeys = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var primaryColumnNames, up, down, up2, down2, up3, down3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        primaryColumnNames = table.primaryKeys.map(function (primaryKey) { return "\"" + primaryKey.columnName + "\""; });
                        up = "ALTER TABLE " + this.escapeTablePath(table) + " DROP CONSTRAINT IF EXISTS \"" + table.name + "_pkey\"";
                        down = "-- TODO: revert " + up;
                        return [4 /*yield*/, this.schemaQuery(up, down)];
                    case 1:
                        _a.sent(); // TODO: Add revert logic
                        up2 = "DROP INDEX IF EXISTS \"" + table.name + "_pkey\"";
                        down2 = "-- TODO: revert " + up2;
                        return [4 /*yield*/, this.schemaQuery(up2, down2)];
                    case 2:
                        _a.sent(); // TODO: Add revert logic
                        if (!(primaryColumnNames.length > 0)) return [3 /*break*/, 4];
                        up3 = "ALTER TABLE " + this.escapeTablePath(table) + " ADD PRIMARY KEY (" + primaryColumnNames.join(", ") + ")";
                        down3 = "ALTER TABLE " + this.escapeTablePath(table) + " DROP PRIMARY KEY (" + primaryColumnNames.join(", ") + ")";
                        return [4 /*yield*/, this.schemaQuery(up3, down3)];
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
    PostgresQueryRunner.prototype.createForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, up, down;
            return __generator(this, function (_b) {
                _a = this.foreignKeySql(tableOrName, foreignKey), up = _a.add, down = _a.drop;
                return [2 /*return*/, this.schemaQuery(up, down)];
            });
        });
    };
    /**
     * Creates a new foreign keys.
     */
    PostgresQueryRunner.prototype.createForeignKeys = function (tableOrName, foreignKeys) {
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
    PostgresQueryRunner.prototype.dropForeignKey = function (tableOrName, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, down, up;
            return __generator(this, function (_b) {
                _a = this.foreignKeySql(tableOrName, foreignKey), down = _a.add, up = _a.drop;
                return [2 /*return*/, this.schemaQuery(up, down)];
            });
        });
    };
    /**
     * Drops a foreign keys from the table.
     */
    PostgresQueryRunner.prototype.dropForeignKeys = function (tableOrName, foreignKeys) {
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
    PostgresQueryRunner.prototype.createIndex = function (table, index) {
        return __awaiter(this, void 0, void 0, function () {
            var columnNames, up, down;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnNames = index.columnNames.map(function (columnName) { return "\"" + columnName + "\""; }).join(",");
                        up = "CREATE " + (index.isUnique ? "UNIQUE " : "") + "INDEX \"" + index.name + "\" ON " + this.escapeTablePath(table) + "(" + columnNames + ")";
                        down = "-- TODO: revert " + up;
                        return [4 /*yield*/, this.schemaQuery(up, down)];
                    case 1:
                        _a.sent(); // TODO: Add revert logic
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops an index from the table.
     */
    PostgresQueryRunner.prototype.dropIndex = function (tableSchemeOrPath, indexName) {
        return __awaiter(this, void 0, void 0, function () {
            var schema, up, down;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        schema = this.extractSchema(tableSchemeOrPath);
                        up = schema ? "DROP INDEX \"" + schema + "\".\"" + indexName + "\"" : "DROP INDEX \"" + indexName + "\"";
                        down = "-- TODO: revert " + up;
                        return [4 /*yield*/, this.schemaQuery(up, down)];
                    case 1:
                        _a.sent(); // TODO: Add revert logic
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Truncates table.
     */
    PostgresQueryRunner.prototype.truncate = function (tablePath) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("TRUNCATE TABLE " + this.escapeTablePath(tablePath))];
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
    PostgresQueryRunner.prototype.clearDatabase = function (schemas) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var schemaNamesString, selectDropsQuery, dropQueries, error_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!schemas)
                            schemas = [];
                        schemas.push(this.driver.options.schema || "current_schema()");
                        schemaNamesString = schemas.map(function (name) {
                            return name === "current_schema()" ? name : "'" + name + "'";
                        }).join(", ");
                        return [4 /*yield*/, this.startTransaction()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 11]);
                        selectDropsQuery = "SELECT 'DROP TABLE IF EXISTS \"' || schemaname || '\".\"' || tablename || '\" CASCADE;' as query FROM pg_tables WHERE schemaname IN (" + schemaNamesString + ")";
                        return [4 /*yield*/, this.query(selectDropsQuery)];
                    case 3:
                        dropQueries = _a.sent();
                        return [4 /*yield*/, Promise.all(dropQueries.map(function (q) { return _this.query(q["query"]); }))];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.commitTransaction()];
                    case 5:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 6:
                        error_1 = _a.sent();
                        _a.label = 7;
                    case 7:
                        _a.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, this.rollbackTransaction()];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 10];
                    case 9:
                        rollbackError_1 = _a.sent();
                        return [3 /*break*/, 10];
                    case 10: throw error_1;
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Enables special query runner mode in which sql queries won't be executed,
     * instead they will be memorized into a special variable inside query runner.
     * You can get memorized sql using getMemorySql() method.
     */
    PostgresQueryRunner.prototype.enableSqlMemory = function () {
        this.sqlMemoryMode = true;
    };
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    PostgresQueryRunner.prototype.disableSqlMemory = function () {
        this.sqlsInMemory = [];
        this.sqlMemoryMode = false;
    };
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    PostgresQueryRunner.prototype.getMemorySql = function () {
        return this.sqlsInMemory;
    };
    /**
     * Executes sql used special for schema build.
     */
    PostgresQueryRunner.prototype.schemaQuery = function (upQuery, downQuery) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // if sql-in-memory mode is enabled then simply store sql in memory and return
                        if (this.sqlMemoryMode === true) {
                            this.sqlsInMemory.push({ up: upQuery, down: downQuery });
                            return [2 /*return*/, Promise.resolve()];
                        }
                        return [4 /*yield*/, this.query(upQuery)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Extracts schema name from given Table object or tablePath string.
     */
    PostgresQueryRunner.prototype.extractSchema = function (tableOrPath) {
        if (tableOrPath instanceof Table_1.Table) {
            return tableOrPath.schema || this.driver.options.schema;
        }
        else {
            return tableOrPath.indexOf(".") === -1 ? this.driver.options.schema : tableOrPath.split(".")[0];
        }
    };
    PostgresQueryRunner.prototype.foreignKeySql = function (tableOrPath, foreignKey) {
        var add = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " ADD CONSTRAINT \"" + foreignKey.name + "\" " +
            ("FOREIGN KEY (\"" + foreignKey.columnNames.join("\", \"") + "\") ") +
            ("REFERENCES " + this.escapeTablePath(foreignKey.referencedTablePath) + "(\"" + foreignKey.referencedColumnNames.join("\", \"") + "\")");
        if (foreignKey.onDelete)
            add += " ON DELETE " + foreignKey.onDelete;
        var drop = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " DROP CONSTRAINT \"" + foreignKey.name + "\"";
        return { add: add, drop: drop };
    };
    /**
     * Escapes given table path.
     */
    PostgresQueryRunner.prototype.escapeTablePath = function (tableOrPath, disableEscape) {
        if (tableOrPath instanceof Table_1.Table) {
            var schema = tableOrPath.schema || this.driver.options.schema;
            if (schema) {
                tableOrPath = schema + "." + tableOrPath.name;
            }
            else {
                tableOrPath = tableOrPath.name;
            }
        }
        else {
            tableOrPath = tableOrPath.indexOf(".") === -1 && this.driver.options.schema ? this.driver.options.schema + "." + tableOrPath : tableOrPath;
        }
        return tableOrPath.split(".").map(function (i) {
            return disableEscape ? i : "\"" + i + "\"";
        }).join(".");
    };
    PostgresQueryRunner.prototype.parseTablePath = function (tablePath) {
        if (tablePath.indexOf(".") === -1) {
            return {
                schema: this.driver.options.schema ? "'" + this.driver.options.schema + "'" : "current_schema()",
                tableName: "'" + tablePath + "'"
            };
        }
        else {
            return {
                schema: "'" + tablePath.split(".")[0] + "'",
                tableName: "'" + tablePath.split(".")[1] + "'"
            };
        }
    };
    /**
     * Parametrizes given object of values. Used to create column=value queries.
     */
    PostgresQueryRunner.prototype.parametrize = function (objectLiteral, startIndex) {
        if (startIndex === void 0) { startIndex = 0; }
        return Object.keys(objectLiteral).map(function (key, index) { return "\"" + key + "\"=$" + (startIndex + index + 1); });
    };
    /**
     * Builds a query for create column.
     */
    PostgresQueryRunner.prototype.buildCreateColumnSql = function (column, skipPrimary) {
        var c = "\"" + column.name + "\"";
        if (column.isGenerated === true && column.generationStrategy === "increment") { // don't use skipPrimary here since updates can update already exist primary without auto inc.
            if (column.type === "integer")
                c += " SERIAL";
            if (column.type === "smallint")
                c += " SMALLSERIAL";
            if (column.type === "bigint")
                c += " BIGSERIAL";
        }
        if (!column.isGenerated || column.type === "uuid")
            c += " " + this.connection.driver.createFullType(column);
        if (column.charset)
            c += " CHARACTER SET \"" + column.charset + "\"";
        if (column.collation)
            c += " COLLATE \"" + column.collation + "\"";
        if (column.isNullable !== true)
            c += " NOT NULL";
        // if (column.isPrimary)
        //     c += " PRIMARY KEY";
        if (column.default !== undefined && column.default !== null) { // todo: same code in all drivers. make it DRY
            c += " DEFAULT " + column.default;
        }
        if (column.isGenerated && column.generationStrategy === "uuid" && !column.default)
            c += " DEFAULT uuid_generate_v4()";
        return c;
    };
    return PostgresQueryRunner;
}());
exports.PostgresQueryRunner = PostgresQueryRunner;

//# sourceMappingURL=PostgresQueryRunner.js.map
