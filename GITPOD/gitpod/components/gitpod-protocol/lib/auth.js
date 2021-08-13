"use strict";
/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectAccountPayload = void 0;
var SelectAccountPayload;
(function (SelectAccountPayload) {
  function is(data) {
    return (
      typeof data === "object" && "currentUser" in data && "otherUser" in data
    );
  }
  SelectAccountPayload.is = is;
})(
  (SelectAccountPayload =
    exports.SelectAccountPayload || (exports.SelectAccountPayload = {}))
);
//# sourceMappingURL=auth.js.map
