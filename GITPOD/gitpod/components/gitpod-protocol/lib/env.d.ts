/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare abstract class AbstractComponentEnv {
    readonly kubeStage: KubeStage;
    readonly kubeNamespace: string;
    readonly version: string;
    readonly installationLongname: string;
    readonly installationShortname: string;
}
export declare type KubeStage = 'production' | 'prodcopy' | 'staging' | 'dev';
export declare function getEnvVar(name: string, defaultValue?: string): string;
export declare function filePathTelepresenceAware(filePath: string): string;
export declare function getEnvVarParsed<T>(name: string, parser: (value: string) => T, defaultValue?: string): T;
//# sourceMappingURL=env.d.ts.map