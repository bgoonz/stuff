"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StopReplicationToReplicaCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
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
class StopReplicationToReplicaCommand extends smithy_client_1.Command {
    // Start section: command_properties
    // End section: command_properties
    constructor(input) {
        // Start section: command_constructor
        super();
        this.input = input;
        // End section: command_constructor
    }
    /**
     * @internal
     */
    resolveMiddleware(clientStack, configuration, options) {
        this.middlewareStack.use(middleware_serde_1.getSerdePlugin(configuration, this.serialize, this.deserialize));
        const stack = clientStack.concat(this.middlewareStack);
        const { logger } = configuration;
        const clientName = "SecretsManagerClient";
        const commandName = "StopReplicationToReplicaCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.StopReplicationToReplicaRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.StopReplicationToReplicaResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1StopReplicationToReplicaCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1StopReplicationToReplicaCommand(output, context);
    }
}
exports.StopReplicationToReplicaCommand = StopReplicationToReplicaCommand;
//# sourceMappingURL=StopReplicationToReplicaCommand.js.map