/// <reference types="node" />
import { Options } from "./types";
import { Probot } from "./probot";
declare type CreateProbotOptions = {
    overrides?: Options;
    defaults?: Options;
    env?: NodeJS.ProcessEnv;
};
/**
 * Merges configuration from defaults/environment variables/overrides and returns
 * a Probot instance. Finds private key using [`@probot/get-private-key`](https://github.com/probot/get-private-key).
 *
 * @see https://probot.github.io/docs/configuration/
 * @param defaults default Options, will be overwritten if according environment variable is set
 * @param overrides overwrites defaults and according environment variables
 * @param env defaults to process.env
 */
export declare function createProbot({ overrides, defaults, env, }?: CreateProbotOptions): Probot;
export {};
