"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Role =
  exports.Permission =
  exports.RoleName =
  exports.Roles =
  exports.Permissions =
    void 0;
// see below for explanation
exports.Permissions = {
  monitor: undefined,
  enforcement: undefined,
  "privileged-ws": undefined,
  "registry-access": undefined,
  "admin-users": undefined,
  "admin-workspaces": undefined,
  "admin-api": undefined,
  "ide-settings": undefined,
  "new-workspace-cluster": undefined,
  "teams-and-projects": undefined,
};
exports.Roles = { devops: undefined, viewer: undefined, admin: undefined };
var RoleName;
(function (RoleName) {
  RoleName.is = function (o) {
    return (
      typeof o === "string" &&
      Role.all().some(function (r) {
        return r.name === o;
      })
    );
  };
})((RoleName = exports.RoleName || (exports.RoleName = {})));
var Permission;
(function (Permission) {
  /** The permission to monitor the (live) state of a Gitpod installation */
  Permission.MONITOR = "monitor";
  /** The permission for actions like block user, stop workspace, etc. */
  Permission.ENFORCEMENT = "enforcement";
  /** The permission for registry access (start workspaces referencing gitpod-internal Docker images) */
  Permission.REGISTRY_ACCESS = "registry-access";
  /** The permission for accessing all user data */
  Permission.ADMIN_USERS = "admin-users";
  /** The permission for accessing all workspace data */
  Permission.ADMIN_WORKSPACES = "admin-workspaces";
  /** The permission to access the admin API */
  Permission.ADMIN_API = "admin-api";
  /** The permission to access the IDE settings */
  Permission.IDE_SETTINGS = "ide-settings";
  Permission.is = function (o) {
    return (
      typeof o === "string" &&
      Permission.all().some(function (p) {
        return p === o;
      })
    );
  };
  Permission.all = function () {
    return Object.keys(Permission)
      .map(function (k) {
        return Permission[k];
      })
      .filter(function (k) {
        return typeof k === "string";
      });
  };
})((Permission = exports.Permission || (exports.Permission = {})));
var Role;
(function (Role) {
  /** The default role for all Gitpod developers */
  Role.DEVOPS = {
    name: "devops",
    permissions: [
      Permission.MONITOR,
      Permission.ENFORCEMENT,
      Permission.REGISTRY_ACCESS,
      Permission.IDE_SETTINGS,
    ],
  };
  /** A role for people that are allowed to view Gitpod internals */
  Role.VIEWER = {
    name: "viewer",
    permissions: [Permission.MONITOR, Permission.REGISTRY_ACCESS],
  };
  Role.ADMIN = {
    name: "admin",
    permissions: [
      Permission.ADMIN_USERS,
      Permission.ADMIN_WORKSPACES,
      Permission.ADMIN_API,
      Permission.ENFORCEMENT,
    ],
  };
  Role.getByName = function (name) {
    var result = Role.all().find(function (r) {
      return r.name === name;
    });
    if (!result) {
      throw Error("Unknown RoleName: " + name);
    }
    return result;
  };
  Role.all = function () {
    return Object.keys(Role)
      .map(function (k) {
        return Role[k];
      })
      .filter(function (k) {
        return typeof k === "object";
      });
  };
})((Role = exports.Role || (exports.Role = {})));
//# sourceMappingURL=permission.js.map
