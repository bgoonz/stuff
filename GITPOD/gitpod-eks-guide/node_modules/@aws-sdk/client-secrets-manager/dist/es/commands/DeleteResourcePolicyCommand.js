import { __extends } from "tslib";
import { DeleteResourcePolicyRequest, DeleteResourcePolicyResponse } from "../models/models_0";
import { deserializeAws_json1_1DeleteResourcePolicyCommand, serializeAws_json1_1DeleteResourcePolicyCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Deletes the resource-based permission policy attached to the secret.</p>
 *          <p>
 *             <b>Minimum permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:DeleteResourcePolicy</p>
 *             </li>
 *          </ul>
 *          <p>
 *             <b>Related operations</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>To attach a resource policy to a secret, use <a>PutResourcePolicy</a>.</p>
 *             </li>
 *             <li>
 *                <p>To retrieve the current resource-based policy attached to a secret, use <a>GetResourcePolicy</a>.</p>
 *             </li>
 *             <li>
 *                <p>To list all of the currently available secrets, use <a>ListSecrets</a>.</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, DeleteResourcePolicyCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, DeleteResourcePolicyCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new DeleteResourcePolicyCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link DeleteResourcePolicyCommandInput} for command's `input` shape.
 * @see {@link DeleteResourcePolicyCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var DeleteResourcePolicyCommand = /** @class */ (function (_super) {
    __extends(DeleteResourcePolicyCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function DeleteResourcePolicyCommand(input) {
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
    DeleteResourcePolicyCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "DeleteResourcePolicyCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: DeleteResourcePolicyRequest.filterSensitiveLog,
            outputFilterSensitiveLog: DeleteResourcePolicyResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    DeleteResourcePolicyCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1DeleteResourcePolicyCommand(input, context);
    };
    DeleteResourcePolicyCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1DeleteResourcePolicyCommand(output, context);
    };
    return DeleteResourcePolicyCommand;
}($Command));
export { DeleteResourcePolicyCommand };
//# sourceMappingURL=DeleteResourcePolicyCommand.js.map