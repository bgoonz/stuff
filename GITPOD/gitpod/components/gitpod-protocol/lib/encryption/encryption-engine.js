"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionEngineImpl = exports.EncryptionEngine = void 0;
var crypto = require("crypto");
var inversify_1 = require("inversify");
exports.EncryptionEngine = Symbol("EncryptionEngine");
/**
 * For starters, let's use aes-cbc-256 with:
 * - 16 bytes/128 bits IV (the size of an aes-256-cbc block)
 * - no salt, as we pass in a real key (no salting needed to turn a password into a key)
 * The implementation closely follows the exampes in https://nodejs.org/api/crypto.html.
 */
var EncryptionEngineImpl = /** @class */ (function () {
  function EncryptionEngineImpl() {
    this.algorithm = "aes-256-cbc";
    this.enc = "base64";
  }
  EncryptionEngineImpl.prototype.encrypt = function (data, key) {
    var iv = crypto.randomBytes(16);
    var cipher = crypto.createCipheriv(this.algorithm, key, iv);
    var encrypted = cipher.update(new Buffer(data, "utf8"));
    var finalEncrypted = Buffer.concat([encrypted, cipher.final()]);
    return {
      data: finalEncrypted.toString(this.enc),
      keyParams: {
        iv: iv.toString(this.enc),
      },
    };
  };
  EncryptionEngineImpl.prototype.decrypt = function (encryptedData, key) {
    var decipher = crypto.createDecipheriv(
      this.algorithm,
      key,
      new Buffer(encryptedData.keyParams.iv, this.enc)
    );
    var decrypted = decipher.update(new Buffer(encryptedData.data, this.enc));
    var finalDecrypted = Buffer.concat([decrypted, decipher.final()]);
    return finalDecrypted.toString("utf8");
  };
  EncryptionEngineImpl = __decorate(
    [inversify_1.injectable()],
    EncryptionEngineImpl
  );
  return EncryptionEngineImpl;
})();
exports.EncryptionEngineImpl = EncryptionEngineImpl;
//# sourceMappingURL=encryption-engine.js.map
