/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { User } from "./protocol";
export interface AccountEntry {
  uid: string;
  userId: string;
  /** [hours] */
  amount: number;
  /**
   * credit: start of validity,
   * session: end of (split-) session
   */
  date: string;
  /**
   * debits (session, expiry, loss): relation to credit
   */
  creditId?: string;
  /**
   * credit: end of validity
   */
  expiryDate?: string;
  kind: AccountEntryKind;
  /**
   * credit: amount - accounted debits
   * [hours]
   */
  remainingAmount?: number;
  description?: object;
}
export declare namespace AccountEntry {
  function create<T extends AccountEntry>(entry: Omit<T, "uid">): T;
}
export declare type DebitAccountEntryKind = "session" | "expiry" | "loss";
export declare type AccountEntryKind =
  | "credit"
  | DebitAccountEntryKind
  | "carry"
  | "open";
export interface Credit extends AccountEntry {
  kind: "credit";
  expiryDate: string;
}
export declare type Debit = LossDebit | ExpiryDebit | SessionDebit;
export interface LossDebit extends AccountEntry {
  kind: "loss";
}
export interface ExpiryDebit extends AccountEntry {
  kind: "expiry";
  creditId: undefined;
}
export interface SessionDebit extends AccountEntry {
  kind: DebitAccountEntryKind;
  creditId: string;
}
export declare type AccountEntryDescription =
  | SessionDescription
  | CreditDescription;
export interface CreditDescription {
  subscriptionId: string;
  planId: string;
}
export declare namespace CreditDescription {
  function is(obj: any): obj is CreditDescription;
}
export interface SessionDescription {
  contextTitle: string;
  contextUrl: string;
  workspaceId: string;
  workspaceInstanceId: string;
  private: boolean;
}
export declare namespace SessionDescription {
  function is(obj: any): obj is SessionDescription;
}
/**
 * - The earliest subscription may start with User.creationDate
 * - There may be multiple Gitpod subscriptions for a user at any given time
 * - The dates form an interval of the form: [startDate, endDate)
 * - Subscriptions that directly map to a Chargebee plan have their paymentReference set and MAY carry additional paymentData (UserPaidSubscription)
 * - Subscriptions that are assigned to a user through a Team Subscription carry a teamSubscriptionSlotId (AssignedTeamSubscription)
 */
export interface Subscription {
  uid: string;
  userId: string;
  startDate: string;
  /** When the subscription will end (must be >= cancellationDate!) */
  endDate?: string;
  /** When the subscription was cancelled */
  cancellationDate?: string;
  /** Number of granted hours */
  amount: number;
  /** Number of granted hours for the first month: If this is set, use this value for the first month */
  firstMonthAmount?: number;
  planId?: string;
  paymentReference?: string;
  paymentData?: PaymentData;
  teamSubscriptionSlotId?: string;
  /** marks the subscription as deleted */
  deleted?: boolean;
}
export interface SubscriptionAndUser extends Subscription {
  user: User;
}
export interface PaymentData {
  /** Marks the date as of which the _switch_ is effective. */
  downgradeDate?: string;
  /** Determines the new plan the dowgrade is targeted against (optional for backwards compatibility) */
  newPlan?: string;
}
export interface UserPaidSubscription extends Subscription {
  paymentReference: string;
  paymentData?: PaymentData;
}
export declare namespace UserPaidSubscription {
  function is(data: any): data is UserPaidSubscription;
}
export interface AssignedTeamSubscription extends Subscription {
  teamSubscriptionSlotId: string;
}
export declare namespace AssignedTeamSubscription {
  function is(data: any): data is AssignedTeamSubscription;
}
export declare namespace Subscription {
  function create(newSubscription: Omit<Subscription, "uid">): Subscription;
  function cancelSubscription(
    s: Subscription,
    cancellationDate: string,
    endDate?: string
  ): void;
  function isSame(
    s1: Subscription | undefined,
    s2: Subscription | undefined
  ): boolean;
  function isActive(s: Subscription, date: string): boolean;
  function isDowngraded(s: Subscription): string | undefined;
  function calculateCurrentPeriod(
    startDate: string,
    now: Date
  ): {
    startDate: string;
    endDate: string;
  };
}
export declare type MaybeSubscription = Subscription | undefined;
export interface Period {
  startDate: string;
  endDate: string;
}
export declare type MaybePeriod = Period | undefined;
export declare type AccountEntryFixedPeriod = Omit<AccountEntry, "uid"> & {
  expiryDate: string;
};
export interface AccountStatement extends Period {
  userId: string;
  /**
   * The subscriptions that have not been cancelled yet at the end of the period
   */
  subscriptions: Subscription[];
  credits: Credit[];
  debits: Debit[];
  /** Remaining valid hours (accumulated from credits) */
  remainingHours: RemainingHours;
}
export declare type RemainingHours = number | "unlimited";
export interface CreditAlert {
  userId: string;
  remainingUsageHours: number;
}
//# sourceMappingURL=accounting-protocol.d.ts.map
