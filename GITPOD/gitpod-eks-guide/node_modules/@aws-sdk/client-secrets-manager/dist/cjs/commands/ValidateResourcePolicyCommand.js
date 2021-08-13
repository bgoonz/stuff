"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateResourcePolicyCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
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
class ValidateResourcePolicyCommand extends smithy_client_1.Command {
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
        const commandName = "ValidateResourcePolicyCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.ValidateResourcePolicyRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.ValidateResourcePolicyResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1ValidateResourcePolicyCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1ValidateResourcePolicyCommand(output, context);
    }
}
exports.ValidateResourcePolicyCommand = ValidateResourcePolicyCommand;
//# sourceMappingURL=ValidateResourcePolicyCommand.js.map