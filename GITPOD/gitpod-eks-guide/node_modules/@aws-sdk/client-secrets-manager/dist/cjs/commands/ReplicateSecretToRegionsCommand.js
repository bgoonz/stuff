"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplicateSecretToRegionsCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
/**
 * <p>Converts an existing secret to a multi-Region secret and begins replication the secret to a
 *       list of new regions. </p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, ReplicateSecretToRegionsCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, ReplicateSecretToRegionsCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new ReplicateSecretToRegionsCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link ReplicateSecretToRegionsCommandInput} for command's `input` shape.
 * @see {@link ReplicateSecretToRegionsCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
class ReplicateSecretToRegionsCommand extends smithy_client_1.Command {
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
        const commandName = "ReplicateSecretToRegionsCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.ReplicateSecretToRegionsRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.ReplicateSecretToRegionsResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1ReplicateSecretToRegionsCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1ReplicateSecretToRegionsCommand(output, context);
    }
}
exports.ReplicateSecretToRegionsCommand = ReplicateSecretToRegionsCommand;
//# sourceMappingURL=ReplicateSecretToRegionsCommand.js.map