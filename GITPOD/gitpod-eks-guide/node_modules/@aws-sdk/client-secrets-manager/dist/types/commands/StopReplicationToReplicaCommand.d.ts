import { SecretsManagerClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../SecretsManagerClient";
import { StopReplicationToReplicaRequest, StopReplicationToReplicaResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export interface StopReplicationToReplicaCommandInput extends StopReplicationToReplicaRequest {
}
export interface StopReplicationToReplicaCommandOutput extends StopReplicationToReplicaResponse, __MetadataBearer {
}
/**
 * <p>Removes the secret from replication and promotes the secret to a regional secret in the replica Region.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, StopReplicationToReplicaCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, StopReplicationToReplicaCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new StopReplicationToReplicaCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link StopReplicationToReplicaCommandInput} for command's `input` shape.
 * @see {@link StopReplicationToReplicaCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
export declare class StopReplicationToReplicaCommand extends $Command<StopReplicationToReplicaCommandInput, StopReplicationToReplicaCommandOutput, SecretsManagerClientResolvedConfig> {
    readonly input: StopReplicationToReplicaCommandInput;
    constructor(input: StopReplicationToReplicaCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: SecretsManagerClientResolvedConfig, options?: __HttpHandlerOptions): Handler<StopReplicationToReplicaCommandInput, StopReplicationToReplicaCommandOutput>;
    private serialize;
    private deserialize;
}
