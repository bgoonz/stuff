"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deferred = void 0;
var Deferred = /** @class */ (function () {
  function Deferred(timeout) {
    var _this = this;
    this.isResolved = false;
    this.promise = new Promise(function (resolve, reject) {
      _this.resolve = function (o) {
        _this.isResolved = true;
        resolve(o);
        clearTimeout(_this.timer);
      };
      _this.reject = function (e) {
        reject(e);
        clearTimeout(_this.timer);
      };
    });
    if (timeout) {
      this.timer = setTimeout(function () {
        return _this.reject(new Error("Timeout of " + timeout + " ms."));
      }, timeout);
    }
  }
  return Deferred;
})();
exports.Deferred = Deferred;
//# sourceMappingURL=deferred.js.map
