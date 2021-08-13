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
exports.ParseWorkspaceIdTest = void 0;
var chai = require("chai");
var mocha_typescript_1 = require("mocha-typescript");
var parse_workspace_id_1 = require("./parse-workspace-id");
var expect = chai.expect;
var ParseWorkspaceIdTest = /** @class */ (function () {
    function ParseWorkspaceIdTest() {
    }
    ParseWorkspaceIdTest.prototype.parseWorkspaceIdFromHostname_fromWorkspaceLocation = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("moccasin-ferret-155799b3.ws-eu01.gitpod.io");
        expect(actual).to.equal("moccasin-ferret-155799b3");
    };
    ParseWorkspaceIdTest.prototype.parseWorkspaceIdFromHostname_fromWorkspacePortLocation = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("3000-moccasin-ferret-155799b3.ws-eu01.gitpod.io");
        expect(actual).to.equal("moccasin-ferret-155799b3");
    };
    ParseWorkspaceIdTest.prototype.parseWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefix = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("webview-3000-moccasin-ferret-155799b3.ws-eu01.gitpod.io");
        expect(actual).to.equal("moccasin-ferret-155799b3");
    };
    ParseWorkspaceIdTest.prototype.parseWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefixCustomHost = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("webview-3000-moccasin-ferret-155799b3.ws-eu01.some.subdomain.somehost.com");
        expect(actual).to.equal("moccasin-ferret-155799b3");
    };
    // legacy mode
    ParseWorkspaceIdTest.prototype.parseLegacyWorkspaceIdFromHostname_fromWorkspaceLocation = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("b7e0eaf8-ec73-44ec-81ea-04859263b656.ws-eu01.gitpod.io");
        expect(actual).to.equal("b7e0eaf8-ec73-44ec-81ea-04859263b656");
    };
    ParseWorkspaceIdTest.prototype.parseLegacyWorkspaceIdFromHostname_fromWorkspacePortLocation = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("3000-b7e0eaf8-ec73-44ec-81ea-04859263b656.ws-eu01.gitpod.io");
        expect(actual).to.equal("b7e0eaf8-ec73-44ec-81ea-04859263b656");
    };
    ParseWorkspaceIdTest.prototype.parseLegacyWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefix = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("webview-3000-b7e0eaf8-ec73-44ec-81ea-04859263b656.ws-eu01.gitpod.io");
        expect(actual).to.equal("b7e0eaf8-ec73-44ec-81ea-04859263b656");
    };
    ParseWorkspaceIdTest.prototype.parseLegacyWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefixCustomHost = function () {
        var actual = parse_workspace_id_1.parseWorkspaceIdFromHostname("webview-3000-ca81a50f-09d7-465c-acd9-264a747d5351.ws-eu01.some.subdomain.somehost.com");
        expect(actual).to.equal("ca81a50f-09d7-465c-acd9-264a747d5351");
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseWorkspaceIdFromHostname_fromWorkspaceLocation", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseWorkspaceIdFromHostname_fromWorkspacePortLocation", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefix", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefixCustomHost", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseLegacyWorkspaceIdFromHostname_fromWorkspaceLocation", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseLegacyWorkspaceIdFromHostname_fromWorkspacePortLocation", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseLegacyWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefix", null);
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], ParseWorkspaceIdTest.prototype, "parseLegacyWorkspaceIdFromHostname_fromWorkspacePortLocationWithWebviewPrefixCustomHost", null);
    ParseWorkspaceIdTest = __decorate([
        mocha_typescript_1.suite
    ], ParseWorkspaceIdTest);
    return ParseWorkspaceIdTest;
}());
exports.ParseWorkspaceIdTest = ParseWorkspaceIdTest;
module.exports = new ParseWorkspaceIdTest();
//# sourceMappingURL=parse-workspace-id.spec.js.map