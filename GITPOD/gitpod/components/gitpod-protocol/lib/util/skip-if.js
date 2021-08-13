"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipIfEnvVarNotSet = exports.skipIf = void 0;
/**
 * Skips all tests of the marked Suite if the passed function returns true
 * @param doSkip A function which takes a TestSuite and decides if it should be skipped
 */
function skipIf(doSkip) {
    var trait = function (ctx, ctor) {
        var suite = ctx; // No idea why those fields are not exported in the types
        var skip = doSkip(suite);
        suite.beforeEach(function () {
            if (skip) {
                this.skip();
            }
        });
    };
    // Mark as "trait": mimics the behavior of https://github.com/testdeck/testdeck/blob/9d2dd6a458c2c86c945f6f2999b8278b7528a7a7/index.ts#L433
    trait["__mts_isTrait"] = true;
    return trait;
}
exports.skipIf = skipIf;
/**
 * Skips a Mocha TestSuite if a certain env var is not set and prints its
 * @param name The name of the env var the TestSuite depends on being present
 */
function skipIfEnvVarNotSet(name) {
    return skipIf(function (suite) {
        var skip = process.env[name] === undefined;
        if (skip) {
            console.log("Skipping suite " + suite.title + " because env var '" + name + "' is not set");
        }
        return skip;
    });
}
exports.skipIfEnvVarNotSet = skipIfEnvVarNotSet;
//# sourceMappingURL=skip-if.js.map