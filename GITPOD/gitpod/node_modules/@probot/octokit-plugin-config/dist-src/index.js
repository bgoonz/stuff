import { VERSION } from "./version";
import { composeConfigGet } from "./compose-config-get";
/**
 * @param octokit Octokit instance
 */
export function config(octokit) {
    return {
        config: {
            async get(options) {
                return composeConfigGet(octokit, options);
            },
        },
    };
}
config.VERSION = VERSION;
export { composeConfigGet } from "./compose-config-get";
