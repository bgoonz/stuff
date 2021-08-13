/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
interface CacheEntry<T> {
    key: string;
    value: T;
    expiryDate: number;
}
export declare class GarbageCollectedCache<T> {
    protected readonly defaultMaxAgeSeconds: number;
    protected readonly gcIntervalSeconds: number;
    protected readonly store: Map<string, CacheEntry<T>>;
    constructor(defaultMaxAgeSeconds: number, gcIntervalSeconds: number);
    set(key: string, value: T): void;
    get(key: string): T | undefined;
    protected regularlyCollectGarbage(): void;
    protected collectGarbage(): void;
    protected calcExpiryDate(maxAgeSeconds?: number): number;
}
export {};
//# sourceMappingURL=garbage-collected-cache.d.ts.map