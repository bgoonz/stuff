/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare enum HeadlessWorkspaceEventType {
  LogOutput = "log-output",
  FinishedSuccessfully = "finish-success",
  FinishedButFailed = "finish-fail",
  AbortedTimedOut = "aborted-timeout",
  Aborted = "aborted",
  Started = "started",
}
export declare namespace HeadlessWorkspaceEventType {
  function isRunning(t: HeadlessWorkspaceEventType): boolean;
  function didFinish(t: HeadlessWorkspaceEventType): boolean;
}
export interface HeadlessWorkspaceEvent {
  workspaceID: string;
  text: string;
  type: HeadlessWorkspaceEventType;
}
export interface HeadlessLogUrls {
  streams: {
    [streamID: string]: string;
  };
}
/** cmp. @const HEADLESS_LOG_STREAM_STATUS_CODE_REGEX */
export declare const HEADLESS_LOG_STREAM_STATUS_CODE = "X-LogStream-StatusCode";
export declare const HEADLESS_LOG_STREAM_STATUS_CODE_REGEX: RegExp;
//# sourceMappingURL=headless-workspace-log.d.ts.map
