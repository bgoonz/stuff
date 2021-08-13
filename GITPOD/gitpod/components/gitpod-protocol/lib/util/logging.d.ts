/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export interface LogContext {
    instanceId?: string;
    sessionId?: string;
    userId?: string;
    workspaceId?: string;
}
export declare namespace LogContext {
    function from(params: {
        userId?: string;
        user?: any;
        request?: any;
    }): LogContext;
}
export interface LogPayload {
}
export declare namespace log {
    function error(context: LogContext, message: string, error: Error, payload: LogPayload): void;
    function error(context: LogContext, message: string, error: Error): void;
    function error(context: LogContext, message: string, payload: LogPayload): void;
    function error(context: LogContext, message: string): void;
    function error(context: LogContext, error: Error, payload: LogPayload): void;
    function error(context: LogContext, error: Error): void;
    function error(message: string, error: Error, payload: LogPayload): void;
    function error(message: string, error: Error): void;
    function error(message: string, payload: LogPayload): void;
    function error(message: string): void;
    function error(error: Error, payload: LogPayload): void;
    function error(error: Error): void;
    function warn(context: LogContext, message: string, error: Error, payload: LogPayload): void;
    function warn(context: LogContext, message: string, error: Error): void;
    function warn(context: LogContext, message: string, payload: LogPayload): void;
    function warn(context: LogContext, message: string): void;
    function warn(context: LogContext, error: Error, payload: LogPayload): void;
    function warn(context: LogContext, error: Error): void;
    function warn(message: string, error: Error, payload: LogPayload): void;
    function warn(message: string, error: Error): void;
    function warn(message: string, payload: LogPayload): void;
    function warn(message: string): void;
    function warn(error: Error, payload: LogPayload): void;
    function warn(error: Error): void;
    function info(context: LogContext, message: string, error: Error, payload: LogPayload): void;
    function info(context: LogContext, message: string, error: Error): void;
    function info(context: LogContext, message: string, payload: LogPayload): void;
    function info(context: LogContext, message: string): void;
    function info(context: LogContext, error: Error, payload: LogPayload): void;
    function info(context: LogContext, error: Error): void;
    function info(message: string, error: Error, payload: LogPayload): void;
    function info(message: string, error: Error): void;
    function info(message: string, payload: LogPayload): void;
    function info(message: string): void;
    function info(error: Error, payload: LogPayload): void;
    function info(error: Error): void;
    function debug(context: LogContext, message: string, error: Error, payload: LogPayload): void;
    function debug(context: LogContext, message: string, error: Error): void;
    function debug(context: LogContext, message: string, payload: LogPayload): void;
    function debug(context: LogContext, message: string): void;
    function debug(context: LogContext, error: Error, payload: LogPayload): void;
    function debug(context: LogContext, error: Error): void;
    function debug(message: string, error: Error, payload: LogPayload): void;
    function debug(message: string, error: Error): void;
    function debug(message: string, payload: LogPayload): void;
    function debug(message: string): void;
    function debug(error: Error, payload: LogPayload): void;
    function debug(error: Error): void;
    /**
     * Do not use in frontend.
     */
    function enableJSONLogging(componentArg: string, versionArg: string | undefined): void;
    function resetToDefaultLogging(): void;
}
//# sourceMappingURL=logging.d.ts.map