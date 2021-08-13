"use strict";
/*
 * Copyright (C) 2017 TypeFox and others.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.toIWebSocket =
  exports.openSocket =
  exports.openJsonRpcSocket =
  exports.createServerWebSocketConnection =
    void 0;
var ws = require("ws");
var url = require("url");
var vscode_ws_jsonrpc_1 = require("vscode-ws-jsonrpc");
var logging_1 = require("../../util/logging");
function createServerWebSocketConnection(options, onConnect) {
  openJsonRpcSocket(options, function (socket) {
    onConnect(vscode_ws_jsonrpc_1.createWebSocketConnection(socket, console));
  });
}
exports.createServerWebSocketConnection = createServerWebSocketConnection;
function openJsonRpcSocket(options, onOpen) {
  openSocket(options, function (socket) {
    var webSocket = toIWebSocket(socket);
    onOpen(webSocket);
  });
}
exports.openJsonRpcSocket = openJsonRpcSocket;
function openSocket(options, onOpen) {
  var wss = new ws.Server({
    noServer: true,
    perMessageDeflate: {
      // don't compress if a message is less than 256kb
      threshold: 256 * 1024,
    },
  });
  options.server.on("upgrade", function (request, socket, head) {
    var pathname = request.url ? url.parse(request.url).pathname : undefined;
    if (
      (options.path && pathname === options.path) ||
      (options.matches && options.matches(request))
    ) {
      wss.handleUpgrade(request, socket, head, function (webSocket) {
        if (webSocket.readyState === webSocket.OPEN) {
          onOpen(webSocket, request, socket, head);
        } else {
          webSocket.on("open", function () {
            return onOpen(webSocket, request, socket, head);
          });
        }
      });
    }
  });
}
exports.openSocket = openSocket;
function toIWebSocket(webSocket) {
  var sendsAfterOpen = 0;
  return {
    send: function (content) {
      if (webSocket.readyState !== ws.OPEN) {
        if (sendsAfterOpen++ > 3) {
          logging_1.log.error(
            "Repeated try to send on closed web socket (readyState was " +
              webSocket.readyState +
              ")",
            { ws: ws }
          );
        }
        return;
      }
      webSocket.send(content, function (err) {
        if (err) {
          logging_1.log.error("Error in ws.send()", err, { ws: ws });
        }
      });
    },
    onMessage: function (cb) {
      return webSocket.on("message", cb);
    },
    onError: function (cb) {
      return webSocket.on("error", cb);
    },
    onClose: function (cb) {
      return webSocket.on("close", cb);
    },
    dispose: function () {
      if (webSocket.readyState < ws.CLOSING) {
        webSocket.close();
      }
    },
  };
}
exports.toIWebSocket = toIWebSocket;
//# sourceMappingURL=connection.js.map
