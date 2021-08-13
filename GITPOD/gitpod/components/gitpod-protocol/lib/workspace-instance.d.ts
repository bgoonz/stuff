/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { NamedWorkspaceFeatureFlag } from "./protocol";
export interface WorkspaceInstance {
  id: string;
  workspaceId: string;
  creationTime: string;
  deployedTime?: string;
  startedTime?: string;
  stoppingTime?: string;
  stoppedTime?: string;
  ideUrl: string;
  region: string;
  workspaceImage: string;
  status: WorkspaceInstanceStatus;
  configuration?: WorkspaceInstanceConfiguration;
  readonly deleted?: boolean;
}
export interface WorkspaceInstanceStatus {
  phase: WorkspaceInstancePhase;
  conditions: WorkspaceInstanceConditions;
  message?: string;
  exposedPorts?: WorkspaceInstancePort[];
  repo?: WorkspaceInstanceRepoStatus;
  timeout?: string;
  nodeName?: string;
  podName?: string;
  nodeIp?: string;
  ownerToken?: string;
}
export declare type WorkspaceInstancePhase =
  | "unknown"
  | "preparing"
  | "pending"
  | "creating"
  | "initializing"
  | "running"
  | "interrupted"
  | "stopping"
  | "stopped";
export interface WorkspaceInstanceConditions {
  failed?: string;
  timeout?: string;
  pullingImages?: boolean;
  serviceExists?: boolean;
  deployed?: boolean;
  neededImageBuild?: boolean;
  firstUserActivity?: string;
}
export declare type AdmissionLevel = "owner_only" | "everyone";
export declare type PortVisibility = "public" | "private";
export interface WorkspaceInstancePort {
  port: number;
  targetPort?: number;
  visibility?: PortVisibility;
  url?: string;
}
export interface WorkspaceInstanceRepoStatus {
  branch?: string;
  latestCommit?: string;
  uncommitedFiles?: string[];
  totalUncommitedFiles?: number;
  untrackedFiles?: string[];
  totalUntrackedFiles?: number;
  unpushedCommits?: string[];
  totalUnpushedCommits?: number;
}
export interface WorkspaceInstanceConfiguration {
  theiaVersion?: string;
  featureFlags?: NamedWorkspaceFeatureFlag[];
  ideImage: string;
}
//# sourceMappingURL=workspace-instance.d.ts.map
