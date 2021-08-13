"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __decorate =
  (this && this.__decorate) ||
  function (decorators, target, key, desc) {
    var c = arguments.length,
      r =
        c < 3
          ? target
          : desc === null
          ? (desc = Object.getOwnPropertyDescriptor(target, key))
          : desc,
      d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function")
      r = Reflect.decorate(decorators, target, key, desc);
    else
      for (var i = decorators.length - 1; i >= 0; i--)
        if ((d = decorators[i]))
          r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
  };
var __metadata =
  (this && this.__metadata) ||
  function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function")
      return Reflect.metadata(k, v);
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitpodHostUrlTest = void 0;
var chai = require("chai");
var mocha_typescript_1 = require("mocha-typescript");
var gitpod_host_url_1 = require("./gitpod-host-url");
var expect = chai.expect;
var GitpodHostUrlTest = /** @class */ (function () {
  function GitpodHostUrlTest() {}
  GitpodHostUrlTest.prototype.parseWorkspaceId_pathBased = function () {
    var actual = gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
      "http://35.223.201.195/workspace/bc77e03d-c781-4235-bca0-e24087f5e472/"
    ).workspaceId;
    expect(actual).to.equal("bc77e03d-c781-4235-bca0-e24087f5e472");
  };
  GitpodHostUrlTest.prototype.parseWorkspaceId_hosts_withEnvVarsInjected =
    function () {
      var actual = gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
        "https://gray-grasshopper-nfbitfia.ws-eu02.gitpod-staging.com/#passedin=test%20value/https://github.com/gitpod-io/gitpod-test-repo"
      ).workspaceId;
      expect(actual).to.equal("gray-grasshopper-nfbitfia");
    };
  GitpodHostUrlTest.prototype.testWithoutWorkspacePrefix = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        expect(
          gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
            "https://3000-moccasin-ferret-155799b3.ws-eu02.gitpod-staging.com/"
          )
            .withoutWorkspacePrefix()
            .toString()
        ).to.equal("https://gitpod-staging.com/");
        return [2 /*return*/];
      });
    });
  };
  GitpodHostUrlTest.prototype.testWithoutWorkspacePrefix2 = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        expect(
          gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
            "https://gitpod-staging.com/"
          )
            .withoutWorkspacePrefix()
            .toString()
        ).to.equal("https://gitpod-staging.com/");
        return [2 /*return*/];
      });
    });
  };
  GitpodHostUrlTest.prototype.testWithoutWorkspacePrefix3 = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        expect(
          gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
            "https://gray-rook-5523v5d8.ws-dev.my-branch-1234.staging.gitpod-dev.com/"
          )
            .withoutWorkspacePrefix()
            .toString()
        ).to.equal("https://my-branch-1234.staging.gitpod-dev.com/");
        return [2 /*return*/];
      });
    });
  };
  GitpodHostUrlTest.prototype.testWithoutWorkspacePrefix4 = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        expect(
          gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
            "https://my-branch-1234.staging.gitpod-dev.com/"
          )
            .withoutWorkspacePrefix()
            .toString()
        ).to.equal("https://my-branch-1234.staging.gitpod-dev.com/");
        return [2 /*return*/];
      });
    });
  };
  GitpodHostUrlTest.prototype.testWithoutWorkspacePrefix5 = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        expect(
          gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
            "https://abc-nice-brunch-4224.staging.gitpod-dev.com/"
          )
            .withoutWorkspacePrefix()
            .toString()
        ).to.equal("https://abc-nice-brunch-4224.staging.gitpod-dev.com/");
        return [2 /*return*/];
      });
    });
  };
  GitpodHostUrlTest.prototype.testWithoutWorkspacePrefix6 = function () {
    return __awaiter(this, void 0, void 0, function () {
      return __generator(this, function (_a) {
        expect(
          gitpod_host_url_1.GitpodHostUrl.fromWorkspaceUrl(
            "https://gray-rook-5523v5d8.ws-dev.abc-nice-brunch-4224.staging.gitpod-dev.com/"
          )
            .withoutWorkspacePrefix()
            .toString()
        ).to.equal("https://abc-nice-brunch-4224.staging.gitpod-dev.com/");
        return [2 /*return*/];
      });
    });
  };
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    GitpodHostUrlTest.prototype,
    "parseWorkspaceId_pathBased",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", void 0),
    ],
    GitpodHostUrlTest.prototype,
    "parseWorkspaceId_hosts_withEnvVarsInjected",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Promise),
    ],
    GitpodHostUrlTest.prototype,
    "testWithoutWorkspacePrefix",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Promise),
    ],
    GitpodHostUrlTest.prototype,
    "testWithoutWorkspacePrefix2",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Promise),
    ],
    GitpodHostUrlTest.prototype,
    "testWithoutWorkspacePrefix3",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Promise),
    ],
    GitpodHostUrlTest.prototype,
    "testWithoutWorkspacePrefix4",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Promise),
    ],
    GitpodHostUrlTest.prototype,
    "testWithoutWorkspacePrefix5",
    null
  );
  __decorate(
    [
      mocha_typescript_1.test,
      __metadata("design:type", Function),
      __metadata("design:paramtypes", []),
      __metadata("design:returntype", Promise),
    ],
    GitpodHostUrlTest.prototype,
    "testWithoutWorkspacePrefix6",
    null
  );
  GitpodHostUrlTest = __decorate([mocha_typescript_1.suite], GitpodHostUrlTest);
  return GitpodHostUrlTest;
})();
exports.GitpodHostUrlTest = GitpodHostUrlTest;
module.exports = new GitpodHostUrlTest();
//# sourceMappingURL=gitpod-host-url.spec.js.map
