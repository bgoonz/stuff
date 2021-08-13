"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuthenticatedOctokit = void 0;
async function getAuthenticatedOctokit(state, installationId) {
    const { log, octokit } = state;
    if (!installationId)
        return octokit;
    return octokit.auth({
        type: "installation",
        installationId,
        factory: ({ octokit, octokitOptions, ...otherOptions }) => {
            const pinoLog = log.child({ name: "github" });
            const options = {
                ...octokitOptions,
                log: {
                    fatal: pinoLog.fatal.bind(pinoLog),
                    error: pinoLog.error.bind(pinoLog),
                    warn: pinoLog.warn.bind(pinoLog),
                    info: pinoLog.info.bind(pinoLog),
                    debug: pinoLog.debug.bind(pinoLog),
                    trace: pinoLog.trace.bind(pinoLog),
                },
                throttle: {
                    ...octokitOptions.throttle,
                    id: installationId,
                },
                auth: {
                    ...octokitOptions.auth,
                    otherOptions,
                    installationId,
                },
            };
            const Octokit = octokit.constructor;
            return new Octokit(options);
        },
    });
}
exports.getAuthenticatedOctokit = getAuthenticatedOctokit;
//# sourceMappingURL=get-authenticated-octokit.js.map