/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { DeepPartial } from "./util/deep-partial";
import { PermissionName } from './permission';
export interface WorkspaceCluster {
    name: string;
    url: string;
    tls?: TLSConfig;
    state: WorkspaceClusterState;
    maxScore: number;
    score: number;
    govern: boolean;
    admissionConstraints?: AdmissionConstraint[];
}
export declare type WorkspaceClusterState = "available" | "cordoned" | "draining";
export interface TLSConfig {
    ca: string;
    key: string;
    crt: string;
}
export declare namespace TLSConfig {
    const loadFromBase64File: (path: string) => string;
}
export declare type WorkspaceClusterWoTLS = Omit<WorkspaceCluster, "tls">;
export declare type WorkspaceManagerConnectionInfo = Pick<WorkspaceCluster, "name" | "url" | "tls">;
export declare type AdmissionConstraint = AdmissionConstraintFeaturePreview | AdmissionConstraintHasRole;
export declare type AdmissionConstraintFeaturePreview = {
    type: "has-feature-preview";
};
export declare type AdmissionConstraintHasRole = {
    type: "has-permission";
    permission: PermissionName;
};
export declare const WorkspaceClusterDB: unique symbol;
export interface WorkspaceClusterDB {
    /**
     * Stores the given WorkspaceCluster to the cluster-local DB in a consistent manner.
     * If there already is an entry with the same name it's merged and updated with the given state.
     * @param cluster
     */
    save(cluster: WorkspaceCluster): Promise<void>;
    /**
     * Deletes the cluster identified by this name, if any.
     * @param name
     */
    deleteByName(name: string): Promise<void>;
    /**
     * Finds a WorkspaceCluster with the given name. If there is none, `undefined` is returned.
     * @param name
     */
    findByName(name: string): Promise<WorkspaceCluster | undefined>;
    /**
     * Lists all WorkspaceClusterWoTls for which the given predicate is true (does not return TLS for size/speed concerns)
     * @param predicate
     */
    findFiltered(predicate: DeepPartial<WorkspaceClusterFilter>): Promise<WorkspaceClusterWoTLS[]>;
}
export interface WorkspaceClusterFilter extends Pick<WorkspaceCluster, "state" | "govern" | "url"> {
    minScore: number;
}
//# sourceMappingURL=workspace-cluster.d.ts.map