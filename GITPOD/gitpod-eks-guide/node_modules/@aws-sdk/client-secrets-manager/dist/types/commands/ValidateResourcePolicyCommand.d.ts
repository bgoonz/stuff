import { SecretsManagerClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../SecretsManagerClient";
import { ValidateResourcePolicyRequest, ValidateResourcePolicyResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export interface ValidateResourcePolicyCommandInput extends ValidateResourcePolicyRequest {
}
export interface ValidateResourcePolicyCommandOutput extends ValidateResourcePolicyResponse, __MetadataBearer {
}
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
export declare class ValidateResourcePolicyCommand extends $Command<ValidateResourcePolicyCommandInput, ValidateResourcePolicyCommandOutput, SecretsManagerClientResolvedConfig> {
    readonly input: ValidateResourcePolicyCommandInput;
    constructor(input: ValidateResourcePolicyCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: SecretsManagerClientResolvedConfig, options?: __HttpHandlerOptions): Handler<ValidateResourcePolicyCommandInput, ValidateResourcePolicyCommandOutput>;
    private serialize;
    private deserialize;
}
