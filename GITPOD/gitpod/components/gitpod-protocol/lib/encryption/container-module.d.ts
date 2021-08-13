/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { interfaces } from "inversify";
/**
 * User have to provide a binding for KeyProviderConfig!!!
 * Example:
 *
 *  bind(KeyProviderConfig).toDynamicValue(_ctx => {
 *      return {
 *          keys: KeyProviderImpl.loadKeyConfigFromJsonString(config)
 *      };
 *  }).inSingletonScope();
 */
export declare const encryptionModule: interfaces.ContainerModuleCallBack;
//# sourceMappingURL=container-module.d.ts.map
