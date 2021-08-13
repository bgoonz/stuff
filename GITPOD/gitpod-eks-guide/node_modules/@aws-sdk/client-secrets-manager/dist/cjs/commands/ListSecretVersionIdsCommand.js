"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListSecretVersionIdsCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
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
class ListSecretVersionIdsCommand extends smithy_client_1.Command {
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
        const commandName = "ListSecretVersionIdsCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.ListSecretVersionIdsRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.ListSecretVersionIdsResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1ListSecretVersionIdsCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1ListSecretVersionIdsCommand(output, context);
    }
}
exports.ListSecretVersionIdsCommand = ListSecretVersionIdsCommand;
//# sourceMappingURL=ListSecretVersionIdsCommand.js.map