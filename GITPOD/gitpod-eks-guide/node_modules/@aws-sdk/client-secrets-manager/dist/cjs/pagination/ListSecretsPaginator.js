"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginateListSecrets = void 0;
const SecretsManager_1 = require("../SecretsManager");
const SecretsManagerClient_1 = require("../SecretsManagerClient");
const ListSecretsCommand_1 = require("../commands/ListSecretsCommand");
/**
 * @private
 */
const makePagedClientRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.send(new ListSecretsCommand_1.ListSecretsCommand(input), ...args);
};
/**
 * @private
 */
const makePagedRequest = async (client, input, ...args) => {
    // @ts-ignore
    return await client.listSecrets(input, ...args);
};
async function* paginateListSecrets(config, input, ...additionalArguments) {
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
exports.paginateListSecrets = paginateListSecrets;
//# sourceMappingURL=ListSecretsPaginator.js.map