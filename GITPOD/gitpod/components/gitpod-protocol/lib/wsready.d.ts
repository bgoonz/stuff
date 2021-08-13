/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare enum WorkspaceInitSource {
    WorkspaceInitFromBackup = "from-backup",
    WorkspaceInitFromPrebuild = "from-prebuild",
    WorkspaceInitFromOther = "from-other"
}
export interface WorkspaceReadyMessage {
    source: WorkspaceInitSource;
}
//# sourceMappingURL=wsready.d.ts.map