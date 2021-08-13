var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
import { Table } from "../../schema-builder/schema/Table";
import { QueryRunnerAlreadyReleasedError } from "../../error/QueryRunnerAlreadyReleasedError";
import { OrmUtils } from "../../util/OrmUtils";
import { QueryFailedError } from "../../error/QueryFailedError";
import { AbstractSqliteQueryRunner } from "../sqlite-abstract/AbstractSqliteQueryRunner";
/**
 * Runs queries on a single websql database connection.
 */
var WebsqlQueryRunner = /** @class */ (function (_super) {
    __extends(WebsqlQueryRunner, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function WebsqlQueryRunner(driver) {
        var _this = _super.call(this, driver) || this;
        _this.driver = driver;
        _this.connection = driver.connection;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates/uses database connection from the connection pool to perform further operations.
     * Returns obtained database connection.
     */
    WebsqlQueryRunner.prototype.connect = function () {
        var _this = this;
        if (this.databaseConnection)
            return Promise.resolve(this.databaseConnection);
        if (this.databaseConnectionPromise)
            return this.databaseConnectionPromise;
        var options = Object.assign({}, {
            database: this.driver.options.database,
            version: this.driver.options.version,
            description: this.driver.options.description,
            size: this.driver.options.size,
        }, this.driver.options.extra || {});
        this.databaseConnectionPromise = new Promise(function (ok, fail) {
            _this.databaseConnection = openDatabase(options.database, options.version, options.description, options.size);
            ok(_this.databaseConnection);
        });
        return this.databaseConnectionPromise;
    };
    /**
     * Starts transaction.
     */
    WebsqlQueryRunner.prototype.startTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (this.isTransactionActive)
                    throw new TransactionAlreadyStartedError();
                this.isTransactionActive = true;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    WebsqlQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (!this.isTransactionActive)
                    throw new TransactionNotStartedError();
                // await this.query("COMMIT");
                this.isTransactionActive = false;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Rollbacks transaction.
     * Error will be thrown if transaction was not started.
     */
    WebsqlQueryRunner.prototype.rollbackTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.isReleased)
                    throw new QueryRunnerAlreadyReleasedError();
                if (!this.isTransactionActive)
                    throw new TransactionNotStartedError();
                // await this.query("ROLLBACK");
                this.isTransactionActive = false;
                return [2 /*return*/];
            });
        });
    };
    /**
     * Executes a given SQL query.
     */
    WebsqlQueryRunner.prototype.query = function (query, parameters) {
        var _this = this;
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError();
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var _this = this;
            var db, queryStartTime_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        db = _a.sent();
                        // todo(dima): check if transaction is not active
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        queryStartTime_1 = +new Date();
                        db.transaction(function (tx) {
                            tx.executeSql(query, parameters, function (tx, result) {
                                // log slow queries if maxQueryExecution time is set
                                var maxQueryExecutionTime = _this.driver.connection.options.maxQueryExecutionTime;
                                var queryEndTime = +new Date();
                                var queryExecutionTime = queryEndTime - queryStartTime_1;
                                if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime)
                                    _this.driver.connection.logger.logQuerySlow(queryExecutionTime, query, parameters, _this);
                                var rows = Object
                                    .keys(result.rows)
                                    .filter(function (key) { return key !== "length"; })
                                    .map(function (key) { return result.rows[key]; });
                                ok(rows);
                            }, function (tx, err) {
                                _this.driver.connection.logger.logQueryError(err, query, parameters, _this);
                                return fail(new QueryFailedError(query, parameters, err));
                            });
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
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    WebsqlQueryRunner.prototype.insert = function (tableName, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var keys, columns, values, generatedColumns, sql, parameters;
            return __generator(this, function (_a) {
                keys = Object.keys(keyValues);
                columns = keys.map(function (key) { return "\"" + key + "\""; }).join(", ");
                values = keys.map(function (key, index) { return "$" + (index + 1); }).join(",");
                generatedColumns = this.connection.hasMetadata(tableName) ? this.connection.getMetadata(tableName).generatedColumns : [];
                sql = columns.length > 0 ? ("INSERT INTO \"" + tableName + "\"(" + columns + ") VALUES (" + values + ")") : "INSERT INTO \"" + tableName + "\" DEFAULT VALUES";
                parameters = keys.map(function (key) { return keyValues[key]; });
                return [2 /*return*/, new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
                        var _this = this;
                        var db;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.driver.connection.logger.logQuery(sql, parameters, this);
                                    return [4 /*yield*/, this.connect()];
                                case 1:
                                    db = _a.sent();
                                    // todo: check if transaction is not active
                                    db.transaction(function (tx) {
                                        tx.executeSql(sql, parameters, function (tx, result) {
                                            var generatedMap = generatedColumns.reduce(function (map, generatedColumn) {
                                                var value = generatedColumn.isPrimary && generatedColumn.generationStrategy === "increment" && result["insertId"] ? result["insertId"] : keyValues[generatedColumn.databaseName];
                                                if (!value)
                                                    return map;
                                                return OrmUtils.mergeDeep(map, generatedColumn.createValueMap(value));
                                            }, {});
                                            ok({
                                                result: undefined,
                                                generatedMap: Object.keys(generatedMap).length > 0 ? generatedMap : undefined
                                            });
                                        }, function (tx, err) {
                                            _this.driver.connection.logger.logQueryError(err, sql, parameters, _this);
                                            return fail(err);
                                        });
                                    });
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    // TODO: finish the table schema loading
    /**
     * Loads all tables (with given names) from the database and creates a Table from them.
     */
    WebsqlQueryRunner.prototype.getTables = function (tableNames) {
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
                                var table;
                                return __generator(this, function (_a) {
                                    table = new Table(dbTable["name"]);
                                    // load columns and indices
                                    /*const [dbColumns, dbIndices, dbForeignKeys]: ObjectLiteral[][] = await Promise.all([
                                        this.query(`PRAGMA table_info("${dbTable["name"]}")`),
                                        this.query(`PRAGMA index_list("${dbTable["name"]}")`),
                                        this.query(`PRAGMA foreign_key_list("${dbTable["name"]}")`),
                                    ]);
                        
                                    // find column name with auto increment
                                    let autoIncrementColumnName: string|undefined = undefined;
                                    const tableSql: string = dbTable["sql"];
                                    if (tableSql.indexOf("AUTOINCREMENT") !== -1) {
                                        autoIncrementColumnName = tableSql.substr(0, tableSql.indexOf("AUTOINCREMENT"));
                                        const comma = autoIncrementColumnName.lastIndexOf(",");
                                        const bracket = autoIncrementColumnName.lastIndexOf("(");
                                        if (comma !== -1) {
                                            autoIncrementColumnName = autoIncrementColumnName.substr(comma);
                                            autoIncrementColumnName = autoIncrementColumnName.substr(0, autoIncrementColumnName.lastIndexOf("\""));
                                            autoIncrementColumnName = autoIncrementColumnName.substr(autoIncrementColumnName.indexOf("\"") + 1);
                        
                                        } else if (bracket !== -1) {
                                            autoIncrementColumnName = autoIncrementColumnName.substr(bracket);
                                            autoIncrementColumnName = autoIncrementColumnName.substr(0, autoIncrementColumnName.lastIndexOf("\""));
                                            autoIncrementColumnName = autoIncrementColumnName.substr(autoIncrementColumnName.indexOf("\"") + 1);
                                        }
                                    }
                        
                                    // create columns from the loaded columns
                                    table.columns = dbColumns.map(dbColumn => {
                                        const tableColumn = new TableColumn();
                                        tableColumn.name = dbColumn["name"];
                                        tableColumn.type = dbColumn["type"].toLowerCase();
                                        tableColumn.default = dbColumn["dflt_value"] !== null && dbColumn["dflt_value"] !== undefined ? dbColumn["dflt_value"] : undefined;
                                        tableColumn.isNullable = dbColumn["notnull"] === 0;
                                        tableColumn.isPrimary = dbColumn["pk"] === 1;
                                        tableColumn.comment = ""; // todo later
                                        tableColumn.isGenerated = autoIncrementColumnName === dbColumn["name"];
                                        const columnForeignKeys = dbForeignKeys
                                            .filter(foreignKey => foreignKey["from"] === dbColumn["name"])
                                            .map(foreignKey => {
                                                const keyName = namingStrategy.foreignKeyName(dbTable["name"], [foreignKey["from"]], foreignKey["table"], [foreignKey["to"]]);
                                                return new TableForeignKey(keyName, [foreignKey["from"]], [foreignKey["to"]], foreignKey["table"], foreignKey["on_delete"]); // todo: how sqlite return from and to when they are arrays? (multiple column foreign keys)
                                            });
                                        table.addForeignKeys(columnForeignKeys);
                                        return tableColumn;
                                    });
                        
                                    // create primary key schema
                                    await Promise.all(dbIndices
                                        .filter(index => index["origin"] === "pk")
                                        .map(async index => {
                                            const indexInfos: ObjectLiteral[] = await this.query(`PRAGMA index_info("${index["name"]}")`);
                                            const indexColumns = indexInfos.map(indexInfo => indexInfo["name"]);
                                            indexColumns.forEach(indexColumn => {
                                                table.primaryKeys.push(new TablePrimaryKey(index["name"], indexColumn));
                                            });
                                        }));
                        
                                    // create index schemas from the loaded indices
                                    const indicesPromises = dbIndices
                                        .filter(dbIndex => {
                                            return  dbIndex["origin"] !== "pk" &&
                                                (!table.foreignKeys.find(foreignKey => foreignKey.name === dbIndex["name"])) &&
                                                (!table.primaryKeys.find(primaryKey => primaryKey.name === dbIndex["name"]));
                                        })
                                        .map(dbIndex => dbIndex["name"])
                                        .filter((value, index, self) => self.indexOf(value) === index) // unqiue
                                        .map(async dbIndexName => {
                                            const dbIndex = dbIndices.find(dbIndex => dbIndex["name"] === dbIndexName);
                                            const indexInfos: ObjectLiteral[] = await this.query(`PRAGMA index_info("${dbIndex!["name"]}")`);
                                            const indexColumns = indexInfos.map(indexInfo => indexInfo["name"]);
                        
                                            // check if db index is generated by sqlite itself and has special use case
                                            if (dbIndex!["name"].substr(0, "sqlite_autoindex".length) === "sqlite_autoindex") {
                                                if (dbIndex!["unique"] === 1) { // this means we have a special index generated for a column
                                                    // so we find and update the column
                                                    indexColumns.forEach(columnName => {
                                                        const column = table.columns.find(column => column.name === columnName);
                                                        if (column)
                                                            column.isUnique = true;
                                                    });
                                                }
                        
                                                return Promise.resolve(undefined);
                        
                                            } else {
                                                return new TableIndex(dbTable["name"], dbIndex!["name"], indexColumns, dbIndex!["unique"] === "1");
                                            }
                                        });
                        
                                    const indices = await Promise.all(indicesPromises);
                                    table.indices = indices.filter(index => !!index) as TableIndex[];*/
                                    return [2 /*return*/, table];
                                });
                            }); }))];
                }
            });
        });
    };
    /**
     * Removes all tables from the currently connected database.
     */
    WebsqlQueryRunner.prototype.clearDatabase = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var selectDropsQuery, dropQueries, error_1, rollbackError_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // await this.query(`PRAGMA foreign_keys = OFF;`);
                    return [4 /*yield*/, this.startTransaction()];
                    case 1:
                        // await this.query(`PRAGMA foreign_keys = OFF;`);
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 11]);
                        selectDropsQuery = "select 'drop table \"' || name || '\";' as query from sqlite_master where type = 'table' and name != 'sqlite_sequence'";
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
    return WebsqlQueryRunner;
}(AbstractSqliteQueryRunner));
export { WebsqlQueryRunner };

//# sourceMappingURL=WebsqlQueryRunner.js.map
