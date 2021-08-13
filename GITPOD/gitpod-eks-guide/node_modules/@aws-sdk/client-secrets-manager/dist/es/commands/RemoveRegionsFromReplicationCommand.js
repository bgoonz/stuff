import { __extends } from "tslib";
import { RemoveRegionsFromReplicationRequest, RemoveRegionsFromReplicationResponse } from "../models/models_0";
import { deserializeAws_json1_1RemoveRegionsFromReplicationCommand, serializeAws_json1_1RemoveRegionsFromReplicationCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Remove regions from replication.</p>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, RemoveRegionsFromReplicationCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, RemoveRegionsFromReplicationCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new RemoveRegionsFromReplicationCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link RemoveRegionsFromReplicationCommandInput} for command's `input` shape.
 * @see {@link RemoveRegionsFromReplicationCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var RemoveRegionsFromReplicationCommand = /** @class */ (function (_super) {
    __extends(RemoveRegionsFromReplicationCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function RemoveRegionsFromReplicationCommand(input) {
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
    RemoveRegionsFromReplicationCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "RemoveRegionsFromReplicationCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: RemoveRegionsFromReplicationRequest.filterSensitiveLog,
            outputFilterSensitiveLog: RemoveRegionsFromReplicationResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    RemoveRegionsFromReplicationCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1RemoveRegionsFromReplicationCommand(input, context);
    };
    RemoveRegionsFromReplicationCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1RemoveRegionsFromReplicationCommand(output, context);
    };
    return RemoveRegionsFromReplicationCommand;
}($Command));
export { RemoveRegionsFromReplicationCommand };
//# sourceMappingURL=RemoveRegionsFromReplicationCommand.js.map