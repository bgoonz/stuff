import { SecretsManagerClientResolvedConfig, ServiceInputTypes, ServiceOutputTypes } from "../SecretsManagerClient";
import { DeleteSecretRequest, DeleteSecretResponse } from "../models/models_0";
import { Command as $Command } from "@aws-sdk/smithy-client";
import { Handler, MiddlewareStack, HttpHandlerOptions as __HttpHandlerOptions, MetadataBearer as __MetadataBearer } from "@aws-sdk/types";
export interface DeleteSecretCommandInput extends DeleteSecretRequest {
}
export interface DeleteSecretCommandOutput extends DeleteSecretResponse, __MetadataBearer {
}
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
export declare class DeleteSecretCommand extends $Command<DeleteSecretCommandInput, DeleteSecretCommandOutput, SecretsManagerClientResolvedConfig> {
    readonly input: DeleteSecretCommandInput;
    constructor(input: DeleteSecretCommandInput);
    /**
     * @internal
     */
    resolveMiddleware(clientStack: MiddlewareStack<ServiceInputTypes, ServiceOutputTypes>, configuration: SecretsManagerClientResolvedConfig, options?: __HttpHandlerOptions): Handler<DeleteSecretCommandInput, DeleteSecretCommandOutput>;
    private serialize;
    private deserialize;
}
