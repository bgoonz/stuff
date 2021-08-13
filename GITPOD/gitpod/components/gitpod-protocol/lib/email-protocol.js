"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMail = exports.EMailStatus = void 0;
var uuidv4 = require("uuid/v4");
var EMailStatus;
(function (EMailStatus) {
  function getState(status) {
    if (status.scheduledSendgridTime) {
      return "scheduledSendgrid";
    }
    return "scheduledInternal";
  }
  EMailStatus.getState = getState;
})((EMailStatus = exports.EMailStatus || (exports.EMailStatus = {})));
var EMail;
(function (EMail) {
  EMail.create = function (ts) {
    var withId = ts;
    withId.uid = uuidv4();
    return withId;
  };
})((EMail = exports.EMail || (exports.EMail = {})));
//# sourceMappingURL=email-protocol.js.map
