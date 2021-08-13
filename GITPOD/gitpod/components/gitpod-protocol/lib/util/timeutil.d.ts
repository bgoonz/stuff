/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/**
 * Returns the <code>day</code>th of the next month from <code>formDate</code>.
 * If the next month does not have a <code>day</code>th, the last day of that
 * month is taken.
 * The time is copied from <code>fromDate</code>.
 *
 * @param fromDate
 * @param day
 */
export declare function oneMonthLater(fromDate: string, day?: number): string;
export declare const yearsLater: (fromDate: string, years: number) => string;
export declare const addMillis: (d1: string, millis: number) => string;
export declare const durationInHours: (d1: string, d2: string) => number;
export declare const durationInMillis: (d1: string, d2: string) => number;
export declare const isDateGreaterOrEqual: (d1: string, d2: string) => boolean;
export declare const isDateSmallerOrEqual: (
  d1: string,
  d2: string | undefined
) => boolean;
export declare const isDateSmaller: (
  d1: string,
  d2: string | undefined
) => boolean;
export declare const oldest: (d1: string, d2: string) => string;
export declare const earliest: (d1: string, d2: string) => string;
export declare const orderAsc: (d1: string, d2: string) => number;
export declare const liftDate1: <T>(d1: string, f: (d1: Date) => T) => T;
export declare const liftDate: <T>(
  d1: string,
  d2: string,
  f: (d1: Date, d2: Date) => T
) => T;
export declare function hoursLater(date: string, hours: number): string;
export declare function secondsBefore(date: string, seconds: number): string;
export declare function rightAfter(date: string): string;
export declare function rightBefore(date: string): string;
export declare function millisecondsToHours(milliseconds: number): number;
export declare function hoursToMilliseconds(hours: number): number;
//# sourceMappingURL=timeutil.d.ts.map
