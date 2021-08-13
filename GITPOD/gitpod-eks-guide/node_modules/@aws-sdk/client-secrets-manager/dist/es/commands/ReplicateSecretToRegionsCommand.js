import { __extends } from "tslib";
import { ReplicateSecretToRegionsRequest, ReplicateSecretToRegionsResponse } from "../models/models_0";
import { deserializeAws_json1_1ReplicateSecretToRegionsCommand, serializeAws_json1_1ReplicateSecretToRegionsCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
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
var ReplicateSecretToRegionsCommand = /** @class */ (function (_super) {
    __extends(ReplicateSecretToRegionsCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function ReplicateSecretToRegionsCommand(input) {
        var _this = 
        // Start section: command_constructor
        _super.call(this) || this;
        _this.input = input;
        return _this;
        // End section: command_constructor
    }
    /**
     * @internal
     */
    ReplicateSecretToRegionsCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "ReplicateSecretToRegionsCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: ReplicateSecretToRegionsRequest.filterSensitiveLog,
            outputFilterSensitiveLog: ReplicateSecretToRegionsResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    ReplicateSecretToRegionsCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1ReplicateSecretToRegionsCommand(input, context);
    };
    ReplicateSecretToRegionsCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1ReplicateSecretToRegionsCommand(output, context);
    };
    return ReplicateSecretToRegionsCommand;
}($Command));
export { ReplicateSecretToRegionsCommand };
//# sourceMappingURL=ReplicateSecretToRegionsCommand.js.map