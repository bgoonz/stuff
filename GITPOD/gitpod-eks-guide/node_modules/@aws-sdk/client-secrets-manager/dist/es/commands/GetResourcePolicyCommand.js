import { __extends } from "tslib";
import { GetResourcePolicyRequest, GetResourcePolicyResponse } from "../models/models_0";
import { deserializeAws_json1_1GetResourcePolicyCommand, serializeAws_json1_1GetResourcePolicyCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Retrieves the JSON text of the resource-based policy document attached to the specified
 *       secret. The JSON request string input and response output displays formatted code
 *       with white space and line breaks for better readability. Submit your input as a single line
 *       JSON string.</p>
 *          <p>
 *             <b>Minimum permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:GetResourcePolicy</p>
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
 *                <p>To delete the resource-based policy attached to a secret, use <a>DeleteResourcePolicy</a>.</p>
 *             </li>
 *             <li>
 *                <p>To list all of the currently available secrets, use <a>ListSecrets</a>.</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, GetResourcePolicyCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, GetResourcePolicyCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new GetResourcePolicyCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link GetResourcePolicyCommandInput} for command's `input` shape.
 * @see {@link GetResourcePolicyCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var GetResourcePolicyCommand = /** @class */ (function (_super) {
    __extends(GetResourcePolicyCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function GetResourcePolicyCommand(input) {
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
    GetResourcePolicyCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "GetResourcePolicyCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: GetResourcePolicyRequest.filterSensitiveLog,
            outputFilterSensitiveLog: GetResourcePolicyResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    GetResourcePolicyCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1GetResourcePolicyCommand(input, context);
    };
    GetResourcePolicyCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1GetResourcePolicyCommand(output, context);
    };
    return GetResourcePolicyCommand;
}($Command));
export { GetResourcePolicyCommand };
//# sourceMappingURL=GetResourcePolicyCommand.js.map