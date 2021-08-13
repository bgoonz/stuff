"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.webhookTransform = void 0;
const context_1 = require("../context");
/**
 * Probot's transform option, which extends the `event` object that is passed
 * to webhook event handlers by `@octokit/webhooks`
 * @see https://github.com/octokit/webhooks.js/#constructor
 */
async function webhookTransform(state, event) {
    const log = state.log.child({ name: "event", id: event.id });
    const octokit = (await state.octokit.auth({
        type: "event-octokit",
        event,
    }));
    return new context_1.Context(event, octokit, log);
}
exports.webhookTransform = webhookTransform;
//# sourceMappingURL=octokit-webhooks-transform.js.map