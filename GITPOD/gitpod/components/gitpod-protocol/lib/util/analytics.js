"use strict";
/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.newAnalyticsWriterFromEnv = void 0;
var Analytics = require("analytics-node");
var logging_1 = require("./logging");
function newAnalyticsWriterFromEnv() {
  switch (process.env.GITPOD_ANALYTICS_WRITER) {
    case "segment":
      return new SegmentAnalyticsWriter(
        process.env.GITPOD_ANALYTICS_SEGMENT_KEY || ""
      );
    case "log":
      return new LogAnalyticsWriter();
    default:
      return new NoAnalyticsWriter();
  }
}
exports.newAnalyticsWriterFromEnv = newAnalyticsWriterFromEnv;
var SegmentAnalyticsWriter = /** @class */ (function () {
  function SegmentAnalyticsWriter(writeKey) {
    this.analytics = new Analytics(writeKey);
  }
  SegmentAnalyticsWriter.prototype.identify = function (msg) {
    try {
      this.analytics.identify(msg, function (err) {
        if (err) {
          logging_1.log.warn("analytics.identify failed", err);
        }
      });
    } catch (err) {
      logging_1.log.warn("analytics.identify failed", err);
    }
  };
  SegmentAnalyticsWriter.prototype.track = function (msg) {
    try {
      this.analytics.track(msg, function (err) {
        if (err) {
          logging_1.log.warn("analytics.track failed", err);
        }
      });
    } catch (err) {
      logging_1.log.warn("analytics.track failed", err);
    }
  };
  return SegmentAnalyticsWriter;
})();
var LogAnalyticsWriter = /** @class */ (function () {
  function LogAnalyticsWriter() {}
  LogAnalyticsWriter.prototype.identify = function (msg) {
    logging_1.log.debug("analytics identify", msg);
  };
  LogAnalyticsWriter.prototype.track = function (msg) {
    logging_1.log.debug("analytics track", msg);
  };
  return LogAnalyticsWriter;
})();
var NoAnalyticsWriter = /** @class */ (function () {
  function NoAnalyticsWriter() {}
  NoAnalyticsWriter.prototype.identify = function (msg) {};
  NoAnalyticsWriter.prototype.track = function (msg) {};
  return NoAnalyticsWriter;
})();
//# sourceMappingURL=analytics.js.map
