"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
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
          : new P(function (resolve) {
              resolve(result.value);
            }).then(fulfilled, rejected);
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
var __read =
  (this && this.__read) ||
  function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o),
      r,
      ar = [],
      e;
    try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done)
        ar.push(r.value);
    } catch (error) {
      e = { error: error };
    } finally {
      try {
        if (r && !r.done && (m = i["return"])) m.call(i);
      } finally {
        if (e) throw e.error;
      }
    }
    return ar;
  };
var __spread =
  (this && this.__spread) ||
  function () {
    for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
    return ar;
  };
var __values =
  (this && this.__values) ||
  function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator],
      i = 0;
    if (m) return m.call(o);
    return {
      next: function () {
        if (o && i >= o.length) o = void 0;
        return { value: o && o[i++], done: !o };
      },
    };
  };
var _this = this;
var getConfig = require("probot-config");
var createScheduler = require("probot-scheduler");
var Gitpod = /** @class */ (function () {
  function Gitpod(context, config, stat) {
    this.context = context;
    this.config = config;
    this.stat = stat;
    context.log.debug(
      "config: " +
        JSON.stringify(
          config,
          function (_, value) {
            if (value instanceof Set) {
              return __spread(value.values());
            }
            return value;
          },
          2
        )
    );
  }
  Gitpod.create = function (context, scheduler, stats) {
    return __awaiter(this, void 0, void 0, function () {
      var _a, owner, repo, key, stat, config, pulls, issues;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            (_a = context.repo()), (owner = _a.owner), (repo = _a.repo);
            key = owner + "/" + repo;
            stat = stats.get(key) || {
              owner: owner,
              repo: repo,
              issues: 0,
              pulls: 0,
            };
            stats.set(key, stat);
            return [4 /*yield*/, getConfig(context, "gitpod.yml")];
          case 1:
            config = _b.sent();
            if (!config) {
              scheduler.stop(context.payload.repository);
            }
            pulls = config && config.pulls;
            issues = config && config.issues;
            return [
              2 /*return*/,
              new Gitpod(
                context,
                {
                  pulls: {
                    perform: (pulls && pulls.perform) || false,
                    comment:
                      (pulls && pulls.comment) ||
                      " - starts a development workspace for this pull request in code review mode and opens it in a browser IDE.",
                  },
                  issues: {
                    perform: (issues && issues.perform) || false,
                    comment:
                      (pulls && pulls.comment) ||
                      " - starts a development workspace with a preconfigured issue branch and opens it in a browser IDE.",
                    labels: new Set((issues && issues.labels) || []),
                  },
                },
                stat
              ),
            ];
        }
      });
    });
  };
  Gitpod.prototype.mark = function (kind, issue) {
    return __awaiter(this, void 0, void 0, function () {
      var github, number, html_url, body, params, id;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            if (!this.config[kind].perform || issue.locked) {
              return [2 /*return*/];
            }
            if (!this.match(kind, issue)) {
              return [2 /*return*/];
            }
            github = this.context.github;
            (number = issue.number), (html_url = issue.html_url);
            body =
              "[Open in Gitpod](https://gitpod.io#" +
              html_url +
              ")" +
              this.config[kind].comment;
            params = this.context.repo({ number: number, body: body });
            id = params.owner + "/" + params.repo + "#" + params.number;
            this.context.log.debug("Marking " + id);
            return [4 /*yield*/, github.issues.createComment(params)];
          case 1:
            _a.sent();
            this.context.log.debug(id + " has been marked");
            this.stat[kind] = this.stat[kind] + 1;
            return [2 /*return*/];
        }
      });
    });
  };
  Gitpod.prototype.match = function (kind, issue) {
    if (!this.config[kind].perform || issue.locked) {
      return false;
    }
    if (kind === "pulls") {
      return true;
    }
    var labels = this.config.issues.labels;
    if (!issue.labels || !issue.labels.length || !labels.size) {
      return false;
    }
    return issue.labels.some(function (label) {
      return labels.has(label.name);
    });
  };
  Gitpod.prototype.markAll = function (kind) {
    return __awaiter(this, void 0, void 0, function () {
      var e_1, _a, query, _b, _c, label, e_1_1;
      return __generator(this, function (_d) {
        switch (_d.label) {
          case 0:
            if (!this.config[kind].perform) {
              return [2 /*return*/];
            }
            query = this.createQuery(kind);
            if (!(kind === "pulls")) return [3 /*break*/, 2];
            return [4 /*yield*/, this.doMarkAll(kind, query)];
          case 1:
            _d.sent();
            return [2 /*return*/];
          case 2:
            _d.trys.push([2, 7, 8, 9]);
            (_b = __values(this.config.issues.labels)), (_c = _b.next());
            _d.label = 3;
          case 3:
            if (!!_c.done) return [3 /*break*/, 6];
            label = _c.value;
            return [
              4 /*yield*/,
              this.doMarkAll(kind, query + ' label:"' + label + '"'),
            ];
          case 4:
            _d.sent();
            _d.label = 5;
          case 5:
            _c = _b.next();
            return [3 /*break*/, 3];
          case 6:
            return [3 /*break*/, 9];
          case 7:
            e_1_1 = _d.sent();
            e_1 = { error: e_1_1 };
            return [3 /*break*/, 9];
          case 8:
            try {
              if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            } finally {
              if (e_1) throw e_1.error;
            }
            return [7 /*endfinally*/];
          case 9:
            return [2 /*return*/];
        }
      });
    });
  };
  Gitpod.prototype.doMarkAll = function (kind, query) {
    return __awaiter(this, void 0, void 0, function () {
      var e_2,
        _a,
        e_3,
        _b,
        pages,
        pages_1,
        pages_1_1,
        issues,
        issues_1,
        issues_1_1,
        issue,
        e_3_1,
        e_2_1;
      return __generator(this, function (_c) {
        switch (_c.label) {
          case 0:
            return [4 /*yield*/, this.findIssues(query)];
          case 1:
            pages = _c.sent();
            _c.label = 2;
          case 2:
            _c.trys.push([2, 13, 14, 15]);
            (pages_1 = __values(pages)), (pages_1_1 = pages_1.next());
            _c.label = 3;
          case 3:
            if (!!pages_1_1.done) return [3 /*break*/, 12];
            issues = pages_1_1.value;
            _c.label = 4;
          case 4:
            _c.trys.push([4, 9, 10, 11]);
            (issues_1 = __values(issues)), (issues_1_1 = issues_1.next());
            _c.label = 5;
          case 5:
            if (!!issues_1_1.done) return [3 /*break*/, 8];
            issue = issues_1_1.value;
            return [4 /*yield*/, this.mark(kind, issue)];
          case 6:
            _c.sent();
            _c.label = 7;
          case 7:
            issues_1_1 = issues_1.next();
            return [3 /*break*/, 5];
          case 8:
            return [3 /*break*/, 11];
          case 9:
            e_3_1 = _c.sent();
            e_3 = { error: e_3_1 };
            return [3 /*break*/, 11];
          case 10:
            try {
              if (issues_1_1 && !issues_1_1.done && (_b = issues_1.return))
                _b.call(issues_1);
            } finally {
              if (e_3) throw e_3.error;
            }
            return [7 /*endfinally*/];
          case 11:
            pages_1_1 = pages_1.next();
            return [3 /*break*/, 3];
          case 12:
            return [3 /*break*/, 15];
          case 13:
            e_2_1 = _c.sent();
            e_2 = { error: e_2_1 };
            return [3 /*break*/, 15];
          case 14:
            try {
              if (pages_1_1 && !pages_1_1.done && (_a = pages_1.return))
                _a.call(pages_1);
            } finally {
              if (e_2) throw e_2.error;
            }
            return [7 /*endfinally*/];
          case 15:
            return [2 /*return*/];
        }
      });
    });
  };
  Gitpod.prototype.findIssues = function (q) {
    return __awaiter(this, void 0, void 0, function () {
      var github, pages, response;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            github = this.context.github;
            pages = [];
            return [
              4 /*yield*/,
              github.search.issues({ q: q, sort: "updated", per_page: 100 }),
            ];
          case 1:
            response = _a.sent();
            pages.push(response.data.items);
            _a.label = 2;
          case 2:
            if (!github.hasNextPage(response)) return [3 /*break*/, 4];
            return [4 /*yield*/, github.getNextPage(response)];
          case 3:
            response = _a.sent();
            pages.push(response.data.items);
            return [3 /*break*/, 2];
          case 4:
            return [2 /*return*/, pages];
        }
      });
    });
  };
  Gitpod.prototype.createQuery = function (kind) {
    var _a = this.context.repo(),
      owner = _a.owner,
      repo = _a.repo;
    var type = kind === "pulls" ? "pr" : "issue";
    return (
      "NOT gitpod repo:" +
      owner +
      "/" +
      repo +
      " type:" +
      type +
      " is:open in:comments"
    );
  };
  return Gitpod;
})();
module.exports = function (app) {
  var scheduler = createScheduler(app);
  var stats = new Map();
  app.on("pull_request.opened", function (context) {
    return __awaiter(_this, void 0, void 0, function () {
      var gitpod, pull_request;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, Gitpod.create(context, scheduler, stats)];
          case 1:
            gitpod = _a.sent();
            pull_request = context.payload.pull_request;
            return [4 /*yield*/, gitpod.mark("pulls", pull_request)];
          case 2:
            _a.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  app.on("issues.opened", function (context) {
    return __awaiter(_this, void 0, void 0, function () {
      var gitpod, issue, number, _a;
      return __generator(this, function (_b) {
        switch (_b.label) {
          case 0:
            return [4 /*yield*/, Gitpod.create(context, scheduler, stats)];
          case 1:
            gitpod = _b.sent();
            issue = context.payload.issue;
            number = issue.number;
            _a = issue;
            return [
              4 /*yield*/,
              context.github.issues.getIssueLabels(
                context.repo({ number: number })
              ),
            ];
          case 2:
            _a.labels = _b.sent().data;
            return [4 /*yield*/, gitpod.mark("issues", issue)];
          case 3:
            _b.sent();
            return [2 /*return*/];
        }
      });
    });
  });
  app.on("schedule.repository", function (context) {
    return __awaiter(_this, void 0, void 0, function () {
      var gitpod;
      return __generator(this, function (_a) {
        switch (_a.label) {
          case 0:
            return [4 /*yield*/, Gitpod.create(context, scheduler, stats)];
          case 1:
            gitpod = _a.sent();
            return [4 /*yield*/, gitpod.markAll("pulls")];
          case 2:
            _a.sent();
            return [4 /*yield*/, gitpod.markAll("issues")];
          case 3:
            _a.sent();
            context.log.info(gitpod.stat);
            return [2 /*return*/];
        }
      });
    });
  });
};
//# sourceMappingURL=index.js.map
