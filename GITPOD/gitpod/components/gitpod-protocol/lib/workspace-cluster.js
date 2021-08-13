"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceClusterDB = exports.TLSConfig = void 0;
var fs = require("fs");
var env_1 = require("./env");
var TLSConfig;
(function (TLSConfig) {
    TLSConfig.loadFromBase64File = function (path) { return fs.readFileSync(env_1.filePathTelepresenceAware(path)).toString("base64"); };
})(TLSConfig = exports.TLSConfig || (exports.TLSConfig = {}));
exports.WorkspaceClusterDB = Symbol("WorkspaceClusterDB");
//# sourceMappingURL=workspace-cluster.js.map