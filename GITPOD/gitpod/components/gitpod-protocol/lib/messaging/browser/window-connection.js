"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createWindowMessageConnection = exports.WindowMessageReader = exports.WindowMessageWriter = void 0;
var messageWriter_1 = require("vscode-jsonrpc/lib/messageWriter");
var messageReader_1 = require("vscode-jsonrpc/lib/messageReader");
var main_1 = require("vscode-jsonrpc/lib/main");
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
function isWindowMessage(value) {
    return !!value && typeof value === 'object' &&
        ('jsonrpc' in value && typeof value['jsonrpc'] === 'string') &&
        ('serviceId' in value && typeof value['serviceId'] === 'string');
}
var WindowMessageWriter = /** @class */ (function (_super) {
    __extends(WindowMessageWriter, _super);
    function WindowMessageWriter(serviceId, window, targetOrigin) {
        var _this = _super.call(this) || this;
        _this.serviceId = serviceId;
        _this.window = window;
        _this.targetOrigin = targetOrigin;
        return _this;
    }
    WindowMessageWriter.prototype.write = function (msg) {
        var serviceId = this.serviceId;
        this.window.postMessage(Object.assign(msg, { serviceId: serviceId }), this.targetOrigin);
    };
    return WindowMessageWriter;
}(messageWriter_1.AbstractMessageWriter));
exports.WindowMessageWriter = WindowMessageWriter;
var WindowMessageReader = /** @class */ (function (_super) {
    __extends(WindowMessageReader, _super);
    function WindowMessageReader(serviceId, sourceOrigin) {
        var _this = _super.call(this) || this;
        _this.serviceId = serviceId;
        _this.sourceOrigin = sourceOrigin;
        _this.buffer = [];
        window.addEventListener('message', function (event) {
            if (_this.sourceOrigin !== '*' && event.origin !== _this.sourceOrigin) {
                return;
            }
            if (!isWindowMessage(event.data) || event.data.serviceId !== _this.serviceId) {
                return;
            }
            if (_this.callback) {
                _this.callback(event.data);
            }
            else {
                _this.buffer.push(event.data);
            }
        }, false);
        return _this;
    }
    WindowMessageReader.prototype.listen = function (callback) {
        var message;
        while (message = this.buffer.pop()) {
            callback(message);
        }
        Object.freeze(this.buffer);
        this.callback = callback;
    };
    return WindowMessageReader;
}(messageReader_1.AbstractMessageReader));
exports.WindowMessageReader = WindowMessageReader;
function createWindowMessageConnection(serviceId, window, sourceOrigin, targetOrigin) {
    if (targetOrigin === void 0) { targetOrigin = sourceOrigin; }
    var reader = new WindowMessageReader(serviceId, sourceOrigin);
    var writer = new WindowMessageWriter(serviceId, window, targetOrigin);
    return main_1.createMessageConnection(reader, writer, new vscode_ws_jsonrpc_1.ConsoleLogger());
}
exports.createWindowMessageConnection = createWindowMessageConnection;
//# sourceMappingURL=window-connection.js.map