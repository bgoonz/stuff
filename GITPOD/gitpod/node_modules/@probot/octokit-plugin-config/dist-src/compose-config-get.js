import { getConfigFiles } from "./util/get-config-files";
/**
 * Loads configuration from one or multiple files and resolves with
 * the combined configuration as well as the list of files the configuration
 * was loaded from
 *
 * @param octokit Octokit instance
 * @param options
 */
export async function composeConfigGet(octokit, { owner, repo, defaults, path, branch }) {
    const files = await getConfigFiles(octokit, {
        owner,
        repo,
        path,
        branch,
    });
    const configs = files
        .map((file) => file.config)
        .reverse()
        .filter(Boolean);
    return {
        files,
        config: typeof defaults === "function"
            ? defaults(configs)
            : Object.assign({}, defaults, ...configs),
    };
}
