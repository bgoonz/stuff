"use strict";
/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Emitter = exports.Event = void 0;
var logging_1 = require("./logging");
var Event;
(function (Event) {
  var _disposable = { dispose: function () {} };
  Event.None = function () {
    return _disposable;
  };
})((Event = exports.Event || (exports.Event = {})));
var CallbackList = /** @class */ (function () {
  function CallbackList() {}
  CallbackList.prototype.add = function (callback, context, bucket) {
    var _this = this;
    if (context === void 0) {
      context = null;
    }
    if (!this._callbacks) {
      this._callbacks = [];
      this._contexts = [];
    }
    this._callbacks.push(callback);
    this._contexts.push(context);
    if (Array.isArray(bucket)) {
      bucket.push({
        dispose: function () {
          return _this.remove(callback, context);
        },
      });
    }
  };
  CallbackList.prototype.remove = function (callback, context) {
    if (context === void 0) {
      context = null;
    }
    if (!this._callbacks) {
      return;
    }
    var foundCallbackWithDifferentContext = false;
    for (var i = 0, len = this._callbacks.length; i < len; i++) {
      if (this._callbacks[i] === callback) {
        if (this._contexts[i] === context) {
          // callback & context match => remove it
          this._callbacks.splice(i, 1);
          this._contexts.splice(i, 1);
          return;
        } else {
          foundCallbackWithDifferentContext = true;
        }
      }
    }
    if (foundCallbackWithDifferentContext) {
      throw new Error(
        "When adding a listener with a context, you should remove it with the same context"
      );
    }
  };
  CallbackList.prototype.invoke = function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    if (!this._callbacks) {
      return [];
    }
    var ret = [];
    var callbacks = this._callbacks.slice(0);
    var contexts = this._contexts.slice(0);
    for (var i = 0, len = callbacks.length; i < len; i++) {
      try {
        ret.push(callbacks[i].apply(contexts[i], args));
      } catch (e) {
        logging_1.log.error(e);
      }
    }
    return ret;
  };
  CallbackList.prototype.isEmpty = function () {
    return !this._callbacks || this._callbacks.length === 0;
  };
  CallbackList.prototype.dispose = function () {
    this._callbacks = undefined;
    this._contexts = undefined;
  };
  return CallbackList;
})();
var Emitter = /** @class */ (function () {
  function Emitter(_options) {
    this._options = _options;
  }
  Object.defineProperty(Emitter.prototype, "event", {
    /**
     * For the public to allow to subscribe
     * to events from this Emitter
     */
    get: function () {
      var _this = this;
      if (!this._event) {
        this._event = function (listener, thisArgs, disposables) {
          if (!_this._callbacks) {
            _this._callbacks = new CallbackList();
          }
          if (
            _this._options &&
            _this._options.onFirstListenerAdd &&
            _this._callbacks.isEmpty()
          ) {
            _this._options.onFirstListenerAdd(_this);
          }
          _this._callbacks.add(listener, thisArgs);
          var result;
          result = {
            dispose: function () {
              _this._callbacks.remove(listener, thisArgs);
              result.dispose = Emitter._noop;
              if (
                _this._options &&
                _this._options.onLastListenerRemove &&
                _this._callbacks.isEmpty()
              ) {
                _this._options.onLastListenerRemove(_this);
              }
            },
          };
          if (Array.isArray(disposables)) {
            disposables.push(result);
          }
          return result;
        };
      }
      return this._event;
    },
    enumerable: false,
    configurable: true,
  });
  /**
   * To be kept private to fire an event to
   * subscribers
   */
  Emitter.prototype.fire = function (event) {
    if (this._callbacks) {
      this._callbacks.invoke.call(this._callbacks, event);
    }
  };
  Emitter.prototype.dispose = function () {
    if (this._callbacks) {
      this._callbacks.dispose();
      this._callbacks = undefined;
    }
  };
  Emitter._noop = function () {};
  return Emitter;
})();
exports.Emitter = Emitter;
//# sourceMappingURL=event.js.map
