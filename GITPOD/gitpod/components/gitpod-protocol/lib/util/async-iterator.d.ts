/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare function find<T>(
  it: AsyncIterableIterator<T>,
  predicate: (value: T) => boolean
): Promise<T | undefined>;
export declare function filter<T>(
  it: AsyncIterableIterator<T>,
  predicate: (value: T) => boolean
): Promise<T[]>;
export interface AsyncCachingIterator<T> extends AsyncIterableIterator<T> {
  resetCursor(): void;
}
export declare class AsyncCachingIteratorImpl<T>
  implements AsyncIterableIterator<T>, AsyncCachingIterator<T>
{
  protected readonly iterable: AsyncIterableIterator<T>;
  protected cache: T[];
  protected cursor: number;
  protected cacheRead: boolean;
  constructor(iterable: AsyncIterableIterator<T>);
  resetCursor(): void;
  next(value?: any): Promise<IteratorResult<T>>;
  [Symbol.asyncIterator](): this;
}
//# sourceMappingURL=async-iterator.d.ts.map
