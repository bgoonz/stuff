/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/// <reference types="mocha" />
/**
 * The subset of actually available fields and methods which are not exported but we care about
 */
interface TestSuiteContext extends Mocha.ISuiteCallbackContext {
    title: string;
    beforeEach: (cb: (this: Mocha.IHookCallbackContext) => void) => void;
}
/**
 * Skips all tests of the marked Suite if the passed function returns true
 * @param doSkip A function which takes a TestSuite and decides if it should be skipped
 */
export declare function skipIf(doSkip: (suite: TestSuiteContext) => boolean): MochaTypeScript.SuiteTrait;
/**
 * Skips a Mocha TestSuite if a certain env var is not set and prints its
 * @param name The name of the env var the TestSuite depends on being present
 */
export declare function skipIfEnvVarNotSet(name: string): MochaTypeScript.SuiteTrait;
export {};
//# sourceMappingURL=skip-if.d.ts.map