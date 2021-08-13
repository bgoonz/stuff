/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare const Permissions: {
    monitor: undefined;
    enforcement: undefined;
    "privileged-ws": undefined;
    "registry-access": undefined;
    "admin-users": undefined;
    "admin-workspaces": undefined;
    "admin-api": undefined;
    "ide-settings": undefined;
    "new-workspace-cluster": undefined;
    "teams-and-projects": undefined;
};
export declare type PermissionName = keyof (typeof Permissions);
export declare const Roles: {
    devops: undefined;
    viewer: undefined;
    admin: undefined;
};
export declare type RoleName = keyof (typeof Roles);
export declare type RoleOrPermission = RoleName | PermissionName;
export declare namespace RoleName {
    const is: (o: any) => o is "devops" | "viewer" | "admin";
}
export interface Role {
    name: RoleName;
    permissions: PermissionName[];
}
export declare namespace Permission {
    /** The permission to monitor the (live) state of a Gitpod installation */
    const MONITOR: PermissionName;
    /** The permission for actions like block user, stop workspace, etc. */
    const ENFORCEMENT: PermissionName;
    /** The permission for registry access (start workspaces referencing gitpod-internal Docker images) */
    const REGISTRY_ACCESS: PermissionName;
    /** The permission for accessing all user data */
    const ADMIN_USERS: PermissionName;
    /** The permission for accessing all workspace data */
    const ADMIN_WORKSPACES: PermissionName;
    /** The permission to access the admin API */
    const ADMIN_API: PermissionName;
    /** The permission to access the IDE settings */
    const IDE_SETTINGS: PermissionName;
    const is: (o: any) => o is "monitor" | "enforcement" | "privileged-ws" | "registry-access" | "admin-users" | "admin-workspaces" | "admin-api" | "ide-settings" | "new-workspace-cluster" | "teams-and-projects";
    const all: () => PermissionName[];
}
export declare namespace Role {
    /** The default role for all Gitpod developers */
    const DEVOPS: Role;
    /** A role for people that are allowed to view Gitpod internals */
    const VIEWER: Role;
    const ADMIN: Role;
    const getByName: (name: RoleName) => Role;
    const all: () => Role[];
}
//# sourceMappingURL=permission.d.ts.map