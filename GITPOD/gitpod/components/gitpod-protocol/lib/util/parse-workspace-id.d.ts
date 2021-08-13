/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
/**
 * Hostname may be of the form:
 *  - moccasin-ferret-155799b3.ws-eu01.gitpod.io
 *  - 1234-moccasin-ferret-155799b3.ws-eu01.gitpod.io
 *  - webview-1234-moccasin-ferret-155799b3.ws-eu01.gitpod.io (or any other string replacing webview)
 * @param hostname The hostname the request is headed to
 */
export declare const parseWorkspaceIdFromHostname: (hostname: string) => string | undefined;
//# sourceMappingURL=parse-workspace-id.d.ts.map