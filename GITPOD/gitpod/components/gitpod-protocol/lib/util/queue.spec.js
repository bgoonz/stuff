"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var mocha_typescript_1 = require("mocha-typescript");
var chai = require("chai");
var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
var __1 = require("..");
var assert_1 = require("assert");
var deferred_1 = require("./deferred");
var expect = chai.expect;
var QueueSpec = /** @class */ (function () {
    function QueueSpec() {
    }
    QueueSpec.prototype.before = function () {
        this.queue = new __1.Queue();
        this.seq = [];
    };
    QueueSpec.prototype.exec = function (seqNr, nextTick, sleep) {
        if (nextTick === void 0) { nextTick = false; }
        if (sleep === void 0) { sleep = 0; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, this.queue.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
                        var push;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    push = function () { return __awaiter(_this, void 0, void 0, function () {
                                        var _this = this;
                                        return __generator(this, function (_a) {
                                            if (sleep > 0)
                                                return [2 /*return*/, new Promise(function (resolve) {
                                                        setTimeout(function () {
                                                            _this.seq.push(seqNr);
                                                            resolve(undefined);
                                                        }, sleep);
                                                    })];
                                            else
                                                this.seq.push(seqNr);
                                            return [2 /*return*/];
                                        });
                                    }); };
                                    if (!nextTick) return [3 /*break*/, 1];
                                    return [2 /*return*/, new Promise(function (resolve) {
                                            process.nextTick(function () {
                                                push().then(resolve);
                                            });
                                        })];
                                case 1: return [4 /*yield*/, push()];
                                case 2:
                                    _a.sent();
                                    _a.label = 3;
                                case 3: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    QueueSpec.prototype.execError = function (seqNr) {
        var _this = this;
        var deferred = new deferred_1.Deferred();
        this.queue.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.seq.push(seqNr);
                throw new Error('test error');
            });
        }); }).then(function () {
            deferred.reject(false);
        }).catch(function () {
            deferred.resolve(true);
        });
        return deferred;
    };
    QueueSpec.prototype.expectArray = function (actual, expected) {
        var e_1, _a;
        expect(actual).to.have.lengthOf(expected.length);
        var expIt = expected.entries();
        try {
            for (var actual_1 = __values(actual), actual_1_1 = actual_1.next(); !actual_1_1.done; actual_1_1 = actual_1.next()) {
                var act = actual_1_1.value;
                var _b = __read(expIt.next().value, 2), exp = _b[1];
                expect(act).to.deep.equal(exp);
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (actual_1_1 && !actual_1_1.done && (_a = actual_1.return)) _a.call(actual_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    QueueSpec.prototype.isExecutedInOrder = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.exec(1);
                        return [4 /*yield*/, this.exec(2)];
                    case 1:
                        _a.sent();
                        this.expectArray(this.seq, [1, 2]);
                        return [2 /*return*/];
                }
            });
        });
    };
    QueueSpec.prototype.isExecutedInOrderSkipTick = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.exec(1, true);
                        return [4 /*yield*/, this.exec(2)];
                    case 1:
                        _a.sent();
                        this.expectArray(this.seq, [1, 2]);
                        return [2 /*return*/];
                }
            });
        });
    };
    QueueSpec.prototype.isExecutedInOrderSleep = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.exec(1, false, 2000);
                        return [4 /*yield*/, this.exec(2)];
                    case 1:
                        _a.sent();
                        this.expectArray(this.seq, [1, 2]);
                        return [2 /*return*/];
                }
            });
        });
    };
    QueueSpec.prototype.continueDespiteError = function () {
        return __awaiter(this, void 0, void 0, function () {
            var receivedError, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.exec(1);
                        receivedError = this.execError(2);
                        return [4 /*yield*/, this.exec(3)];
                    case 1:
                        _b.sent();
                        expect(receivedError.isResolved).to.equal(true);
                        _a = expect;
                        return [4 /*yield*/, receivedError.promise];
                    case 2:
                        _a.apply(void 0, [_b.sent()]).to.equal(true);
                        this.expectArray(this.seq, [1, 2, 3]);
                        return [2 /*return*/];
                }
            });
        });
    };
    QueueSpec.prototype.mustCatchError = function () {
        return __awaiter(this, void 0, void 0, function () {
            var f, p;
            var _this = this;
            return __generator(this, function (_a) {
                f = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error();
                    });
                }); };
                try {
                    p = this.queue.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
                        return __generator(this, function (_a) {
                            return [2 /*return*/, f()];
                        });
                    }); });
                    p.catch(function (err) {
                        // Silence unhandled promise rejection messages
                    });
                }
                catch (err) {
                    assert_1.fail("We expect to catch no error");
                }
                return [2 /*return*/];
            });
        });
    };
    QueueSpec.prototype.expectUncaughtError = function () {
        return __awaiter(this, void 0, void 0, function () {
            var f, p;
            var _this = this;
            return __generator(this, function (_a) {
                f = function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        throw new Error();
                    });
                }); };
                p = this.queue.enqueue(function () { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        return [2 /*return*/, f()];
                    });
                }); });
                p.then(function (r) {
                    assert_1.fail("Expected to catch error!");
                }).catch(function (err) {
                    // Silence unhandled promise rejection messages
                });
                return [2 /*return*/];
            });
        });
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], QueueSpec.prototype, "isExecutedInOrder", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], QueueSpec.prototype, "isExecutedInOrderSkipTick", null);
    __decorate([
        mocha_typescript_1.test,
        mocha_typescript_1.timeout(3000),
        mocha_typescript_1.slow(3000),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], QueueSpec.prototype, "isExecutedInOrderSleep", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], QueueSpec.prototype, "continueDespiteError", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], QueueSpec.prototype, "mustCatchError", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", Promise)
    ], QueueSpec.prototype, "expectUncaughtError", null);
    QueueSpec = __decorate([
        mocha_typescript_1.suite
    ], QueueSpec);
    return QueueSpec;
}());
module.exports = new QueueSpec();
//# sourceMappingURL=queue.spec.js.map