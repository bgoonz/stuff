import { __extends } from "tslib";
import { DeleteSecretRequest, DeleteSecretResponse } from "../models/models_0";
import { deserializeAws_json1_1DeleteSecretCommand, serializeAws_json1_1DeleteSecretCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Deletes an entire secret and all of the versions. You can optionally include a recovery
 *       window during which you can restore the secret. If you don't specify a recovery window value,
 *       the operation defaults to 30 days. Secrets Manager attaches a <code>DeletionDate</code> stamp to
 *       the secret that specifies the end of the recovery window. At the end of the recovery window,
 *       Secrets Manager deletes the secret permanently.</p>
 *          <p>At any time before recovery window ends, you can use <a>RestoreSecret</a> to
 *       remove the <code>DeletionDate</code> and cancel the deletion of the secret.</p>
 *          <p>You cannot access the encrypted secret information in any secret scheduled for deletion.
 *       If you need to access that information, you must cancel the deletion with <a>RestoreSecret</a> and then retrieve the information.</p>
 *          <note>
 *             <ul>
 *                <li>
 *                   <p>There is no explicit operation to delete a version of a secret. Instead, remove all
 *             staging labels from the <code>VersionStage</code> field of a version. That marks the
 *             version as deprecated and allows Secrets Manager to delete it as needed. Versions without any
 *             staging labels do not show up in <a>ListSecretVersionIds</a> unless you
 *             specify <code>IncludeDeprecated</code>.</p>
 *                </li>
 *                <li>
 *                   <p>The permanent secret deletion at the end of the waiting period is performed as a
 *             background task with low priority. There is no guarantee of a specific time after the
 *             recovery window for the actual delete operation to occur.</p>
 *                </li>
 *             </ul>
 *          </note>
 *          <p>
 *             <b>Minimum permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:DeleteSecret</p>
 *             </li>
 *          </ul>
 *          <p>
 *             <b>Related operations</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>To create a secret, use <a>CreateSecret</a>.</p>
 *             </li>
 *             <li>
 *                <p>To cancel deletion of a version of a secret before the recovery window has expired,
 *           use <a>RestoreSecret</a>.</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, DeleteSecretCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, DeleteSecretCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new DeleteSecretCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link DeleteSecretCommandInput} for command's `input` shape.
 * @see {@link DeleteSecretCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var DeleteSecretCommand = /** @class */ (function (_super) {
    __extends(DeleteSecretCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function DeleteSecretCommand(input) {
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
    DeleteSecretCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "DeleteSecretCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: DeleteSecretRequest.filterSensitiveLog,
            outputFilterSensitiveLog: DeleteSecretResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    DeleteSecretCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1DeleteSecretCommand(input, context);
    };
    DeleteSecretCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1DeleteSecretCommand(output, context);
    };
    return DeleteSecretCommand;
}($Command));
export { DeleteSecretCommand };
//# sourceMappingURL=DeleteSecretCommand.js.map