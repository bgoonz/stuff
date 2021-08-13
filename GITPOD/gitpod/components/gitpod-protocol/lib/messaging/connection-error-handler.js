"use strict";
/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
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
exports.ConnectionErrorHandler = void 0;
var logging_1 = require("../util/logging");
var ConnectionErrorHandler = /** @class */ (function () {
  function ConnectionErrorHandler(options) {
    this.restarts = [];
    this.options = __assign(
      { maxErrors: 3, maxRestarts: 5, restartInterval: 3 },
      options
    );
  }
  ConnectionErrorHandler.prototype.shouldStop = function (
    error,
    message,
    count
  ) {
    return !count || count > this.options.maxErrors;
  };
  ConnectionErrorHandler.prototype.shouldRestart = function () {
    this.restarts.push(Date.now());
    if (this.restarts.length <= this.options.maxRestarts) {
      return true;
    }
    var diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
    if (diff <= this.options.restartInterval * 60 * 1000) {
      logging_1.log.error(
        "Server " +
          this.options.serverName +
          " crashed " +
          this.options.maxRestarts +
          " times in the last " +
          this.options.restartInterval +
          " minutes. Will not restart"
      );
      return false;
    }
    this.restarts.shift();
    return true;
  };
  return ConnectionErrorHandler;
})();
exports.ConnectionErrorHandler = ConnectionErrorHandler;
//# sourceMappingURL=connection-error-handler.js.map
