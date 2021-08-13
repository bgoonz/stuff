"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __values =
  (this && this.__values) ||
  function (o) {
    var s = typeof Symbol === "function" && Symbol.iterator,
      m = s && o[s],
      i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number")
      return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        },
      };
    throw new TypeError(
      s ? "Object is not iterable." : "Symbol.iterator is not defined."
    );
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GarbageCollectedCache = void 0;
var GarbageCollectedCache = /** @class */ (function () {
  function GarbageCollectedCache(defaultMaxAgeSeconds, gcIntervalSeconds) {
    this.defaultMaxAgeSeconds = defaultMaxAgeSeconds;
    this.gcIntervalSeconds = gcIntervalSeconds;
    this.store = new Map();
    this.regularlyCollectGarbage();
  }
  GarbageCollectedCache.prototype.set = function (key, value) {
    var oldValue = this.store.get(key);
    if (oldValue) {
      // We don't want values to be cached indefinitely just because their queried often
      return;
    }
    this.store.set(key, {
      key: key,
      value: value,
      expiryDate: this.calcExpiryDate(),
    });
  };
  GarbageCollectedCache.prototype.get = function (key) {
    var entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }
    return entry.value;
  };
  GarbageCollectedCache.prototype.regularlyCollectGarbage = function () {
    var _this = this;
    setInterval(function () {
      return _this.collectGarbage();
    }, this.gcIntervalSeconds * 1000);
  };
  GarbageCollectedCache.prototype.collectGarbage = function () {
    var e_1, _a;
    var now = Date.now();
    try {
      for (
        var _b = __values(this.store.values()), _c = _b.next();
        !_c.done;
        _c = _b.next()
      ) {
        var entry = _c.value;
        if (entry.expiryDate < now) {
          this.store.delete(entry.key);
        }
      }
    } catch (e_1_1) {
      e_1 = { error: e_1_1 };
    } finally {
      try {
        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
      } finally {
        if (e_1) throw e_1.error;
      }
    }
  };
  GarbageCollectedCache.prototype.calcExpiryDate = function (maxAgeSeconds) {
    return Date.now() + (maxAgeSeconds || this.defaultMaxAgeSeconds) * 1000;
  };
  return GarbageCollectedCache;
})();
exports.GarbageCollectedCache = GarbageCollectedCache;
//# sourceMappingURL=garbage-collected-cache.js.map
