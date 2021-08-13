"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListSecretVersionIds = void 0;
const SecretsManager_1 = require("../SecretsManager");
const SecretsManagerClient_1 = require("../SecretsManagerClient");
const ListSecretVersionIdsCommand_1 = require("../commands/ListSecretVersionIdsCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new ListSecretVersionIdsCommand_1.ListSecretVersionIdsCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.listSecretVersionIds(input, ...args);
};
async function* paginateListSecretVersionIds(config, input, ...additionalArguments) {
    // ToDo: replace with actual type instead of typeof input.NextToken
    let token = config.startingToken || undefined;
    let hasNext = true;
    let page;
    while (hasNext) {
        input.NextToken = token;
        input["MaxResults"] = config.pageSize;
        if (config.client instanceof SecretsManager_1.SecretsManager) {
            page = await makePagedRequest(config.client, input, ...additionalArguments);
        }
        else if (config.client instanceof SecretsManagerClient_1.SecretsManagerClient) {
            page = await makePagedClientRequest(config.client, input, ...additionalArguments);
        }
        else {
            throw new Error("Invalid client, expected SecretsManager | SecretsManagerClient");
        }
        yield page;
        token = page.NextToken;
        hasNext = !!token;
    }
    // @ts-ignore
    return undefined;
}
exports.paginateListSecretVersionIds = paginateListSecretVersionIds;
//# sourceMappingURL=ListSecretVersionIdsPaginator.js.map