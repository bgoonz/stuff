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
import { PlatformTools } from "../platform/PlatformTools";
/**
 * Caches query result into Redis database.
 */
var RedisQueryResultCache = /** @class */ (function () {
    // -------------------------------------------------------------------------
    // Constructor
    // -------------------------------------------------------------------------
    function RedisQueryResultCache(connection) {
        this.connection = connection;
        this.redis = this.loadRedis();
    }
    // -------------------------------------------------------------------------
    // Public Methods
    // -------------------------------------------------------------------------
    /**
     * Creates a connection with given cache provider.
     */
    RedisQueryResultCache.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var cacheOptions;
            return __generator(this, function (_a) {
                cacheOptions = this.connection.options.cache;
                if (cacheOptions && cacheOptions.options) {
                    this.client = this.redis.createClient(cacheOptions.options);
                }
                else {
                    this.client = this.redis.createClient();
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Creates a connection with given cache provider.
     */
    RedisQueryResultCache.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        _this.client.quit(function (err, result) {
                            if (err)
                                return fail(err);
                            ok();
                            _this.client = undefined;
                        });
                    })];
            });
        });
    };
    /**
     * Creates table for storing cache if it does not exist yet.
     */
    RedisQueryResultCache.prototype.synchronize = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    /**
     * Caches given query result.
     * Returns cache result if found.
     * Returns undefined if result is not cached.
     */
    RedisQueryResultCache.prototype.getFromCache = function (options, queryRunner) {
        var _this = this;
        return new Promise(function (ok, fail) {
            if (options.identifier) {
                _this.client.get(options.identifier, function (err, result) {
                    if (err)
                        return fail(err);
                    ok(JSON.parse(result));
                });
            }
            else if (options.query) {
                _this.client.get(options.query, function (err, result) {
                    if (err)
                        return fail(err);
                    ok(JSON.parse(result));
                });
            }
            else {
                ok(undefined);
            }
        });
    };
    /**
     * Checks if cache is expired or not.
     */
    RedisQueryResultCache.prototype.isExpired = function (savedCache) {
        return (savedCache.time + savedCache.duration) < new Date().getTime();
    };
    /**
     * Stores given query result in the cache.
     */
    RedisQueryResultCache.prototype.storeInCache = function (options, savedCache, queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        if (options.identifier) {
                            _this.client.set(options.identifier, JSON.stringify(options), function (err, result) {
                                if (err)
                                    return fail(err);
                                ok();
                            });
                        }
                        else if (options.query) {
                            _this.client.set(options.query, JSON.stringify(options), function (err, result) {
                                if (err)
                                    return fail(err);
                                ok();
                            });
                        }
                    })];
            });
        });
    };
    /**
     * Clears everything stored in the cache.
     */
    RedisQueryResultCache.prototype.clear = function (queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (ok, fail) {
                        _this.client.flushdb(function (err, result) {
                            if (err)
                                return fail(err);
                            ok();
                        });
                    })];
            });
        });
    };
    /**
     * Removes all cached results by given identifiers from cache.
     */
    RedisQueryResultCache.prototype.remove = function (identifiers, queryRunner) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, Promise.all(identifiers.map(function (identifier) {
                            return _this.deleteKey(identifier);
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
     * Removes a single key from redis database.
     */
    RedisQueryResultCache.prototype.deleteKey = function (key) {
        var _this = this;
        return new Promise(function (ok, fail) {
            _this.client.del(key, function (err, result) {
                if (err)
                    return fail(err);
                ok();
            });
        });
    };
    /**
     * Loads redis dependency.
     */
    RedisQueryResultCache.prototype.loadRedis = function () {
        try {
            return PlatformTools.load("redis");
        }
        catch (e) {
            throw new Error("Cannot use cache because redis is not installed. Please run \"npm i redis --save\".");
        }
    };
    return RedisQueryResultCache;
}());
export { RedisQueryResultCache };

//# sourceMappingURL=RedisQueryResultCache.js.map
