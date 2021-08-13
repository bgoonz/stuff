"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorCodes = void 0;
var ErrorCodes;
(function (ErrorCodes) {
  // 401 Unauthorized
  ErrorCodes.NOT_AUTHENTICATED = 401;
  // 402 Payment Required
  ErrorCodes.NOT_ENOUGH_CREDIT = 402;
  // 403 Forbidden
  ErrorCodes.PERMISSION_DENIED = 403;
  // 404 Not Found
  ErrorCodes.NOT_FOUND = 404;
  // 409 Conflict (e.g. already existing)
  ErrorCodes.CONFLICT = 409;
  // 410 No User
  ErrorCodes.SETUP_REQUIRED = 410;
  // 429 Too Many Requests
  ErrorCodes.TOO_MANY_REQUESTS = 429;
  // 430 Repository not whitelisted (custom status code)
  ErrorCodes.REPOSITORY_NOT_WHITELISTED = 430;
  // 460 Context Parse Error (custom status code)
  ErrorCodes.CONTEXT_PARSE_ERROR = 460;
  // 461 Invalid gitpod yml
  ErrorCodes.INVALID_GITPOD_YML = 461;
  // 450 Payment error
  ErrorCodes.PAYMENT_ERROR = 450;
  // 470 User Blocked (custom status code)
  ErrorCodes.USER_BLOCKED = 470;
  // 471 User Deleted (custom status code)
  ErrorCodes.USER_DELETED = 471;
  // 472 Terms Acceptance Required (custom status code)
  ErrorCodes.USER_TERMS_ACCEPTANCE_REQUIRED = 472;
  // 480 Plan does not allow private repos
  ErrorCodes.PLAN_DOES_NOT_ALLOW_PRIVATE_REPOS = 480;
  // 481 Professional plan is required for this operation
  ErrorCodes.PLAN_PROFESSIONAL_REQUIRED = 481;
  // 485 Plan is only allowed for students
  ErrorCodes.PLAN_ONLY_ALLOWED_FOR_STUDENTS = 485;
  // 490 Too Many Running Workspace
  ErrorCodes.TOO_MANY_RUNNING_WORKSPACES = 490;
  // 501 EE Feature
  ErrorCodes.EE_FEATURE = 501;
  // 555 EE License Required
  ErrorCodes.EE_LICENSE_REQUIRED = 555;
  // 601 SaaS Feature
  ErrorCodes.SAAS_FEATURE = 601;
  // 610 Invalid Team Subscription Quantity
  ErrorCodes.TEAM_SUBSCRIPTION_INVALID_QUANTITY = 610;
  // 620 Team Subscription Assignment Failed
  ErrorCodes.TEAM_SUBSCRIPTION_ASSIGNMENT_FAILED = 620;
  // 666 Not Implemented TODO IO-SPLIT remove
  ErrorCodes.NOT_IMPLEMENTED = 666;
})((ErrorCodes = exports.ErrorCodes || (exports.ErrorCodes = {})));
//# sourceMappingURL=error.js.map
