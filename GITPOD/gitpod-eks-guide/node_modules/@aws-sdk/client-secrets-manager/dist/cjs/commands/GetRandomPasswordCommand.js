"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetRandomPasswordCommand = void 0;
const models_0_1 = require("../models/models_0");
const Aws_json1_1_1 = require("../protocols/Aws_json1_1");
const middleware_serde_1 = require("@aws-sdk/middleware-serde");
const smithy_client_1 = require("@aws-sdk/smithy-client");
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
class GetRandomPasswordCommand extends smithy_client_1.Command {
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
        const commandName = "GetRandomPasswordCommand";
        const handlerExecutionContext = {
            logger,
            clientName,
            commandName,
            inputFilterSensitiveLog: models_0_1.GetRandomPasswordRequest.filterSensitiveLog,
            outputFilterSensitiveLog: models_0_1.GetRandomPasswordResponse.filterSensitiveLog,
        };
        const { requestHandler } = configuration;
        return stack.resolve((request) => requestHandler.handle(request.request, options || {}), handlerExecutionContext);
    }
    serialize(input, context) {
        return Aws_json1_1_1.serializeAws_json1_1GetRandomPasswordCommand(input, context);
    }
    deserialize(output, context) {
        return Aws_json1_1_1.deserializeAws_json1_1GetRandomPasswordCommand(output, context);
    }
}
exports.GetRandomPasswordCommand = GetRandomPasswordCommand;
//# sourceMappingURL=GetRandomPasswordCommand.js.map