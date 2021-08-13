/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { Subscription } from "./accounting-protocol";
export interface TeamSubscription {
    id: string;
    userId: string;
    planId: string;
    startDate: string;
    endDate?: string;
    quantity: number;
    /** The Chargebee subscription id */
    paymentReference: string;
    cancellationDate?: string;
    deleted?: boolean;
}
export declare namespace TeamSubscription {
    const create: (ts: Omit<TeamSubscription, 'id'>) => TeamSubscription;
    const isActive: (ts: TeamSubscription, date: string) => boolean;
}
/**
 * A slot represents one unit of a TeamSubscription that gets assigned to one user at a time
 */
export interface TeamSubscriptionSlot {
    id: string;
    teamSubscriptionId: string;
    assigneeId?: string;
    assigneeIdentifier?: AssigneeIdentifier;
    subscriptionId?: string;
    cancellationDate?: string;
}
export declare type TeamSubscriptionSlotDeactivated = TeamSubscriptionSlot & {
    assigneeId: string;
    assigneeIdentifier: AssigneeIdentifier;
};
export declare type TeamSubscriptionSlotAssigned = TeamSubscriptionSlot & TeamSubscriptionSlotDeactivated & {
    subscriptionId: string;
};
export declare type TeamSubscriptionSlotState = 'unassigned' | 'assigned' | 'deactivated' | 'cancelled';
export declare namespace TeamSubscriptionSlot {
    const create: (ts: Omit<TeamSubscriptionSlot, 'id'>) => TeamSubscriptionSlot;
    const assign: (slot: TeamSubscriptionSlot, assigneeId: string, subscriptionId: string, assigneeIdentifier: AssigneeIdentifier) => void;
    const deactivate: (slot: TeamSubscriptionSlot, cancellationDate: string) => void;
    const reactivate: (slot: TeamSubscriptionSlot, subscriptionId?: string | undefined) => void;
    const status: (slot: TeamSubscriptionSlot, now: string) => TeamSubscriptionSlotState;
    const isActive: (slot: TeamSubscriptionSlot) => boolean;
}
/**
 * The mapping between a TeamSubscription and a resulting Subscription, resolved
 */
export interface TeamSubscriptionSlotResolved {
    id: string;
    teamSubscription: TeamSubscription;
    state: TeamSubscriptionSlotState;
    assigneeId?: string;
    assigneeIdentifier?: AssigneeIdentifier;
    subscription?: Subscription;
    cancellationDate?: string;
    hoursLeft?: number;
}
/**
 * Contains the data structure that the assigner used to identify the assignee.
 */
export declare type AssigneeIdentifier = AssigneeIdentityIdentifier;
export interface AssigneeIdentityIdentifier {
    identity: {
        authHost: string;
        authName: string;
    };
}
//# sourceMappingURL=team-subscription-protocol.d.ts.map