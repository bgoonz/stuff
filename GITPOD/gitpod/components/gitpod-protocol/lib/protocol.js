"use strict";
/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TheiaPlugin = exports.AuthProviderEntry = exports.WorkspaceCreationResult = exports.CreateWorkspaceMode = exports.WorkspaceInfo = exports.WorkspaceInstancePortsChangedEvent = exports.Repository = exports.NavigatorContext = exports.IssueContext = exports.PullRequestContext = exports.CommitContext = exports.AdditionalContentContext = exports.RefType = exports.WorkspaceProbeContext = exports.WithEnvvarsContext = exports.PrebuiltWorkspaceContext = exports.StartPrebuildContext = exports.SnapshotContext = exports.WithDefaultConfig = exports.WithPrebuild = exports.WithSnapshot = exports.WorkspaceContext = exports.ExternalImageConfigFile = exports.ImageConfigFile = exports.ImageConfigString = exports.WorkspaceImageBuild = exports.TaskConfig = exports.PortRangeConfig = exports.PortConfig = exports.PrebuiltWorkspace = exports.WorkspaceImageSourceReference = exports.WorkspaceImageSourceDocker = exports.GithubAppPrebuildConfig = exports.Workspace = exports.Identity = exports.GitpodTokenType = exports.UserEnvVar = exports.WorkspaceFeatureFlags = exports.User = void 0;
var User;
(function (User) {
    function is(data) {
        return data
            && data.hasOwnProperty('id')
            && data.hasOwnProperty('identities');
    }
    User.is = is;
    function getIdentity(user, authProviderId) {
        return user.identities.find(function (id) { return id.authProviderId === authProviderId; });
    }
    User.getIdentity = getIdentity;
    function censor(user) {
        var res = __assign({}, user);
        delete (res.additionalData);
        res.identities = res.identities.map(function (i) {
            delete (i.tokens);
            // The user field is not in the Identity shape, but actually exists on DBIdentity.
            // Trying to push this object out via JSON RPC will fail because of the cyclic nature
            // of this field.
            delete (i.user);
            return i;
        });
        return res;
    }
    User.censor = censor;
    function getPrimaryEmail(user) {
        var identities = user.identities.filter(function (i) { return !!i.primaryEmail; });
        if (identities.length <= 0) {
            throw new Error("No identity with primary email for user: " + user.id + "!");
        }
        return identities[0].primaryEmail;
    }
    User.getPrimaryEmail = getPrimaryEmail;
    function getName(user) {
        var e_1, _a;
        var name = user.fullName || user.name;
        if (name) {
            return name;
        }
        try {
            for (var _b = __values(user.identities), _c = _b.next(); !_c.done; _c = _b.next()) {
                var id = _c.value;
                if (id.authName !== "") {
                    return id.authName;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return undefined;
    }
    User.getName = getName;
})(User = exports.User || (exports.User = {}));
/**
 * The values of this type MUST MATCH enum values in WorkspaceFeatureFlag from ws-manager/client/core_pb.d.ts
 * If they don't we'll break things during workspace startup.
 */
exports.WorkspaceFeatureFlags = { "full_workspace_backup": undefined, "fixed_resources": undefined };
var UserEnvVar;
(function (UserEnvVar) {
    function normalizeRepoPattern(pattern) {
        return pattern.toLocaleLowerCase();
    }
    UserEnvVar.normalizeRepoPattern = normalizeRepoPattern;
    function score(value) {
        // We use a score to enforce precedence:
        //      value/value = 0
        //      value/*     = 1
        //      */value     = 2
        //      */*         = 3
        //      #/#         = 4 (used for env vars passed through the URL)
        // the lower the score, the higher the precedence.
        var _a = __read(splitRepositoryPattern(value.repositoryPattern), 2), ownerPattern = _a[0], repoPattern = _a[1];
        var score = 0;
        if (repoPattern == "*") {
            score += 1;
        }
        if (ownerPattern == '*') {
            score += 2;
        }
        if (ownerPattern == "#" || repoPattern == "#") {
            score = 4;
        }
        return score;
    }
    UserEnvVar.score = score;
    function filter(vars, owner, repo) {
        var e_2, _a, e_3, _b;
        var result = vars.filter(function (e) {
            var _a = __read(splitRepositoryPattern(e.repositoryPattern), 2), ownerPattern = _a[0], repoPattern = _a[1];
            if (ownerPattern !== '*' && ownerPattern !== '#' && (!!owner && ownerPattern !== owner.toLocaleLowerCase())) {
                return false;
            }
            if (repoPattern !== '*' && repoPattern !== '#' && (!!repo && repoPattern !== repo.toLocaleLowerCase())) {
                return false;
            }
            return true;
        });
        var resmap = new Map();
        result.forEach(function (e) {
            var l = (resmap.get(e.name) || []);
            l.push(e);
            resmap.set(e.name, l);
        });
        result = [];
        try {
            for (var _c = __values(resmap.keys()), _d = _c.next(); !_d.done; _d = _c.next()) {
                var name_1 = _d.value;
                var candidates = resmap.get(name_1);
                if (!candidates) {
                    // not sure how this can happen, but so be it
                    continue;
                }
                if (candidates.length == 1) {
                    result.push(candidates[0]);
                    continue;
                }
                var minscore = 10;
                var bestCandidate = void 0;
                try {
                    for (var candidates_1 = (e_3 = void 0, __values(candidates)), candidates_1_1 = candidates_1.next(); !candidates_1_1.done; candidates_1_1 = candidates_1.next()) {
                        var e = candidates_1_1.value;
                        var score_1 = UserEnvVar.score(e);
                        if (!bestCandidate || score_1 < minscore) {
                            minscore = score_1;
                            bestCandidate = e;
                        }
                    }
                }
                catch (e_3_1) { e_3 = { error: e_3_1 }; }
                finally {
                    try {
                        if (candidates_1_1 && !candidates_1_1.done && (_b = candidates_1.return)) _b.call(candidates_1);
                    }
                    finally { if (e_3) throw e_3.error; }
                }
                result.push(bestCandidate);
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (_d && !_d.done && (_a = _c.return)) _a.call(_c);
            }
            finally { if (e_2) throw e_2.error; }
        }
        return result;
    }
    UserEnvVar.filter = filter;
    function splitRepositoryPattern(repositoryPattern) {
        var patterns = repositoryPattern.split('/');
        var repoPattern = patterns.pop() || "";
        var ownerPattern = patterns.join('/');
        return [ownerPattern, repoPattern];
    }
    UserEnvVar.splitRepositoryPattern = splitRepositoryPattern;
})(UserEnvVar = exports.UserEnvVar || (exports.UserEnvVar = {}));
var GitpodTokenType;
(function (GitpodTokenType) {
    GitpodTokenType[GitpodTokenType["API_AUTH_TOKEN"] = 0] = "API_AUTH_TOKEN";
    GitpodTokenType[GitpodTokenType["MACHINE_AUTH_TOKEN"] = 1] = "MACHINE_AUTH_TOKEN";
})(GitpodTokenType = exports.GitpodTokenType || (exports.GitpodTokenType = {}));
var Identity;
(function (Identity) {
    function is(data) {
        return data.hasOwnProperty('authProviderId')
            && data.hasOwnProperty('authId')
            && data.hasOwnProperty('authName');
    }
    Identity.is = is;
    function equals(id1, id2) {
        return id1.authProviderId === id2.authProviderId
            && id1.authId === id2.authId;
    }
    Identity.equals = equals;
})(Identity = exports.Identity || (exports.Identity = {}));
var Workspace;
(function (Workspace) {
    function getFullRepositoryName(ws) {
        if (CommitContext.is(ws.context)) {
            return ws.context.repository.owner + '/' + ws.context.repository.name;
        }
        return undefined;
    }
    Workspace.getFullRepositoryName = getFullRepositoryName;
    function getFullRepositoryUrl(ws) {
        if (CommitContext.is(ws.context)) {
            return "https://" + ws.context.repository.host + "/" + getFullRepositoryName(ws);
        }
        return undefined;
    }
    Workspace.getFullRepositoryUrl = getFullRepositoryUrl;
    function getPullRequestNumber(ws) {
        if (PullRequestContext.is(ws.context)) {
            return ws.context.nr;
        }
        return undefined;
    }
    Workspace.getPullRequestNumber = getPullRequestNumber;
    function getIssueNumber(ws) {
        if (IssueContext.is(ws.context)) {
            return ws.context.nr;
        }
        return undefined;
    }
    Workspace.getIssueNumber = getIssueNumber;
    function getBranchName(ws) {
        if (CommitContext.is(ws.context)) {
            return ws.context.ref;
        }
        return undefined;
    }
    Workspace.getBranchName = getBranchName;
    function getCommit(ws) {
        if (CommitContext.is(ws.context)) {
            return ws.context.revision && ws.context.revision.substr(0, 8);
        }
        return undefined;
    }
    Workspace.getCommit = getCommit;
})(Workspace = exports.Workspace || (exports.Workspace = {}));
var GithubAppPrebuildConfig;
(function (GithubAppPrebuildConfig) {
    function is(obj) {
        return !(typeof obj === 'boolean');
    }
    GithubAppPrebuildConfig.is = is;
})(GithubAppPrebuildConfig = exports.GithubAppPrebuildConfig || (exports.GithubAppPrebuildConfig = {}));
var WorkspaceImageSourceDocker;
(function (WorkspaceImageSourceDocker) {
    function is(obj) {
        return 'dockerFileHash' in obj
            && 'dockerFilePath' in obj;
    }
    WorkspaceImageSourceDocker.is = is;
})(WorkspaceImageSourceDocker = exports.WorkspaceImageSourceDocker || (exports.WorkspaceImageSourceDocker = {}));
var WorkspaceImageSourceReference;
(function (WorkspaceImageSourceReference) {
    function is(obj) {
        return 'baseImageResolved' in obj;
    }
    WorkspaceImageSourceReference.is = is;
})(WorkspaceImageSourceReference = exports.WorkspaceImageSourceReference || (exports.WorkspaceImageSourceReference = {}));
var PrebuiltWorkspace;
(function (PrebuiltWorkspace) {
    function isDone(pws) {
        return pws.state === "available" || pws.state === "timeout" || pws.state === 'aborted';
    }
    PrebuiltWorkspace.isDone = isDone;
    function isAvailable(pws) {
        return pws.state === "available" && !!pws.snapshot;
    }
    PrebuiltWorkspace.isAvailable = isAvailable;
    function buildDidSucceed(pws) {
        return pws.state === "available" && !pws.error;
    }
    PrebuiltWorkspace.buildDidSucceed = buildDidSucceed;
})(PrebuiltWorkspace = exports.PrebuiltWorkspace || (exports.PrebuiltWorkspace = {}));
var PortConfig;
(function (PortConfig) {
    function is(config) {
        return config && ('port' in config) && (typeof config.port === 'number');
    }
    PortConfig.is = is;
})(PortConfig = exports.PortConfig || (exports.PortConfig = {}));
var PortRangeConfig;
(function (PortRangeConfig) {
    function is(config) {
        return config && ('port' in config) && (typeof config.port === 'string' || config.port instanceof String);
    }
    PortRangeConfig.is = is;
})(PortRangeConfig = exports.PortRangeConfig || (exports.PortRangeConfig = {}));
var TaskConfig;
(function (TaskConfig) {
    function is(config) {
        return config
            && ('command' in config || 'init' in config || 'before' in config);
    }
    TaskConfig.is = is;
})(TaskConfig = exports.TaskConfig || (exports.TaskConfig = {}));
var WorkspaceImageBuild;
(function (WorkspaceImageBuild) {
    var LogLine;
    (function (LogLine) {
        LogLine.DELIMITER = '\r\n';
        LogLine.DELIMITER_REGEX = /\r?\n/;
    })(LogLine = WorkspaceImageBuild.LogLine || (WorkspaceImageBuild.LogLine = {}));
})(WorkspaceImageBuild = exports.WorkspaceImageBuild || (exports.WorkspaceImageBuild = {}));
var ImageConfigString;
(function (ImageConfigString) {
    function is(config) {
        return typeof config === 'string';
    }
    ImageConfigString.is = is;
})(ImageConfigString = exports.ImageConfigString || (exports.ImageConfigString = {}));
var ImageConfigFile;
(function (ImageConfigFile) {
    function is(config) {
        return typeof config === 'object'
            && 'file' in config;
    }
    ImageConfigFile.is = is;
})(ImageConfigFile = exports.ImageConfigFile || (exports.ImageConfigFile = {}));
var ExternalImageConfigFile;
(function (ExternalImageConfigFile) {
    function is(config) {
        return typeof config === 'object'
            && 'file' in config
            && 'externalSource' in config;
    }
    ExternalImageConfigFile.is = is;
})(ExternalImageConfigFile = exports.ExternalImageConfigFile || (exports.ExternalImageConfigFile = {}));
var WorkspaceContext;
(function (WorkspaceContext) {
    function is(context) {
        return context
            && 'title' in context;
    }
    WorkspaceContext.is = is;
})(WorkspaceContext = exports.WorkspaceContext || (exports.WorkspaceContext = {}));
var WithSnapshot;
(function (WithSnapshot) {
    function is(context) {
        return context
            && 'snapshotBucketId' in context;
    }
    WithSnapshot.is = is;
})(WithSnapshot = exports.WithSnapshot || (exports.WithSnapshot = {}));
var WithPrebuild;
(function (WithPrebuild) {
    function is(context) {
        return context
            && 'snapshotBucketId' in context
            && 'prebuildWorkspaceId' in context
            && 'wasPrebuilt' in context;
    }
    WithPrebuild.is = is;
})(WithPrebuild = exports.WithPrebuild || (exports.WithPrebuild = {}));
var WithDefaultConfig;
(function (WithDefaultConfig) {
    function is(context) {
        return context
            && 'withDefaultConfig' in context
            && context.withDefaultConfig;
    }
    WithDefaultConfig.is = is;
    function mark(ctx) {
        return __assign(__assign({}, ctx), { withDefaultConfig: true });
    }
    WithDefaultConfig.mark = mark;
})(WithDefaultConfig = exports.WithDefaultConfig || (exports.WithDefaultConfig = {}));
var SnapshotContext;
(function (SnapshotContext) {
    function is(context) {
        return context
            && WithSnapshot.is(context)
            && 'snapshotId' in context;
    }
    SnapshotContext.is = is;
})(SnapshotContext = exports.SnapshotContext || (exports.SnapshotContext = {}));
var StartPrebuildContext;
(function (StartPrebuildContext) {
    function is(context) {
        return context
            && 'actual' in context;
    }
    StartPrebuildContext.is = is;
})(StartPrebuildContext = exports.StartPrebuildContext || (exports.StartPrebuildContext = {}));
var PrebuiltWorkspaceContext;
(function (PrebuiltWorkspaceContext) {
    function is(context) {
        return context
            && 'originalContext' in context
            && 'prebuiltWorkspace' in context;
    }
    PrebuiltWorkspaceContext.is = is;
})(PrebuiltWorkspaceContext = exports.PrebuiltWorkspaceContext || (exports.PrebuiltWorkspaceContext = {}));
var WithEnvvarsContext;
(function (WithEnvvarsContext) {
    function is(context) {
        return context
            && 'envvars' in context;
    }
    WithEnvvarsContext.is = is;
})(WithEnvvarsContext = exports.WithEnvvarsContext || (exports.WithEnvvarsContext = {}));
var WorkspaceProbeContext;
(function (WorkspaceProbeContext) {
    function is(context) {
        return context
            && 'responseURL' in context
            && 'responseToken' in context;
    }
    WorkspaceProbeContext.is = is;
})(WorkspaceProbeContext = exports.WorkspaceProbeContext || (exports.WorkspaceProbeContext = {}));
var RefType;
(function (RefType) {
    RefType.getRefType = function (commit) {
        if (!commit.ref) {
            return "revision";
        }
        // This fallback is meant to handle the cases where (for historic reasons) ref is present but refType is missing
        return commit.refType || "branch";
    };
})(RefType = exports.RefType || (exports.RefType = {}));
var AdditionalContentContext;
(function (AdditionalContentContext) {
    function is(ctx) {
        return 'additionalFiles' in ctx;
    }
    AdditionalContentContext.is = is;
    function hasDockerConfig(ctx, config) {
        return is(ctx) && ImageConfigFile.is(config.image) && !!ctx.additionalFiles[config.image.file];
    }
    AdditionalContentContext.hasDockerConfig = hasDockerConfig;
})(AdditionalContentContext = exports.AdditionalContentContext || (exports.AdditionalContentContext = {}));
var CommitContext;
(function (CommitContext) {
    function is(commit) {
        return WorkspaceContext.is(commit)
            && 'repository' in commit
            && 'revision' in commit;
    }
    CommitContext.is = is;
})(CommitContext = exports.CommitContext || (exports.CommitContext = {}));
var PullRequestContext;
(function (PullRequestContext) {
    function is(ctx) {
        return CommitContext.is(ctx)
            && 'nr' in ctx
            && 'ref' in ctx
            && 'base' in ctx;
    }
    PullRequestContext.is = is;
})(PullRequestContext = exports.PullRequestContext || (exports.PullRequestContext = {}));
var IssueContext;
(function (IssueContext) {
    function is(ctx) {
        return CommitContext.is(ctx)
            && 'nr' in ctx
            && 'ref' in ctx
            && 'localBranch' in ctx;
    }
    IssueContext.is = is;
})(IssueContext = exports.IssueContext || (exports.IssueContext = {}));
var NavigatorContext;
(function (NavigatorContext) {
    function is(ctx) {
        return CommitContext.is(ctx)
            && 'path' in ctx
            && 'isFile' in ctx;
    }
    NavigatorContext.is = is;
})(NavigatorContext = exports.NavigatorContext || (exports.NavigatorContext = {}));
var Repository;
(function (Repository) {
    function fullRepoName(repo) {
        return repo.host + "/" + repo.owner + "/" + repo.name;
    }
    Repository.fullRepoName = fullRepoName;
})(Repository = exports.Repository || (exports.Repository = {}));
var WorkspaceInstancePortsChangedEvent;
(function (WorkspaceInstancePortsChangedEvent) {
    function is(data) {
        return data && data.type == "PortsChanged";
    }
    WorkspaceInstancePortsChangedEvent.is = is;
})(WorkspaceInstancePortsChangedEvent = exports.WorkspaceInstancePortsChangedEvent || (exports.WorkspaceInstancePortsChangedEvent = {}));
var WorkspaceInfo;
(function (WorkspaceInfo) {
    function lastActiveISODate(info) {
        var _a;
        return ((_a = info.latestInstance) === null || _a === void 0 ? void 0 : _a.creationTime) || info.workspace.creationTime;
    }
    WorkspaceInfo.lastActiveISODate = lastActiveISODate;
})(WorkspaceInfo = exports.WorkspaceInfo || (exports.WorkspaceInfo = {}));
var CreateWorkspaceMode;
(function (CreateWorkspaceMode) {
    // Default returns a running prebuild if there is any, otherwise creates a new workspace (using a prebuild if one is available)
    CreateWorkspaceMode["Default"] = "default";
    // ForceNew creates a new workspace irrespective of any running prebuilds. This mode is guaranteed to actually create a workspace - but may degrade user experience as currently runnig prebuilds are ignored.
    CreateWorkspaceMode["ForceNew"] = "force-new";
    // UsePrebuild polls the database waiting for a currently running prebuild to become available. This mode exists to handle the db-sync delay.
    CreateWorkspaceMode["UsePrebuild"] = "use-prebuild";
    // SelectIfRunning returns a list of currently running workspaces for the context URL if there are any, otherwise falls back to Default mode
    CreateWorkspaceMode["SelectIfRunning"] = "select-if-running";
})(CreateWorkspaceMode = exports.CreateWorkspaceMode || (exports.CreateWorkspaceMode = {}));
var WorkspaceCreationResult;
(function (WorkspaceCreationResult) {
    function is(data) {
        return data && ('createdWorkspaceId' in data
            || 'existingWorkspaces' in data
            || 'runningWorkspacePrebuild' in data
            || 'runningPrebuildWorkspaceID' in data);
    }
    WorkspaceCreationResult.is = is;
})(WorkspaceCreationResult = exports.WorkspaceCreationResult || (exports.WorkspaceCreationResult = {}));
var AuthProviderEntry;
(function (AuthProviderEntry) {
    function redact(entry) {
        return __assign(__assign({}, entry), { oauth: __assign(__assign({}, entry.oauth), { clientSecret: "redacted" }) });
    }
    AuthProviderEntry.redact = redact;
})(AuthProviderEntry = exports.AuthProviderEntry || (exports.AuthProviderEntry = {}));
var TheiaPlugin;
(function (TheiaPlugin) {
    var State;
    (function (State) {
        State["Uploading"] = "uploading";
        State["Uploaded"] = "uploaded";
        State["CheckinFailed"] = "checkin-failed";
    })(State = TheiaPlugin.State || (TheiaPlugin.State = {}));
})(TheiaPlugin = exports.TheiaPlugin || (exports.TheiaPlugin = {}));
//# sourceMappingURL=protocol.js.map