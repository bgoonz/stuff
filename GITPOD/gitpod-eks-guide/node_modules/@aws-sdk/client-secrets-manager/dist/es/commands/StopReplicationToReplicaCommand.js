import { __extends } from "tslib";
import { StopReplicationToReplicaRequest, StopReplicationToReplicaResponse } from "../models/models_0";
import { deserializeAws_json1_1StopReplicationToReplicaCommand, serializeAws_json1_1StopReplicationToReplicaCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
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
var StopReplicationToReplicaCommand = /** @class */ (function (_super) {
    __extends(StopReplicationToReplicaCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function StopReplicationToReplicaCommand(input) {
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
    StopReplicationToReplicaCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "StopReplicationToReplicaCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: StopReplicationToReplicaRequest.filterSensitiveLog,
            outputFilterSensitiveLog: StopReplicationToReplicaResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    StopReplicationToReplicaCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1StopReplicationToReplicaCommand(input, context);
    };
    StopReplicationToReplicaCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1StopReplicationToReplicaCommand(output, context);
    };
    return StopReplicationToReplicaCommand;
}($Command));
export { StopReplicationToReplicaCommand };
//# sourceMappingURL=StopReplicationToReplicaCommand.js.map