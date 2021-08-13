"use strict";
/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamSubscriptionSlot = exports.TeamSubscription = void 0;
var uuidv4 = require("uuid/v4");
var TeamSubscription;
(function (TeamSubscription) {
    TeamSubscription.create = function (ts) {
        var withId = ts;
        withId.id = uuidv4();
        return withId;
    };
    TeamSubscription.isActive = function (ts, date) {
        return ts.startDate <= date && (ts.endDate === undefined || date < ts.endDate);
    };
})(TeamSubscription = exports.TeamSubscription || (exports.TeamSubscription = {}));
var TeamSubscriptionSlot;
(function (TeamSubscriptionSlot) {
    TeamSubscriptionSlot.create = function (ts) {
        var withId = ts;
        withId.id = uuidv4();
        return withId;
    };
    TeamSubscriptionSlot.assign = function (slot, assigneeId, subscriptionId, assigneeIdentifier) {
        slot.assigneeId = assigneeId;
        slot.subscriptionId = subscriptionId;
        slot.assigneeIdentifier = assigneeIdentifier;
    };
    TeamSubscriptionSlot.deactivate = function (slot, cancellationDate) {
        slot.subscriptionId = undefined;
        slot.cancellationDate = cancellationDate;
    };
    TeamSubscriptionSlot.reactivate = function (slot, subscriptionId) {
        slot.subscriptionId = subscriptionId;
        slot.cancellationDate = undefined;
    };
    TeamSubscriptionSlot.status = function (slot, now) {
        if (slot.cancellationDate) {
            if (slot.cancellationDate < now) {
                return 'cancelled';
            }
            else {
                return 'deactivated';
            }
        }
        else {
            if (slot.subscriptionId) {
                return 'assigned';
            }
            else {
                return 'unassigned';
            }
        }
    };
    TeamSubscriptionSlot.isActive = function (slot) {
        return !slot.cancellationDate;
    };
})(TeamSubscriptionSlot = exports.TeamSubscriptionSlot || (exports.TeamSubscriptionSlot = {}));
//# sourceMappingURL=team-subscription-protocol.js.map