"use strict";
/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Project = void 0;
var uuidv4 = require("uuid/v4");
var Project;
(function (Project) {
  Project.create = function (project) {
    return __assign(__assign({}, project), {
      id: uuidv4(),
      creationTime: new Date().toISOString(),
    });
  };
})((Project = exports.Project || (exports.Project = {})));
//# sourceMappingURL=teams-projects-protocol.js.map
