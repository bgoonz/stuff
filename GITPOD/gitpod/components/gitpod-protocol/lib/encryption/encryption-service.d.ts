/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { EncryptedData, EncryptionEngine } from "./encryption-engine";
import { KeyProvider, KeyMetadata } from "./key-provider";
export interface Encrypted<_T> extends EncryptedData {
    keyMetadata: KeyMetadata;
}
export declare const EncryptionService: unique symbol;
export interface EncryptionService {
    encrypt<T>(data: T): Encrypted<T>;
    decrypt<T>(encrypted: Encrypted<T>): T;
}
export declare class EncryptionServiceImpl implements EncryptionService {
    protected readonly engine: EncryptionEngine;
    protected readonly keyProvider: KeyProvider;
    encrypt<T>(data: T): Encrypted<T>;
    decrypt<T>(encrypted: Encrypted<T>): T;
    protected serialize(data: any): string;
    protected deserialize<T>(data: string): T;
}
//# sourceMappingURL=encryption-service.d.ts.map