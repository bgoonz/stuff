/// <reference types="node" />
import * as ws from "ws";
import * as http from "http";
import * as https from "https";
import * as net from "net";
import { MessageConnection } from "vscode-jsonrpc";
import { IWebSocket } from "vscode-ws-jsonrpc";
export interface IServerOptions {
  readonly server: http.Server | https.Server;
  readonly path?: string;
  matches?(request: http.IncomingMessage): boolean;
}
export declare function createServerWebSocketConnection(
  options: IServerOptions,
  onConnect: (connection: MessageConnection) => void
): void;
export declare function openJsonRpcSocket(
  options: IServerOptions,
  onOpen: (socket: IWebSocket) => void
): void;
export interface OnOpen {
  (
    webSocket: ws,
    request: http.IncomingMessage,
    socket: net.Socket,
    head: Buffer
  ): void;
}
export declare function openSocket(
  options: IServerOptions,
  onOpen: OnOpen
): void;
export declare function toIWebSocket(webSocket: ws): IWebSocket;
//# sourceMappingURL=connection.d.ts.map
