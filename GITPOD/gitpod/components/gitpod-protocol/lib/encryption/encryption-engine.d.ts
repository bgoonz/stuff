/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/// <reference types="node" />
export interface KeyParams {
  iv: string;
}
export interface EncryptedData {
  /** utf8 encoded string */
  data: string;
  keyParams: KeyParams;
}
export declare const EncryptionEngine: unique symbol;
export interface EncryptionEngine {
  /**
   * @param data utf8 encoded string
   */
  encrypt(data: string, key: Buffer): EncryptedData;
  decrypt(encryptedData: EncryptedData, key: Buffer): string;
}
/**
 * For starters, let's use aes-cbc-256 with:
 * - 16 bytes/128 bits IV (the size of an aes-256-cbc block)
 * - no salt, as we pass in a real key (no salting needed to turn a password into a key)
 * The implementation closely follows the exampes in https://nodejs.org/api/crypto.html.
 */
export declare class EncryptionEngineImpl {
  readonly algorithm = "aes-256-cbc";
  readonly enc = "base64";
  encrypt(data: string, key: Buffer): EncryptedData;
  decrypt(encryptedData: EncryptedData, key: Buffer): string;
}
//# sourceMappingURL=encryption-engine.d.ts.map
