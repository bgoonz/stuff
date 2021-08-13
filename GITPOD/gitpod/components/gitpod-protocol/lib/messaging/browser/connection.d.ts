import { Logger } from "vscode-ws-jsonrpc";
import { JsonRpcProxy } from "../proxy-factory";
import { ConnectionHandler } from "../handler";
import ReconnectingWebSocket from 'reconnecting-websocket';
export interface WebSocketOptions {
    onerror?: (event: Event) => void;
    onListening?: (socket: ReconnectingWebSocket) => void;
}
export declare class WebSocketConnectionProvider {
    /**
     * Create a proxy object to remote interface of T type
     * over a web socket connection for the given path.
     *
     * An optional target can be provided to handle
     * notifications and requests from a remote side.
     */
    createProxy<T extends object>(path: string | Promise<string>, target?: object, options?: WebSocketOptions): JsonRpcProxy<T>;
    /**
     * Install a connection handler for the given path.
     */
    listen(handler: ConnectionHandler, options?: WebSocketOptions): WebSocket;
    protected createLogger(): Logger;
    /**
     * Creates a web socket for the given url
     */
    createWebSocket(url: string): WebSocket;
}
//# sourceMappingURL=connection.d.ts.map