"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeleteSecretCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
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
class DeleteSecretCommand extends smithy_client_1.Command {
    // Start section: command_properties
    // End section: command_properties
    constructor(input) {
        // Start section: command_constructor
        super();
        this.input = input;
        // End section: command_constructor
    }
    /**
     * @internal
     */
    resolveMiddleware(clientStack, configuration, options) {
        this.middlewareStack.use(middleware_serde_1.getSerdePlugin(configuration, this.serialize, this.deserialize));
        const stack = clientStack.concat(this.middlewareStack);
        const { logger } = configuration;
        const clientName = "SecretsManagerClient";
        const commandName = "DeleteSecretCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.DeleteSecretRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.DeleteSecretResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1DeleteSecretCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1DeleteSecretCommand(output, context);
    }
}
exports.DeleteSecretCommand = DeleteSecretCommand;
//# sourceMappingURL=DeleteSecretCommand.js.map