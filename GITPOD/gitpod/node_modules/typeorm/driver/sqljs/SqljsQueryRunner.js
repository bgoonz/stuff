"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var QueryRunnerAlreadyReleasedError_1 = require("../../error/QueryRunnerAlreadyReleasedError");
var OrmUtils_1 = require("../../util/OrmUtils");
var AbstractSqliteQueryRunner_1 = require("../sqlite-abstract/AbstractSqliteQueryRunner");
/**
 * Runs queries on a single sqlite database connection.
 *
 * Does not support compose primary keys with autoincrement field.
 * todo: need to throw exception for this case.
 */
var SqljsQueryRunner = /** @class */ (function (_super) {
    __extends(SqljsQueryRunner, _super);
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function SqljsQueryRunner(driver) {
        var _this = _super.call(this, driver) || this;
        _this.driver = driver;
        _this.connection = driver.connection;
        return _this;
    }
    // -------------------------------------------------------------------------
    // Public methods
    // -------------------------------------------------------------------------
    /**
     * Commits transaction.
     * Error will be thrown if transaction was not started.
     */
    SqljsQueryRunner.prototype.commitTransaction = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.commitTransaction.call(this)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.driver.autoSave()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Executes a given SQL query.
     */
    SqljsQueryRunner.prototype.query = function (query, parameters) {
        var _this = this;
        if (this.isReleased)
            throw new QueryRunnerAlreadyReleasedError_1.QueryRunnerAlreadyReleasedError();
        return new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
            var databaseConnection, queryStartTime, statement, maxQueryExecutionTime, queryEndTime, queryExecutionTime, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.connect()];
                    case 1:
                        databaseConnection = _a.sent();
                        this.driver.connection.logger.logQuery(query, parameters, this);
                        queryStartTime = +new Date();
                        try {
                            statement = databaseConnection.prepare(query);
                            statement.bind(parameters);
                            maxQueryExecutionTime = this.driver.connection.options.maxQueryExecutionTime;
                            queryEndTime = +new Date();
                            queryExecutionTime = queryEndTime - queryStartTime;
                            if (maxQueryExecutionTime && queryExecutionTime > maxQueryExecutionTime)
                                this.driver.connection.logger.logQuerySlow(queryExecutionTime, query, parameters, this);
                            result = [];
                            while (statement.step()) {
                                result.push(statement.getAsObject());
                            }
                            statement.free();
                            ok(result);
                        }
                        catch (e) {
                            fail(e);
                        }
                        return [2 /*return*/];
                }
            });
        }); });
    };
    /**
     * Insert a new row with given values into the given table.
     * Returns value of the generated column if given and generate column exist in the table.
     */
    SqljsQueryRunner.prototype.insert = function (tableName, keyValues) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            var keys, columns, values, generatedColumns, sql, parameters;
            return __generator(this, function (_a) {
                keys = Object.keys(keyValues);
                columns = keys.map(function (key) { return "\"" + key + "\""; }).join(", ");
                values = keys.map(function (key) { return "?"; }).join(",");
                generatedColumns = this.connection.hasMetadata(tableName) ? this.connection.getMetadata(tableName).generatedColumns : [];
                sql = columns.length > 0 ? ("INSERT INTO \"" + tableName + "\"(" + columns + ") VALUES (" + values + ")") : "INSERT INTO \"" + tableName + "\" DEFAULT VALUES";
                parameters = keys.map(function (key) { return keyValues[key]; });
                return [2 /*return*/, new Promise(function (ok, fail) { return __awaiter(_this, void 0, void 0, function () {
                        var databaseConnection, statement, generatedMap, e_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.driver.connection.logger.logQuery(sql, parameters, this);
                                    return [4 /*yield*/, this.connect()];
                                case 1:
                                    databaseConnection = _a.sent();
                                    _a.label = 2;
                                case 2:
                                    _a.trys.push([2, 5, , 6]);
                                    statement = databaseConnection.prepare(sql);
                                    statement.bind(parameters);
                                    statement.step();
                                    generatedMap = generatedColumns.reduce(function (map, generatedColumn) {
                                        var value = keyValues[generatedColumn.databaseName];
                                        // seems to be the only way to get the inserted id, see https://github.com/kripken/sql.js/issues/77
                                        if (generatedColumn.isPrimary && generatedColumn.generationStrategy === "increment") {
                                            value = databaseConnection.exec("SELECT last_insert_rowid()")[0].values[0][0];
                                        }
                                        if (!value)
                                            return map;
                                        return OrmUtils_1.OrmUtils.mergeDeep(map, generatedColumn.createValueMap(value));
                                    }, {});
                                    if (!!this.isTransactionActive) return [3 /*break*/, 4];
                                    return [4 /*yield*/, this.driver.autoSave()];
                                case 3:
                                    _a.sent();
                                    _a.label = 4;
                                case 4:
                                    ok({
                                        result: undefined,
                                        generatedMap: Object.keys(generatedMap).length > 0 ? generatedMap : undefined
                                    });
                                    return [3 /*break*/, 6];
                                case 5:
                                    e_1 = _a.sent();
                                    fail(e_1);
                                    return [3 /*break*/, 6];
                                case 6: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    /**
     * Updates rows that match given conditions in the given table.
     * Calls AbstractSqliteQueryRunner.update() and runs autoSave if update() was not called in a transaction.
     */
    SqljsQueryRunner.prototype.update = function (tableName, valuesMap, conditions) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.update.call(this, tableName, valuesMap, conditions)];
                    case 1:
                        _a.sent();
                        if (!!this.isTransactionActive) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.driver.autoSave()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Deletes from the given table by a given conditions.
     * Calls AbstractSqliteQueryRunner.delete() and runs autoSave if delete() was not called in a transaction.
     */
    SqljsQueryRunner.prototype.delete = function (tableName, conditions, maybeParameters) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, _super.prototype.delete.call(this, tableName, conditions, maybeParameters)];
                    case 1:
                        _a.sent();
                        if (!!this.isTransactionActive) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.driver.autoSave()];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return SqljsQueryRunner;
}(AbstractSqliteQueryRunner_1.AbstractSqliteQueryRunner));
exports.SqljsQueryRunner = SqljsQueryRunner;

//# sourceMappingURL=SqljsQueryRunner.js.map
