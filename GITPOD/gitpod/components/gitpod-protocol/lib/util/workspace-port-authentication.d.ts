/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/**
* These cookies are set in the Theia frontend. This pattern is relied upon in:
*  - proxy:
*    - to filter it out on port locations
*    - to forward it to the server for authentication
*  - server:
*    - to authenticate access to port locations
*/
export declare const worspacePortAuthCookieName: (host: string, workspaceId: string) => string;
//# sourceMappingURL=workspace-port-authentication.d.ts.map