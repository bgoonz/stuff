"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UntagResourceCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
/**
 * <p>Removes one or more tags from the specified secret.</p>
 *          <p>This operation is idempotent. If a requested tag is not attached to the secret, no error
 *       is returned and the secret metadata is unchanged.</p>
 *          <important>
 *             <p>If you use tags as part of your security strategy, then removing a tag can change
 *         permissions. If successfully completing this operation would result in you losing your
 *         permissions for this secret, then the operation is blocked and returns an Access Denied
 *         error.</p>
 *          </important>
 *          <p>
 *             <b>Minimum permissions</b>
 *          </p>
 *          <p>To run this command, you must have the following permissions:</p>
 *          <ul>
 *             <li>
 *                <p>secretsmanager:UntagResource</p>
 *             </li>
 *          </ul>
 *          <p>
 *             <b>Related operations</b>
 *          </p>
 *          <ul>
 *             <li>
 *                <p>To add one or more tags to the collection attached to a secret, use <a>TagResource</a>.</p>
 *             </li>
 *             <li>
 *                <p>To view the list of tags attached to a secret, use <a>DescribeSecret</a>.</p>
 *             </li>
 *          </ul>
 * @example
 * Use a bare-bones client and the command you need to make an API call.
 * ```javascript
 * import { SecretsManagerClient, UntagResourceCommand } from "@aws-sdk/client-secrets-manager"; // ES Modules import
 * // const { SecretsManagerClient, UntagResourceCommand } = require("@aws-sdk/client-secrets-manager"); // CommonJS import
 * const client = new SecretsManagerClient(config);
 * const command = new UntagResourceCommand(input);
 * const response = await client.send(command);
 * ```
 *
 * @see {@link UntagResourceCommandInput} for command's `input` shape.
 * @see {@link UntagResourceCommandOutput} for command's `response` shape.
 * @see {@link SecretsManagerClientResolvedConfig | config} for command's `input` shape.
 *
 */
class UntagResourceCommand extends smithy_client_1.Command {
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
        const commandName = "UntagResourceCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.UntagResourceRequest.filterSensitiveLog,
            outputFilterSensitiveLog: (output) => output,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1UntagResourceCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1UntagResourceCommand(output, context);
    }
}
exports.UntagResourceCommand = UntagResourceCommand;
//# sourceMappingURL=UntagResourceCommand.js.map