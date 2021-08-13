"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptionModule = void 0;
var key_provider_1 = require("./key-provider");
var encryption_engine_1 = require("./encryption-engine");
var encryption_service_1 = require("./encryption-service");
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
var encryptionModule = function (bind) {
  bind(key_provider_1.KeyProvider)
    .to(key_provider_1.KeyProviderImpl)
    .inSingletonScope();
  bind(encryption_engine_1.EncryptionEngine)
    .to(encryption_engine_1.EncryptionEngineImpl)
    .inSingletonScope();
  bind(encryption_service_1.EncryptionService)
    .to(encryption_service_1.EncryptionServiceImpl)
    .inSingletonScope();
};
exports.encryptionModule = encryptionModule;
//# sourceMappingURL=container-module.js.map
