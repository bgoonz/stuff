"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
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
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncCachingIteratorImpl = exports.filter = exports.find = void 0;
// Use asyncIterators with es2015
if (typeof Symbol.asyncIterator === 'undefined') {
    Symbol.asyncIterator = Symbol.asyncIterator || Symbol('asyncIterator');
}
function find(it, predicate) {
    var it_1, it_1_1;
    var e_1, _a;
    return __awaiter(this, void 0, void 0, function () {
        var t, e_1_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    it_1 = __asyncValues(it);
                    _b.label = 1;
                case 1: return [4 /*yield*/, it_1.next()];
                case 2:
                    if (!(it_1_1 = _b.sent(), !it_1_1.done)) return [3 /*break*/, 4];
                    t = it_1_1.value;
                    if (predicate(t)) {
                        return [2 /*return*/, t];
                    }
                    _b.label = 3;
                case 3: return [3 /*break*/, 1];
                case 4: return [3 /*break*/, 11];
                case 5:
                    e_1_1 = _b.sent();
                    e_1 = { error: e_1_1 };
                    return [3 /*break*/, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(it_1_1 && !it_1_1.done && (_a = it_1.return))) return [3 /*break*/, 8];
                    return [4 /*yield*/, _a.call(it_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    if (e_1) throw e_1.error;
                    return [7 /*endfinally*/];
                case 10: return [7 /*endfinally*/];
                case 11: return [2 /*return*/, undefined];
            }
        });
    });
}
exports.find = find;
function filter(it, predicate) {
    var it_2, it_2_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var result, t, e_2_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    result = [];
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 6, 7, 12]);
                    it_2 = __asyncValues(it);
                    _b.label = 2;
                case 2: return [4 /*yield*/, it_2.next()];
                case 3:
                    if (!(it_2_1 = _b.sent(), !it_2_1.done)) return [3 /*break*/, 5];
                    t = it_2_1.value;
                    if (predicate(t)) {
                        result.push(t);
                    }
                    _b.label = 4;
                case 4: return [3 /*break*/, 2];
                case 5: return [3 /*break*/, 12];
                case 6:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3 /*break*/, 12];
                case 7:
                    _b.trys.push([7, , 10, 11]);
                    if (!(it_2_1 && !it_2_1.done && (_a = it_2.return))) return [3 /*break*/, 9];
                    return [4 /*yield*/, _a.call(it_2)];
                case 8:
                    _b.sent();
                    _b.label = 9;
                case 9: return [3 /*break*/, 11];
                case 10:
                    if (e_2) throw e_2.error;
                    return [7 /*endfinally*/];
                case 11: return [7 /*endfinally*/];
                case 12: return [2 /*return*/, result];
            }
        });
    });
}
exports.filter = filter;
var AsyncCachingIteratorImpl = /** @class */ (function () {
    function AsyncCachingIteratorImpl(iterable) {
        this.iterable = iterable;
        this.cache = [];
        this.cursor = 0;
        this.cacheRead = false;
    }
    AsyncCachingIteratorImpl.prototype.resetCursor = function () {
        this.cursor = 0;
        this.cacheRead = false;
    };
    AsyncCachingIteratorImpl.prototype.next = function (value) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.cacheRead && this.cursor < this.cache.length) {
                            return [2 /*return*/, {
                                    done: false,
                                    value: this.cache[this.cursor++]
                                }];
                        }
                        this.cacheRead = true;
                        return [4 /*yield*/, this.iterable.next(value)];
                    case 1:
                        result = _a.sent();
                        if (!result.done) {
                            this.cache.push(result.value);
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    AsyncCachingIteratorImpl.prototype[Symbol.asyncIterator] = function () {
        return this;
    };
    return AsyncCachingIteratorImpl;
}());
exports.AsyncCachingIteratorImpl = AsyncCachingIteratorImpl;
//# sourceMappingURL=async-iterator.js.map