/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { LogContext } from './logging';
export declare class SafePromise {
    static catchAndLog<T>(p: Promise<T>, logCtx?: LogContext): Promise<T>;
    static catch<T>(p: Promise<T>, handler: (err: any) => void): Promise<T>;
}
//# sourceMappingURL=safe-promise.d.ts.map