/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import { WorkspaceInstance, PortVisibility } from "./workspace-instance";
import { RoleOrPermission } from "./permission";
import { Project } from "./teams-projects-protocol";
export interface UserInfo {
    name?: string;
}
export interface User {
    /** The user id */
    id: string;
    /** The timestamp when the user entry was created */
    creationDate: string;
    avatarUrl?: string;
    name?: string;
    /** Optional for backwards compatibility */
    fullName?: string;
    identities: Identity[];
    allowsMarketingCommunication: boolean;
    /**
     * Whether the user has been blocked to use our service, because of TOS violation for example.
     * Optional for backwards compatibility.
     */
    blocked?: boolean;
    /** A map of random settings that alter the behaviour of Gitpod on a per-user basis */
    featureFlags?: UserFeatureSettings;
    /** The permissions and/or roles the user has */
    rolesOrPermissions?: RoleOrPermission[];
    /** Whether the user is logical deleted. This flag is respected by all queries in UserDB */
    markedDeleted?: boolean;
    additionalData?: AdditionalUserData;
}
export declare namespace User {
    function is(data: any): data is User;
    function getIdentity(user: User, authProviderId: string): Identity | undefined;
    function censor(user: User): User;
    function getPrimaryEmail(user: User): string;
    function getName(user: User): string | undefined;
}
export interface AdditionalUserData {
    platforms?: UserPlatform[];
    emailNotificationSettings?: EmailNotificationSettings;
    featurePreview?: boolean;
    ideSettings?: IDESettings;
    whatsNewSeen?: {
        [key: string]: string;
    };
    oauthClientsApproved?: {
        [key: string]: string;
    };
    knownGitHubOrgs?: string[];
}
export interface EmailNotificationSettings {
    disallowTransactionalEmails?: boolean;
}
export declare type IDESettings = {
    defaultIde?: string;
};
export interface UserPlatform {
    uid: string;
    userAgent: string;
    browser: string;
    os: string;
    lastUsed: string;
    firstUsed: string;
    /**
     * Since when does the user have the browser extension installe don this device.
     */
    browserExtensionInstalledSince?: string;
    /**
     * Since when does the user not have the browser extension installed anymore (but previously had).
     */
    browserExtensionUninstalledSince?: string;
}
export interface UserFeatureSettings {
    /**
     * This field is used as marker to grant users a free trial for using private repositories,
     * independent of any subscription or Chargebee.
     *  - it is set when the user uses their first private repo
     *  - whether the trial is expired or not is juged by the UserService
     */
    privateRepoTrialStartDate?: string;
    /**
     * Permanent feature flags are added to each and every workspace instance
     * this user starts.
     */
    permanentWSFeatureFlags?: NamedWorkspaceFeatureFlag[];
}
/**
 * The values of this type MUST MATCH enum values in WorkspaceFeatureFlag from ws-manager/client/core_pb.d.ts
 * If they don't we'll break things during workspace startup.
 */
export declare const WorkspaceFeatureFlags: {
    full_workspace_backup: undefined;
    fixed_resources: undefined;
};
export declare type NamedWorkspaceFeatureFlag = keyof (typeof WorkspaceFeatureFlags);
export interface UserEnvVarValue {
    id?: string;
    name: string;
    repositoryPattern: string;
    value: string;
}
export interface UserEnvVar extends UserEnvVarValue {
    id: string;
    userId: string;
    deleted?: boolean;
}
export declare namespace UserEnvVar {
    function normalizeRepoPattern(pattern: string): string;
    function score(value: UserEnvVarValue): number;
    function filter<T extends UserEnvVarValue>(vars: T[], owner: string, repo: string): T[];
    function splitRepositoryPattern(repositoryPattern: string): string[];
}
export interface GitpodToken {
    /** Hash value (SHA256) of the token (primary key). */
    tokenHash: string;
    /** Human readable name of the token */
    name?: string;
    /** Token kind */
    type: GitpodTokenType;
    /** The user the token belongs to. */
    user: User;
    /** Scopes (e.g. limition to read-only) */
    scopes: string[];
    /** Created timestamp */
    created: string;
    deleted?: boolean;
}
export declare enum GitpodTokenType {
    API_AUTH_TOKEN = 0,
    MACHINE_AUTH_TOKEN = 1
}
export interface OneTimeSecret {
    id: string;
    value: string;
    expirationTime: string;
    deleted: boolean;
}
export interface WorkspaceInstanceUser {
    name?: string;
    avatarUrl?: string;
    instanceId: string;
    userId: string;
    lastSeen: string;
}
export interface Identity {
    authProviderId: string;
    authId: string;
    authName: string;
    primaryEmail?: string;
    /** @deprecated */
    tokens?: Token[];
    /** This is a flag that triggers the HARD DELETION of this entity */
    deleted?: boolean;
    readonly?: boolean;
}
export declare type IdentityLookup = Pick<Identity, "authProviderId" | "authId">;
export declare namespace Identity {
    function is(data: any): data is Identity;
    function equals(id1: IdentityLookup, id2: IdentityLookup): boolean;
}
export interface Token {
    value: string;
    scopes: string[];
    updateDate?: string;
    expiryDate?: string;
    idToken?: string;
    refreshToken?: string;
    username?: string;
}
export interface TokenEntry {
    uid: string;
    authProviderId: string;
    authId: string;
    token: Token;
    expiryDate?: string;
    refreshable?: boolean;
    /** This is a flag that triggers the HARD DELETION of this entity */
    deleted?: boolean;
}
export interface EmailDomainFilterEntry {
    domain: string;
    negative: boolean;
}
export interface EduEmailDomain {
    domain: string;
}
export declare type AppInstallationPlatform = "github";
export declare type AppInstallationState = "claimed.user" | "claimed.platform" | "installed" | "uninstalled";
export interface AppInstallation {
    platform: AppInstallationPlatform;
    installationID: string;
    ownerUserID?: string;
    platformUserID?: string;
    state: AppInstallationState;
    creationTime: string;
    lastUpdateTime: string;
}
export interface PendingGithubEvent {
    id: string;
    githubUserId: string;
    creationDate: Date;
    type: string;
    event: string;
}
export interface Snapshot {
    id: string;
    creationTime: string;
    originalWorkspaceId: string;
    bucketId: string;
    layoutData?: string;
}
export interface LayoutData {
    workspaceId: string;
    lastUpdatedTime: string;
    layoutData: string;
}
export interface Workspace {
    id: string;
    creationTime: string;
    contextURL: string;
    description: string;
    ownerId: string;
    projectId?: string;
    context: WorkspaceContext;
    config: WorkspaceConfig;
    /**
     * The source where to get the workspace base image from. This source is resolved
     * during workspace creation. Once a base image has been built the information in here
     * is superseded by baseImageNameResolved.
     */
    imageSource?: WorkspaceImageSource;
    /**
     * The resolved, fix name of the workspace image. We only use this
     * to access the logs during an image build.
     */
    imageNameResolved?: string;
    /**
     * The resolved/built fixed named of the base image. This field is only set if the workspace
     * already has its base image built.
     */
    baseImageNameResolved?: string;
    shareable?: boolean;
    pinned?: boolean;
    readonly deleted?: boolean;
    /**
     * Mark as deleted (user-facing). The actual deletion of the workspace content is executed
     * with a (configurable) delay
     */
    softDeleted?: WorkspaceSoftDeletion;
    /**
     * Marks the time when the workspace was marked as softDeleted. The actual deletion of the
     * workspace content happens after a configurable period
     */
    softDeletedTime?: string;
    /**
     * Marks the time when the workspace content has been deleted.
     */
    contentDeletedTime?: string;
    type: WorkspaceType;
    basedOnPrebuildId?: string;
    basedOnSnapshotId?: string;
}
export declare type WorkspaceSoftDeletion = "user" | "gc";
export declare type WorkspaceType = "regular" | "prebuild" | "probe";
export declare namespace Workspace {
    function getFullRepositoryName(ws: Workspace): string | undefined;
    function getFullRepositoryUrl(ws: Workspace): string | undefined;
    function getPullRequestNumber(ws: Workspace): number | undefined;
    function getIssueNumber(ws: Workspace): number | undefined;
    function getBranchName(ws: Workspace): string | undefined;
    function getCommit(ws: Workspace): string | undefined;
}
export interface PreparePluginUploadParams {
    fullPluginName: string;
}
export interface ResolvePluginsParams {
    config?: WorkspaceConfig;
    builtins?: ResolvedPlugins;
    vsxRegistryUrl?: string;
}
export interface InstallPluginsParams {
    pluginIds: string[];
}
export interface UninstallPluginParams {
    pluginId: string;
}
export interface GuessGitTokenScopesParams {
    host: string;
    repoUrl: string;
    gitCommand: string;
    currentToken: GitToken;
}
export interface GitToken {
    token: string;
    user: string;
    scopes: string[];
}
export interface GuessedGitTokenScopes {
    message?: string;
    scopes?: string[];
}
export declare type ResolvedPluginKind = 'user' | 'workspace' | 'builtin';
export interface ResolvedPlugins {
    [pluginId: string]: ResolvedPlugin | undefined;
}
export interface ResolvedPlugin {
    fullPluginName: string;
    url: string;
    kind: ResolvedPluginKind;
}
export interface VSCodeConfig {
    extensions?: string[];
}
export interface WorkspaceConfig {
    image?: ImageConfig;
    ports?: PortConfig[];
    tasks?: TaskConfig[];
    checkoutLocation?: string;
    workspaceLocation?: string;
    gitConfig?: {
        [config: string]: string;
    };
    github?: GithubAppConfig;
    vscode?: VSCodeConfig;
    /**
     * Where the config object originates from.
     *
     * repo - from the repository
     * project-db - from the "Project" stored in the database
     * definitly-gp - from github.com/gitpod-io/definitely-gp
     * derived - computed based on analyzing the repository
     * additional-content - config comes from additional content, usually provided through the project's configuration
     * default - our static catch-all default config
     */
    _origin?: 'repo' | 'project-db' | 'definitely-gp' | 'derived' | 'additional-content' | 'default';
    /**
     * Set of automatically infered feature flags. That's not something the user can set, but
     * that is set by gitpod at workspace creation time.
     */
    _featureFlags?: NamedWorkspaceFeatureFlag[];
}
export interface GithubAppConfig {
    prebuilds?: GithubAppPrebuildConfig;
}
export interface GithubAppPrebuildConfig {
    master?: boolean;
    branches?: boolean;
    pullRequests?: boolean;
    pullRequestsFromForks?: boolean;
    addCheck?: boolean;
    addBadge?: boolean;
    addLabel?: boolean | string;
    addComment?: boolean;
}
export declare namespace GithubAppPrebuildConfig {
    function is(obj: boolean | GithubAppPrebuildConfig): obj is GithubAppPrebuildConfig;
}
export declare type WorkspaceImageSource = WorkspaceImageSourceDocker | WorkspaceImageSourceReference;
export interface WorkspaceImageSourceDocker {
    dockerFilePath: string;
    dockerFileHash: string;
    dockerFileSource?: Commit;
}
export declare namespace WorkspaceImageSourceDocker {
    function is(obj: object): obj is WorkspaceImageSourceDocker;
}
export interface WorkspaceImageSourceReference {
    /** The resolved, fix base image reference */
    baseImageResolved: string;
}
export declare namespace WorkspaceImageSourceReference {
    function is(obj: object): obj is WorkspaceImageSourceReference;
}
export declare type PrebuiltWorkspaceState = "queued" | "building" | "aborted" | "timeout" | "available";
export interface PrebuiltWorkspace {
    id: string;
    cloneURL: string;
    branch?: string;
    projectId?: string;
    commit: string;
    buildWorkspaceId: string;
    creationTime: string;
    state: PrebuiltWorkspaceState;
    error?: string;
    snapshot?: string;
}
export declare namespace PrebuiltWorkspace {
    function isDone(pws: PrebuiltWorkspace): boolean;
    function isAvailable(pws: PrebuiltWorkspace): boolean;
    function buildDidSucceed(pws: PrebuiltWorkspace): boolean;
}
export interface PrebuiltWorkspaceUpdatable {
    id: string;
    prebuiltWorkspaceId: string;
    owner: string;
    repo: string;
    isResolved: boolean;
    installationId: string;
    issue?: string;
    contextUrl?: string;
}
export interface WhitelistedRepository {
    url: string;
    name: string;
    description?: string;
    avatar?: string;
}
export declare type PortOnOpen = 'open-browser' | 'open-preview' | 'notify' | 'ignore';
export interface PortConfig {
    port: number;
    onOpen?: PortOnOpen;
    visibility?: PortVisibility;
}
export declare namespace PortConfig {
    function is(config: any): config is PortConfig;
}
export interface PortRangeConfig {
    port: string;
    onOpen?: PortOnOpen;
}
export declare namespace PortRangeConfig {
    function is(config: any): config is PortRangeConfig;
}
export interface TaskConfig {
    name?: string;
    before?: string;
    init?: string;
    prebuild?: string;
    command?: string;
    env?: {
        [env: string]: string;
    };
    openIn?: 'bottom' | 'main' | 'left' | 'right';
    openMode?: 'split-top' | 'split-left' | 'split-right' | 'split-bottom' | 'tab-before' | 'tab-after';
}
export declare namespace TaskConfig {
    function is(config: any): config is TaskConfig;
}
export declare namespace WorkspaceImageBuild {
    type Phase = 'BaseImage' | 'GitpodLayer' | 'Error' | 'Done';
    interface StateInfo {
        phase: Phase;
        currentStep?: number;
        maxSteps?: number;
    }
    interface LogContent {
        text: string;
        upToLine?: number;
        isDiff?: boolean;
    }
    type LogCallback = (info: StateInfo, content: LogContent | undefined) => void;
    namespace LogLine {
        const DELIMITER = "\r\n";
        const DELIMITER_REGEX: RegExp;
    }
}
export declare type ImageConfig = ImageConfigString | ImageConfigFile;
export declare type ImageConfigString = string;
export declare namespace ImageConfigString {
    function is(config: ImageConfig | undefined): config is ImageConfigString;
}
export interface ImageConfigFile {
    file: string;
    context?: string;
}
export declare namespace ImageConfigFile {
    function is(config: ImageConfig | undefined): config is ImageConfigFile;
}
export interface ExternalImageConfigFile extends ImageConfigFile {
    externalSource: Commit;
}
export declare namespace ExternalImageConfigFile {
    function is(config: any | undefined): config is ExternalImageConfigFile;
}
export interface WorkspaceContext {
    title: string;
    normalizedContextURL?: string;
    forceCreateNewWorkspace?: boolean;
    forceImageBuild?: boolean;
}
export declare namespace WorkspaceContext {
    function is(context: any): context is WorkspaceContext;
}
export interface WithSnapshot {
    snapshotBucketId: string;
}
export declare namespace WithSnapshot {
    function is(context: any): context is WithSnapshot;
}
export interface WithPrebuild {
    snapshotBucketId: string;
    prebuildWorkspaceId: string;
    wasPrebuilt: true;
}
export declare namespace WithPrebuild {
    function is(context: any): context is WithPrebuild;
}
/**
 * WithDefaultConfig contexts disable the download of the gitpod.yml from the repository
 * and fall back to the built-in configuration.
 */
export interface WithDefaultConfig {
    withDefaultConfig: true;
}
export declare namespace WithDefaultConfig {
    function is(context: any): context is WithDefaultConfig;
    function mark(ctx: WorkspaceContext): WorkspaceContext & WithDefaultConfig;
}
export interface SnapshotContext extends WorkspaceContext, WithSnapshot {
    snapshotId: string;
}
export declare namespace SnapshotContext {
    function is(context: any): context is SnapshotContext;
}
export interface StartPrebuildContext extends WorkspaceContext {
    actual: WorkspaceContext;
    commitHistory?: string[];
    project?: Project;
    branch?: string;
}
export declare namespace StartPrebuildContext {
    function is(context: any): context is StartPrebuildContext;
}
export interface PrebuiltWorkspaceContext extends WorkspaceContext {
    originalContext: WorkspaceContext;
    prebuiltWorkspace: PrebuiltWorkspace;
    snapshotBucketId?: string;
}
export declare namespace PrebuiltWorkspaceContext {
    function is(context: any): context is PrebuiltWorkspaceContext;
}
export interface WithEnvvarsContext extends WorkspaceContext {
    envvars: UserEnvVarValue[];
}
export declare namespace WithEnvvarsContext {
    function is(context: any): context is WithEnvvarsContext;
}
export interface WorkspaceProbeContext extends WorkspaceContext {
    responseURL: string;
    responseToken: string;
}
export declare namespace WorkspaceProbeContext {
    function is(context: any): context is WorkspaceProbeContext;
}
export declare type RefType = "branch" | "tag" | "revision";
export declare namespace RefType {
    const getRefType: (commit: Commit) => RefType;
}
export interface Commit {
    repository: Repository;
    revision: string;
    ref?: string;
    refType?: RefType;
}
export interface AdditionalContentContext extends WorkspaceContext {
    /**
     * utf-8 encoded contents that will be copied on top of the workspace's filesystem
     */
    additionalFiles: {
        [filePath: string]: string;
    };
}
export declare namespace AdditionalContentContext {
    function is(ctx: any): ctx is AdditionalContentContext;
    function hasDockerConfig(ctx: any, config: WorkspaceConfig): boolean;
}
export interface CommitContext extends WorkspaceContext, Commit {
    /** @deprecated Moved to .repository.cloneUrl, left here for backwards-compatibility for old workspace contextes in the DB */
    cloneUrl?: string;
}
export declare namespace CommitContext {
    function is(commit: any): commit is CommitContext;
}
export interface PullRequestContext extends CommitContext {
    nr: number;
    ref: string;
    base: {
        repository: Repository;
        ref: string;
    };
}
export declare namespace PullRequestContext {
    function is(ctx: any): ctx is PullRequestContext;
}
export interface IssueContext extends CommitContext {
    nr: number;
    ref: string;
    localBranch: string;
}
export declare namespace IssueContext {
    function is(ctx: any): ctx is IssueContext;
}
export interface NavigatorContext extends CommitContext {
    path: string;
    isFile: boolean;
}
export declare namespace NavigatorContext {
    function is(ctx: any): ctx is NavigatorContext;
}
export interface Repository {
    host: string;
    owner: string;
    name: string;
    cloneUrl: string;
    description?: string;
    avatarUrl?: string;
    webUrl?: string;
    defaultBranch?: string;
    /** Optional for backwards compatibility */
    private?: boolean;
    fork?: {
        parent: Repository;
    };
}
export interface Branch {
    name: string;
    commit: CommitInfo;
    htmlUrl: string;
}
export interface CommitInfo {
    author: string;
    sha: string;
    commitMessage: string;
    authorAvatarUrl?: string;
    authorDate?: string;
}
export declare namespace Repository {
    function fullRepoName(repo: Repository): string;
}
export interface WorkspaceInstancePortsChangedEvent {
    type: "PortsChanged";
    instanceID: string;
    portsOpened: number[];
    portsClosed: number[];
}
export declare namespace WorkspaceInstancePortsChangedEvent {
    function is(data: any): data is WorkspaceInstancePortsChangedEvent;
}
export interface WorkspaceInfo {
    workspace: Workspace;
    latestInstance?: WorkspaceInstance;
}
export declare namespace WorkspaceInfo {
    function lastActiveISODate(info: WorkspaceInfo): string;
}
export declare type RunningWorkspaceInfo = WorkspaceInfo & {
    latestInstance: WorkspaceInstance;
};
export interface WorkspaceCreationResult {
    createdWorkspaceId?: string;
    workspaceURL?: string;
    existingWorkspaces?: WorkspaceInfo[];
    runningWorkspacePrebuild?: {
        prebuildID: string;
        workspaceID: string;
        instanceID: string;
        starting: RunningWorkspacePrebuildStarting;
        sameCluster: boolean;
    };
    runningPrebuildWorkspaceID?: string;
}
export declare type RunningWorkspacePrebuildStarting = 'queued' | 'starting' | 'running';
export declare enum CreateWorkspaceMode {
    Default = "default",
    ForceNew = "force-new",
    UsePrebuild = "use-prebuild",
    SelectIfRunning = "select-if-running"
}
export declare namespace WorkspaceCreationResult {
    function is(data: any): data is WorkspaceCreationResult;
}
export interface UserMessage {
    readonly id: string;
    readonly title?: string;
    /**
     * date from where on this message should be shown
     */
    readonly from?: string;
    readonly content?: string;
    readonly url?: string;
}
export interface AuthProviderInfo {
    readonly authProviderId: string;
    readonly authProviderType: string;
    readonly host: string;
    readonly ownerId?: string;
    readonly verified: boolean;
    readonly isReadonly?: boolean;
    readonly hiddenOnDashboard?: boolean;
    readonly loginContextMatcher?: string;
    readonly disallowLogin?: boolean;
    readonly icon?: string;
    readonly description?: string;
    readonly settingsUrl?: string;
    readonly scopes?: string[];
    readonly requirements?: {
        readonly default: string[];
        readonly publicRepo: string[];
        readonly privateRepo: string[];
    };
}
export interface AuthProviderEntry {
    readonly id: string;
    readonly type: AuthProviderEntry.Type;
    readonly host: string;
    readonly ownerId: string;
    readonly status: AuthProviderEntry.Status;
    readonly oauth: OAuth2Config;
}
export interface OAuth2Config {
    readonly clientId: string;
    readonly clientSecret: string;
    readonly callBackUrl: string;
    readonly authorizationUrl: string;
    readonly tokenUrl: string;
    readonly scope?: string;
    readonly scopeSeparator?: string;
    readonly settingsUrl?: string;
    readonly authorizationParams?: {
        [key: string]: string;
    };
    readonly configURL?: string;
}
export declare namespace AuthProviderEntry {
    type Type = "GitHub" | "GitLab" | string;
    type Status = "pending" | "verified";
    type NewEntry = Pick<AuthProviderEntry, "ownerId" | "host" | "type"> & {
        clientId?: string;
        clientSecret?: string;
    };
    type UpdateEntry = Pick<AuthProviderEntry, "id" | "ownerId"> & Pick<OAuth2Config, "clientId" | "clientSecret">;
    function redact(entry: AuthProviderEntry): AuthProviderEntry;
}
export interface Branding {
    readonly name: string;
    readonly favicon?: string;
    /** Either including domain OR absolute path (interpreted relative to host URL) */
    readonly logo: string;
    readonly startupLogo: string;
    readonly showProductivityTips: boolean;
    readonly redirectUrlIfNotAuthenticated?: string;
    readonly redirectUrlAfterLogout?: string;
    readonly homepage: string;
    readonly ide?: {
        readonly logo: string;
        readonly showReleaseNotes: boolean;
        readonly helpMenu: Branding.Link[];
    };
    readonly links: {
        readonly header: Branding.Link[];
        readonly footer: Branding.Link[];
        readonly social: Branding.SocialLink[];
        readonly legal: Branding.Link[];
    };
}
export declare namespace Branding {
    interface Link {
        readonly name: string;
        readonly url: string;
    }
    interface SocialLink {
        readonly type: string;
        readonly url: string;
    }
}
export interface Configuration {
    readonly daysBeforeGarbageCollection: number;
    readonly garbageCollectionStartDate: number;
}
export interface TheiaPlugin {
    id: string;
    pluginName: string;
    pluginId?: string;
    /**
     * Id of the user which uploaded this plugin.
     */
    userId?: string;
    bucketName: string;
    path: string;
    hash?: string;
    state: TheiaPlugin.State;
}
export declare namespace TheiaPlugin {
    enum State {
        Uploading = "uploading",
        Uploaded = "uploaded",
        CheckinFailed = "checkin-failed"
    }
}
export interface TermsAcceptanceEntry {
    readonly userId: string;
    readonly termsRevision: string;
    readonly acceptionTime: string;
}
export interface Terms {
    readonly revision: string;
    readonly activeSince: string;
    readonly adminOnlyTerms: boolean;
    readonly updateMessage: string;
    readonly content: string;
    readonly formElements?: object;
}
//# sourceMappingURL=protocol.d.ts.map