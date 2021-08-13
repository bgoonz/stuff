import { __extends } from "tslib";
import { GetRandomPasswordRequest, GetRandomPasswordResponse } from "../models/models_0";
import { deserializeAws_json1_1GetRandomPasswordCommand, serializeAws_json1_1GetRandomPasswordCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Generates a random password of the specified complexity. This operation is intended for
 *       use in the Lambda rotation function. Per best practice, we recommend that you specify the
 *       maximum length and include every character type that the system you are generating a password
 *       for can support.</p>
 *          <p>
 *             <b>Minimum permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:GetRandomPassword</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, GetRandomPasswordCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, GetRandomPasswordCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new GetRandomPasswordCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link GetRandomPasswordCommandInput} for command's `input` shape.
 * @see {@link GetRandomPasswordCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var GetRandomPasswordCommand = /** @class */ (function (_super) {
    __extends(GetRandomPasswordCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function GetRandomPasswordCommand(input) {
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
    GetRandomPasswordCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "GetRandomPasswordCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: GetRandomPasswordRequest.filterSensitiveLog,
            outputFilterSensitiveLog: GetRandomPasswordResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    GetRandomPasswordCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1GetRandomPasswordCommand(input, context);
    };
    GetRandomPasswordCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1GetRandomPasswordCommand(output, context);
    };
    return GetRandomPasswordCommand;
}($Command));
export { GetRandomPasswordCommand };
//# sourceMappingURL=GetRandomPasswordCommand.js.map