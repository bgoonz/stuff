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
import { MssqlParameter } from "./MssqlParameter";
import { OrmUtils } from "../../util/OrmUtils";
import { QueryFailedError } from "../../error/QueryFailedError";
import { PromiseUtils } from "../../util/PromiseUtils";
/**
 * Runs queries on a single mysql database connection.
 */
var SqlServerQueryRunner = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SqlServerQueryRunner(driver, mode) {
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
         * Last executed query in a transaction.
         * This is needed because in transaction mode mssql cannot execute parallel queries,
         * that's why we store last executed query promise to wait it when we execute next query.
         *
         * @see https://github.com/patriksimek/node-mssql/issues/491
         */
        this.queryResponsibilityChain = [];
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
    SqlServerQueryRunner.prototype.connect = function () {
        return Promise.resolve();
    };
    /**
     * Releases used database connection.
     * You cannot use query runner methods once its released.
     */
    SqlServerQueryRunner.prototype.release = function () {
        this.isReleased = true;
        return Promise.resolve();
    };
    /**
     * Starts transaction.
     */
    SqlServerQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (this.isTransactionActive)
                    throw new TransactionAlreadyStartedError();
                return [2 /*return*/, new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        var pool;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.isTransactionActive = true;
                                    return [4 /*yield*/, (this.mode === "slave" ? this.driver.obtainSlaveConnection() : this.driver.obtainMasterConnection())];
                                case 1:
                                    pool = _a.sent();
                                    this.databaseConnection = pool.transaction();
                                    this.databaseConnection.begin(function (err) {
                                        if (err) {
                                            _this.isTransactionActive = false;
                                            return fail(err);
                                        }
                                        ok();
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    SqlServerQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (!this.isTransactionActive)
                    throw new TransactionNotStartedError();
                return [2 /*return*/, new Promise(function (ok, fail) {
                        _this.databaseConnection.commit(function (err) {
                            if (err)
                                return fail(err);
                            _this.isTransactionActive = false;
                            _this.databaseConnection = null;
                            ok();
                        });
                    })];
            });
        });
    };
    /**
     * Rollbacks transaction.
     * Error will be thrown if transaction was not started.
     */
    SqlServerQueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (!this.isTransactionActive)
                    throw new TransactionNotStartedError();
                return [2 /*return*/, new Promise(function (ok, fail) {
                        _this.databaseConnection.rollback(function (err) {
                            if (err)
                                return fail(err);
                            _this.isTransactionActive = false;
                            _this.databaseConnection = null;
                            ok();
                        });
                    })];
            });
        });
    };
    SqlServerQueryRunner.prototype.mssqlParameterToNativeParameter = function (parameter) {
        switch (this.driver.normalizeType({ type: parameter.type })) {
            case "bit":
                return this.driver.mssql.Bit;
            case "bigint":
                return this.driver.mssql.BigInt;
            case "decimal":
                return (_a = this.driver.mssql).Decimal.apply(_a, parameter.params);
            case "float":
                return this.driver.mssql.Float;
            case "int":
                return this.driver.mssql.Int;
            case "money":
                return this.driver.mssql.Money;
            case "numeric":
                return (_b = this.driver.mssql).Numeric.apply(_b, parameter.params);
            case "smallint":
                return this.driver.mssql.SmallInt;
            case "smallmoney":
                return this.driver.mssql.SmallMoney;
            case "real":
                return this.driver.mssql.Real;
            case "tinyint":
                return this.driver.mssql.TinyInt;
            case "char":
                return (_c = this.driver.mssql).Char.apply(_c, parameter.params);
            case "nchar":
                return (_d = this.driver.mssql).NChar.apply(_d, parameter.params);
            case "text":
                return this.driver.mssql.Text;
            case "ntext":
                return this.driver.mssql.Ntext;
            case "varchar":
                return (_e = this.driver.mssql).VarChar.apply(_e, parameter.params);
            case "nvarchar":
                return (_f = this.driver.mssql).NVarChar.apply(_f, parameter.params);
            case "xml":
                return this.driver.mssql.Xml;
            case "time":
                return (_g = this.driver.mssql).Time.apply(_g, parameter.params);
            case "date":
                return this.driver.mssql.Date;
            case "datetime":
                return this.driver.mssql.DateTime;
            case "datetime2":
                return (_h = this.driver.mssql).DateTime2.apply(_h, parameter.params);
            case "datetimeoffset":
                return (_j = this.driver.mssql).DateTimeOffset.apply(_j, parameter.params);
            case "smalldatetime":
                return this.driver.mssql.SmallDateTime;
            case "uniqueidentifier":
                return this.driver.mssql.UniqueIdentifier;
            case "variant":
                return this.driver.mssql.Variant;
            case "binary":
                return this.driver.mssql.Binary;
            case "varbinary":
                return (_k = this.driver.mssql).VarBinary.apply(_k, parameter.params);
            case "image":
                return this.driver.mssql.Image;
            case "udt":
                return this.driver.mssql.UDT;
            case "geography":
                return this.driver.mssql.Geography;
            case "geometry":
                return this.driver.mssql.Geometry;
        }
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    };
    /**
     * Executes a given SQL query.
     */
    SqlServerQueryRunner.prototype.query = function (query, parameters) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var waitingOkay, waitingPromise, otherWaitingPromises, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isReleased)
                            throw new QueryRunnerAlreadyReleasedError();
                        waitingPromise = new Promise(function (ok) { return waitingOkay = ok; });
                        if (!this.queryResponsibilityChain.length) return [3 /*break*/, 2];
                        otherWaitingPromises = this.queryResponsibilityChain.slice();
                        this.queryResponsibilityChain.push(waitingPromise);
                        return [4 /*yield*/, Promise.all(otherWaitingPromises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        promise = new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            var pool, request_1, queryStartTime_1, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 2, , 3]);
                                        this.driver.connection.logger.logQuery(query, parameters, this);
                                        return [4 /*yield*/, (this.mode === "slave" ? this.driver.obtainSlaveConnection() : this.driver.obtainMasterConnection())];
                                    case 1:
                                        pool = _a.sent();
                                        request_1 = new this.driver.mssql.Request(this.isTransactionActive ? this.databaseConnection : pool);
                                        if (parameters && parameters.length) {
                                            parameters.forEach(function (parameter, index) {
                                                if (parameter instanceof MssqlParameter) {
                                                    var mssqlParameter = _this.mssqlParameterToNativeParameter(parameter);
                                                    if (mssqlParameter) {
                                                        request_1.input(index, mssqlParameter, parameter.value);
                                                    }
                                                    else {
                                                        request_1.input(index, parameter.value);
                                                    }
                                                }
                                                else {
                                                    request_1.input(index, parameter);
                                                }
                                            });
                                        }
                                        queryStartTime_1 = +new Date();
                                        request_1.query(query, function (err, result) {
                                            // log slow queries if maxQueryExecution time is set
                                            var maxQueryExecutionTime = _this.driver.connection.options.maxQueryExecutionTime;
                                            var queryEndTime = +new Date();
                                            var queryExecutionTime = queryEndTime - queryStartTime_1;
                                            if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime)
                                                _this.driver.connection.logger.logQuerySlow(queryExecutionTime, query, parameters, _this);
                                            var resolveChain = function () {
                                                if (promiseIndex !== -1)
                                                    _this.queryResponsibilityChain.splice(promiseIndex, 1);
                                                if (waitingPromiseIndex !== -1)
                                                    _this.queryResponsibilityChain.splice(waitingPromiseIndex, 1);
                                                waitingOkay();
                                            };
                                            var promiseIndex = _this.queryResponsibilityChain.indexOf(promise);
                                            var waitingPromiseIndex = _this.queryResponsibilityChain.indexOf(waitingPromise);
                                            if (err) {
                                                _this.driver.connection.logger.logQueryError(err, query, parameters, _this);
                                                resolveChain();
                                                return fail(new QueryFailedError(query, parameters, err));
                                            }
                                            ok(result.recordset);
                                            resolveChain();
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _a.sent();
                                        fail(err_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        if (this.isTransactionActive)
                            this.queryResponsibilityChain.push(promise);
                        return [2 /*return*/, promise];
                }
            });
        });
    };
    /**
     * Returns raw data stream.
     */
    SqlServerQueryRunner.prototype.stream = function (query, parameters, onEnd, onError) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var waitingOkay, waitingPromise, otherWaitingPromises, promise;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.isReleased)
                            throw new QueryRunnerAlreadyReleasedError();
                        waitingPromise = new Promise(function (ok) { return waitingOkay = ok; });
                        if (!this.queryResponsibilityChain.length) return [3 /*break*/, 2];
                        otherWaitingPromises = this.queryResponsibilityChain.slice();
                        this.queryResponsibilityChain.push(waitingPromise);
                        return [4 /*yield*/, Promise.all(otherWaitingPromises)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        promise = new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
                            var _this = this;
                            var pool, request;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        this.driver.connection.logger.logQuery(query, parameters, this);
                                        return [4 /*yield*/, (this.mode === "slave" ? this.driver.obtainSlaveConnection() : this.driver.obtainMasterConnection())];
                                    case 1:
                                        pool = _a.sent();
                                        request = new this.driver.mssql.Request(this.isTransactionActive ? this.databaseConnection : pool);
                                        request.stream = true;
                                        if (parameters && parameters.length) {
                                            parameters.forEach(function (parameter, index) {
                                                if (parameter instanceof MssqlParameter) {
                                                    request.input(index, _this.mssqlParameterToNativeParameter(parameter), parameter.value);
                                                }
                                                else {
                                                    request.input(index, parameter);
                                                }
                                            });
                                        }
                                        request.query(query, function (err, result) {
                                            var resolveChain = function () {
                                                if (promiseIndex !== -1)
                                                    _this.queryResponsibilityChain.splice(promiseIndex, 1);
                                                if (waitingPromiseIndex !== -1)
                                                    _this.queryResponsibilityChain.splice(waitingPromiseIndex, 1);
                                                waitingOkay();
                                            };
                                            var promiseIndex = _this.queryResponsibilityChain.indexOf(promise);
                                            var waitingPromiseIndex = _this.queryResponsibilityChain.indexOf(waitingPromise);
                                            if (err) {
                                                _this.driver.connection.logger.logQueryError(err, query, parameters, _this);
                                                resolveChain();
                                                return fail(err);
                                            }
                                            ok(result.recordset);
                                            resolveChain();
                                        });
                                        if (onEnd)
                                            request.on("done", onEnd);
                                        if (onError)
                                            request.on("error", onError);
                                        ok(request);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        if (this.isTransactionActive)
                            this.queryResponsibilityChain.push(promise);
                        return [2 /*return*/, promise];
                }
            });
        });
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    SqlServerQueryRunner.prototype.insert = function (tablePath, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, columns, values, generatedColumns, generatedColumnNames, generatedColumnSql, sql, parameters, parametersArray, result, generatedMap;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keys = Object.keys(keyValues);
                        columns = keys.map(function (key) { return "\"" + key + "\""; }).join(", ");
                        values = keys.map(function (key, index) { return "@" + index; }).join(",");
                        generatedColumns = this.connection.hasMetadata(tablePath) ? this.connection.getMetadata(tablePath).generatedColumns : [];
                        generatedColumnNames = generatedColumns.map(function (generatedColumn) { return "INSERTED.\"" + generatedColumn.databaseName + "\""; }).join(", ");
                        generatedColumnSql = generatedColumns.length > 0 ? " OUTPUT " + generatedColumnNames : "";
                        sql = columns.length > 0
                            ? "INSERT INTO " + this.escapeTablePath(tablePath) + "(" + columns + ") " + generatedColumnSql + " VALUES (" + values + ")"
                            : "INSERT INTO " + this.escapeTablePath(tablePath) + " " + generatedColumnSql + " DEFAULT VALUES ";
                        parameters = this.driver.parametrizeMap(tablePath, keyValues);
                        parametersArray = Object.keys(parameters).map(function (key) { return parameters[key]; });
                        return [4 /*yield*/, this.query(sql, parametersArray)];
                    case 1:
                        result = _a.sent();
                        generatedMap = generatedColumns.reduce(function (map, column) {
                            var valueMap = column.createValueMap(result[0][column.databaseName]);
                            return OrmUtils.mergeDeep(map, valueMap);
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
    SqlServerQueryRunner.prototype.update = function (tablePath, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            var conditionParams, updateParams, allParameters, updateValues, conditionString, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        valuesMap = this.driver.parametrizeMap(tablePath, valuesMap);
                        conditions = this.driver.parametrizeMap(tablePath, conditions);
                        conditionParams = Object.keys(conditions).map(function (key) { return conditions[key]; });
                        updateParams = Object.keys(valuesMap).map(function (key) { return valuesMap[key]; });
                        allParameters = updateParams.concat(conditionParams);
                        updateValues = this.parametrize(valuesMap).join(", ");
                        conditionString = this.parametrize(conditions, updateParams.length).join(" AND ");
                        sql = "UPDATE " + this.escapeTablePath(tablePath) + " SET " + updateValues + " " + (conditionString ? (" WHERE " + conditionString) : "");
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
    SqlServerQueryRunner.prototype.delete = function (tablePath, conditions, maybeParameters) {
        return __awaiter(this, void 0, void 0, function () {
            var conditionString, parameters, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        conditions = typeof conditions === "object" ? this.driver.parametrizeMap(tablePath, conditions) : conditions;
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
     * Inserts rows into the closure table.
     */
    SqlServerQueryRunner.prototype.insertIntoClosureTable = function (tablePath, newEntityId, parentId, hasLevel) {
        return __awaiter(this, void 0, void 0, function () {
            var sql, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "";
                        if (hasLevel) { // todo: escape all parameters there
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
    SqlServerQueryRunner.prototype.getTable = function (tablePath) {
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
    SqlServerQueryRunner.prototype.getTables = function (tablePaths) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var tableNames, schemaNames, dbNames, schemaNamesString, tableNamesString, tablesSql, columnsSql, constraintsSql, identityColumnsSql, indicesSql, _a, dbTables, dbColumns, dbConstraints, dbIdentityColumns, dbIndices;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // if no tables given then no need to proceed
                        if (!tablePaths || !tablePaths.length)
                            return [2 /*return*/, []];
                        tableNames = tablePaths.map(function (tablePath) {
                            if (tablePath.split(".").length === 3) {
                                return tablePath.split(".")[2];
                            }
                            else if (tablePath.split(".").length === 2) {
                                return tablePath.split(".")[1];
                            }
                            else {
                                return tablePath;
                            }
                        });
                        schemaNames = [];
                        tablePaths.filter(function (tablePath) { return tablePath.indexOf(".") !== -1; })
                            .forEach(function (tablePath) {
                            if (tablePath.split(".").length === 3) {
                                if (tablePath.split(".")[1] !== "")
                                    schemaNames.push(tablePath.split(".")[1]);
                            }
                            else {
                                schemaNames.push(tablePath.split(".")[0]);
                            }
                        });
                        schemaNames.push(this.driver.options.schema || "SCHEMA_NAME()");
                        dbNames = tablePaths
                            .filter(function (tablePath) { return tablePath.split(".").length === 3; })
                            .map(function (tablePath) { return tablePath.split(".")[0]; });
                        if (this.driver.database && !dbNames.find(function (dbName) { return dbName === _this.driver.database; }))
                            dbNames.push(this.driver.database);
                        schemaNamesString = schemaNames.map(function (name) {
                            return name === "SCHEMA_NAME()" ? name : "'" + name + "'";
                        }).join(", ");
                        tableNamesString = tableNames.map(function (name) { return "'" + name + "'"; }).join(", ");
                        tablesSql = dbNames.map(function (dbName) {
                            return "SELECT * FROM " + dbName + ".INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME IN (" + tableNamesString + ") AND TABLE_SCHEMA IN (" + schemaNamesString + ")";
                        }).join(" UNION ALL ");
                        columnsSql = dbNames.map(function (dbName) {
                            return "SELECT * FROM " + dbName + ".INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA IN (" + schemaNamesString + ")";
                        }).join(" UNION ALL ");
                        constraintsSql = dbNames.map(function (dbName) {
                            return "SELECT columnUsages.*, tableConstraints.CONSTRAINT_TYPE FROM " + dbName + ".INFORMATION_SCHEMA.KEY_COLUMN_USAGE columnUsages " +
                                ("LEFT JOIN " + dbName + ".INFORMATION_SCHEMA.TABLE_CONSTRAINTS tableConstraints ON tableConstraints.CONSTRAINT_NAME = columnUsages.CONSTRAINT_NAME ") +
                                ("WHERE columnUsages.TABLE_SCHEMA IN (" + schemaNamesString + ") AND tableConstraints.TABLE_SCHEMA IN (" + schemaNamesString + ")");
                        }).join(" UNION ALL ");
                        identityColumnsSql = dbNames.map(function (dbName) {
                            return "SELECT COLUMN_NAME, TABLE_NAME FROM " + dbName + ".INFORMATION_SCHEMA.COLUMNS WHERE COLUMNPROPERTY(object_id(TABLE_SCHEMA + '.' + TABLE_NAME), COLUMN_NAME, 'IsIdentity') = 1 AND TABLE_SCHEMA IN (" + schemaNamesString + ")";
                        }).join(" UNION ALL ");
                        indicesSql = dbNames.map(function (dbName) {
                            return "SELECT TABLE_NAME = t.name, INDEX_NAME = ind.name, IndexId = ind.index_id, ColumnId = ic.index_column_id, \n                    COLUMN_NAME = col.name, IS_UNIQUE = ind.is_unique, ind.*, ic.*, col.* \n                    FROM " + dbName + ".sys.indexes ind \n                    INNER JOIN " + dbName + ".sys.index_columns ic ON ind.object_id = ic.object_id and ind.index_id = ic.index_id\n                    INNER JOIN " + dbName + ".sys.columns col ON ic.object_id = col.object_id and ic.column_id = col.column_id \n                    INNER JOIN " + dbName + ".sys.tables t ON ind.object_id = t.object_id WHERE ind.is_primary_key = 0 \n                    AND ind.is_unique_constraint = 0 AND t.is_ms_shipped = 0";
                        }).join(" UNION ALL ");
                        return [4 /*yield*/, Promise.all([
                                this.query(tablesSql),
                                this.query(columnsSql),
                                this.query(constraintsSql),
                                this.query(identityColumnsSql),
                                this.query(indicesSql),
                            ])];
                    case 1:
                        _a = _b.sent(), dbTables = _a[0], dbColumns = _a[1], dbConstraints = _a[2], dbIdentityColumns = _a[3], dbIndices = _a[4];
                        // if tables were not found in the db, no need to proceed
                        if (!dbTables.length)
                            return [2 /*return*/, []];
                        // create table schemas for loaded tables
                        return [2 /*return*/, Promise.all(dbTables.map(function (dbTable) { return __awaiter(_this, void 0, void 0, function () {
                                var table;
                                return __generator(this, function (_a) {
                                    table = new Table(dbTable["TABLE_NAME"]);
                                    table.database = dbTable["TABLE_CATALOG"];
                                    table.schema = dbTable["TABLE_SCHEMA"];
                                    // create columns from the loaded columns
                                    table.columns = dbColumns
                                        .filter(function (dbColumn) { return dbColumn["TABLE_NAME"] === table.name; })
                                        .map(function (dbColumn) {
                                        var isPrimary = !!dbConstraints.find(function (dbConstraint) {
                                            return dbConstraint["TABLE_NAME"] === table.name &&
                                                dbConstraint["COLUMN_NAME"] === dbColumn["COLUMN_NAME"] &&
                                                dbConstraint["CONSTRAINT_TYPE"] === "PRIMARY KEY";
                                        });
                                        var isGenerated = !!dbIdentityColumns.find(function (column) {
                                            return column["TABLE_NAME"] === table.name &&
                                                column["COLUMN_NAME"] === dbColumn["COLUMN_NAME"];
                                        });
                                        var isUnique = !!dbConstraints.find(function (dbConstraint) {
                                            return dbConstraint["TABLE_NAME"] === table.name &&
                                                dbConstraint["COLUMN_NAME"] === dbColumn["COLUMN_NAME"] &&
                                                dbConstraint["CONSTRAINT_TYPE"] === "UNIQUE";
                                        });
                                        var tableColumn = new TableColumn();
                                        tableColumn.name = dbColumn["COLUMN_NAME"];
                                        tableColumn.type = dbColumn["DATA_TYPE"].toLowerCase();
                                        tableColumn.length = dbColumn["CHARACTER_MAXIMUM_LENGTH"] ? dbColumn["CHARACTER_MAXIMUM_LENGTH"].toString() : "";
                                        if (tableColumn.length === "-1")
                                            tableColumn.length = "MAX";
                                        tableColumn.precision = dbColumn["NUMERIC_PRECISION"];
                                        tableColumn.scale = dbColumn["NUMERIC_SCALE"];
                                        tableColumn.default = dbColumn["COLUMN_DEFAULT"] !== null && dbColumn["COLUMN_DEFAULT"] !== undefined ? dbColumn["COLUMN_DEFAULT"] : undefined;
                                        tableColumn.isNullable = dbColumn["IS_NULLABLE"] === "YES";
                                        tableColumn.isPrimary = isPrimary;
                                        tableColumn.isGenerated = isGenerated;
                                        if (tableColumn.default === "(newsequentialid())") {
                                            tableColumn.isGenerated = true;
                                            tableColumn.default = undefined;
                                        }
                                        tableColumn.isUnique = isUnique;
                                        tableColumn.charset = dbColumn["CHARACTER_SET_NAME"];
                                        tableColumn.collation = dbColumn["COLLATION_NAME"];
                                        tableColumn.comment = ""; // todo: less priority, implement this later
                                        if (tableColumn.type === "datetime2" || tableColumn.type === "time" || tableColumn.type === "datetimeoffset") {
                                            tableColumn.precision = dbColumn["DATETIME_PRECISION"];
                                        }
                                        return tableColumn;
                                    });
                                    // create primary key schema
                                    table.primaryKeys = dbConstraints
                                        .filter(function (dbConstraint) {
                                        return dbConstraint["TABLE_NAME"] === table.name &&
                                            dbConstraint["CONSTRAINT_TYPE"] === "PRIMARY KEY";
                                    })
                                        .map(function (keyColumnUsage) {
                                        return new TablePrimaryKey(keyColumnUsage["CONSTRAINT_NAME"], keyColumnUsage["COLUMN_NAME"]);
                                    });
                                    // create foreign key schemas from the loaded indices
                                    table.foreignKeys = dbConstraints
                                        .filter(function (dbConstraint) {
                                        return dbConstraint["TABLE_NAME"] === table.name &&
                                            dbConstraint["CONSTRAINT_TYPE"] === "FOREIGN KEY";
                                    })
                                        .map(function (dbConstraint) { return new TableForeignKey(dbConstraint["CONSTRAINT_NAME"], [], [], "", ""); }); // todo: fix missing params
                                    // create index schemas from the loaded indices
                                    table.indices = dbIndices
                                        .filter(function (dbIndex) {
                                        return dbIndex["TABLE_NAME"] === table.name &&
                                            (!table.foreignKeys.find(function (foreignKey) { return foreignKey.name === dbIndex["INDEX_NAME"]; })) &&
                                            (!table.primaryKeys.find(function (primaryKey) { return primaryKey.name === dbIndex["INDEX_NAME"]; }));
                                    })
                                        .map(function (dbIndex) { return dbIndex["INDEX_NAME"]; })
                                        .filter(function (value, index, self) { return self.indexOf(value) === index; }) // unqiue
                                        .map(function (dbIndexName) {
                                        var columnNames = dbIndices
                                            .filter(function (dbIndex) { return dbIndex["TABLE_NAME"] === table.name && dbIndex["INDEX_NAME"] === dbIndexName; })
                                            .map(function (dbIndex) { return dbIndex["COLUMN_NAME"]; });
                                        var isUnique = !!dbIndices.find(function (dbIndex) { return dbIndex["TABLE_NAME"] === table.name && dbIndex["INDEX_NAME"] === dbIndexName && dbIndex["IS_UNIQUE"] === true; });
                                        return new TableIndex(dbTable["TABLE_NAME"], dbIndexName, columnNames, isUnique);
                                    });
                                    return [2 /*return*/, table];
                                });
                            }); }))];
                }
            });
        });
    };
    /**
     * Checks if database with the given name exist.
     */
    SqlServerQueryRunner.prototype.hasDatabase = function (database) {
        return __awaiter(this, void 0, void 0, function () {
            var result, dbId;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.query("SELECT DB_ID('" + database + "') as db_id")];
                    case 1:
                        result = _a.sent();
                        dbId = result[0]["db_id"];
                        return [2 /*return*/, !!dbId];
                }
            });
        });
    };
    /**
     * Checks if table with the given name exist in the database.
     */
    SqlServerQueryRunner.prototype.hasTable = function (tablePath) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedTablePath, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedTablePath = this.parseTablePath(tablePath);
                        sql = "SELECT * FROM " + parsedTablePath.database + ".INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '" + parsedTablePath.tableName + "' AND TABLE_SCHEMA = " + (parsedTablePath.schema === "SCHEMA_NAME()" ? parsedTablePath.schema : "'" + parsedTablePath.schema + "'");
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
    SqlServerQueryRunner.prototype.createDatabase = function (database) {
        return this.query("IF DB_ID('" + database + "') IS NULL CREATE DATABASE " + database);
    };
    /**
     * Creates a schema if it's not created.
     */
    SqlServerQueryRunner.prototype.createSchema = function (schemaPaths) {
        var _this = this;
        if (this.driver.options.schema)
            schemaPaths.push(this.driver.options.schema);
        return PromiseUtils.runInSequence(schemaPaths, function (path) { return __awaiter(_this, void 0, void 0, function () {
            var query, dbName, schema, currentDBQuery, currentDB, query;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(path.indexOf(".") === -1)) return [3 /*break*/, 1];
                        query = "IF SCHEMA_ID('" + path + "') IS NULL BEGIN EXEC sp_executesql N'CREATE SCHEMA " + path + "' END";
                        return [2 /*return*/, this.query(query)];
                    case 1:
                        dbName = path.split(".")[0];
                        schema = path.split(".")[1];
                        return [4 /*yield*/, this.query("SELECT DB_NAME() AS db_name")];
                    case 2:
                        currentDBQuery = _a.sent();
                        currentDB = currentDBQuery[0]["db_name"];
                        return [4 /*yield*/, this.query("USE " + dbName)];
                    case 3:
                        _a.sent();
                        query = "IF SCHEMA_ID('" + schema + "') IS NULL BEGIN EXEC sp_executesql N'CREATE SCHEMA " + schema + "' END";
                        return [4 /*yield*/, this.query(query)];
                    case 4:
                        _a.sent();
                        return [2 /*return*/, this.query("USE " + currentDB)];
                }
            });
        }); });
    };
    /**
     * Creates a new table from the given table metadata and column metadatas.
     */
    SqlServerQueryRunner.prototype.createTable = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var columnDefinitions, sql, primaryKeyColumns;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columnDefinitions = table.columns.map(function (column) { return _this.buildCreateColumnSql(table.name, column, false, true); }).join(", ");
                        sql = "CREATE TABLE " + this.escapeTablePath(table) + " (" + columnDefinitions;
                        sql += table.columns
                            .filter(function (column) { return column.isUnique; })
                            .map(function (column) {
                            var constraintName = table.name + "_" + column.name;
                            var schema = table.schema || _this.driver.options.schema;
                            if (schema)
                                constraintName = schema + "_" + constraintName;
                            return ", CONSTRAINT \"uk_" + constraintName + "\" UNIQUE (\"" + column.name + "\")";
                        }).join(" ");
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
    SqlServerQueryRunner.prototype.dropTable = function (tablePath) {
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
    SqlServerQueryRunner.prototype.hasColumn = function (tablePath, columnName) {
        return __awaiter(this, void 0, void 0, function () {
            var parsedTablePath, sql, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        parsedTablePath = this.parseTablePath(tablePath);
                        sql = "SELECT * FROM " + parsedTablePath.database + ".INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = '" + parsedTablePath.tableName + "' AND COLUMN_NAME = '" + columnName + "' AND TABLE_SCHEMA = " + (parsedTablePath.schema === "SCHEMA_NAME()" ? parsedTablePath.schema : "'" + parsedTablePath.schema + "'");
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
    SqlServerQueryRunner.prototype.addColumn = function (tableOrPath, column) {
        return __awaiter(this, void 0, void 0, function () {
            var tableName, sql;
            return __generator(this, function (_a) {
                tableName = tableOrPath instanceof Table ? tableOrPath.name : this.parseTablePath(tableOrPath).tableName;
                sql = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " ADD " + this.buildCreateColumnSql(tableName, column, false, true);
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Creates a new columns from the column in the table.
     */
    SqlServerQueryRunner.prototype.addColumns = function (tableOrName, columns) {
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
    SqlServerQueryRunner.prototype.renameColumn = function (tableOrName, oldTableColumnOrName, newTableColumnOrName) {
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
    SqlServerQueryRunner.prototype.changeColumn = function (tableOrName, oldTableColumnOrName, newColumn) {
        return __awaiter(this, void 0, void 0, function () {
            var table, oldColumn, sql;
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
                        if (!(newColumn.isGenerated !== oldColumn.isGenerated)) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " DROP COLUMN \"" + newColumn.name + "\"")];
                    case 4:
                        _a.sent();
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " ADD " + this.buildCreateColumnSql(table.name, newColumn, false, false))];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        sql = "ALTER TABLE " + this.escapeTablePath(tableOrName) + " ALTER COLUMN " + this.buildCreateColumnSql(table.name, newColumn, true, false);
                        return [4 /*yield*/, this.query(sql)];
                    case 7:
                        _a.sent();
                        if (!(newColumn.isUnique !== oldColumn.isUnique)) return [3 /*break*/, 11];
                        if (!(newColumn.isUnique === true)) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " ADD CONSTRAINT \"uk_" + table.name + "_" + newColumn.name + "\" UNIQUE (\"" + newColumn.name + "\")")];
                    case 8:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 9:
                        if (!(newColumn.isUnique === false)) return [3 /*break*/, 11];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " DROP CONSTRAINT \"uk_" + table.name + "_" + newColumn.name + "\"")];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11:
                        if (!(newColumn.default !== oldColumn.default)) return [3 /*break*/, 16];
                        if (!(newColumn.default !== null && newColumn.default !== undefined)) return [3 /*break*/, 14];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " DROP CONSTRAINT \"df_" + table.name + "_" + newColumn.name + "\"")];
                    case 12:
                        _a.sent();
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " ADD CONSTRAINT \"df_" + table.name + "_" + newColumn.name + "\" DEFAULT " + newColumn.default + " FOR \"" + newColumn.name + "\"")];
                    case 13:
                        _a.sent();
                        return [3 /*break*/, 16];
                    case 14:
                        if (!(oldColumn.default !== null && oldColumn.default !== undefined)) return [3 /*break*/, 16];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(tableOrName) + " DROP CONSTRAINT \"df_" + table.name + "_" + newColumn.name + "\"")];
                    case 15:
                        _a.sent();
                        _a.label = 16;
                    case 16: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Changes a column in the table.
     */
    SqlServerQueryRunner.prototype.changeColumns = function (table, changedColumns) {
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
    SqlServerQueryRunner.prototype.dropColumn = function (table, column) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!column.default) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(table) + " DROP CONSTRAINT \"df_" + table.name + "_" + column.name + "\"")];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(table) + " DROP COLUMN \"" + column.name + "\"")];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Drops the columns in the table.
     */
    SqlServerQueryRunner.prototype.dropColumns = function (table, columns) {
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
    SqlServerQueryRunner.prototype.updatePrimaryKeys = function (table) {
        return __awaiter(this, void 0, void 0, function () {
            var schema, database, oldPrimaryKeySql, oldPrimaryKey, primaryColumnNames;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        schema = table.schema || "SCHEMA_NAME()";
                        database = table.database || this.driver.database;
                        oldPrimaryKeySql = "SELECT columnUsages.*, tableConstraints.CONSTRAINT_TYPE FROM " + database + ".INFORMATION_SCHEMA.KEY_COLUMN_USAGE columnUsages\nLEFT JOIN " + database + ".INFORMATION_SCHEMA.TABLE_CONSTRAINTS tableConstraints ON tableConstraints.CONSTRAINT_NAME = columnUsages.CONSTRAINT_NAME AND tableConstraints.CONSTRAINT_TYPE = 'PRIMARY KEY'\nWHERE tableConstraints.TABLE_CATALOG = '" + database + "' AND columnUsages.TABLE_SCHEMA = '" + schema + "' AND tableConstraints.TABLE_SCHEMA = '" + schema + "'";
                        return [4 /*yield*/, this.query(oldPrimaryKeySql)];
                    case 1:
                        oldPrimaryKey = _a.sent();
                        if (!(oldPrimaryKey.length > 0)) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(table) + " DROP CONSTRAINT \"" + oldPrimaryKey[0]["CONSTRAINT_NAME"] + "\"")];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        primaryColumnNames = table.primaryKeys.map(function (primaryKey) { return "\"" + primaryKey.columnName + "\""; });
                        if (!(primaryColumnNames.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.query("ALTER TABLE " + this.escapeTablePath(table) + " ADD PRIMARY KEY (" + primaryColumnNames.join(", ") + ")")];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Creates a new foreign key.
     */
    SqlServerQueryRunner.prototype.createForeignKey = function (tableOrPath, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var columnNames, referencedColumnNames, sql;
            return __generator(this, function (_a) {
                columnNames = foreignKey.columnNames.map(function (column) { return "\"" + column + "\""; }).join(", ");
                referencedColumnNames = foreignKey.referencedColumnNames.map(function (column) { return "\"" + column + "\""; }).join(",");
                sql = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " ADD CONSTRAINT \"" + foreignKey.name + "\" " +
                    ("FOREIGN KEY (" + columnNames + ") ") +
                    ("REFERENCES " + this.escapeTablePath(foreignKey.referencedTablePath) + "(" + referencedColumnNames + ")");
                if (foreignKey.onDelete)
                    sql += " ON DELETE " + foreignKey.onDelete;
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Creates a new foreign keys.
     */
    SqlServerQueryRunner.prototype.createForeignKeys = function (tableOrName, foreignKeys) {
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
    SqlServerQueryRunner.prototype.dropForeignKey = function (tableOrPath, foreignKey) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                sql = "ALTER TABLE " + this.escapeTablePath(tableOrPath) + " DROP CONSTRAINT \"" + foreignKey.name + "\"";
                return [2 /*return*/, this.query(sql)];
            });
        });
    };
    /**
     * Drops a foreign keys from the table.
     */
    SqlServerQueryRunner.prototype.dropForeignKeys = function (tableOrName, foreignKeys) {
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
    SqlServerQueryRunner.prototype.createIndex = function (tablePath, index) {
        return __awaiter(this, void 0, void 0, function () {
            var columns, sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        columns = index.columnNames.map(function (columnName) { return "\"" + columnName + "\""; }).join(", ");
                        sql = "CREATE " + (index.isUnique ? "UNIQUE " : "") + "INDEX \"" + index.name + "\" ON " + this.escapeTablePath(tablePath) + "(" + columns + ")";
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
    SqlServerQueryRunner.prototype.dropIndex = function (tableSchemeOrName, indexName) {
        return __awaiter(this, void 0, void 0, function () {
            var sql;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        sql = "DROP INDEX \"" + indexName + "\" ON " + this.escapeTablePath(tableSchemeOrName);
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
    SqlServerQueryRunner.prototype.truncate = function (tablePath) {
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
    SqlServerQueryRunner.prototype.clearDatabase = function (schemas, database) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var isDatabaseExist, schemaNamesString, allTablesSql, allTablesResults, error_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.hasDatabase(database)];
                    case 1:
                        isDatabaseExist = _a.sent();
                        if (!isDatabaseExist)
                            return [2 /*return*/, Promise.resolve()];
                        if (!schemas)
                            schemas = [];
                        schemas.push(this.driver.options.schema || "SCHEMA_NAME()");
                        schemaNamesString = schemas.map(function (name) {
                            return name === "SCHEMA_NAME()" ? name : "'" + name + "'";
                        }).join(", ");
                        return [4 /*yield*/, this.startTransaction()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 8, , 13]);
                        allTablesSql = "SELECT * FROM " + database + ".INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_SCHEMA IN (" + schemaNamesString + ")";
                        return [4 /*yield*/, this.query(allTablesSql)];
                    case 4:
                        allTablesResults = _a.sent();
                        return [4 /*yield*/, Promise.all(allTablesResults.map(function (tablesResult) { return __awaiter(_this, void 0, void 0, function () {
                                var _this = this;
                                var dropForeignKeySql, dropFkQueries;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            dropForeignKeySql = "SELECT 'ALTER TABLE \"" + database + "\".\"' + OBJECT_SCHEMA_NAME(fk.parent_object_id, DB_ID('" + database + "')) + '\".\"' + OBJECT_NAME(fk.parent_object_id, DB_ID('" + database + "')) + '\" DROP CONSTRAINT \"' + fk.name + '\"' as query FROM " + database + ".sys.foreign_keys AS fk WHERE fk.referenced_object_id = object_id('\"" + database + "\".\"" + tablesResult["TABLE_SCHEMA"] + "\".\"" + tablesResult["TABLE_NAME"] + "\"')";
                                            return [4 /*yield*/, this.query(dropForeignKeySql)];
                                        case 1:
                                            dropFkQueries = _a.sent();
                                            return [2 /*return*/, Promise.all(dropFkQueries.map(function (result) { return result["query"]; }).map(function (dropQuery) {
                                                    return _this.query(dropQuery);
                                                }))];
                                    }
                                });
                            }); }))];
                    case 5:
                        _a.sent();
                        return [4 /*yield*/, Promise.all(allTablesResults.map(function (tablesResult) {
                                var dropTableSql = "DROP TABLE \"" + tablesResult["TABLE_CATALOG"] + "\".\"" + tablesResult["TABLE_SCHEMA"] + "\".\"" + tablesResult["TABLE_NAME"] + "\"";
                                return _this.query(dropTableSql);
                            }))];
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
    SqlServerQueryRunner.prototype.enableSqlMemory = function () {
        this.sqlMemoryMode = true;
    };
    /**
     * Disables special query runner mode in which sql queries won't be executed
     * started by calling enableSqlMemory() method.
     *
     * Previously memorized sql will be flushed.
     */
    SqlServerQueryRunner.prototype.disableSqlMemory = function () {
        this.sqlsInMemory = [];
        this.sqlMemoryMode = false;
    };
    /**
     * Gets sql stored in the memory. Parameters in the sql are already replaced.
     */
    SqlServerQueryRunner.prototype.getMemorySql = function () {
        return this.sqlsInMemory;
    };
    // -------------------------------------------------------------------------
    // Protected Methods
    // -------------------------------------------------------------------------
    /**
     * Escapes given table path.
     */
    SqlServerQueryRunner.prototype.escapeTablePath = function (tableOrPath, disableEscape) {
        var tablePath;
        if (tableOrPath instanceof Table) {
            var schema = tableOrPath.schema || this.driver.options.schema;
            if (schema) {
                tablePath = schema + "." + tableOrPath.name;
                if (tableOrPath.database)
                    tablePath = tableOrPath.database + "." + tablePath;
            }
            else {
                tablePath = tableOrPath.name;
                if (tableOrPath.database)
                    tablePath = tableOrPath.database + ".." + tablePath;
            }
        }
        else {
            tablePath = tableOrPath.indexOf(".") === -1 && this.driver.options.schema ? this.driver.options.schema + "." + tableOrPath : tableOrPath;
        }
        return tablePath.split(".").map(function (i) {
            // this condition need because when custom database name was specified and schema name was not, we got `dbName..tableName` string, and doesn't need to escape middle empty string
            if (i === "")
                return i;
            return disableEscape ? i : "\"" + i + "\"";
        }).join(".");
    };
    SqlServerQueryRunner.prototype.parseTablePath = function (target) {
        var tableName = target instanceof Table ? target.name : target;
        if (tableName.split(".").length === 3) {
            return {
                database: tableName.split(".")[0],
                schema: tableName.split(".")[1] === "" ? "SCHEMA_NAME()" : tableName.split(".")[1],
                tableName: tableName.split(".")[2]
            };
        }
        else if (tableName.split(".").length === 2) {
            return {
                database: this.driver.database,
                schema: tableName.split(".")[0],
                tableName: tableName.split(".")[1]
            };
        }
        else {
            return {
                database: this.driver.database,
                schema: this.driver.options.schema ? this.driver.options.schema : "SCHEMA_NAME()",
                tableName: tableName
            };
        }
    };
    /**
     * Parametrizes given object of values. Used to create column=value queries.
     */
    SqlServerQueryRunner.prototype.parametrize = function (objectLiteral, startFrom) {
        if (startFrom === void 0) { startFrom = 0; }
        return Object.keys(objectLiteral).map(function (key, index) {
            return "\"" + key + "\"" + "=@" + (startFrom + index);
        });
    };
    /**
     * Builds a query for create column.
     */
    SqlServerQueryRunner.prototype.buildCreateColumnSql = function (tableName, column, skipIdentity, createDefault) {
        var c = "\"" + column.name + "\" " + this.connection.driver.createFullType(column);
        if (column.collation)
            c += " COLLATE " + column.collation;
        if (column.isNullable !== true)
            c += " NOT NULL";
        if (column.isGenerated === true && column.generationStrategy === "increment" && !skipIdentity) // don't use skipPrimary here since updates can update already exist primary without auto inc.
            c += " IDENTITY(1,1)";
        // if (column.isPrimary === true && !skipPrimary)
        //     c += " PRIMARY KEY";
        if (column.comment)
            c += " COMMENT '" + column.comment + "'";
        if (createDefault) {
            if (column.default !== undefined && column.default !== null) {
                c += " CONSTRAINT \"df_" + tableName + "_" + column.name + "\" DEFAULT " + column.default;
            }
        }
        if (column.isGenerated && column.generationStrategy === "uuid" && !column.default)
            c += " DEFAULT NEWSEQUENTIALID()";
        return c;
    };
    return SqlServerQueryRunner;
}());
export { SqlServerQueryRunner };

//# sourceMappingURL=SqlServerQueryRunner.js.map
