/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
export declare namespace ContextURL {
  const INCREMENTAL_PREBUILD_PREFIX = "incremental-prebuild";
  const PREBUILD_PREFIX = "prebuild";
  const IMAGEBUILD_PREFIX = "imagebuild";
  /**
   * The field "contextUrl" might contain prefixes like:
   *  - envvar1=value1/...
   *  - prebuild/...
   * This is the analogon to the (Prefix)ContextParser structure in "server".
   */
  function parseToURL(contextUrl: string | undefined): URL | undefined;
}
//# sourceMappingURL=context-url.d.ts.map
