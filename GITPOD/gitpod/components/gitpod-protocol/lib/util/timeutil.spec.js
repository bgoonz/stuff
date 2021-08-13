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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeutilSpec = void 0;
var chai = require("chai");
var expect = chai.expect;
var mocha_typescript_1 = require("mocha-typescript");
var timeutil_1 = require("./timeutil");
var TimeutilSpec = /** @class */ (function () {
    function TimeutilSpec() {
    }
    TimeutilSpec.prototype.testTimeutil = function () {
        // targeting a 1st, 1th of Jan => 1st of Feb
        this.isOneMonthLater(new Date(2000, 0, 1), 1, new Date(2000, 1, 1));
        // targeting a 31th, 30th of Apr => 31st of May
        this.isOneMonthLater(new Date(2000, 3, 30), 31, new Date(2000, 4, 31));
        // targeting a 31th, 31th of Mar => 30th of Apr
        this.isOneMonthLater(new Date(2000, 2, 31), 31, new Date(2000, 3, 30));
        // targeting a 30th, 30th of Mar => 30th of Apr
        this.isOneMonthLater(new Date(2000, 2, 30), 30, new Date(2000, 3, 30));
        // next year
        this.isOneMonthLater(new Date(2000, 11, 1), 1, new Date(2001, 0, 1));
        this.isOneMonthLater(new Date(2000, 11, 31), 31, new Date(2001, 0, 31));
        // Feb
        this.isOneMonthLater(new Date(2001, 0, 31), 31, new Date(2001, 1, 28));
        // Feb leap year
        this.isOneMonthLater(new Date(2000, 0, 31), 31, new Date(2000, 1, 29));
    };
    TimeutilSpec.prototype.isOneMonthLater = function (from, day, expectation) {
        var later = timeutil_1.oneMonthLater(from.toISOString(), day);
        expect(later, "expected " + later + " to be equal " + expectation).to.be.equal(expectation.toISOString());
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TimeutilSpec.prototype, "testTimeutil", null);
    TimeutilSpec = __decorate([
        mocha_typescript_1.suite()
    ], TimeutilSpec);
    return TimeutilSpec;
}());
exports.TimeutilSpec = TimeutilSpec;
//# sourceMappingURL=timeutil.spec.js.map