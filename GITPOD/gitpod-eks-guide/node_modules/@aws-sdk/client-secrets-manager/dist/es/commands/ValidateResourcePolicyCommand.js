import { __extends } from "tslib";
import { ValidateResourcePolicyRequest, ValidateResourcePolicyResponse } from "../models/models_0";
import { deserializeAws_json1_1ValidateResourcePolicyCommand, serializeAws_json1_1ValidateResourcePolicyCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Validates that the resource policy does not grant a wide range of IAM principals access to
 *       your secret. The JSON request string input and response output displays formatted code
 *       with white space and line breaks for better readability. Submit your input as a single line
 *       JSON string. A resource-based policy is optional for secrets.</p>
 *          <p>The API performs three checks when validating the secret:</p>
 *          <ul>
 *             <li>
 *                <p>Sends a call to <a href="https://aws.amazon.com/blogs/security/protect-sensitive-data-in-the-cloud-with-automated-reasoning-zelkova/">Zelkova</a>, an automated reasoning engine, to ensure your Resource Policy does not
 *           allow broad access to your secret.</p>
 *             </li>
 *             <li>
 *                <p>Checks for correct syntax in a policy.</p>
 *             </li>
 *             <li>
 *                <p>Verifies the policy does not lock out a caller.</p>
 *             </li>
 *          </ul>
 *
 *
 *          <p>
 *             <b>Minimum Permissions</b>
 *          </p>
 *          <p>You must have the permissions required to access the following APIs:</p>
 *          <ul>
 *             <li>
 *                <p>
 *                   <code>secretsmanager:PutResourcePolicy</code>
 *                </p>
 *             </li>
 *             <li>
 *                <p>
 *                   <code>secretsmanager:ValidateResourcePolicy</code>
 *                </p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, ValidateResourcePolicyCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, ValidateResourcePolicyCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new ValidateResourcePolicyCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link ValidateResourcePolicyCommandInput} for command's `input` shape.
 * @see {@link ValidateResourcePolicyCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var ValidateResourcePolicyCommand = /** @class */ (function (_super) {
    __extends(ValidateResourcePolicyCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function ValidateResourcePolicyCommand(input) {
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
    ValidateResourcePolicyCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "ValidateResourcePolicyCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: ValidateResourcePolicyRequest.filterSensitiveLog,
            outputFilterSensitiveLog: ValidateResourcePolicyResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    ValidateResourcePolicyCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1ValidateResourcePolicyCommand(input, context);
    };
    ValidateResourcePolicyCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1ValidateResourcePolicyCommand(output, context);
    };
    return ValidateResourcePolicyCommand;
}($Command));
export { ValidateResourcePolicyCommand };
//# sourceMappingURL=ValidateResourcePolicyCommand.js.map