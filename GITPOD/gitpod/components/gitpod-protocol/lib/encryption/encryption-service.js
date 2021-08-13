"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionServiceImpl = exports.EncryptionService = void 0;
var inversify_1 = require("inversify");
var encryption_engine_1 = require("./encryption-engine");
var key_provider_1 = require("./key-provider");
exports.EncryptionService = Symbol('EncryptionService');
var EncryptionServiceImpl = /** @class */ (function () {
    function EncryptionServiceImpl() {
    }
    EncryptionServiceImpl.prototype.encrypt = function (data) {
        var dataStr = this.serialize(data);
        var key = this.keyProvider.getPrimaryKey();
        var encryptedData = this.engine.encrypt(dataStr, key.material);
        return __assign(__assign({}, encryptedData), { keyMetadata: key.metadata });
    };
    EncryptionServiceImpl.prototype.decrypt = function (encrypted) {
        var key = this.keyProvider.getKeyFor(encrypted.keyMetadata);
        var serializedData = this.engine.decrypt(encrypted, key.material);
        return this.deserialize(serializedData);
    };
    EncryptionServiceImpl.prototype.serialize = function (data) {
        return JSON.stringify(data);
    };
    EncryptionServiceImpl.prototype.deserialize = function (data) {
        return JSON.parse(data);
    };
    __decorate([
        inversify_1.inject(encryption_engine_1.EncryptionEngine),
        __metadata("design:type", Object)
    ], EncryptionServiceImpl.prototype, "engine", void 0);
    __decorate([
        inversify_1.inject(key_provider_1.KeyProvider),
        __metadata("design:type", Object)
    ], EncryptionServiceImpl.prototype, "keyProvider", void 0);
    EncryptionServiceImpl = __decorate([
        inversify_1.injectable()
    ], EncryptionServiceImpl);
    return EncryptionServiceImpl;
}());
exports.EncryptionServiceImpl = EncryptionServiceImpl;
//# sourceMappingURL=encryption-service.js.map