import { ListSecretVersionIdsCommandInput, ListSecretVersionIdsCommandOutput } from "../commands/ListSecretVersionIdsCommand";
import { SecretsManagerPaginationConfiguration } from "./Interfaces";
import { Paginator } from "@aws-sdk/types";
export declare function paginateListSecretVersionIds(config: SecretsManagerPaginationConfiguration, input: ListSecretVersionIdsCommandInput, ...additionalArguments: any): Paginator<ListSecretVersionIdsCommandOutput>;
