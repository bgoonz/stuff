"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.HEADLESS_LOG_STREAM_STATUS_CODE_REGEX =
  exports.HEADLESS_LOG_STREAM_STATUS_CODE =
  exports.HeadlessWorkspaceEventType =
    void 0;
var HeadlessWorkspaceEventType;
(function (HeadlessWorkspaceEventType) {
  HeadlessWorkspaceEventType["LogOutput"] = "log-output";
  HeadlessWorkspaceEventType["FinishedSuccessfully"] = "finish-success";
  HeadlessWorkspaceEventType["FinishedButFailed"] = "finish-fail";
  HeadlessWorkspaceEventType["AbortedTimedOut"] = "aborted-timeout";
  HeadlessWorkspaceEventType["Aborted"] = "aborted";
  HeadlessWorkspaceEventType["Started"] = "started";
})(
  (HeadlessWorkspaceEventType =
    exports.HeadlessWorkspaceEventType ||
    (exports.HeadlessWorkspaceEventType = {}))
);
(function (HeadlessWorkspaceEventType) {
  function isRunning(t) {
    return t === HeadlessWorkspaceEventType.LogOutput;
  }
  HeadlessWorkspaceEventType.isRunning = isRunning;
  function didFinish(t) {
    return (
      t === HeadlessWorkspaceEventType.FinishedButFailed ||
      t === HeadlessWorkspaceEventType.FinishedSuccessfully
    );
  }
  HeadlessWorkspaceEventType.didFinish = didFinish;
})(
  (HeadlessWorkspaceEventType =
    exports.HeadlessWorkspaceEventType ||
    (exports.HeadlessWorkspaceEventType = {}))
);
/** cmp. @const HEADLESS_LOG_STREAM_STATUS_CODE_REGEX */
exports.HEADLESS_LOG_STREAM_STATUS_CODE = "X-LogStream-StatusCode";
exports.HEADLESS_LOG_STREAM_STATUS_CODE_REGEX =
  /X-LogStream-StatusCode: ([0-9]{3})/;
//# sourceMappingURL=headless-workspace-log.js.map
