"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatHours = exports.formatDate = void 0;
function formatDate(date) {
  return date ? new Date(date).toLocaleString() : "";
}
exports.formatDate = formatDate;
function formatHours(hours) {
  if (hours === undefined) {
    return "";
  }
  var h = Math.floor(Math.abs(hours));
  var rm = (Math.abs(hours) - h) * 60;
  var m = Math.floor(rm);
  var rs = (rm - m) * 60;
  var s = Math.floor(rs);
  var result = h + ":" + pad2(m) + ":" + pad2(s);
  if (hours < 0) {
    return "-" + result;
  } else {
    return "" + result;
  }
}
exports.formatHours = formatHours;
function pad2(n) {
  return n < 10 ? "0" + n : "" + n;
}
//# sourceMappingURL=date-time.js.map
