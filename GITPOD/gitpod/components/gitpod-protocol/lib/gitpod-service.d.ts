/**
 * Copyright (c) 2020 Gitpod GmbH. All rights reserved.
 * Licensed under the GNU Affero General Public License (AGPL).
 * See License-AGPL.txt in the project root for license information.
 */
import {
  User,
  WorkspaceInfo,
  WorkspaceCreationResult,
  WorkspaceInstanceUser,
  WhitelistedRepository,
  WorkspaceImageBuild,
  AuthProviderInfo,
  Branding,
  CreateWorkspaceMode,
  Token,
  UserEnvVarValue,
  ResolvePluginsParams,
  PreparePluginUploadParams,
  Terms,
  ResolvedPlugins,
  Configuration,
  InstallPluginsParams,
  UninstallPluginParams,
  UserInfo,
  GitpodTokenType,
  GitpodToken,
  AuthProviderEntry,
  GuessGitTokenScopesParams,
  GuessedGitTokenScopes,
} from "./protocol";
import {
  Team,
  TeamMemberInfo,
  TeamMembershipInvite,
  Project,
  PrebuildInfo,
  TeamMemberRole,
} from "./teams-projects-protocol";
import { JsonRpcProxy, JsonRpcServer } from "./messaging/proxy-factory";
import { Disposable } from "vscode-jsonrpc";
import { HeadlessLogUrls } from "./headless-workspace-log";
import { WorkspaceInstance, WorkspaceInstancePort } from "./workspace-instance";
import { AdminServer } from "./admin-protocol";
import { PermissionName } from "./permission";
import { LicenseService } from "./license-protocol";
import { AccountStatement, CreditAlert } from "./accounting-protocol";
import { GithubUpgradeURL, PlanCoupon } from "./payment-protocol";
import {
  TeamSubscription,
  TeamSubscriptionSlot,
  TeamSubscriptionSlotResolved,
} from "./team-subscription-protocol";
import { RemoteTrackMessage } from "./analytics";
export interface GitpodClient {
  onInstanceUpdate(instance: WorkspaceInstance): void;
  onWorkspaceImageBuildLogs: WorkspaceImageBuild.LogCallback;
  onCreditAlert(creditAlert: CreditAlert): void;
  notifyDidOpenConnection(): void;
  notifyDidCloseConnection(): void;
}
export declare const GitpodServer: unique symbol;
export interface GitpodServer
  extends JsonRpcServer<GitpodClient>,
    AdminServer,
    LicenseService {
  getLoggedInUser(): Promise<User>;
  getTerms(): Promise<Terms>;
  updateLoggedInUser(user: Partial<User>): Promise<User>;
  getAuthProviders(): Promise<AuthProviderInfo[]>;
  getOwnAuthProviders(): Promise<AuthProviderEntry[]>;
  updateOwnAuthProvider(
    params: GitpodServer.UpdateOwnAuthProviderParams
  ): Promise<AuthProviderEntry>;
  deleteOwnAuthProvider(
    params: GitpodServer.DeleteOwnAuthProviderParams
  ): Promise<void>;
  getBranding(): Promise<Branding>;
  getConfiguration(): Promise<Configuration>;
  getToken(
    query: GitpodServer.GetTokenSearchOptions
  ): Promise<Token | undefined>;
  /**
   * @deprecated
   */
  getPortAuthenticationToken(workspaceId: string): Promise<Token>;
  deleteAccount(): Promise<void>;
  getClientRegion(): Promise<string | undefined>;
  hasPermission(permission: PermissionName): Promise<boolean>;
  getWorkspaces(
    options: GitpodServer.GetWorkspacesOptions
  ): Promise<WorkspaceInfo[]>;
  getWorkspaceOwner(workspaceId: string): Promise<UserInfo | undefined>;
  getWorkspaceUsers(workspaceId: string): Promise<WorkspaceInstanceUser[]>;
  getFeaturedRepositories(): Promise<WhitelistedRepository[]>;
  getWorkspace(id: string): Promise<WorkspaceInfo>;
  isWorkspaceOwner(workspaceId: string): Promise<boolean>;
  /**
   * Creates and starts a workspace for the given context URL.
   * @param options GitpodServer.CreateWorkspaceOptions
   * @return WorkspaceCreationResult
   */
  createWorkspace(
    options: GitpodServer.CreateWorkspaceOptions
  ): Promise<WorkspaceCreationResult>;
  startWorkspace(
    id: string,
    options: GitpodServer.StartWorkspaceOptions
  ): Promise<StartWorkspaceResult>;
  stopWorkspace(id: string): Promise<void>;
  deleteWorkspace(id: string): Promise<void>;
  setWorkspaceDescription(id: string, desc: string): Promise<void>;
  controlAdmission(
    id: string,
    level: GitpodServer.AdmissionLevel
  ): Promise<void>;
  updateWorkspaceUserPin(
    id: string,
    action: GitpodServer.PinAction
  ): Promise<void>;
  sendHeartBeat(options: GitpodServer.SendHeartBeatOptions): Promise<void>;
  watchWorkspaceImageBuildLogs(workspaceId: string): Promise<void>;
  isPrebuildDone(pwsid: string): Promise<boolean>;
  getHeadlessLog(instanceId: string): Promise<HeadlessLogUrls>;
  setWorkspaceTimeout(
    workspaceId: string,
    duration: WorkspaceTimeoutDuration
  ): Promise<SetWorkspaceTimeoutResult>;
  getWorkspaceTimeout(workspaceId: string): Promise<GetWorkspaceTimeoutResult>;
  sendHeartBeat(options: GitpodServer.SendHeartBeatOptions): Promise<void>;
  updateWorkspaceUserPin(
    id: string,
    action: GitpodServer.PinAction
  ): Promise<void>;
  getOpenPorts(workspaceId: string): Promise<WorkspaceInstancePort[]>;
  openPort(
    workspaceId: string,
    port: WorkspaceInstancePort
  ): Promise<WorkspaceInstancePort | undefined>;
  closePort(workspaceId: string, port: number): Promise<void>;
  getUserStorageResource(
    options: GitpodServer.GetUserStorageResourceOptions
  ): Promise<string>;
  updateUserStorageResource(
    options: GitpodServer.UpdateUserStorageResourceOptions
  ): Promise<void>;
  getEnvVars(): Promise<UserEnvVarValue[]>;
  getAllEnvVars(): Promise<UserEnvVarValue[]>;
  setEnvVar(variable: UserEnvVarValue): Promise<void>;
  deleteEnvVar(variable: UserEnvVarValue): Promise<void>;
  getTeams(): Promise<Team[]>;
  getTeamMembers(teamId: string): Promise<TeamMemberInfo[]>;
  createTeam(name: string): Promise<Team>;
  joinTeam(inviteId: string): Promise<Team>;
  setTeamMemberRole(
    teamId: string,
    userId: string,
    role: TeamMemberRole
  ): Promise<void>;
  removeTeamMember(teamId: string, userId: string): Promise<void>;
  getGenericInvite(teamId: string): Promise<TeamMembershipInvite>;
  resetGenericInvite(inviteId: string): Promise<TeamMembershipInvite>;
  getProviderRepositoriesForUser(
    params: GetProviderRepositoriesParams
  ): Promise<ProviderRepository[]>;
  createProject(params: CreateProjectParams): Promise<Project>;
  deleteProject(projectId: string): Promise<void>;
  getTeamProjects(teamId: string): Promise<Project[]>;
  getUserProjects(): Promise<Project[]>;
  getProjectOverview(projectId: string): Promise<Project.Overview | undefined>;
  findPrebuilds(params: FindPrebuildsParams): Promise<PrebuildInfo[]>;
  triggerPrebuild(projectId: string, branch: string): Promise<void>;
  setProjectConfiguration(
    projectId: string,
    configString: string
  ): Promise<void>;
  fetchProjectRepositoryConfiguration(
    projectId: string
  ): Promise<string | undefined>;
  getContentBlobUploadUrl(name: string): Promise<string>;
  getContentBlobDownloadUrl(name: string): Promise<string>;
  getGitpodTokens(): Promise<GitpodToken[]>;
  generateNewGitpodToken(
    options: GitpodServer.GenerateNewGitpodTokenOptions
  ): Promise<string>;
  deleteGitpodToken(tokenHash: string): Promise<void>;
  sendFeedback(feedback: string): Promise<string | undefined>;
  registerGithubApp(installationId: string): Promise<void>;
  /**
   * Stores a new snapshot for the given workspace and bucketId
   * @return the snapshot id
   */
  takeSnapshot(options: GitpodServer.TakeSnapshotOptions): Promise<string>;
  /**
   * Returns the list of snapshots that exist for a workspace.
   */
  getSnapshots(workspaceID: string): Promise<string[]>;
  /**
   * stores/updates layout information for the given workspace
   */
  storeLayout(workspaceId: string, layoutData: string): Promise<void>;
  /**
   * retrieves layout information for the given workspace
   */
  getLayout(workspaceId: string): Promise<string | undefined>;
  /**
   * @param params
   * @returns promise resolves to an URL to be used for the upload
   */
  preparePluginUpload(params: PreparePluginUploadParams): Promise<string>;
  resolvePlugins(
    workspaceId: string,
    params: ResolvePluginsParams
  ): Promise<ResolvedPlugins>;
  installUserPlugins(params: InstallPluginsParams): Promise<boolean>;
  uninstallUserPlugin(params: UninstallPluginParams): Promise<boolean>;
  guessGitTokenScopes(
    params: GuessGitTokenScopesParams
  ): Promise<GuessedGitTokenScopes>;
  /**
   * gitpod.io concerns
   */
  isStudent(): Promise<boolean>;
  getPrivateRepoTrialEndDate(): Promise<string | undefined>;
  /**
   *
   */
  getAccountStatement(
    options: GitpodServer.GetAccountStatementOptions
  ): Promise<AccountStatement | undefined>;
  getRemainingUsageHours(): Promise<number>;
  /**
   *
   */
  getChargebeeSiteId(): Promise<string>;
  createPortalSession(): Promise<{}>;
  checkout(planId: string, planQuantity?: number): Promise<{}>;
  getAvailableCoupons(): Promise<PlanCoupon[]>;
  getAppliedCoupons(): Promise<PlanCoupon[]>;
  getShowPaymentUI(): Promise<boolean>;
  isChargebeeCustomer(): Promise<boolean>;
  mayAccessPrivateRepo(): Promise<boolean>;
  subscriptionUpgradeTo(
    subscriptionId: string,
    chargebeePlanId: string
  ): Promise<void>;
  subscriptionDowngradeTo(
    subscriptionId: string,
    chargebeePlanId: string
  ): Promise<void>;
  subscriptionCancel(subscriptionId: string): Promise<void>;
  subscriptionCancelDowngrade(subscriptionId: string): Promise<void>;
  tsGet(): Promise<TeamSubscription[]>;
  tsGetSlots(): Promise<TeamSubscriptionSlotResolved[]>;
  tsGetUnassignedSlot(
    teamSubscriptionId: string
  ): Promise<TeamSubscriptionSlot | undefined>;
  tsAddSlots(teamSubscriptionId: string, quantity: number): Promise<void>;
  tsAssignSlot(
    teamSubscriptionId: string,
    teamSubscriptionSlotId: string,
    identityStr: string | undefined
  ): Promise<void>;
  tsReassignSlot(
    teamSubscriptionId: string,
    teamSubscriptionSlotId: string,
    newIdentityStr: string
  ): Promise<void>;
  tsDeactivateSlot(
    teamSubscriptionId: string,
    teamSubscriptionSlotId: string
  ): Promise<void>;
  tsReactivateSlot(
    teamSubscriptionId: string,
    teamSubscriptionSlotId: string
  ): Promise<void>;
  getGithubUpgradeUrls(): Promise<GithubUpgradeURL[]>;
  /**
   * Analytics
   */
  trackEvent(event: RemoteTrackMessage): Promise<void>;
}
export interface CreateProjectParams {
  name: string;
  account: string;
  provider: string;
  cloneUrl: string;
  teamId?: string;
  userId?: string;
  appInstallationId: string;
}
export interface FindPrebuildsParams {
  projectId: string;
  branch?: string;
  latest?: boolean;
  prebuildId?: string;
}
export interface GetProviderRepositoriesParams {
  provider: string;
  hints?:
    | {
        installationId: string;
      }
    | object;
}
export interface ProviderRepository {
  name: string;
  account: string;
  accountAvatarUrl: string;
  cloneUrl: string;
  updatedAt: string;
  installationId?: number;
  installationUpdatedAt?: string;
  inUse?: boolean;
}
export declare const WorkspaceTimeoutValues: readonly ["30m", "60m", "180m"];
export declare const createServiceMock: <
  C extends GitpodClient,
  S extends GitpodServer
>(
  methods: Partial<JsonRpcProxy<S>>
) => GitpodServiceImpl<C, S>;
export declare const createServerMock: <
  C extends GitpodClient,
  S extends GitpodServer
>(
  methods: Partial<JsonRpcProxy<S>>
) => JsonRpcProxy<S>;
declare type WorkspaceTimeoutDurationTuple = typeof WorkspaceTimeoutValues;
export declare type WorkspaceTimeoutDuration =
  WorkspaceTimeoutDurationTuple[number];
export interface SetWorkspaceTimeoutResult {
  resetTimeoutOnWorkspaces: string[];
}
export interface GetWorkspaceTimeoutResult {
  duration: WorkspaceTimeoutDuration;
  canChange: boolean;
}
export interface StartWorkspaceResult {
  instanceID: string;
  workspaceURL?: string;
}
export declare namespace GitpodServer {
  interface GetWorkspacesOptions {
    limit?: number;
    searchString?: string;
    pinnedOnly?: boolean;
    projectId?: string;
  }
  interface GetAccountStatementOptions {
    date?: string;
  }
  interface CreateWorkspaceOptions {
    contextUrl: string;
    mode?: CreateWorkspaceMode;
    forceDefaultConfig?: boolean;
  }
  interface StartWorkspaceOptions {
    forceDefaultImage: boolean;
  }
  interface TakeSnapshotOptions {
    workspaceId: string;
    layoutData?: string;
  }
  interface GetUserStorageResourceOptions {
    readonly uri: string;
  }
  interface UpdateUserStorageResourceOptions {
    readonly uri: string;
    readonly content: string;
  }
  interface GetTokenSearchOptions {
    readonly host: string;
  }
  interface SendHeartBeatOptions {
    readonly instanceId: string;
    readonly wasClosed?: boolean;
    readonly roundTripTime?: number;
  }
  interface UpdateOwnAuthProviderParams {
    readonly entry: AuthProviderEntry.UpdateEntry | AuthProviderEntry.NewEntry;
  }
  interface DeleteOwnAuthProviderParams {
    readonly id: string;
  }
  type AdmissionLevel = "owner" | "everyone";
  type PinAction = "pin" | "unpin" | "toggle";
  interface GenerateNewGitpodTokenOptions {
    name?: string;
    type: GitpodTokenType;
    scopes?: string[];
  }
}
export declare const GitpodServerPath = "/gitpod";
export declare const GitpodServerProxy: unique symbol;
export declare type GitpodServerProxy<S extends GitpodServer> = JsonRpcProxy<S>;
export declare class GitpodCompositeClient<Client extends GitpodClient>
  implements GitpodClient
{
  protected clients: Partial<Client>[];
  registerClient(client: Partial<Client>): Disposable;
  onInstanceUpdate(instance: WorkspaceInstance): void;
  onWorkspaceImageBuildLogs(
    info: WorkspaceImageBuild.StateInfo,
    content: WorkspaceImageBuild.LogContent | undefined
  ): void;
  notifyDidOpenConnection(): void;
  notifyDidCloseConnection(): void;
  onCreditAlert(creditAlert: CreditAlert): void;
}
export declare type GitpodService = GitpodServiceImpl<
  GitpodClient,
  GitpodServer
>;
export declare class WorkspaceInstanceUpdateListener {
  private readonly service;
  private _info;
  private readonly onDidChangeEmitter;
  readonly onDidChange: import("./util/event").Event<void>;
  private source;
  get info(): WorkspaceInfo;
  constructor(service: GitpodService, _info: WorkspaceInfo);
  private syncQueue;
  private syncTokenSource;
  /**
   * Only one sync can be performed at the same time.
   * Any new sync request or instance update cancels all previously scheduled sync requests.
   */
  private sync;
  private cancelSync;
  /**
   * If sync seen more recent update then ignore all updates with previous phases.
   * Within the same phase still the race can occur but which should be eventually consistent.
   */
  private isOutOfOrder;
}
export interface GitpodServiceOptions {
  onReconnect?: () => void | Promise<void>;
}
export declare class GitpodServiceImpl<
  Client extends GitpodClient,
  Server extends GitpodServer
> {
  readonly server: JsonRpcProxy<Server>;
  private options?;
  private readonly compositeClient;
  constructor(
    server: JsonRpcProxy<Server>,
    options?: GitpodServiceOptions | undefined
  );
  registerClient(client: Partial<Client>): Disposable;
  private readonly instanceListeners;
  listenToInstance(
    workspaceId: string
  ): Promise<WorkspaceInstanceUpdateListener>;
  reconnect(): Promise<void>;
}
export declare function createGitpodService<
  C extends GitpodClient,
  S extends GitpodServer
>(serverUrl: string | Promise<string>): GitpodServiceImpl<C, S>;
export {};
//# sourceMappingURL=gitpod-service.d.ts.map
