"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContextURL = void 0;
var ContextURL;
(function (ContextURL) {
  ContextURL.INCREMENTAL_PREBUILD_PREFIX = "incremental-prebuild";
  ContextURL.PREBUILD_PREFIX = "prebuild";
  ContextURL.IMAGEBUILD_PREFIX = "imagebuild";
  /**
   * The field "contextUrl" might contain prefixes like:
   *  - envvar1=value1/...
   *  - prebuild/...
   * This is the analogon to the (Prefix)ContextParser structure in "server".
   */
  function parseToURL(contextUrl) {
    if (contextUrl === undefined) {
      return undefined;
    }
    var segments = contextUrl.split("/");
    if (segments.length === 1) {
      return new URL(segments[0]); // this might be something, we just try
    }
    var segmentsToURL = function (offset) {
      var rest = segments.slice(offset).join("/");
      if (!rest.startsWith("http")) {
        rest = "https://" + rest;
      }
      return new URL(rest);
    };
    var firstSegment = segments[0];
    if (
      firstSegment === ContextURL.PREBUILD_PREFIX ||
      firstSegment === ContextURL.INCREMENTAL_PREBUILD_PREFIX ||
      firstSegment === ContextURL.IMAGEBUILD_PREFIX
    ) {
      return segmentsToURL(1);
    }
    // check for env vars
    if (firstSegment.indexOf("=") !== -1) {
      return segmentsToURL(1);
    }
    return segmentsToURL(0);
  }
  ContextURL.parseToURL = parseToURL;
})((ContextURL = exports.ContextURL || (exports.ContextURL = {})));
//# sourceMappingURL=context-url.js.map
