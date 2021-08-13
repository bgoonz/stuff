"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aliasLog = void 0;
/**
 * `probot.log()`, `app.log()` and `context.log()` are aliasing `.log.info()`.
 * We will probably remove the aliasing in future.
 */
function aliasLog(log) {
    function logInfo() {
        // @ts-ignore
        log.info(...arguments);
    }
    for (const key in log) {
        // @ts-ignore
        logInfo[key] =
            typeof log[key] === "function" ? log[key].bind(log) : log[key];
    }
    // @ts-ignore
    return logInfo;
}
exports.aliasLog = aliasLog;
//# sourceMappingURL=alias-log.js.map