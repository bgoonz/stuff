/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export interface UrlChange {
  (old: URL): Partial<URL>;
}
export declare type UrlUpdate = UrlChange | Partial<URL>;
export declare class GitpodHostUrl {
  readonly url: URL;
  constructor(urlParam?: string | URL);
  static fromWorkspaceUrl(url: string): GitpodHostUrl;
  withWorkspacePrefix(workspaceId: string, region: string): GitpodHostUrl;
  withDomainPrefix(prefix: string): GitpodHostUrl;
  withoutWorkspacePrefix(): GitpodHostUrl;
  withoutDomainPrefix(removeSegmentsCount: number): GitpodHostUrl;
  with(urlUpdate: UrlUpdate): GitpodHostUrl;
  withApi(urlUpdate?: UrlUpdate): GitpodHostUrl;
  withContext(contextUrl: string): GitpodHostUrl;
  asWebsocket(): GitpodHostUrl;
  asDashboard(): GitpodHostUrl;
  asLogin(): GitpodHostUrl;
  asUpgradeSubscription(): GitpodHostUrl;
  asAccessControl(): GitpodHostUrl;
  asSettings(): GitpodHostUrl;
  asGraphQLApi(): GitpodHostUrl;
  asStart(workspaceId?: string | undefined): GitpodHostUrl;
  asWorkspaceAuth(instanceID: string, redirect?: boolean): GitpodHostUrl;
  toString(): string;
  toStringWoRootSlash(): string;
  get workspaceId(): string | undefined;
  get blobServe(): boolean;
  asSorry(message: string): GitpodHostUrl;
  asApiLogout(): GitpodHostUrl;
}
//# sourceMappingURL=gitpod-host-url.d.ts.map
