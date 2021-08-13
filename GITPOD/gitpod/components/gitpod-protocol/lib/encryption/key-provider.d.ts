/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/// <reference types="node" />
export interface KeyMetadata {
  name: string;
  version: number;
}
export interface Key {
  metadata: KeyMetadata;
  material: Buffer;
}
export declare const KeyProvider: unique symbol;
export interface KeyProvider {
  getPrimaryKey(): Key;
  getKeyFor(metadata: KeyMetadata): Key;
}
export declare type KeyConfig = KeyMetadata & {
  /** base64 encoded */
  material: string;
  primary?: boolean;
};
export declare const KeyProviderConfig: unique symbol;
export interface KeyProviderConfig {
  keys: KeyConfig[];
}
export declare class KeyProviderImpl implements KeyProvider {
  protected readonly config: KeyProviderConfig;
  static loadKeyConfigFromJsonString(configStr: string): KeyConfig[];
  constructor(config: KeyProviderConfig);
  protected get keys(): KeyConfig[];
  getPrimaryKey(): Key;
  getKeyFor(metadata: KeyMetadata): Key;
  protected configToKey(config: KeyConfig): Key;
}
//# sourceMappingURL=key-provider.d.ts.map
