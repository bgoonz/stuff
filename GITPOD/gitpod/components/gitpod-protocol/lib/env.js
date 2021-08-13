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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEnvVarParsed = exports.filePathTelepresenceAware = exports.getEnvVar = exports.AbstractComponentEnv = void 0;
var inversify_1 = require("inversify");
var legacyStagenameTranslation = {
    "production": "production",
    "staging": "prodcopy",
    "devstaging": "dev",
    "dev": "dev"
};
var AbstractComponentEnv = /** @class */ (function () {
    function AbstractComponentEnv() {
        this.kubeStage = getEnvVarParsed('KUBE_STAGE', function (kubeStage) {
            var stage = legacyStagenameTranslation[kubeStage];
            if (!stage) {
                throw new Error("Environment variable invalid: KUBE_STAGE=" + kubeStage);
            }
            return stage;
        });
        this.kubeNamespace = getEnvVar('KUBE_NAMESPACE');
        this.version = getEnvVar('VERSION');
        this.installationLongname = getEnvVar("GITPOD_INSTALLATION_LONGNAME");
        this.installationShortname = getEnvVar("GITPOD_INSTALLATION_SHORTNAME");
    }
    AbstractComponentEnv = __decorate([
        inversify_1.injectable()
    ], AbstractComponentEnv);
    return AbstractComponentEnv;
}());
exports.AbstractComponentEnv = AbstractComponentEnv;
function getEnvVar(name, defaultValue) {
    var value = process.env[name] || defaultValue;
    if (!value) {
        throw new Error("Environment variable undefined or empty: " + name);
    }
    return value;
}
exports.getEnvVar = getEnvVar;
function filePathTelepresenceAware(filePath) {
    if (filePath && process.env.TELEPRESENCE_ROOT) {
        filePath = process.env.TELEPRESENCE_ROOT + filePath;
    }
    return filePath;
}
exports.filePathTelepresenceAware = filePathTelepresenceAware;
function getEnvVarParsed(name, parser, defaultValue) {
    return parser(getEnvVar(name, defaultValue));
}
exports.getEnvVarParsed = getEnvVarParsed;
//# sourceMappingURL=env.js.map