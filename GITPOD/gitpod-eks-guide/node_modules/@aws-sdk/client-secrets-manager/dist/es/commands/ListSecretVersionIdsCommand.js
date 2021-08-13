import { __extends } from "tslib";
import { ListSecretVersionIdsRequest, ListSecretVersionIdsResponse } from "../models/models_0";
import { deserializeAws_json1_1ListSecretVersionIdsCommand, serializeAws_json1_1ListSecretVersionIdsCommand, } from "../protocols/Aws_json1_1";
import { getSerdePlugin } from "@aws-sdk/middleware-serde";
import { Command as $Command } from "@aws-sdk/smithy-client";
/**
 * <p>Lists all of the versions attached to the specified secret. The output does not include
 *       the <code>SecretString</code> or <code>SecretBinary</code> fields. By default, the list
 *       includes only versions that have at least one staging label in <code>VersionStage</code>
 *       attached.</p>
 *          <note>
 *             <p>Always check the <code>NextToken</code> response parameter
 *     when calling any of the <code>List*</code> operations. These operations can occasionally return
 *     an empty or shorter than expected list of results even when there more results become available.
 *     When this happens, the <code>NextToken</code> response parameter contains a value to pass to the
 *     next call to the same API to request the next part of the list.</p>
 *          </note>
 *          <p>
 *             <b>Minimum
 *       permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:ListSecretVersionIds</p>
 *             </li>
 *          </ul>
 *          <p>
 *             <b>Related operations</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>To list the secrets in an account, use <a>ListSecrets</a>.</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, ListSecretVersionIdsCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, ListSecretVersionIdsCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new ListSecretVersionIdsCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link ListSecretVersionIdsCommandInput} for command's `input` shape.
 * @see {@link ListSecretVersionIdsCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
var ListSecretVersionIdsCommand = /** @class */ (function (_super) {
    __extends(ListSecretVersionIdsCommand, _super);
    // Start section: command_properties
    // End section: command_properties
    function ListSecretVersionIdsCommand(input) {
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
    ListSecretVersionIdsCommand.prototype.resolveMiddleware = function (clientStack, configuration, options) {
        this.middlewareStack.use(getSerdePlugin(configuration, this.serialize, this.deserialize));
        var stack = clientStack.concat(this.middlewareStack);
        var logger = configuration.logger;
        var clientName = "SecretsManagerClient";
        var commandName = "ListSecretVersionIdsCommand";
        var handlerExecutionContext = {
            logger: logger,
            clientName: clientName,
            commandName: commandName,
            inputFilterSensitiveLog: ListSecretVersionIdsRequest.filterSensitiveLog,
            outputFilterSensitiveLog: ListSecretVersionIdsResponse.filterSensitiveLog,
        };
        var requestHandler = configuration.requestHandler;
        return stack.resolve(function (request) {
            return requestHandler.handle(request.request, options || {});
        }, handlerExecutionContext);
    };
    ListSecretVersionIdsCommand.prototype.serialize = function (input, context) {
        return serializeAws_json1_1ListSecretVersionIdsCommand(input, context);
    };
    ListSecretVersionIdsCommand.prototype.deserialize = function (output, context) {
        return deserializeAws_json1_1ListSecretVersionIdsCommand(output, context);
    };
    return ListSecretVersionIdsCommand;
}($Command));
export { ListSecretVersionIdsCommand };
//# sourceMappingURL=ListSecretVersionIdsCommand.js.map