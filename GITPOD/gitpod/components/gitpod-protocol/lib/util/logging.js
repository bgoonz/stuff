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
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spread =
  (this && this.__spread) ||
  function () {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.LogContext = void 0;
var inspect = require("util").inspect; // undefined in frontend
var jsonLogging = false;
var component;
var version;
var LogContext;
(function (LogContext) {
  function from(params) {
    var _a, _b;
    return {
      sessionId:
        (_a = params.request) === null || _a === void 0 ? void 0 : _a.requestID,
      userId:
        params.userId ||
        ((_b = params.user) === null || _b === void 0 ? void 0 : _b.id),
    };
  }
  LogContext.from = from;
})((LogContext = exports.LogContext || (exports.LogContext = {})));
var log;
(function (log) {
  function error() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    errorLog(false, args);
  }
  log.error = error;
  function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    warnLog(false, args);
  }
  log.warn = warn;
  function info() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    infoLog(false, args);
  }
  log.info = info;
  function debug() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    debugLog(false, args);
  }
  log.debug = debug;
  /**
   * Do not use in frontend.
   */
  function enableJSONLogging(componentArg, versionArg) {
    component = componentArg;
    version = versionArg;
    jsonLogging = true;
    console.error = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      errorLog(true, args);
    };
    console.warn = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      warnLog(true, args);
    };
    console.info = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      infoLog(true, args);
    };
    console.debug = function () {
      var args = [];
      for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
      }
      debugLog(true, args);
    };
    console.log = console.info;
    // FIXME wrap also other console methods (e.g. trace())
  }
  log.enableJSONLogging = enableJSONLogging;
  function resetToDefaultLogging() {
    jsonLogging = false;
    console.log = logConsoleLog;
    console.error = errorConsoleLog;
    console.warn = warnConsoleLog;
    console.info = infoConsoleLog;
    console.debug = debugConsoleLog;
  }
  log.resetToDefaultLogging = resetToDefaultLogging;
})((log = exports.log || (exports.log = {})));
function errorLog(calledViaConsole, args) {
  doLog(calledViaConsole, errorConsoleLog, "ERROR", args);
}
function warnLog(calledViaConsole, args) {
  doLog(calledViaConsole, warnConsoleLog, "WARNING", args);
}
function infoLog(calledViaConsole, args) {
  doLog(calledViaConsole, infoConsoleLog, "INFO", args);
}
function debugLog(calledViaConsole, args) {
  doLog(calledViaConsole, debugConsoleLog, "DEBUG", args);
}
var GoogleLogSeverity;
(function (GoogleLogSeverity) {
  GoogleLogSeverity.isGreaterOrEqualThanWarning = function (severity) {
    switch (severity) {
      case "INFO":
      case "DEBUG":
        return false;
      default:
        return true;
    }
  };
})(GoogleLogSeverity || (GoogleLogSeverity = {}));
function doLog(calledViaConsole, consoleLog, severity, args) {
  if (!jsonLogging) {
    consoleLog.apply(void 0, __spread(args));
    return;
  }
  if (args.length == 0) {
    // console.xyz()
    return;
  }
  var context;
  var message;
  var error;
  var payloadArgs;
  if (args[0] instanceof Error) {
    // console.xyz(Error, ...any) / log.xyz(Error) / log.xyz(Error, LogPayload)
    error = args[0];
    payloadArgs = args.slice(1);
  } else if (typeof args[0] === "string") {
    message = args[0];
    if (args.length < 2 || !(args[1] instanceof Error)) {
      // console.xyz(string) / console.xyz(string, !Error, ...any) / log.xyz(string) / log.xyz(string, LogPayload)
      payloadArgs = args.slice(1);
    } else {
      // console.xyz(string, Error, ...any) / log.xyz(string, Error) / log.xyz(string, Error, LogPayload)
      error = args[1];
      payloadArgs = args.slice(2);
    }
  } else if (calledViaConsole || args.length < 2) {
    // console.xyz(!string & !Error, ...any) / wrong call of log.xyz (can happen when juggling with 'any'
    // or when passing, by mistake, log.xyz instead of console.xyz to third-party code as a callback (*))
    payloadArgs = args;
  } else {
    context = args[0];
    if (args[1] instanceof Error) {
      // log.xyz(LogContext, Error) / log.xyz(LogContext, Error, LogPayload)
      error = args[1];
      payloadArgs = args.slice(2);
    } else if (typeof args[1] === "string") {
      message = args[1];
      if (args.length < 3 || !(args[2] instanceof Error)) {
        // log.xyz(LogContext, string) / log.xyz(LogContext, string, LogPayload)
        payloadArgs = args.slice(2);
      } else {
        // log.xyz(LogContext, string, Error) / log.xyz(LogContext, string, Error, LogPayload)
        error = args[2];
        payloadArgs = args.slice(3);
      }
    } else {
      // wrong call of log.xyz (see (*) above)
      context = undefined;
      payloadArgs = args;
    }
  }
  var logItem = makeLogItem(
    severity,
    context,
    message,
    error,
    payloadArgs,
    calledViaConsole
  );
  if (logItem !== undefined) {
    consoleLog(logItem);
  }
}
function makeLogItem(
  severity,
  context,
  message,
  error,
  payloadArgs,
  calledViaConsole
) {
  if (context !== undefined && Object.keys(context).length == 0) {
    context = undefined;
  }
  var reportedErrorEvent = {};
  if (GoogleLogSeverity.isGreaterOrEqualThanWarning(severity)) {
    reportedErrorEvent = makeReportedErrorEvent(error);
  }
  var payload =
    payloadArgs.length == 0
      ? undefined
      : payloadArgs.length == 1
      ? payloadArgs[0]
      : payloadArgs;
  var logItem = __assign(__assign({}, reportedErrorEvent), {
    component: component,
    severity: severity,
    time: new Date().toISOString(),
    environment: process.env.KUBE_STAGE,
    region: process.env.GITPOD_REGION,
    context: context,
    message: message,
    error: error,
    payload: payload,
    loggedViaConsole: calledViaConsole ? true : undefined,
  });
  var result = stringifyLogItem(logItem);
  if (result.length > maxAllowedLogItemLength && payload !== undefined) {
    delete logItem.payload;
    logItem.payloadStub =
      "Payload stripped as log item was longer than " +
      maxAllowedLogItemLength +
      " characters";
    result = stringifyLogItem(logItem);
    if (result.length <= maxAllowedLogItemLength) {
      log.warn("Log item too large, stripping payload", {
        logItemStub: makeLogItemStub(logItem),
      });
    }
  }
  if (result.length > maxAllowedLogItemLength) {
    log.error("Log item too large w/o payload, discarding", {
      logItemStub: makeLogItemStub(logItem),
    });
    return undefined;
  }
  return result;
}
// See https://cloud.google.com/error-reporting/docs/formatting-error-messages
// and https://cloud.google.com/error-reporting/reference/rest/v1beta1/projects.events/report#ReportedErrorEvent
function makeReportedErrorEvent(error) {
  var result = {
    // Serves as marker only
    "@type":
      "type.googleapis.com/google.devtools.clouderrorreporting.v1beta1.ReportedErrorEvent",
    // This is useful for filtering in the UI
    serviceContext: {
      service: component || "<ts-not-set>",
      version: version || "<ts-not-set>",
    },
  };
  if (error) {
    // According to: https://cloud.google.com/error-reporting/docs/formatting-error-messages#json_representation
    var stackTrace = error.stack;
    if (stackTrace) {
      result.stack_trace = stackTrace;
    }
  }
  return result;
}
function makeLogItemStub(logItem) {
  var result = {
    component: logItem.component,
    severity: logItem.severity,
    time: logItem.time,
    environment: logItem.environment,
    region: logItem.region,
  };
  if (typeof logItem.message === "string") {
    if (logItem.message.length <= maxMessageStubLength) {
      result.message = logItem.message;
    } else {
      result.messageStub =
        logItem.message.substring(0, maxMessageStubLength) +
        " ... (too long, truncated)";
    }
  }
  if (logItem.error instanceof Error) {
    if (logItem.error.stack.length <= maxErrorStubLength) {
      result.error = logItem.error.stack;
    } else {
      result.errorStub =
        logItem.error.stack.substring(0, maxErrorStubLength) +
        " ... (too long, truncated)";
    }
  }
  return result;
}
function stringifyLogItem(logItem) {
  try {
    return jsonStringifyWithErrors(logItem);
  } catch (err) {
    if (err instanceof TypeError && logItem.payload !== undefined) {
      // payload contains circular references: save it as a string in the form console.xyz() would print
      logItem.payload = inspect(logItem.payload);
      return jsonStringifyWithErrors(logItem);
    }
    throw err;
  }
}
/**
 * Jsonifies Errors properly, not as {} only.
 */
function jsonStringifyWithErrors(value) {
  return JSON.stringify(value, function (key, value) {
    return value instanceof Error ? value.stack : value;
  });
}
var logConsoleLog = console.log;
var errorConsoleLog = console.error;
var warnConsoleLog = console.warn;
var infoConsoleLog = console.info;
var debugConsoleLog = console.debug;
// according to https://cloud.google.com/logging/quotas#logging_usage_limits, the log item must fit in 100 KB (internal data
// size; its relation to the stringified JSON's size is unknown), so let's have a sufficient safe margin
var maxAllowedLogItemLength = 32 * 1024;
var maxMessageStubLength = 1024;
var maxErrorStubLength = 4096;
//# sourceMappingURL=logging.js.map
