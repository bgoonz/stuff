"use strict";
/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketConnectionProvider = void 0;
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var proxy_factory_1 = require("../proxy-factory");
var reconnecting_websocket_1 = require("reconnecting-websocket");
var WebSocketConnectionProvider = /** @class */ (function () {
    function WebSocketConnectionProvider() {
    }
    /**
     * Create a proxy object to remote interface of T type
     * over a web socket connection for the given path.
     *
     * An optional target can be provided to handle
     * notifications and requests from a remote side.
     */
    WebSocketConnectionProvider.prototype.createProxy = function (path, target, options) {
        var _this = this;
        var factory = new proxy_factory_1.JsonRpcProxyFactory(target);
        var startListening = function (path) {
            var socket = _this.listen({
                path: path,
                onConnection: function (c) { return factory.listen(c); }
            }, options);
            if (options === null || options === void 0 ? void 0 : options.onListening) {
                options.onListening(socket);
            }
        };
        if (typeof path === "string") {
            startListening(path);
        }
        else {
            path.then(function (path) { return startListening(path); });
        }
        return factory.createProxy();
    };
    /**
     * Install a connection handler for the given path.
     */
    WebSocketConnectionProvider.prototype.listen = function (handler, options) {
        var url = handler.path;
        var webSocket = this.createWebSocket(url);
        var logger = this.createLogger();
        if (options && options.onerror) {
            var onerror_1 = options.onerror;
            webSocket.addEventListener('error', function (event) {
                onerror_1(event);
            });
        }
        else {
            webSocket.addEventListener('error', function (error) {
                logger.error(JSON.stringify(error));
            });
        }
        vscode_ws_jsonrpc_1.listen({
            webSocket: webSocket,
            onConnection: function (connection) { return handler.onConnection(connection); },
            logger: logger
        });
        return webSocket;
    };
    WebSocketConnectionProvider.prototype.createLogger = function () {
        return new vscode_ws_jsonrpc_1.ConsoleLogger();
    };
    /**
     * Creates a web socket for the given url
     */
    WebSocketConnectionProvider.prototype.createWebSocket = function (url) {
        return new reconnecting_websocket_1.default(url, undefined, {
            maxReconnectionDelay: 10000,
            minReconnectionDelay: 1000,
            reconnectionDelayGrowFactor: 1.3,
            maxRetries: Infinity,
            debug: false,
            WebSocket: WebSocket
        });
    };
    return WebSocketConnectionProvider;
}());
exports.WebSocketConnectionProvider = WebSocketConnectionProvider;
//# sourceMappingURL=connection.js.map