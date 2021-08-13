import { ApplicationFunction } from "./types";
import { Server } from "./server/server";
declare type AdditionalOptions = {
    env: Record<string, string | undefined>;
};
/**
 *
 * @param appFnOrArgv set to either a probot application function: `(app) => { ... }` or to process.argv
 */
export declare function run(appFnOrArgv: ApplicationFunction | string[], additionalOptions?: AdditionalOptions): Promise<Server>;
export {};
