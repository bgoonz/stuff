"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.hoursToMilliseconds = exports.millisecondsToHours = exports.rightBefore = exports.rightAfter = exports.secondsBefore = exports.hoursLater = exports.liftDate = exports.liftDate1 = exports.orderAsc = exports.earliest = exports.oldest = exports.isDateSmaller = exports.isDateSmallerOrEqual = exports.isDateGreaterOrEqual = exports.durationInMillis = exports.durationInHours = exports.addMillis = exports.yearsLater = exports.oneMonthLater = void 0;
/**
 * Returns the <code>day</code>th of the next month from <code>formDate</code>.
 * If the next month does not have a <code>day</code>th, the last day of that
 * month is taken.
 * The time is copied from <code>fromDate</code>.
 *
 * @param fromDate
 * @param day
 */
function oneMonthLater(fromDate, day) {
    var later = new Date(fromDate);
    day = day || later.getDate();
    var fromMonth = later.getMonth();
    later.setDate(day);
    later.setMonth(later.getMonth() + 1);
    if (later.getMonth() - fromMonth > 1) {
        later.setDate(0);
    }
    return later.toISOString();
}
exports.oneMonthLater = oneMonthLater;
var yearsLater = function (fromDate, years) { return exports.liftDate1(fromDate, function (d) {
    d.setUTCFullYear(d.getUTCFullYear() + years);
    return d.toISOString();
}); };
exports.yearsLater = yearsLater;
// tslint:disable-next-line:no-shadowed-variable
var addMillis = function (d1, millis) { return exports.liftDate1(d1, function (d1) { return new Date(d1.getTime() + millis).toISOString(); }); };
exports.addMillis = addMillis;
var durationInHours = function (d1, d2) { return exports.liftDate(d1, d2, function (d1, d2) { return millisecondsToHours(d1.getTime() - d2.getTime()); }); };
exports.durationInHours = durationInHours;
var durationInMillis = function (d1, d2) { return exports.liftDate(d1, d2, function (d1, d2) { return d1.getTime() - d2.getTime(); }); };
exports.durationInMillis = durationInMillis;
// tslint:disable-next-line:no-shadowed-variable
var isDateGreaterOrEqual = function (d1, d2) { return exports.liftDate(d1, d2, function (d1, d2) { return d1.getTime() >= d2.getTime(); }); };
exports.isDateGreaterOrEqual = isDateGreaterOrEqual;
var isDateSmallerOrEqual = function (d1, d2) { return !d2 || d1 <= d2; };
exports.isDateSmallerOrEqual = isDateSmallerOrEqual;
var isDateSmaller = function (d1, d2) { return !d2 || d1 < d2; };
exports.isDateSmaller = isDateSmaller;
var oldest = function (d1, d2) { return d1 > d2 ? d1 : d2; };
exports.oldest = oldest;
var earliest = function (d1, d2) { return d1 < d2 ? d1 : d2; };
exports.earliest = earliest;
var orderAsc = function (d1, d2) { return exports.liftDate(d1, d2, function (d1, d2) { return d1.getTime() - d2.getTime(); }); };
exports.orderAsc = orderAsc;
var liftDate1 = function (d1, f) { return f(new Date(d1)); };
exports.liftDate1 = liftDate1;
var liftDate = function (d1, d2, f) { return f(new Date(d1), new Date(d2)); };
exports.liftDate = liftDate;
function hoursLater(date, hours) {
    var result = new Date(date);
    result.setHours(result.getHours() + hours);
    return result.toISOString();
}
exports.hoursLater = hoursLater;
function secondsBefore(date, seconds) {
    return new Date(new Date(date).getTime() - seconds * 1000).toISOString();
}
exports.secondsBefore = secondsBefore;
function rightAfter(date) {
    return new Date(new Date(date).getTime() + 1).toISOString();
}
exports.rightAfter = rightAfter;
function rightBefore(date) {
    return new Date(new Date(date).getTime() - 1).toISOString();
}
exports.rightBefore = rightBefore;
function millisecondsToHours(milliseconds) {
    return milliseconds / 1000 / 60 / 60;
}
exports.millisecondsToHours = millisecondsToHours;
function hoursToMilliseconds(hours) {
    return hours * 60 * 60 * 1000;
}
exports.hoursToMilliseconds = hoursToMilliseconds;
//# sourceMappingURL=timeutil.js.map