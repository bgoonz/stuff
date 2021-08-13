import { __extends } from "tslib";
import { RestoreSecretRequest, RestoreSecretResponse } from "../models/models_0";
import { deserializeAws_json1_1RestoreSecretCommand, serializeAws_json1_1RestoreSecretCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Cancels the scheduled deletion of a secret by removing the <code>DeletedDate</code> time
 *       stamp. This makes the secret accessible to query once again.</p>
 *          <p>
 *             <b>Minimum permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:RestoreSecret</p>
 *             </li>
 *          </ul>
 *          <p>
 *             <b>Related operations</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>To delete a secret, use <a>DeleteSecret</a>.</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, RestoreSecretCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, RestoreSecretCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new RestoreSecretCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link RestoreSecretCommandInput} for command's `input` shape.
 * @see {@link RestoreSecretCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var RestoreSecretCommand = /** @class */ (function (_super) {
    __extends(RestoreSecretCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function RestoreSecretCommand(input) {
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
    RestoreSecretCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "RestoreSecretCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: RestoreSecretRequest.filterSensitiveLog,
            outputFilterSensitiveLog: RestoreSecretResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    RestoreSecretCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1RestoreSecretCommand(input, context);
    };
    RestoreSecretCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1RestoreSecretCommand(output, context);
    };
    return RestoreSecretCommand;
}($Command));
export { RestoreSecretCommand };
//# sourceMappingURL=RestoreSecretCommand.js.map