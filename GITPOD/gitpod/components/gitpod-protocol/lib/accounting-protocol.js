"use strict";
/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = exports.AssignedTeamSubscription = exports.UserPaidSubscription = exports.SessionDescription = exports.CreditDescription = exports.AccountEntry = void 0;
var uuidv4 = require("uuid/v4");
var timeutil_1 = require("./util/timeutil");
var AccountEntry;
(function (AccountEntry) {
    function create(entry) {
        var result = entry;
        result.uid = uuidv4();
        return result;
    }
    AccountEntry.create = create;
    ;
})(AccountEntry = exports.AccountEntry || (exports.AccountEntry = {}));
var CreditDescription;
(function (CreditDescription) {
    function is(obj) {
        return !!obj
            && obj.hasOwnProperty('subscriptionId')
            && obj.hasOwnProperty('planId');
    }
    CreditDescription.is = is;
})(CreditDescription = exports.CreditDescription || (exports.CreditDescription = {}));
var SessionDescription;
(function (SessionDescription) {
    function is(obj) {
        return !!obj
            && obj.hasOwnProperty('contextTitle')
            && obj.hasOwnProperty('contextUrl')
            && obj.hasOwnProperty('workspaceId')
            && obj.hasOwnProperty('workspaceInstanceId')
            && obj.hasOwnProperty('private');
    }
    SessionDescription.is = is;
})(SessionDescription = exports.SessionDescription || (exports.SessionDescription = {}));
var UserPaidSubscription;
(function (UserPaidSubscription) {
    function is(data) {
        return !!data
            && data.hasOwnProperty('paymentReference');
    }
    UserPaidSubscription.is = is;
})(UserPaidSubscription = exports.UserPaidSubscription || (exports.UserPaidSubscription = {}));
var AssignedTeamSubscription;
(function (AssignedTeamSubscription) {
    function is(data) {
        return !!data
            && data.hasOwnProperty('teamSubscriptionSlotId');
    }
    AssignedTeamSubscription.is = is;
})(AssignedTeamSubscription = exports.AssignedTeamSubscription || (exports.AssignedTeamSubscription = {}));
var Subscription;
(function (Subscription) {
    function create(newSubscription) {
        var subscription = newSubscription;
        subscription.uid = uuidv4();
        return subscription;
    }
    Subscription.create = create;
    ;
    function cancelSubscription(s, cancellationDate, endDate) {
        s.endDate = endDate || cancellationDate;
        s.cancellationDate = cancellationDate;
    }
    Subscription.cancelSubscription = cancelSubscription;
    ;
    function isSame(s1, s2) {
        return !!s1 && !!s2
            && s1.userId === s2.userId
            && s1.planId === s2.planId
            && s1.startDate === s2.startDate
            && s1.endDate === s2.endDate
            && s1.amount === s2.amount
            && s1.cancellationDate === s2.cancellationDate
            && s1.deleted === s2.deleted
            && ((s1.paymentData === undefined && s2.paymentData === undefined)
                || (!!s1.paymentData && !!s2.paymentData
                    && s1.paymentData.downgradeDate === s2.paymentData.downgradeDate
                    && s1.paymentData.newPlan === s2.paymentData.newPlan));
    }
    Subscription.isSame = isSame;
    ;
    function isActive(s, date) {
        return s.startDate <= date && (s.endDate === undefined || date < s.endDate);
    }
    Subscription.isActive = isActive;
    ;
    function isDowngraded(s) {
        return s.paymentData && s.paymentData.downgradeDate;
    }
    Subscription.isDowngraded = isDowngraded;
    ;
    function calculateCurrentPeriod(startDate, now) {
        var nextStartDate = startDate;
        do {
            startDate = nextStartDate;
            nextStartDate = timeutil_1.oneMonthLater(startDate, new Date(startDate).getDate());
        } while (nextStartDate < now.toISOString());
        return { startDate: startDate, endDate: nextStartDate };
    }
    Subscription.calculateCurrentPeriod = calculateCurrentPeriod;
    ;
})(Subscription = exports.Subscription || (exports.Subscription = {}));
//# sourceMappingURL=accounting-protocol.js.map