"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitpodHostUrl = void 0;
var URL = require('url').URL || window.URL;
var logging_1 = require("./logging");
var basewoWkspaceIDRegex = "(([a-f][0-9a-f]{7}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})|([0-9a-z]{2,16}-[0-9a-z]{2,16}-[0-9a-z]{8}))";
// this pattern matches v4 UUIDs as well as the new generated workspace ids (e.g. pink-panda-ns35kd21)
var workspaceIDRegex = RegExp("^" + basewoWkspaceIDRegex + "$");
// this pattern matches URL prefixes of workspaces
var workspaceUrlPrefixRegex = RegExp("^([0-9]{4,6}-)?" + basewoWkspaceIDRegex + "\\.");
var GitpodHostUrl = /** @class */ (function () {
    function GitpodHostUrl(urlParam) {
        if (urlParam === undefined || typeof urlParam === 'string') {
            this.url = new URL(urlParam || 'https://gitpod.io');
            this.url.search = '';
            this.url.hash = '';
            this.url.pathname = '';
        }
        else if (urlParam instanceof URL) {
            this.url = urlParam;
        }
        else {
            logging_1.log.error('Unexpected urlParam', { urlParam: urlParam });
        }
    }
    GitpodHostUrl.fromWorkspaceUrl = function (url) {
        return new GitpodHostUrl(new URL(url));
    };
    GitpodHostUrl.prototype.withWorkspacePrefix = function (workspaceId, region) {
        return this.withDomainPrefix(workspaceId + ".ws-" + region + ".");
    };
    GitpodHostUrl.prototype.withDomainPrefix = function (prefix) {
        return this.with(function (url) { return ({ host: prefix + url.host }); });
        ;
    };
    GitpodHostUrl.prototype.withoutWorkspacePrefix = function () {
        if (!this.url.host.match(workspaceUrlPrefixRegex)) {
            // URL has no workspace prefix
            return this;
        }
        return this.withoutDomainPrefix(2);
    };
    GitpodHostUrl.prototype.withoutDomainPrefix = function (removeSegmentsCount) {
        return this.with(function (url) { return ({ host: url.host.split('.').splice(removeSegmentsCount).join('.') }); });
    };
    GitpodHostUrl.prototype.with = function (urlUpdate) {
        var update = typeof urlUpdate === 'function' ? urlUpdate(this.url) : urlUpdate;
        var addSlashToPath = update.pathname && update.pathname.length > 0 && !update.pathname.startsWith('/');
        if (addSlashToPath) {
            update.pathname = '/' + update.pathname;
        }
        var result = Object.assign(new URL(this.toString()), update);
        return new GitpodHostUrl(result);
    };
    GitpodHostUrl.prototype.withApi = function (urlUpdate) {
        var updated = urlUpdate ? this.with(urlUpdate) : this;
        return updated.with(function (url) { return ({ pathname: "/api" + url.pathname }); });
    };
    GitpodHostUrl.prototype.withContext = function (contextUrl) {
        return this.with(function (url) { return ({ hash: contextUrl }); });
    };
    GitpodHostUrl.prototype.asWebsocket = function () {
        return this.with(function (url) { return ({ protocol: url.protocol === 'https:' ? 'wss:' : 'ws:' }); });
    };
    GitpodHostUrl.prototype.asDashboard = function () {
        return this.with(function (url) { return ({ pathname: '/workspaces/' }); });
    };
    GitpodHostUrl.prototype.asLogin = function () {
        return this.with(function (url) { return ({ pathname: '/login/' }); });
    };
    GitpodHostUrl.prototype.asUpgradeSubscription = function () {
        return this.with(function (url) { return ({ pathname: '/plans/' }); });
    };
    GitpodHostUrl.prototype.asAccessControl = function () {
        return this.with(function (url) { return ({ pathname: '/access-control/' }); });
    };
    GitpodHostUrl.prototype.asSettings = function () {
        return this.with(function (url) { return ({ pathname: '/settings/' }); });
    };
    GitpodHostUrl.prototype.asGraphQLApi = function () {
        return this.with(function (url) { return ({ pathname: '/graphql/' }); });
    };
    GitpodHostUrl.prototype.asStart = function (workspaceId) {
        if (workspaceId === void 0) { workspaceId = this.workspaceId; }
        return this.withoutWorkspacePrefix().with({
            pathname: '/start/',
            hash: '#' + workspaceId
        });
    };
    GitpodHostUrl.prototype.asWorkspaceAuth = function (instanceID, redirect) {
        return this.with(function (url) { return ({ pathname: "/api/auth/workspace-cookie/" + instanceID, search: redirect ? "redirect" : "" }); });
    };
    GitpodHostUrl.prototype.toString = function () {
        return this.url.toString();
    };
    GitpodHostUrl.prototype.toStringWoRootSlash = function () {
        var result = this.toString();
        if (result.endsWith('/')) {
            result = result.slice(0, result.length - 1);
        }
        return result;
    };
    Object.defineProperty(GitpodHostUrl.prototype, "workspaceId", {
        get: function () {
            var hostSegs = this.url.host.split(".");
            if (hostSegs.length > 1) {
                var matchResults = hostSegs[0].match(workspaceIDRegex);
                if (matchResults) {
                    // URL has a workspace prefix
                    // port prefixes are excluded
                    return matchResults[0];
                }
            }
            var pathSegs = this.url.pathname.split("/");
            if (pathSegs.length > 3 && pathSegs[1] === "workspace") {
                return pathSegs[2];
            }
            return undefined;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GitpodHostUrl.prototype, "blobServe", {
        get: function () {
            var hostSegments = this.url.host.split(".");
            if (hostSegments[0] === 'blobserve') {
                return true;
            }
            var pathSegments = this.url.pathname.split("/");
            return pathSegments[0] === "blobserve";
        },
        enumerable: false,
        configurable: true
    });
    GitpodHostUrl.prototype.asSorry = function (message) {
        return this.with({ pathname: '/sorry', hash: message });
    };
    GitpodHostUrl.prototype.asApiLogout = function () {
        return this.withApi(function (url) { return ({ pathname: '/logout/' }); });
    };
    return GitpodHostUrl;
}());
exports.GitpodHostUrl = GitpodHostUrl;
//# sourceMappingURL=gitpod-host-url.js.map