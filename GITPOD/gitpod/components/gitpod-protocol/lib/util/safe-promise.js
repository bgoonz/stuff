"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SafePromise = void 0;
var logging_1 = require("./logging");
var SafePromise = /** @class */ (function () {
    function SafePromise() {
    }
    SafePromise.catchAndLog = function (p, logCtx) {
        return SafePromise.catch(p, function (err) {
            if (logCtx) {
                logging_1.log.error(logCtx, err);
            }
            else {
                logging_1.log.error(err);
            }
        });
    };
    ;
    SafePromise.catch = function (p, handler) {
        return p.catch(function (err) {
            handler(err);
            return {}; // Nobody will ever see this value as the Promise already failed. It's just there to please the compiler
        });
    };
    ;
    return SafePromise;
}());
exports.SafePromise = SafePromise;
//# sourceMappingURL=safe-promise.js.map