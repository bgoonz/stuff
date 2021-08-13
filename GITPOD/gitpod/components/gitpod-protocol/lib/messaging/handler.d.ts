import { MessageConnection } from "vscode-jsonrpc";
export declare const ConnectionHandler: unique symbol;
export interface ConnectionHandler {
    readonly path: string;
    onConnection(connection: MessageConnection, session?: object): void;
}
//# sourceMappingURL=handler.d.ts.map