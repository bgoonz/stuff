"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextUrlTest = void 0;
var chai = require("chai");
var mocha_typescript_1 = require("mocha-typescript");
var context_url_1 = require("./context-url");
var expect = chai.expect;
var ContextUrlTest = /** @class */ (function () {
  function ContextUrlTest() {}
  ContextUrlTest.prototype.parseContextUrl_withEnvVar = function () {
    var actual = context_url_1.ContextURL.parseToURL(
      "passedin=test%20value/https://github.com/gitpod-io/gitpod-test-repo"
    );
    expect(
      actual === null || actual === void 0 ? void 0 : actual.host
    ).to.equal("github.com");
    expect(
      actual === null || actual === void 0 ? void 0 : actual.pathname
    ).to.equal("/gitpod-io/gitpod-test-repo");
  };
  ContextUrlTest.prototype.parseContextUrl_withEnvVar_withoutSchema =
    function () {
      var actual = context_url_1.ContextURL.parseToURL(
        "passedin=test%20value/github.com/gitpod-io/gitpod-test-repo"
      );
      expect(
        actual === null || actual === void 0 ? void 0 : actual.host
      ).to.equal("github.com");
      expect(
        actual === null || actual === void 0 ? void 0 : actual.pathname
      ).to.equal("/gitpod-io/gitpod-test-repo");
    };
  ContextUrlTest.prototype.parseContextUrl_withPrebuild = function () {
    var actual = context_url_1.ContextURL.parseToURL(
      "prebuild/https://github.com/gitpod-io/gitpod-test-repo"
    );
    expect(
      actual === null || actual === void 0 ? void 0 : actual.host
    ).to.equal("github.com");
    expect(
      actual === null || actual === void 0 ? void 0 : actual.pathname
    ).to.equal("/gitpod-io/gitpod-test-repo");
  };
  ContextUrlTest.prototype.parseContextUrl_withPrebuild_withoutSchema =
    function () {
      var actual = context_url_1.ContextURL.parseToURL(
        "prebuild/github.com/gitpod-io/gitpod-test-repo"
      );
      expect(
        actual === null || actual === void 0 ? void 0 : actual.host
      ).to.equal("github.com");
      expect(
        actual === null || actual === void 0 ? void 0 : actual.pathname
      ).to.equal("/gitpod-io/gitpod-test-repo");
    };
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    ContextUrlTest.prototype,
    "parseContextUrl_withEnvVar",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    ContextUrlTest.prototype,
    "parseContextUrl_withEnvVar_withoutSchema",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    ContextUrlTest.prototype,
    "parseContextUrl_withPrebuild",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    ContextUrlTest.prototype,
    "parseContextUrl_withPrebuild_withoutSchema",
    null
  );
  ContextUrlTest = __decorate([mocha_typescript_1.suite], ContextUrlTest);
  return ContextUrlTest;
})();
exports.ContextUrlTest = ContextUrlTest;
module.exports = new ContextUrlTest();
//# sourceMappingURL=context-url.spec.js.map
