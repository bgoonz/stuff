/**
 * Copyright (c) 2021 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */

import { OAuthClient, OAuthScope, OAuthToken } from "@jmondi/oauth2-server";
import { ScopedResourceGuard } from "../auth/resource-access";

/**
 * Currently (2021-05-15) we only support 1 client and a fixed set of scopes so hard-coding here is acceptable.
 * This will change in time, in which case we can move to using the DB.
 */
export interface InMemory {
  clients: { [id: string]: OAuthClient };
  tokens: { [id: string]: OAuthToken };
  scopes: { [id: string]: OAuthScope };
}

// Scopes
const getWorkspacesScope: OAuthScope = { name: "function:getWorkspaces" };
const listenForWorkspaceInstanceUpdatesScope: OAuthScope = {
  name: "function:listenForWorkspaceInstanceUpdates",
};
const getWorkspaceResourceScope: OAuthScope = {
  name:
    "resource:" +
    ScopedResourceGuard.marshalResourceScope({
      kind: "workspace",
      subjectID: "*",
      operations: ["get"],
    }),
};
const getWorkspaceInstanceResourceScope: OAuthScope = {
  name:
    "resource:" +
    ScopedResourceGuard.marshalResourceScope({
      kind: "workspaceInstance",
      subjectID: "*",
      operations: ["get"],
    }),
};

// Clients
const localAppClientID = "gplctl-1.0";
const localClient: OAuthClient = {
  id: localAppClientID,
  secret: `${localAppClientID}-secret`,
  name: "Gitpod local control client",
  // Set of valid redirect URIs
  // NOTE: these need to be kept in sync with the port range in the local app
  redirectUris: Array.from(
    { length: 10 },
    (_, i) => "http://127.0.0.1:" + (63110 + i)
  ),
  allowedGrants: ["authorization_code"],
  scopes: [
    getWorkspacesScope,
    listenForWorkspaceInstanceUpdatesScope,
    getWorkspaceResourceScope,
    getWorkspaceInstanceResourceScope,
  ],
};

export const inMemoryDatabase: InMemory = {
  clients: {
    [localClient.id]: localClient,
  },
  tokens: {},
  scopes: {
    [getWorkspacesScope.name]: getWorkspacesScope,
    [listenForWorkspaceInstanceUpdatesScope.name]:
      listenForWorkspaceInstanceUpdatesScope,
    [getWorkspaceResourceScope.name]: getWorkspaceResourceScope,
    [getWorkspaceInstanceResourceScope.name]: getWorkspaceInstanceResourceScope,
  },
};
