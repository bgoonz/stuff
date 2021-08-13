"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __assign =
  (this && this.__assign) ||
  function () {
    __assign =
      Object.assign ||
      function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s)
            if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
      };
    return __assign.apply(this, arguments);
  };
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitpodFileParser = void 0;
var inversify_1 = require("inversify");
var yaml = require("js-yaml");
var Ajv = require("ajv");
var logging_1 = require("./util/logging");
var protocol_1 = require("./protocol");
var schema = require("../data/gitpod-schema.json");
var validate = new Ajv().compile(schema);
var defaultParseOptions = {
  acceptPortRanges: false,
};
var GitpodFileParser = /** @class */ (function () {
  function GitpodFileParser() {}
  GitpodFileParser.prototype.parse = function (
    content,
    parseOptions,
    defaultConfig
  ) {
    if (parseOptions === void 0) {
      parseOptions = {};
    }
    if (defaultConfig === void 0) {
      defaultConfig = {};
    }
    var options = __assign(__assign({}, defaultParseOptions), parseOptions);
    try {
      var parsedConfig = yaml.safeLoad(content);
      validate(parsedConfig);
      var validationErrors = validate.errors
        ? validate.errors.map(function (e) {
            return e.message || e.keyword;
          })
        : undefined;
      if (validationErrors && validationErrors.length > 0) {
        return {
          config: defaultConfig,
          parsedConfig: parsedConfig,
          validationErrors: validationErrors,
        };
      }
      var overrides = {};
      if (!options.acceptPortRanges && Array.isArray(parsedConfig.ports)) {
        overrides.ports = parsedConfig.ports.filter(function (port) {
          return !protocol_1.PortRangeConfig.is(port);
        });
      }
      return {
        config: __assign(
          __assign(__assign({}, defaultConfig), parsedConfig),
          overrides
        ),
        parsedConfig: parsedConfig,
      };
    } catch (err) {
      logging_1.log.error("Unparsable Gitpod configuration", err, {
        content: content,
      });
      return {
        config: defaultConfig,
        validationErrors: [
          "Unparsable Gitpod configuration: " + err.toString(),
        ],
      };
    }
  };
  GitpodFileParser = __decorate([inversify_1.injectable()], GitpodFileParser);
  return GitpodFileParser;
})();
exports.GitpodFileParser = GitpodFileParser;
//# sourceMappingURL=gitpod-file-parser.js.map
