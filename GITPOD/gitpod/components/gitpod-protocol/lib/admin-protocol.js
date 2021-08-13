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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceAndInstance = void 0;
var WorkspaceAndInstance;
(function (WorkspaceAndInstance) {
  function toWorkspace(wai) {
    return __assign(
      { id: wai.workspaceId, creationTime: wai.workspaceCreationTime },
      wai
    );
  }
  WorkspaceAndInstance.toWorkspace = toWorkspace;
  function toInstance(wai) {
    if (!wai.instanceId) {
      return undefined;
    }
    return __assign(
      { id: wai.instanceId, creationTime: wai.instanceCreationTime },
      wai
    );
  }
  WorkspaceAndInstance.toInstance = toInstance;
})(
  (WorkspaceAndInstance =
    exports.WorkspaceAndInstance || (exports.WorkspaceAndInstance = {}))
);
//# sourceMappingURL=admin-protocol.js.map
