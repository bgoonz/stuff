/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { Message } from 'vscode-jsonrpc/lib/messages';
import { AbstractMessageWriter, MessageWriter } from 'vscode-jsonrpc/lib/messageWriter';
import { AbstractMessageReader, MessageReader, DataCallback } from 'vscode-jsonrpc/lib/messageReader';
import { MessageConnection } from 'vscode-jsonrpc/lib/main';
export declare class WindowMessageWriter extends AbstractMessageWriter implements MessageWriter {
    readonly serviceId: string;
    readonly window: Window;
    readonly targetOrigin: string;
    constructor(serviceId: string, window: Window, targetOrigin: string);
    write(msg: Message): void;
}
export declare class WindowMessageReader extends AbstractMessageReader implements MessageReader {
    readonly serviceId: string;
    readonly sourceOrigin: string;
    protected callback?: DataCallback;
    protected readonly buffer: Message[];
    constructor(serviceId: string, sourceOrigin: string);
    listen(callback: DataCallback): void;
}
export declare function createWindowMessageConnection(serviceId: string, window: Window, sourceOrigin: string, targetOrigin?: string): MessageConnection;
//# sourceMappingURL=window-connection.d.ts.map