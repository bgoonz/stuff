import EventSource from "eventsource";
import type { Logger } from "pino";
export declare const createWebhookProxy: (opts: WebhookProxyOptions) => EventSource | undefined;
export interface WebhookProxyOptions {
    url?: string;
    port?: number;
    path?: string;
    logger: Logger;
}
