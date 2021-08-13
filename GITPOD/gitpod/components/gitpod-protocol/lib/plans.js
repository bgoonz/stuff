"use strict";
/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spread =
  (this && this.__spread) ||
  function () {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plans =
  exports.ABSOLUTE_MAX_USAGE =
  exports.Coupons =
  exports.Coupon =
  exports.MAX_PARALLEL_WORKSPACES =
  exports.Plan =
  exports.Currency =
    void 0;
var Currency;
(function (Currency) {
  Currency.getAll = function () {
    return ["USD", "EUR"];
  };
  Currency.getSymbol = function (c) {
    return c === "USD" ? "$" : "€";
  };
})((Currency = exports.Currency || (exports.Currency = {})));
var Plan;
(function (Plan) {
  Plan.is = function (o) {
    return (
      "chargebeeId" in o &&
      "name" in o &&
      "currency" in o &&
      "pricePerMonth" in o &&
      "hoursPerMonth" in o &&
      "type" in o
    );
  };
})((Plan = exports.Plan || (exports.Plan = {})));
exports.MAX_PARALLEL_WORKSPACES = 16;
var Coupon;
(function (Coupon) {
  Coupon.is = function (o) {
    return "id" in o;
  };
})((Coupon = exports.Coupon || (exports.Coupon = {})));
var Coupons;
(function (Coupons) {
  Coupons.INTERNAL_GITPOD_GHSP = {
    id: "INTERNAL_GITPOD_GHSP",
    isGithubStudentCoupon: true,
  };
  Coupons.INTERNAL_GITPOD_GHSP_2 = {
    id: "INTERNAL_GITPOD_GHSP_2",
    isGithubStudentCoupon: true,
  };
  Coupons.GITHUBSTUDENTPACKFORFACULTY = {
    id: "GITHUBSTUDENTPACKFORFACULTY",
    isGithubStudentCoupon: true,
  };
  Coupons.isGithubStudentCoupon = function (id) {
    var c = Coupons.getAllCoupons().find(function (ic) {
      return ic.id === id;
    });
    if (!c) {
      return undefined;
    }
    return !!c.isGithubStudentCoupon;
  };
  Coupons.getAllCoupons = function () {
    return Object.keys(Coupons)
      .map(function (k) {
        return Coupons[k];
      })
      .filter(function (a) {
        return typeof a === "object" && Coupon.is(a);
      });
  };
})((Coupons = exports.Coupons || (exports.Coupons = {})));
// Theoretical maximum of workspace hours: 16 workspaces for 24h a day for 31 days as permitted by the v3 unlimited plan
// Other unlimited hour plans are restricted by the number of Parallel Workspaces they can start.
exports.ABSOLUTE_MAX_USAGE = exports.MAX_PARALLEL_WORKSPACES * 24 * 31;
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
var Plans;
(function (Plans) {
  /**
   * The old default plan (v1): 100h hours for public repos
   */
  Plans.FREE = {
    chargebeeId: "free",
    githubId: 2034,
    githubPlanNumber: 1,
    type: "free",
    name: "Open Source",
    currency: "USD",
    pricePerMonth: 0,
    hoursPerMonth: 100,
  };
  /**
   * The new default plan (v3): 50h hours for public repos
   */
  Plans.FREE_50 = {
    chargebeeId: "free-50",
    githubId: 4902,
    githubPlanNumber: 5,
    type: "free-50",
    name: "Open Source",
    currency: "USD",
    pricePerMonth: 0,
    hoursPerMonth: 50,
  };
  /**
   * Users created after this date get the FREE_50 plan (v3) instead of the (old) FREE plan (v1)
   */
  Plans.FREE_50_START_DATE = "2019-12-19T00:00:00.000Z";
  /**
   * The 'Professional Open Source' plan was introduced to offer professional open-souce developers unlimited hours.
   */
  Plans.FREE_OPEN_SOURCE = {
    chargebeeId: "free-open-source",
    type: "free-open-source",
    name: "Professional Open Source",
    currency: "USD",
    pricePerMonth: 0,
    hoursPerMonth: "unlimited",
  };
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  Plans.PROFESSIONAL_STUDENT_EUR = {
    chargebeeId: "professional-student-eur",
    type: "student",
    name: "Student Unleashed",
    currency: "EUR",
    pricePerMonth: 8,
    hoursPerMonth: "unlimited",
  };
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  Plans.PROFESSIONAL_STUDENT_USD = {
    chargebeeId: "professional-student-usd",
    type: "student",
    name: "Student Unleashed",
    currency: "USD",
    pricePerMonth: 9,
    hoursPerMonth: "unlimited",
  };
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  Plans.TEAM_PROFESSIONAL_STUDENT_EUR = {
    chargebeeId: "team-professional-student-eur",
    type: "student",
    name: "Team Student Unleashed",
    team: true,
    currency: "EUR",
    pricePerMonth: 8,
    hoursPerMonth: "unlimited",
  };
  /**
   * The 'Student Unleashed' plans were introduced to give students access to the highly-priced unlimited plans.
   */
  Plans.TEAM_PROFESSIONAL_STUDENT_USD = {
    chargebeeId: "team-professional-student-usd",
    type: "student",
    name: "Team Student Unleashed",
    team: true,
    currency: "USD",
    pricePerMonth: 9,
    hoursPerMonth: "unlimited",
  };
  /**
   * The 'basic' plan was the original differentiator between FREE and Professional (v1) but got discarded soon.
   */
  Plans.BASIC_EUR = {
    chargebeeId: "basic-eur",
    type: "basic",
    name: "Standard",
    currency: "EUR",
    pricePerMonth: 17,
    hoursPerMonth: 100,
  };
  /**
   * The 'basic' plan was the original differentiator between FREE and Professional (v1) but got discarded soon.
   */
  Plans.BASIC_USD = {
    chargebeeId: "basic-usd",
    githubId: 2035,
    githubPlanNumber: 2,
    type: "basic",
    name: "Standard",
    currency: "USD",
    pricePerMonth: 19,
    hoursPerMonth: 100,
  };
  /**
   * The 'personal' plan was introduced to superseed the 'basic' plan (introduced with v2) to be more attractive to hobbyists.
   */
  Plans.PERSONAL_EUR = {
    chargebeeId: "personal-eur",
    type: "personal",
    name: "Personal",
    currency: "EUR",
    pricePerMonth: 8,
    hoursPerMonth: 100,
  };
  /**
   * The 'personal' plan was introduced to superseed the 'basic' plan (introduced with v2) to be more attractive to hobbyists.
   */
  Plans.PERSONAL_USD = {
    chargebeeId: "personal-usd",
    githubId: 2274,
    githubPlanNumber: 4,
    type: "personal",
    name: "Personal",
    currency: "USD",
    pricePerMonth: 9,
    hoursPerMonth: 100,
  };
  /**
   * This is the 'new' Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  Plans.PROFESSIONAL_NEW_EUR = {
    chargebeeId: "professional-new-eur",
    type: "professional-new",
    name: "Professional",
    currency: "EUR",
    pricePerMonth: 23,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the 'new' Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  Plans.PROFESSIONAL_NEW_USD = {
    chargebeeId: "professional-new-usd",
    type: "professional-new",
    name: "Professional",
    currency: "USD",
    pricePerMonth: 25,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the 'new' Team Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  Plans.TEAM_PROFESSIONAL_NEW_EUR = {
    chargebeeId: "team-professional-new-eur",
    type: "professional-new",
    name: "Team Professional",
    currency: "EUR",
    team: true,
    pricePerMonth: 23,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the 'new' Team Professional plan (v3), which is meant to fit well between Personal (9$/8€) on the left and
   * Unleashed (39$/35€) on the right.
   */
  Plans.TEAM_PROFESSIONAL_NEW_USD = {
    chargebeeId: "team-professional-new-usd",
    type: "professional-new",
    name: "Team Professional",
    currency: "USD",
    team: true,
    pricePerMonth: 25,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the 'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  Plans.PROFESSIONAL_EUR = {
    chargebeeId: "professional-eur",
    type: "professional",
    name: "Unleashed",
    currency: "EUR",
    pricePerMonth: 35,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the 'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  Plans.PROFESSIONAL_USD = {
    chargebeeId: "professional-usd",
    githubId: 2036,
    githubPlanNumber: 3,
    type: "professional",
    name: "Unleashed",
    currency: "USD",
    pricePerMonth: 39,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the Team-'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  Plans.TEAM_PROFESSIONAL_USD = {
    chargebeeId: "team-professional-usd",
    type: "professional",
    name: "Team Unleashed",
    currency: "USD",
    team: true,
    pricePerMonth: 39,
    hoursPerMonth: "unlimited",
  };
  /**
   * This is the Team-'Unleashed' plan (v1, rebranded v2, v5)
   * It was originally introduced as 'Professional', and we cannot update the ids, so it stays that way in the code.
   */
  Plans.TEAM_PROFESSIONAL_EUR = {
    chargebeeId: "team-professional-eur",
    type: "professional",
    name: "Team Unleashed",
    currency: "EUR",
    team: true,
    pricePerMonth: 35,
    hoursPerMonth: "unlimited",
  };
  var getAllPlans = function () {
    return Object.keys(Plans)
      .map(function (k) {
        return Plans[k];
      })
      .filter(function (a) {
        return typeof a === "object" && Plan.is(a);
      });
  };
  /**
   * This function returns all individual plans that might be active (= we have subscriptions for) at the moment
   */
  function getAvailablePlans(currency) {
    var availablePaidPlans = [
      Plans.BASIC_EUR,
      Plans.BASIC_USD,
      Plans.PERSONAL_EUR,
      Plans.PERSONAL_USD,
      Plans.PROFESSIONAL_NEW_EUR,
      Plans.PROFESSIONAL_NEW_USD,
      Plans.PROFESSIONAL_EUR,
      Plans.PROFESSIONAL_USD,
    ];
    return __spread(
      [Plans.FREE, Plans.FREE_50, Plans.FREE_OPEN_SOURCE],
      availablePaidPlans.filter(function (p) {
        return p.currency;
      })
    );
  }
  Plans.getAvailablePlans = getAvailablePlans;
  Plans.getAvailableTeamPlans = function (currency) {
    var teamPlans = getAllPlans().filter(function (p) {
      return !!p.team;
    });
    return currency
      ? teamPlans.filter(function (p) {
          return p.currency === currency;
        })
      : teamPlans;
  };
  function getById(id) {
    if (id === undefined) {
      return undefined;
    }
    return (
      getAllPlans().find(function (p) {
        return p.chargebeeId === id;
      }) || undefined
    );
  }
  Plans.getById = getById;
  function getByTypeAndCurrency(type, currency) {
    return getAllPlans()
      .filter(function (p) {
        return p.type;
      })
      .find(function (p) {
        return p.currency === currency;
      });
  }
  Plans.getByTypeAndCurrency = getByTypeAndCurrency;
  function getProPlan(currency) {
    switch (currency) {
      case "EUR":
        return Plans.PROFESSIONAL_EUR;
      case "USD":
        return Plans.PROFESSIONAL_USD;
    }
  }
  Plans.getProPlan = getProPlan;
  function getNewProPlan(currency) {
    switch (currency) {
      case "EUR":
        return Plans.PROFESSIONAL_NEW_EUR;
      case "USD":
        return Plans.PROFESSIONAL_NEW_USD;
    }
  }
  Plans.getNewProPlan = getNewProPlan;
  function getStudentProPlan(currency) {
    switch (currency) {
      case "EUR":
        return Plans.PROFESSIONAL_STUDENT_EUR;
      case "USD":
        return Plans.PROFESSIONAL_STUDENT_USD;
    }
  }
  Plans.getStudentProPlan = getStudentProPlan;
  function getBasicPlan(currency) {
    switch (currency) {
      case "EUR":
        return Plans.BASIC_EUR;
      case "USD":
        return Plans.BASIC_USD;
    }
  }
  Plans.getBasicPlan = getBasicPlan;
  function getPersonalPlan(currency) {
    switch (currency) {
      case "EUR":
        return Plans.PERSONAL_EUR;
      case "USD":
        return Plans.PERSONAL_USD;
    }
  }
  Plans.getPersonalPlan = getPersonalPlan;
  function getFreePlan(userCreationDate) {
    return userCreationDate < Plans.FREE_50_START_DATE
      ? Plans.FREE
      : Plans.FREE_50;
  }
  Plans.getFreePlan = getFreePlan;
  function isFreePlan(chargebeeId) {
    return (
      chargebeeId === Plans.FREE.chargebeeId ||
      chargebeeId === Plans.FREE_50.chargebeeId ||
      chargebeeId === Plans.FREE_OPEN_SOURCE.chargebeeId
    );
  }
  Plans.isFreePlan = isFreePlan;
  function isFreeNonTransientPlan(chargebeeId) {
    return chargebeeId === Plans.FREE_OPEN_SOURCE.chargebeeId;
  }
  Plans.isFreeNonTransientPlan = isFreeNonTransientPlan;
  function getHoursPerMonth(plan) {
    return plan.hoursPerMonth == "unlimited"
      ? exports.ABSOLUTE_MAX_USAGE
      : plan.hoursPerMonth;
  }
  Plans.getHoursPerMonth = getHoursPerMonth;
  /**
   * Returns the maximum number of parallel workspaces for the given plan
   * @param plan
   */
  function getParallelWorkspacesById(planId) {
    return getParallelWorkspaces(Plans.getById(planId));
  }
  Plans.getParallelWorkspacesById = getParallelWorkspacesById;
  /**
   * Returns the maximum number of parallel workspaces for the given plan
   * @param plan
   */
  function getParallelWorkspaces(plan) {
    var DEFAULT = 4;
    if (!plan) {
      return DEFAULT;
    }
    switch (plan.type) {
      case "professional-new":
        return 8;
      case "professional":
      case "student":
        return 16;
    }
    return DEFAULT;
  }
  Plans.getParallelWorkspaces = getParallelWorkspaces;
  /**
   * This declares the plan structure we have in Gitpod: All entries in a sub-array have the same arity in this structure.
   * This is used to impose a partial order on plan types (cmp. compareTypes(...)).
   * The order inside the sub-array carries meaning, too: The first one is the current, preferred plan (we advertise) for the given arity.
   * This is used to be able to get the next "higher" plan (cmp. getNextHigherPlanType).
   */
  var planStructure = [
    ["free-50", "free", "free-open-source"],
    ["personal", "basic"],
    ["professional-new"],
    ["professional", "student"],
  ];
  function getPlanTypeArity(type) {
    return planStructure.findIndex(function (types) {
      return types.includes(type);
    });
  }
  function getPlanTypeForArity(arity) {
    if (arity >= planStructure.length) {
      return undefined;
    }
    return planStructure[arity][0];
  }
  /**
   * Returns the preferred plan type with the next higher arity
   * @param type
   */
  function getNextHigherPlanType(type) {
    var arity = getPlanTypeArity(type);
    var nextHigherType = getPlanTypeForArity(arity + 1);
    return nextHigherType || "professional";
  }
  Plans.getNextHigherPlanType = getNextHigherPlanType;
  /**
   * This imposes a partial order on the plan types
   * @param planTypeA
   * @param planTypeB
   */
  function compareTypes(planTypeA, planTypeB) {
    var va = getPlanTypeArity(planTypeA);
    var vb = getPlanTypeArity(planTypeB);
    return va < vb ? -1 : va > vb ? 1 : 0;
  }
  Plans.compareTypes = compareTypes;
  function subscriptionChange(fromType, toType) {
    var cmp = Plans.compareTypes(fromType, toType);
    if (cmp < 0) {
      return "upgrade";
    } else if (cmp > 0) {
      return "downgrade";
    } else {
      return "none";
    }
  }
  Plans.subscriptionChange = subscriptionChange;
  var Feature;
  (function (Feature) {
    Feature.getFeaturesFor = function (p) {
      switch (p.type) {
        case "free":
          return [{ title: "Public repositories" }];
        case "free-50":
          return [{ title: "Public repositories" }];
        case "free-open-source":
          return [{ title: "Public repositories" }];
        case "student":
          return [
            { title: "Private & Public repos" },
            {
              title: Plans.getParallelWorkspaces(p) + " Parallel Workspaces",
              tooltip: "The number of workspaces running at the same time",
            },
            {
              title: "Team Manageable",
              link: "/teams/",
              tooltip:
                "Setup Gitpod for an entire Team with a single invoice and credit card",
            },
            {
              title: "1h Timeout",
              tooltip:
                "Workspaces without user activity are stopped after 1 hour",
            },
            {
              title: "3h Timeout Boost",
              tooltip:
                "You can manually boost the timeout to 3 hours within a running workspace",
            },
          ];
        case "basic":
          return [
            { title: "Private & Public repos" },
            {
              title: Plans.getParallelWorkspaces(p) + " Parallel Workspaces",
              tooltip: "The number of workspaces running at the same time.",
            },
          ];
        // Personal
        case "personal":
          return [
            { title: "Private & Public repos" },
            {
              title: Plans.getParallelWorkspaces(p) + " Parallel Workspaces",
              tooltip: "The number of workspaces running at the same time",
            },
            {
              title: "30min Timeout",
              tooltip:
                "Workspaces without user activity are stopped after 30 minutes",
            },
          ];
        // Professional
        case "professional-new":
          return [
            { title: "Private & Public repos" },
            {
              title: Plans.getParallelWorkspaces(p) + " Parallel Workspaces",
              tooltip: "The number of workspaces running at the same time",
            },
            {
              title: "Team Manageable",
              link: "/teams/",
              tooltip:
                "Setup Gitpod for an entire Team with a single invoice and credit card",
            },
            {
              title: "30min Timeout",
              tooltip:
                "Workspaces without user activity are stopped after 30 minutes",
            },
          ];
        // Unleashed
        case "professional":
          return [
            { title: "Private & Public repos" },
            {
              title: Plans.getParallelWorkspaces(p) + " Parallel Workspaces",
              tooltip: "The number of workspaces running at the same time",
            },
            {
              title: "Team Manageable",
              link: "/teams/",
              tooltip:
                "Setup Gitpod for an entire Team with a single invoice and credit card",
            },
            {
              title: "1h Timeout",
              tooltip:
                "Workspaces without user activity are stopped after 1 hour",
            },
            {
              title: "3h Timeout Boost",
              tooltip:
                "You can manually boost the timeout to 3 hours within a running workspace",
            },
          ];
      }
    };
  })((Feature = Plans.Feature || (Plans.Feature = {})));
})((Plans = exports.Plans || (exports.Plans = {})));
//# sourceMappingURL=plans.js.map
