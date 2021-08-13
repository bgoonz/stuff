import type { Logger } from "pino";
import type { DeprecatedLogger } from "../types";
/**
 * `probot.log()`, `app.log()` and `context.log()` are aliasing `.log.info()`.
 * We will probably remove the aliasing in future.
 */
export declare function aliasLog(log: Logger): DeprecatedLogger;
