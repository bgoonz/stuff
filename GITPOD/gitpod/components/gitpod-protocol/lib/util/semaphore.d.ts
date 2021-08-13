/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare class Semaphore {
    protected readonly capacity: number;
    protected queue: (() => void)[];
    protected used: number;
    constructor(capacity: number);
    release(): void;
    acquire(): Promise<void>;
}
//# sourceMappingURL=semaphore.d.ts.map