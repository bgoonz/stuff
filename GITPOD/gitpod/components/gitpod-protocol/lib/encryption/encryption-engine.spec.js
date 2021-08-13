"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
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
exports.t = void 0;
var mocha_typescript_1 = require("mocha-typescript");
var chai = require("chai");
var path = require("path");
var fs = require("fs");
var encryption_engine_1 = require("./encryption-engine");
var expect = chai.expect;
var TestEncryptionEngineImpl = /** @class */ (function () {
    function TestEncryptionEngineImpl() {
    }
    Object.defineProperty(TestEncryptionEngineImpl.prototype, "testkey", {
        // Created with openssl rand -rand /dev/urandom -out key -base64 32
        get: function () {
            var keyFilePath = path.resolve(__dirname, '../../test/fixtures/encryption/testkey');
            var keyBuffer = fs.readFileSync(keyFilePath);
            return keyBuffer.toString().trim();
        },
        enumerable: false,
        configurable: true
    });
    ;
    TestEncryptionEngineImpl.prototype.basicSymmetry = function () {
        var plaintext = "12345678901234567890";
        var key = new Buffer(this.testkey, 'base64');
        var cut = new encryption_engine_1.EncryptionEngineImpl();
        var encryptedData = cut.encrypt(plaintext, key);
        expect(encryptedData).to.be.not.undefined;
        var decryptedPlaintext = cut.decrypt(encryptedData, key);
        expect(decryptedPlaintext).equals(plaintext);
    };
    __decorate([
        mocha_typescript_1.test,
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], TestEncryptionEngineImpl.prototype, "basicSymmetry", null);
    TestEncryptionEngineImpl = __decorate([
        mocha_typescript_1.suite
    ], TestEncryptionEngineImpl);
    return TestEncryptionEngineImpl;
}());
exports.t = new TestEncryptionEngineImpl();
//# sourceMappingURL=encryption-engine.spec.js.map