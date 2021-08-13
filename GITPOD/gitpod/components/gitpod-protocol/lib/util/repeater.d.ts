/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { Deferred } from "./deferred";
/**
 * Repeats a given function until it is stopped
 */
export declare class Repeater {
    protected readonly fn: () => Promise<void> | void;
    protected readonly timeout: number;
    protected shouldRun: boolean;
    protected finished: Deferred<void>;
    protected timer?: any;
    constructor(fn: () => Promise<void> | void, timeout: number);
    start(): Promise<void>;
    run(): Promise<void>;
    protected sleep(timeout: number): Promise<unknown>;
    stop(): Promise<void>;
}
//# sourceMappingURL=repeater.d.ts.map