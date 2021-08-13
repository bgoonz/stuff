"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createGitpodService = exports.GitpodServiceImpl = exports.WorkspaceInstanceUpdateListener = exports.GitpodCompositeClient = exports.GitpodServerProxy = exports.GitpodServerPath = exports.createServerMock = exports.createServiceMock = exports.WorkspaceTimeoutValues = exports.GitpodServer = void 0;
var vscode_jsonrpc_1 = require("vscode-jsonrpc");
var gitpod_host_url_1 = require("./util/gitpod-host-url");
var connection_1 = require("./messaging/browser/connection");
var event_1 = require("./util/event");
exports.GitpodServer = Symbol('GitpodServer');
exports.WorkspaceTimeoutValues = ["30m", "60m", "180m"];
var createServiceMock = function (methods) {
    return new GitpodServiceImpl(exports.createServerMock(methods));
};
exports.createServiceMock = createServiceMock;
var createServerMock = function (methods) {
    methods.setClient = methods.setClient || (function () { });
    methods.dispose = methods.dispose || (function () { });
    return new Proxy(methods, {
        // @ts-ignore
        get: function (target, property) {
            var result = target[property];
            if (!result) {
                throw new Error("Method " + property + " not implemented");
            }
            return result;
        }
    });
};
exports.createServerMock = createServerMock;
exports.GitpodServerPath = '/gitpod';
exports.GitpodServerProxy = Symbol('GitpodServerProxy');
var GitpodCompositeClient = /** @class */ (function () {
    function GitpodCompositeClient() {
        this.clients = [];
    }
    GitpodCompositeClient.prototype.registerClient = function (client) {
        var _this = this;
        this.clients.push(client);
        var index = this.clients.length;
        return {
            dispose: function () {
                _this.clients.slice(index, 1);
            }
        };
    };
    GitpodCompositeClient.prototype.onInstanceUpdate = function (instance) {
        var e_1, _a;
        try {
            for (var _b = __values(this.clients), _c = _b.next(); !_c.done; _c = _b.next()) {
                var client = _c.value;
                if (client.onInstanceUpdate) {
                    try {
                        client.onInstanceUpdate(instance);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
    };
    GitpodCompositeClient.prototype.onWorkspaceImageBuildLogs = function (info, content) {
        var e_2, _a;
        try {
            for (var _b = __values(this.clients), _c = _b.next(); !_c.done; _c = _b.next()) {
                var client = _c.value;
                if (client.onWorkspaceImageBuildLogs) {
                    try {
                        client.onWorkspaceImageBuildLogs(info, content);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_2) throw e_2.error; }
        }
    };
    GitpodCompositeClient.prototype.notifyDidOpenConnection = function () {
        var e_3, _a;
        try {
            for (var _b = __values(this.clients), _c = _b.next(); !_c.done; _c = _b.next()) {
                var client = _c.value;
                if (client.notifyDidOpenConnection) {
                    try {
                        client.notifyDidOpenConnection();
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_3) throw e_3.error; }
        }
    };
    GitpodCompositeClient.prototype.notifyDidCloseConnection = function () {
        var e_4, _a;
        try {
            for (var _b = __values(this.clients), _c = _b.next(); !_c.done; _c = _b.next()) {
                var client = _c.value;
                if (client.notifyDidCloseConnection) {
                    try {
                        client.notifyDidCloseConnection();
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
        catch (e_4_1) { e_4 = { error: e_4_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_4) throw e_4.error; }
        }
    };
    GitpodCompositeClient.prototype.onCreditAlert = function (creditAlert) {
        var e_5, _a;
        try {
            for (var _b = __values(this.clients), _c = _b.next(); !_c.done; _c = _b.next()) {
                var client = _c.value;
                if (client.onCreditAlert) {
                    try {
                        client.onCreditAlert(creditAlert);
                    }
                    catch (error) {
                        console.error(error);
                    }
                }
            }
        }
        catch (e_5_1) { e_5 = { error: e_5_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_5) throw e_5.error; }
        }
    };
    return GitpodCompositeClient;
}());
exports.GitpodCompositeClient = GitpodCompositeClient;
var hasWindow = (typeof window !== 'undefined');
var phasesOrder = {
    unknown: 0,
    preparing: 1,
    pending: 2,
    creating: 3,
    initializing: 4,
    running: 5,
    interrupted: 6,
    stopping: 7,
    stopped: 8
};
var WorkspaceInstanceUpdateListener = /** @class */ (function () {
    function WorkspaceInstanceUpdateListener(service, _info) {
        var _this = this;
        this.service = service;
        this._info = _info;
        this.onDidChangeEmitter = new event_1.Emitter();
        this.onDidChange = this.onDidChangeEmitter.event;
        this.source = 'sync';
        this.syncQueue = Promise.resolve();
        service.registerClient({
            onInstanceUpdate: function (instance) {
                if (_this.isOutOfOrder(instance)) {
                    return;
                }
                _this.cancelSync();
                _this._info.latestInstance = instance;
                _this.source = 'update';
                _this.onDidChangeEmitter.fire(undefined);
            },
            notifyDidOpenConnection: function () {
                _this.sync();
            }
        });
        if (hasWindow) {
            // learn about page lifecycle here: https://developers.google.com/web/updates/2018/07/page-lifecycle-api
            window.document.addEventListener('visibilitychange', function () { return __awaiter(_this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (window.document.visibilityState === 'visible') {
                        this.sync();
                    }
                    return [2 /*return*/];
                });
            }); });
            window.addEventListener('pageshow', function (e) {
                if (e.persisted) {
                    _this.sync();
                }
            });
        }
    }
    Object.defineProperty(WorkspaceInstanceUpdateListener.prototype, "info", {
        get: function () {
            return this._info;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Only one sync can be performed at the same time.
     * Any new sync request or instance update cancels all previously scheduled sync requests.
     */
    WorkspaceInstanceUpdateListener.prototype.sync = function () {
        var _this = this;
        this.cancelSync();
        this.syncTokenSource = new vscode_jsonrpc_1.CancellationTokenSource();
        var token = this.syncTokenSource.token;
        this.syncQueue = this.syncQueue.then(function () { return __awaiter(_this, void 0, void 0, function () {
            var info, e_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (token.isCancellationRequested) {
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.service.server.getWorkspace(this._info.workspace.id)];
                    case 2:
                        info = _a.sent();
                        if (token.isCancellationRequested) {
                            return [2 /*return*/];
                        }
                        this._info = info;
                        this.source = 'sync';
                        this.onDidChangeEmitter.fire(undefined);
                        return [3 /*break*/, 4];
                    case 3:
                        e_6 = _a.sent();
                        console.error('failed to sync workspace instance:', e_6);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
    };
    WorkspaceInstanceUpdateListener.prototype.cancelSync = function () {
        if (this.syncTokenSource) {
            this.syncTokenSource.cancel();
            this.syncTokenSource = undefined;
        }
    };
    /**
     * If sync seen more recent update then ignore all updates with previous phases.
     * Within the same phase still the race can occur but which should be eventually consistent.
     */
    WorkspaceInstanceUpdateListener.prototype.isOutOfOrder = function (instance) {
        var _a;
        if (instance.workspaceId !== this._info.workspace.id) {
            return true;
        }
        if (this.source === 'update') {
            return false;
        }
        if (instance.id !== ((_a = this.info.latestInstance) === null || _a === void 0 ? void 0 : _a.id)) {
            return false;
        }
        return phasesOrder[instance.status.phase] < phasesOrder[this.info.latestInstance.status.phase];
    };
    return WorkspaceInstanceUpdateListener;
}());
exports.WorkspaceInstanceUpdateListener = WorkspaceInstanceUpdateListener;
var GitpodServiceImpl = /** @class */ (function () {
    function GitpodServiceImpl(server, options) {
        var _this = this;
        this.server = server;
        this.options = options;
        this.compositeClient = new GitpodCompositeClient();
        this.instanceListeners = new Map();
        server.setClient(this.compositeClient);
        server.onDidOpenConnection(function () { return _this.compositeClient.notifyDidOpenConnection(); });
        server.onDidCloseConnection(function () { return _this.compositeClient.notifyDidCloseConnection(); });
    }
    GitpodServiceImpl.prototype.registerClient = function (client) {
        return this.compositeClient.registerClient(client);
    };
    GitpodServiceImpl.prototype.listenToInstance = function (workspaceId) {
        var _this = this;
        var listener = this.instanceListeners.get(workspaceId) ||
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.server.getWorkspace(workspaceId)];
                        case 1:
                            info = _a.sent();
                            return [2 /*return*/, new WorkspaceInstanceUpdateListener(this, info)];
                    }
                });
            }); })();
        this.instanceListeners.set(workspaceId, listener);
        return listener;
    };
    GitpodServiceImpl.prototype.reconnect = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!((_a = this.options) === null || _a === void 0 ? void 0 : _a.onReconnect)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.options.onReconnect()];
                    case 1:
                        _b.sent();
                        _b.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    return GitpodServiceImpl;
}());
exports.GitpodServiceImpl = GitpodServiceImpl;
function createGitpodService(serverUrl) {
    var toWsUrl = function (serverUrl) {
        return new gitpod_host_url_1.GitpodHostUrl(serverUrl)
            .asWebsocket()
            .withApi({ pathname: exports.GitpodServerPath })
            .toString();
    };
    var url;
    if (typeof serverUrl === "string") {
        url = toWsUrl(serverUrl);
    }
    else {
        url = serverUrl.then(function (url) { return toWsUrl(url); });
    }
    var connectionProvider = new connection_1.WebSocketConnectionProvider();
    var onReconnect = function () { };
    var gitpodServer = connectionProvider.createProxy(url, undefined, {
        onListening: function (socket) {
            onReconnect = function () { return socket.reconnect(); };
        }
    });
    return new GitpodServiceImpl(gitpodServer, { onReconnect: onReconnect });
}
exports.createGitpodService = createGitpodService;
//# sourceMappingURL=gitpod-service.js.map