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
var SqlServerDriver_1 = require("../driver/sqlserver/SqlServerDriver");
var MssqlParameter_1 = require("../driver/sqlserver/MssqlParameter");
/**
 * Caches query result into current database, into separate table called "query-result-cache".
 */
var DbQueryResultCache = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function DbQueryResultCache(connection) {
        this.connection = connection;
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a connection with given cache provider.
     */
    DbQueryResultCache.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Disconnects with given cache provider.
     */
    DbQueryResultCache.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Creates table for storing cache if it does not exist yet.
     */
    DbQueryResultCache.prototype.synchronize = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var driver, tableExist;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.getQueryRunner(queryRunner);
                        driver = this.connection.driver;
                        return [4 /*yield*/, queryRunner.hasTable("query-result-cache")];
                    case 1:
                        tableExist = _a.sent();
                        if (tableExist)
                            return [2 /*return*/];
                        return [4 /*yield*/, queryRunner.createTable(new Table_1.Table("query-result-cache", [
                                new TableColumn_1.TableColumn({
                                    name: "id",
                                    isNullable: true,
                                    isPrimary: true,
                                    type: driver.normalizeType({ type: driver.mappedDataTypes.cacheId }),
                                    generationStrategy: "increment",
                                    isGenerated: true
                                }),
                                new TableColumn_1.TableColumn({
                                    name: "identifier",
                                    type: driver.normalizeType({ type: driver.mappedDataTypes.cacheIdentifier }),
                                    isNullable: true
                                }),
                                new TableColumn_1.TableColumn({
                                    name: "time",
                                    type: driver.normalizeType({ type: driver.mappedDataTypes.cacheTime }),
                                    isPrimary: false,
                                    isNullable: false
                                }),
                                new TableColumn_1.TableColumn({
                                    name: "duration",
                                    type: driver.normalizeType({ type: driver.mappedDataTypes.cacheDuration }),
                                    isPrimary: false,
                                    isNullable: false
                                }),
                                new TableColumn_1.TableColumn({
                                    name: "query",
                                    type: driver.normalizeType({ type: driver.mappedDataTypes.cacheQuery }),
                                    isPrimary: false,
                                    isNullable: false
                                }),
                                new TableColumn_1.TableColumn({
                                    name: "result",
                                    type: driver.normalizeType({ type: driver.mappedDataTypes.cacheResult }),
                                    isNullable: false
                                }),
                            ]))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Caches given query result.
     * Returns cache result if found.
     * Returns undefined if result is not cached.
     */
    DbQueryResultCache.prototype.getFromCache = function (options, queryRunner) {
        queryRunner = this.getQueryRunner(queryRunner);
        var qb = this.connection
            .createQueryBuilder(queryRunner)
            .select()
            .from("query-result-cache", "cache");
        if (options.identifier) {
            return qb
                .where(qb.escape("cache") + "." + qb.escape("identifier") + " = :identifier")
                .setParameters({ identifier: this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver ? new MssqlParameter_1.MssqlParameter(options.identifier, "nvarchar") : options.identifier })
                .getRawOne();
        }
        else if (options.query) {
            return qb
                .where(qb.escape("cache") + "." + qb.escape("query") + " = :query")
                .setParameters({ query: this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver ? new MssqlParameter_1.MssqlParameter(options.query, "nvarchar") : options.query })
                .getRawOne();
        }
        return Promise.resolve(undefined);
    };
    /**
     * Checks if cache is expired or not.
     */
    DbQueryResultCache.prototype.isExpired = function (savedCache) {
        return ((typeof savedCache.time === "string" ? parseInt(savedCache.time) : savedCache.time) + savedCache.duration) < new Date().getTime();
    };
    /**
     * Stores given query result in the cache.
     */
    DbQueryResultCache.prototype.storeInCache = function (options, savedCache, queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var insertedValues;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        queryRunner = this.getQueryRunner(queryRunner);
                        insertedValues = options;
                        if (this.connection.driver instanceof SqlServerDriver_1.SqlServerDriver) { // todo: bad abstraction, re-implement this part, probably better if we create an entity metadata for cache table
                            insertedValues = {
                                identifier: new MssqlParameter_1.MssqlParameter(options.identifier, "nvarchar"),
                                time: new MssqlParameter_1.MssqlParameter(options.time, "bigint"),
                                duration: new MssqlParameter_1.MssqlParameter(options.duration, "int"),
                                query: new MssqlParameter_1.MssqlParameter(options.query, "nvarchar"),
                                result: new MssqlParameter_1.MssqlParameter(options.result, "nvarchar"),
                            };
                        }
                        if (!(savedCache && savedCache.identifier)) return [3 /*break*/, 2];
                        return [4 /*yield*/, queryRunner.update("query-result-cache", insertedValues, { identifier: insertedValues.identifier })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 2:
                        if (!(savedCache && savedCache.query)) return [3 /*break*/, 4];
                        return [4 /*yield*/, queryRunner.update("query-result-cache", insertedValues, { query: insertedValues.query })];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 4: // otherwise insert
                    return [4 /*yield*/, queryRunner.insert("query-result-cache", insertedValues)];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Clears everything stored in the cache.
     */
    DbQueryResultCache.prototype.clear = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getQueryRunner(queryRunner).truncate("query-result-cache")];
            });
        });
    };
    /**
     * Removes all cached results by given identifiers from cache.
     */
    DbQueryResultCache.prototype.remove = function (identifiers, queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(identifiers.map(function (identifier) {
                            return _this.getQueryRunner(queryRunner).delete("query-result-cache", { identifier: identifier });
                        }))];
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
     * Gets a query runner to work with.
     */
    DbQueryResultCache.prototype.getQueryRunner = function (queryRunner) {
        if (queryRunner)
            return queryRunner;
        return this.connection.createQueryRunner("master");
    };
    return DbQueryResultCache;
}());
exports.DbQueryResultCache = DbQueryResultCache;

//# sourceMappingURL=DbQueryResultCache.js.map
