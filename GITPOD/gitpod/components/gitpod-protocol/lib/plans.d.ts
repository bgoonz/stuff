/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare type Currency = "USD" | "EUR";
export declare namespace Currency {
  const getAll: () => Currency[];
  const getSymbol: (c: Currency) => "$" | "€";
}
/**
 * Different plans of the same type MAY have different prices ($/€, for example) but MUST have the same feature set.
 */
export declare type PlanType =
  | "free"
  | "free-50"
  | "free-open-source"
  | "student"
  | "basic"
  | "personal"
  | "professional"
  | "professional-new";
export declare type HoursPerMonthType = number | "unlimited";
export interface Plan {
  chargebeeId: string;
  githubId?: number;
  githubPlanNumber?: number;
  name: string;
  currency: Currency;
  /** In full currencies (Euro, US Dollar, ...) */
  pricePerMonth: number;
  hoursPerMonth: HoursPerMonthType;
  type: PlanType;
  team?: boolean;
}
export declare namespace Plan {
  const is: (o: any) => o is Plan;
}
export declare const MAX_PARALLEL_WORKSPACES = 16;
export interface Coupon {
  id: string;
  isGithubStudentCoupon?: boolean;
}
export declare namespace Coupon {
  const is: (o: any) => o is Coupon;
}
export declare namespace Coupons {
  const INTERNAL_GITPOD_GHSP: Coupon;
  const INTERNAL_GITPOD_GHSP_2: Coupon;
  const GITHUBSTUDENTPACKFORFACULTY: Coupon;
  const isGithubStudentCoupon: (id: string) => boolean | undefined;
  const getAllCoupons: () => Coupon[];
}
export declare const ABSOLUTE_MAX_USAGE: number;
/**
 * Version history:
 *  - v1:
 *    - Free
 *    - Basic
 *    - Professional
 *    - Team Professional
 *  - v2:
 *    - Free
 *    - Personal
 *    - Unlimited: rebranded professional with unlimited hours
 *    - Team Unlimited: rebranded professional with unlimited hours
 *    - dropped: Basic
 *  - v2.5:
 *    + Student Unlimited
 *    + Team Unlimited Student
 *  - V3:
 *    - Free: reduced to 50h (stays default, but not advertised directly anymore)
 *    - Personal (8/9)
 *    - Professional (23/25)
 *    - Unlimited (35/39)
 *  - v4:
 *    - Professional Open Source (free)
 *  - v5:
 *    - Unleashed: rebranded Unlimited
 */
export declare namespace Plans {
  /**
   * The old default plan (v1): 100h hours for public repos
   */
  const FREE: Plan;
  /**
   * The new default plan (v3): 50h hours for public repos
   */
  const FREE_50: Plan;
  /**
   * Users created after this date get the FREE_50 plan (v3) instead of the (old) FREE plan (v1)
   */
  const FREE_50_START_DATE = "2019-12-19T00:00:00.000Z";
  /**
   * The 'Professional Open Source' plan was introduced to offer professional open-souce developers unlimited hours.
   */
  const FREE_OPEN_SOURCE: Plan;
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  const PROFESSIONAL_STUDENT_EUR: Plan;
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  const PROFESSIONAL_STUDENT_USD: Plan;
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  const TEAM_PROFESSIONAL_STUDENT_EUR: Plan;
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  const TEAM_PROFESSIONAL_STUDENT_USD: Plan;
  /**
   * The 'basic' plan was the original differentiator between FREE and Professional (v1) but got discarded soon.
   */
  const BASIC_EUR: Plan;
  /**
   * The 'basic' plan was the original differentiator between FREE and Professional (v1) but got discarded soon.
   */
  const BASIC_USD: Plan;
  /**
   * The 'personal' plan was introduced to superseed the 'basic' plan (introduced with v2) to be more attractive to hobbyists.
   */
  const PERSONAL_EUR: Plan;
  /**
   * The 'personal' plan was introduced to superseed the 'basic' plan (introduced with v2) to be more attractive to hobbyists.
   */
  const PERSONAL_USD: Plan;
  /**
   * This is the 'new' Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  const PROFESSIONAL_NEW_EUR: Plan;
  /**
   * This is the 'new' Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  const PROFESSIONAL_NEW_USD: Plan;
  /**
   * This is the 'new' Team Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  const TEAM_PROFESSIONAL_NEW_EUR: Plan;
  /**
   * This is the 'new' Team Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  const TEAM_PROFESSIONAL_NEW_USD: Plan;
  /**
   * This is the 'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  const PROFESSIONAL_EUR: Plan;
  /**
   * This is the 'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  const PROFESSIONAL_USD: Plan;
  /**
   * This is the Team-'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  const TEAM_PROFESSIONAL_USD: Plan;
  /**
   * This is the Team-'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  const TEAM_PROFESSIONAL_EUR: Plan;
  /**
   * This function returns all individual plans that might be active (= we have subscriptions for) at the moment
   */
  function getAvailablePlans(currency: Currency): Plan[];
  const getAvailableTeamPlans: (currency?: "USD" | "EUR" | undefined) => Plan[];
  function getById(id: string | undefined): Plan | undefined;
  function getByTypeAndCurrency(
    type: PlanType,
    currency: Currency
  ): Plan | undefined;
  function getProPlan(currency: Currency): Plan;
  function getNewProPlan(currency: Currency): Plan;
  function getStudentProPlan(currency: Currency): Plan;
  function getBasicPlan(currency: Currency): Plan;
  function getPersonalPlan(currency: Currency): Plan;
  function getFreePlan(userCreationDate: string): Plan;
  function isFreePlan(chargebeeId: string | undefined): boolean;
  function isFreeNonTransientPlan(chargebeeId: string | undefined): boolean;
  function getHoursPerMonth(plan: Plan): number;
  /**
   * Returns the maximum number of parallel workspaces for the given plan
   * @param plan
   */
  function getParallelWorkspacesById(planId: string | undefined): number;
  /**
   * Returns the maximum number of parallel workspaces for the given plan
   * @param plan
   */
  function getParallelWorkspaces(plan: Plan | undefined): number;
  /**
   * Returns the preferred plan type with the next higher arity
   * @param type
   */
  function getNextHigherPlanType(type: PlanType): PlanType;
  /**
   * This imposes a partial order on the plan types
   * @param planTypeA
   * @param planTypeB
   */
  function compareTypes(planTypeA: PlanType, planTypeB: PlanType): 0 | 1 | -1;
  function subscriptionChange(
    fromType: PlanType,
    toType: PlanType
  ): "upgrade" | "downgrade" | "none";
  interface Feature {
    title: string;
    emph?: boolean;
    link?: string;
    tooltip?: string;
  }
  namespace Feature {
    const getFeaturesFor: (p: Plan) => Feature[];
  }
}
//# sourceMappingURL=plans.d.ts.map
