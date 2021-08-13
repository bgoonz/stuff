/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/**
 * Queues asynchronous operations in a synchronous context
 */
export declare class Queue {
  protected queue: Promise<any>;
  enqueue<T>(operation: () => Promise<T>): Promise<T>;
}
//# sourceMappingURL=queue.d.ts.map
