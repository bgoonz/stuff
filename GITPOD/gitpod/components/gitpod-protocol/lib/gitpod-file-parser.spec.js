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
var mocha_typescript_1 = require("mocha-typescript");
var chai = require("chai");
var gitpod_file_parser_1 = require("./gitpod-file-parser");
var expect = chai.expect;
var DEFAULT_IMAGE = "default-image";
var DEFAULT_CONFIG = { image: DEFAULT_IMAGE };
var TestGitpodFileParser = /** @class */ (function () {
  function TestGitpodFileParser() {}
  TestGitpodFileParser.prototype.before = function () {
    this.parser = new gitpod_file_parser_1.GitpodFileParser();
  };
  TestGitpodFileParser.prototype.testOnlyOnePort = function () {
    var content = "ports:\n" + "  - port: 5555";
    var result = this.parser.parse(content, {}, DEFAULT_CONFIG);
    expect(result.config).to.deep.equal({
      ports: [
        {
          port: 5555,
        },
      ],
      image: DEFAULT_IMAGE,
    });
  };
  TestGitpodFileParser.prototype.testPortRange = function () {
    var content = "ports:\n" + "  - port: 5555\n" + "  - port: 3000-3999"; // should be filtered out by default
    var result = this.parser.parse(content, {}, DEFAULT_CONFIG);
    expect(result.config).to.deep.equal({
      ports: [
        {
          port: 5555,
        },
      ],
      image: DEFAULT_IMAGE,
    });
  };
  TestGitpodFileParser.prototype.testPortRangeAccepted = function () {
    var content = "ports:\n" + "  - port: 5555\n" + "  - port: 3000-3999"; // should be included if explicitly supported
    var result = this.parser.parse(
      content,
      { acceptPortRanges: true },
      DEFAULT_CONFIG
    );
    expect(result.config).to.deep.equal({
      ports: [
        {
          port: 5555,
        },
        {
          port: "3000-3999",
        },
      ],
      image: DEFAULT_IMAGE,
    });
  };
  TestGitpodFileParser.prototype.testSimpleTask = function () {
    var content = "tasks:\n" + "  - command: yarn";
    var result = this.parser.parse(content, {}, DEFAULT_CONFIG);
    expect(result.config).to.deep.equal({
      tasks: [
        {
          command: "yarn",
        },
      ],
      image: DEFAULT_IMAGE,
    });
  };
  TestGitpodFileParser.prototype.testSimpleImage = function () {
    var imageName = "my-test-org/my-test-image:some-tag";
    var content = 'image: "' + imageName + '"\n';
    var result = this.parser.parse(content);
    expect(result.config).to.deep.equal({
      image: imageName,
    });
  };
  TestGitpodFileParser.prototype.testComplexImageWithoutContext = function () {
    var dockerFileName = "Dockerfile";
    var content = "image:\n  file: " + dockerFileName + "\n";
    var result = this.parser.parse(content);
    expect(result.config).to.deep.equal({
      image: {
        file: dockerFileName,
      },
    });
  };
  TestGitpodFileParser.prototype.testComplexImageWithContext = function () {
    var dockerFileName = "Dockerfile";
    var dockerContext = "docker";
    var content =
      "image:\n  file: " +
      dockerFileName +
      "\n  context: " +
      dockerContext +
      "\n";
    var result = this.parser.parse(content);
    expect(result.config).to.deep.equal({
      image: {
        file: dockerFileName,
        context: dockerContext,
      },
    });
  };
  TestGitpodFileParser.prototype.testGitconfig = function () {
    var content = "\ngitConfig:\n    core.autocrlf: input\n";
    var result = this.parser.parse(content, {}, DEFAULT_CONFIG);
    expect(result.config).to.deep.equal({
      gitConfig: {
        "core.autocrlf": "input",
      },
      image: DEFAULT_IMAGE,
    });
  };
  TestGitpodFileParser.prototype.testBrokenConfig = function () {
    var content = "image: 42\n";
    var result = this.parser.parse(content, {}, DEFAULT_CONFIG);
    expect(result.config).to.deep.equal({
      image: DEFAULT_IMAGE,
    });
  };
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testOnlyOnePort",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testPortRange",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testPortRangeAccepted",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testSimpleTask",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testSimpleImage",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testComplexImageWithoutContext",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testComplexImageWithContext",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testGitconfig",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    TestGitpodFileParser.prototype,
    "testBrokenConfig",
    null
  );
  TestGitpodFileParser = __decorate(
    [mocha_typescript_1.suite],
    TestGitpodFileParser
  );
  return TestGitpodFileParser;
})();
module.exports = new TestGitpodFileParser(); // Only to circumvent no usage warning :-/
//# sourceMappingURL=gitpod-file-parser.spec.js.map
