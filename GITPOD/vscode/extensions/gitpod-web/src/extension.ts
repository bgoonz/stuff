/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Gitpod. All rights reserved.
 *--------------------------------------------------------------------------------------------*/

/// <reference path='../../../src/vs/vscode.d.ts'/>
/// <reference path='../../../src/vs/vscode.proposed.d.ts'/>

import * as workspaceInstance from '@gitpod/gitpod-protocol/lib/workspace-instance';
import * as grpc from '@grpc/grpc-js';
import * as fs from 'fs';
import type * as keytarType from 'keytar';
import fetch from 'node-fetch';
import * as path from 'path';
import { URL } from 'url';
import * as util from 'util';
import * as vscode from 'vscode';
import * as rpc from 'vscode-jsonrpc';
import type { ServerExtensionHostConnection } from '../../../src/vs/gitpod/node/server-extension-host-connection';
import type { GitpodExtension, GitpodExtensionContext, GitpodPluginModel, port, status } from 'gitpod/src/gitpod';
import { ThrottledDelayer } from './async';

export async function activate(context: vscode.ExtensionContext) {
	const gitpodExtension = vscode.extensions.getExtension<GitpodExtension | undefined>('gitpod.gitpod')!.exports;
	if (!gitpodExtension) {
		return;
	}
	const gitpodContext = gitpodExtension.newContext(context);
	registerAuth(gitpodContext);
	registerPorts(gitpodContext);

	const codeServer = new GitpodCodeServer();
	registerCLI(codeServer, gitpodContext);
	registerExtensionManagement(codeServer, gitpodContext);
	await gitpodContext.active;
}

export function deactivate() { }

class MessageReader extends rpc.IPCMessageReader {
	override listen(callback: rpc.DataCallback): void {
		super.listen((msg: any) => {
			if ('jsonrpc' in msg) {
				callback(msg);
			}
		});
	}
}

export class GitpodCodeServer implements vscode.Disposable {
	private readonly onDidInstallExtensionEmitter = new vscode.EventEmitter<void>();
	readonly onDidInstallExtension = this.onDidInstallExtensionEmitter.event;

	private readonly onDidUninstallExtensionEmitter = new vscode.EventEmitter<void>();
	readonly onDidUninstallExtension = this.onDidUninstallExtensionEmitter.event;

	readonly connection = rpc.createMessageConnection(
		new MessageReader(process),
		new rpc.IPCMessageWriter(process),
		console
	) as any as ServerExtensionHostConnection;;

	private readonly toDispose = vscode.Disposable.from(this.onDidInstallExtensionEmitter, this.onDidUninstallExtensionEmitter, this.connection);

	constructor() {
		this.connection.onNotification('onDidInstallExtension', () => this.onDidInstallExtensionEmitter.fire(undefined));
		this.connection.onNotification('onDidUninstallExtension', () => this.onDidUninstallExtensionEmitter.fire(undefined));
		this.connection.listen();
	}

	dispose(): void {
		this.toDispose.dispose();
	}
}

export function registerAuth(context: GitpodExtensionContext): void {
	type Keytar = {
		getPassword: typeof keytarType['getPassword'];
		setPassword: typeof keytarType['setPassword'];
		deletePassword: typeof keytarType['deletePassword'];
	};
	interface SessionData {
		id: string;
		account?: {
			label?: string;
			displayName?: string;
			id: string;
		}
		scopes: string[];
		accessToken: string;
	}
	interface UserInfo {
		id: string;
		accountName: string;
	}
	async function resolveAuthenticationSession(data: SessionData, resolveUser: (data: SessionData) => Promise<UserInfo>): Promise<vscode.AuthenticationSession> {
		const needsUserInfo = !data.account;
		const userInfo = needsUserInfo ? await resolveUser(data) : undefined;
		return {
			id: data.id,
			account: {
				label: data.account
					? data.account.label || data.account.displayName!
					: userInfo!.accountName,
				id: data.account?.id ?? userInfo!.id
			},
			scopes: data.scopes,
			accessToken: data.accessToken
		};
	}
	function hasScopes(session: vscode.AuthenticationSession, scopes?: readonly string[]): boolean {
		return !scopes || scopes.every(scope => session.scopes.indexOf(scope) !== -1);
	}
	//#endregion

	//#region gitpod auth
	context.pendingActivate.push((async () => {
		const sessions: vscode.AuthenticationSession[] = [];
		const onDidChangeSessionsEmitter = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
		try {
			const resolveGitpodUser = async () => {
				const owser = await context.owner;
				return {
					id: owser.id,
					accountName: owser.name!
				};
			};
			if (vscode.env.uiKind === vscode.UIKind.Web) {
				const keytar: Keytar = require('keytar');
				const value = await keytar.getPassword(`${vscode.env.uriScheme}-gitpod.login`, 'account');
				if (value) {
					await keytar.deletePassword(`${vscode.env.uriScheme}-gitpod.login`, 'account');
					const sessionData: SessionData[] = JSON.parse(value);
					if (sessionData.length) {
						const session = await resolveAuthenticationSession(sessionData[0], resolveGitpodUser);
						sessions.push(session);
					}
				}
			} else {
				const getTokenRequest = new context.supervisor.GetTokenRequest();
				getTokenRequest.setKind('gitpod');
				getTokenRequest.setHost(context.info.getGitpodApi()!.getHost());
				const scopes = [
					'function:accessCodeSyncStorage'
				];
				for (const scope of scopes) {
					getTokenRequest.addScope(scope);
				}
				const getTokenResponse = await util.promisify(context.supervisor.token.getToken.bind(context.supervisor.token, getTokenRequest, context.supervisor.metadata, {
					deadline: Date.now() + context.supervisor.deadlines.long
				}))();
				const accessToken = getTokenResponse.getToken();
				const session = await resolveAuthenticationSession({
					// current session ID should remain stable between window reloads
					// otherwise setting sync will log out
					id: 'gitpod-current-session',
					accessToken,
					scopes
				}, resolveGitpodUser);
				sessions.push(session);
				onDidChangeSessionsEmitter.fire({ added: [session] });
			}
		} catch (e) {
			console.error('Failed to restore Gitpod session:', e);
		}
		context.subscriptions.push(onDidChangeSessionsEmitter);
		context.subscriptions.push(vscode.authentication.registerAuthenticationProvider('gitpod', 'Gitpod', {
			onDidChangeSessions: onDidChangeSessionsEmitter.event,
			getSessions: scopes => {
				if (!scopes) {
					return Promise.resolve(sessions);
				}
				return Promise.resolve(sessions.filter(session => hasScopes(session, scopes)));
			},
			createSession: async () => {
				throw new Error('not supported');
			},
			removeSession: async () => {
				throw new Error('not supported');
			},
		}, { supportsMultipleAccounts: false }));
	})());
	//#endregion gitpod auth

	//#region github auth
	context.pendingActivate.push((async () => {
		const onDidChangeGitHubSessionsEmitter = new vscode.EventEmitter<vscode.AuthenticationProviderAuthenticationSessionsChangeEvent>();
		let gitHubSessionID = 'github-session';
		let gitHubSession: vscode.AuthenticationSession | undefined;

		async function resolveGitHubUser(data: SessionData): Promise<UserInfo> {
			const userResponse = await fetch('https://api.github.com/user', {
				headers: {
					Authorization: `token ${data.accessToken}`,
					'User-Agent': 'Gitpod-Code'
				}
			});
			if (!userResponse.ok) {
				throw new Error(`Getting GitHub account info failed: ${userResponse.statusText}`);
			}
			const user: { id: string, login: string } = await userResponse.json();
			return {
				id: user.id,
				accountName: user.login
			};
		}

		async function loginGitHub(scopes?: readonly string[]): Promise<vscode.AuthenticationSession> {
			const getTokenRequest = new context.supervisor.GetTokenRequest();
			getTokenRequest.setKind('git');
			getTokenRequest.setHost('github.com');
			if (scopes) {
				for (const scope of scopes) {
					getTokenRequest.addScope(scope);
				}
			}
			const getTokenResponse = await util.promisify(context.supervisor.token.getToken.bind(context.supervisor.token, getTokenRequest, context.supervisor.metadata, {
				deadline: Date.now() + context.supervisor.deadlines.long
			}))();
			const accessToken = getTokenResponse.getToken();
			gitHubSession = await resolveAuthenticationSession({
				id: gitHubSessionID,
				accessToken,
				scopes: getTokenResponse.getScopeList()
			}, resolveGitHubUser);
			onDidChangeGitHubSessionsEmitter.fire({ added: [gitHubSession] });
			return gitHubSession;
		}

		try {
			await loginGitHub();
		} catch (e) {
			console.error('Failed an initial GitHub login:', e);
		}

		context.subscriptions.push(vscode.authentication.registerAuthenticationProvider('github', 'GitHub', {
			onDidChangeSessions: onDidChangeGitHubSessionsEmitter.event,
			getSessions: scopes => {
				const sessions = [];
				if (gitHubSession && hasScopes(gitHubSession, scopes)) {
					sessions.push(gitHubSession);
				}
				return Promise.resolve(sessions);
			},
			createSession: async scopes => {
				try {
					const session = await loginGitHub(scopes);
					return session;
				} catch (e) {
					console.error('GitHub sign in failed: ', e);
					throw e;
				}
			},
			removeSession: async id => {
				if (id === gitHubSession?.id) {
					const session = gitHubSession;
					gitHubSession = undefined;
					onDidChangeGitHubSessionsEmitter.fire({ removed: [session] });
				}
			},
		}, { supportsMultipleAccounts: false }));
	})());
}

export class GitpodWorkspacePort extends vscode.TreeItem {
	status?: status.PortsStatus.AsObject;
	tunnel?: vscode.TunnelDescription;
	readonly localUrl: string;
	constructor(
		readonly portNumber: number,
		private readonly context: GitpodExtensionContext
	) {
		super('' + portNumber);
		this.localUrl = 'http://localhost:' + this.portNumber;
	}
	openExternal() {
		return vscode.env.openExternal(vscode.Uri.parse(this.localUrl));
	}
	get externalUrl(): string {
		if (this.tunnel) {
			const localAddress = typeof this.tunnel.localAddress === 'string' ? this.tunnel.localAddress : this.tunnel.localAddress.host + ':' + this.tunnel.localAddress.port;
			return localAddress.startsWith('http') ? localAddress : `http://${localAddress}`;
		}
		return this.status?.exposed?.url || this.localUrl;
	}
	get remotePort(): number | undefined {
		if (this.tunnel) {
			if (typeof this.tunnel.localAddress === 'string') {
				try {
					return Number(new URL(this.tunnel.localAddress).port);
				} catch {
					return undefined;
				}
			}
			return this.tunnel.localAddress.port;
		}
		return undefined;
	}
	async setPortVisibility(visibility: workspaceInstance.PortVisibility): Promise<void> {
		if (this.status) {
			await this.context.gitpod.server.openPort(this.context.info.getWorkspaceId(), {
				port: this.status.localPort,
				targetPort: this.status.globalPort,
				visibility
			});
		}
	}
	async setTunnelVisibility(visibility: port.TunnelVisiblity): Promise<void> {
		const request = new this.context.supervisor.TunnelPortRequest();
		request.setPort(this.portNumber);
		request.setTargetPort(this.portNumber);
		request.setVisibility(visibility);
		await util.promisify(this.context.supervisor.port.tunnel.bind(this.context.supervisor.port, request, this.context.supervisor.metadata, {
			deadline: Date.now() + this.context.supervisor.deadlines.normal
		}))();
	}
}

interface ExposedPort extends status.PortsStatus.AsObject {
	exposed: status.ExposedPortInfo.AsObject
}
function isExposedPort(port: status.PortsStatus.AsObject | undefined): port is ExposedPort {
	return !!port?.exposed;
}
interface ExposedServedPort extends ExposedPort {
	served: true
}
function isExposedServedPort(port: status.PortsStatus.AsObject | undefined): port is ExposedServedPort {
	return isExposedPort(port) && !!port.served;
}
interface ExposedServedGitpodWorkspacePort extends GitpodWorkspacePort {
	status: ExposedServedPort
}
function isExposedServedGitpodWorkspacePort(port: GitpodWorkspacePort | undefined): port is ExposedServedGitpodWorkspacePort {
	return port instanceof GitpodWorkspacePort && isExposedServedPort(port.status);
}

class GitpodWorksapcePorts extends vscode.TreeItem {
	readonly ports = new Map<number, GitpodWorkspacePort>();
	constructor() {
		super('Ports', vscode.TreeItemCollapsibleState.Expanded);
	}
}

type GitpodWorkspaceElement = GitpodWorksapcePorts | GitpodWorkspacePort;

export class GitpodWorkspaceTreeDataProvider implements vscode.TreeDataProvider<GitpodWorkspaceElement> {

	readonly ports = new GitpodWorksapcePorts();

	protected readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<GitpodWorkspaceElement | undefined>();
	readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

	private readonly onDidExposeServedPortEmitter = new vscode.EventEmitter<ExposedServedGitpodWorkspacePort>();
	readonly onDidExposeServedPort = this.onDidExposeServedPortEmitter.event;

	constructor(
		private readonly context: GitpodExtensionContext
	) {
	}

	getTreeItem(element: GitpodWorkspaceElement): vscode.TreeItem {
		return element;
	}

	getChildren(element?: GitpodWorkspaceElement): vscode.ProviderResult<GitpodWorkspaceElement[]> {
		if (!element) {
			return [this.ports];
		}
		if (element === this.ports) {
			return [...this.ports.ports.values()];
		}
		return [];
	}

	getParent(element: GitpodWorkspaceElement): GitpodWorkspaceElement | undefined {
		if (element instanceof GitpodWorkspacePort) {
			return this.ports;
		}
		return undefined;
	}

	readonly tunnels = new Map<number, vscode.TunnelDescription>();
	updateTunnels(tunnels: vscode.TunnelDescription[]): void {
		this.tunnels.clear();
		for (const tunnel of tunnels) {
			this.tunnels.set(tunnel.remoteAddress.port, tunnel);
		}
		this.update();
	}

	private portStatus: status.PortsStatusResponse | undefined;
	updatePortsStatus(portsStatus: status.PortsStatusResponse): void {
		this.portStatus = portsStatus;
		this.update();
	}

	private updating = false;
	private update(): void {
		if (this.updating) {
			return;
		}
		this.updating = true;
		try {
			if (!this.portStatus) {
				return;
			}
			const toClean = new Set<number>(this.ports.ports.keys());
			for (const portStatus of this.portStatus.getPortsList()) {
				const portNumber = portStatus.getLocalPort();
				toClean?.delete(portNumber);
				const port = this.ports.ports.get(portNumber) || new GitpodWorkspacePort(portNumber, this.context);
				this.ports.ports.set(portNumber, port);
				const currentStatus = port.status;
				port.status = portStatus.toObject();
				port.tunnel = this.tunnels.get(portNumber);

				port.label = '' + portNumber;
				const remotePort = port.remotePort;
				if (remotePort && remotePort !== portNumber) {
					port.label += ':' + remotePort;
				}

				const exposed = portStatus.getExposed();
				const accessible = exposed || port.tunnel;
				if (!portStatus.getServed()) {
					port.description = 'not served';
					port.iconPath = new vscode.ThemeIcon('circle-outline');
				} else if (!accessible) {
					if (portStatus.getAutoExposure() === this.context.supervisor.PortAutoExposure.FAILED) {
						port.description = 'failed to expose';
						port.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('editorWarning.foreground'));
					} else {
						port.description = 'detecting...';
						port.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('editorWarning.foreground'));
					}
				} else {
					port.description = 'open';
					if (port.tunnel) {
						port.description += ` on ${!!port.tunnel.public ? 'all interfaces' : 'localhost'}`;
					}
					if (exposed) {
						port.description += ` ${exposed.getVisibility() === this.context.supervisor.PortVisibility.PUBLIC ? '(public)' : '(private)'}`;
					}
					port.iconPath = new vscode.ThemeIcon('circle-filled', new vscode.ThemeColor('ports.iconRunningProcessForeground'));
				}

				port.contextValue = 'port';
				if (portStatus.getServed()) {
					port.contextValue = 'served-' + port.contextValue;
				}
				if (exposed) {
					port.contextValue = 'exposed-' + port.contextValue;
					if (exposed.getVisibility() === this.context.supervisor.PortVisibility.PUBLIC) {
						port.contextValue = 'public-' + port.contextValue;
					} else {
						port.contextValue = 'private-' + port.contextValue;
					}
				}
				if (port.tunnel) {
					port.contextValue = 'tunneled-' + port.contextValue;
					if (!!port.tunnel.public) {
						port.contextValue = 'network-' + port.contextValue;
					} else {
						port.contextValue = 'host-' + port.contextValue;
					}
				}
				if (!accessible && portStatus.getAutoExposure() === this.context.supervisor.PortAutoExposure.FAILED) {
					port.contextValue = 'failed-' + port.contextValue;
				}
				if (isExposedServedGitpodWorkspacePort(port) && !isExposedServedPort(currentStatus)) {
					this.onDidExposeServedPortEmitter.fire(port);
				}
			}

			for (const portNumber of toClean) {
				this.ports.ports.delete(portNumber);
			}

			this.onDidChangeTreeDataEmitter.fire(this.ports);
		} finally {
			this.updating = false;
		}
	}
}

export function registerPorts(context: GitpodExtensionContext): void {
	const gitpodWorkspaceTreeDataProvider = new GitpodWorkspaceTreeDataProvider(context);
	const workspaceView = vscode.window.createTreeView('gitpod.workspace', {
		treeDataProvider: gitpodWorkspaceTreeDataProvider,
	});
	context.subscriptions.push(workspaceView);

	function observePortsStatus(): vscode.Disposable {
		let run = true;
		let stopUpdates: Function | undefined;
		(async () => {
			while (run) {
				try {
					const req = new context.supervisor.PortsStatusRequest();
					req.setObserve(true);
					const evts = context.supervisor.status.portsStatus(req, context.supervisor.metadata);
					stopUpdates = evts.cancel.bind(evts);

					await new Promise((resolve, reject) => {
						evts.on('end', resolve);
						evts.on('error', reject);
						evts.on('data', (update: status.PortsStatusResponse) => {
							gitpodWorkspaceTreeDataProvider.updatePortsStatus(update);
						});
					});
				} catch (err) {
					if (!('code' in err && err.code === grpc.status.CANCELLED)) {
						console.error('cannot maintain connection to supervisor', err);
					}
				} finally {
					stopUpdates = undefined;
				}
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		})();
		return new vscode.Disposable(() => {
			run = false;
			if (stopUpdates) {
				stopUpdates();
			}
		});
	}
	context.subscriptions.push(observePortsStatus());
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.resolveExternalPort', (portNumber: number) => {
		return new Promise<string>(async (resolve, reject) => {
			try {
				const tryResolve = () => {
					const port = gitpodWorkspaceTreeDataProvider.ports.ports.get(portNumber);
					const exposed = port?.status?.exposed;
					if (exposed) {
						resolve(exposed.url);
						return true;
					}
					return false;
				};
				if (!tryResolve()) {
					const listener = gitpodWorkspaceTreeDataProvider.onDidChangeTreeData(element => {
						if (element === gitpodWorkspaceTreeDataProvider.ports && tryResolve()) {
							listener.dispose();
						}
					});
					const request = new context.supervisor.ExposePortRequest();
					request.setPort(portNumber);
					request.setTargetPort(portNumber);
					await util.promisify(context.supervisor.control.exposePort.bind(context.supervisor.control, request, context.supervisor.metadata, {
						deadline: Date.now() + context.supervisor.deadlines.normal
					}))();
				}
			} catch (e) {
				reject(e);
			}
		});
	}));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.makePrivate', (port: GitpodWorkspacePort) =>
		port.setPortVisibility('private')
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.makePublic', (port: GitpodWorkspacePort) =>
		port.setPortVisibility('public')
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.tunnelNetwork', (port: GitpodWorkspacePort) =>
		port.setTunnelVisibility(context.supervisor.TunnelVisiblity.NETWORK)
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.tunnelHost', async (port: GitpodWorkspacePort) =>
		port.setTunnelVisibility(context.supervisor.TunnelVisiblity.HOST)
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.preview', (port: GitpodWorkspacePort) =>
		openPreview(port)
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.openBrowser', (port: GitpodWorkspacePort) =>
		port.openExternal()
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.retryAutoExpose', async (port: GitpodWorkspacePort) => {
		const request = new context.supervisor.RetryAutoExposeRequest();
		request.setPort(port.portNumber);
		await util.promisify(context.supervisor.port.retryAutoExpose.bind(context.supervisor.port, request, context.supervisor.metadata, {
			deadline: Date.now() + context.supervisor.deadlines.normal
		}))();
	}));

	const portsStatusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right);
	context.subscriptions.push(portsStatusBarItem);
	function updateStatusBar(): void {
		const exposedPorts: number[] = [];

		for (const port of gitpodWorkspaceTreeDataProvider.ports.ports.values()) {
			if (isExposedServedGitpodWorkspacePort(port)) {
				exposedPorts.push(port.status.localPort);
			}
		}

		let text: string;
		let tooltip = 'Click to open "Ports View"';
		if (exposedPorts.length) {
			text = 'Ports:';
			tooltip += '\n\nPorts';
			text += ` ${exposedPorts.join(', ')}`;
			tooltip += `\nPublic: ${exposedPorts.join(', ')}`;
		} else {
			text = '$(circle-slash) No open ports';
		}

		portsStatusBarItem.text = text;
		portsStatusBarItem.tooltip = tooltip;
		portsStatusBarItem.command = 'gitpod.ports.reveal';
		portsStatusBarItem.show();
	}
	updateStatusBar();
	context.subscriptions.push(gitpodWorkspaceTreeDataProvider.onDidChangeTreeData(() => updateStatusBar()));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.ports.reveal', () => {
		workspaceView.reveal(gitpodWorkspaceTreeDataProvider.ports, {
			focus: true,
			expand: true
		});
	}));

	const currentNotifications = new Set<number>();
	async function showOpenServiceNotification(port: GitpodWorkspacePort, offerMakePublic = false): Promise<void> {
		const localPort = port.portNumber;
		if (currentNotifications.has(localPort)) {
			return;
		}

		const makePublic = 'Make Public';
		const openAction = 'Open Preview';
		const openExternalAction = 'Open Browser';
		const actions = offerMakePublic ? [makePublic, openAction, openExternalAction] : [openAction, openExternalAction];

		currentNotifications.add(localPort);
		const result = await vscode.window.showInformationMessage('A service is available on port ' + localPort, ...actions);
		currentNotifications.delete(localPort);

		if (result === makePublic) {
			await port.setPortVisibility('public');
		} else if (result === openAction) {
			await openPreview(port);
		} else if (result === openExternalAction) {
			await port.openExternal();
		}
	}
	async function openPreview(port: GitpodWorkspacePort): Promise<void> {
		await previewUrl(port.externalUrl.toString());
	}
	async function previewUrl(url: string): Promise<void> {
		await vscode.commands.executeCommand('simpleBrowser.api.open', url, {
			viewColumn: vscode.ViewColumn.Beside,
			preserveFocus: true
		});
	}
	context.subscriptions.push(gitpodWorkspaceTreeDataProvider.onDidExposeServedPort(port => {
		if (port.status.exposed.onExposed === context.supervisor.OnPortExposedAction.IGNORE) {
			return;
		}

		if (port.status.exposed.onExposed === context.supervisor.OnPortExposedAction.OPEN_BROWSER) {
			port.openExternal();
			return;
		}

		if (port.status.exposed.onExposed === context.supervisor.OnPortExposedAction.OPEN_PREVIEW) {
			openPreview(port);
			return;
		}

		if (port.status.exposed.onExposed === context.supervisor.OnPortExposedAction.NOTIFY) {
			showOpenServiceNotification(port);
			return;
		}

		if (port.status.exposed.onExposed === context.supervisor.OnPortExposedAction.NOTIFY_PRIVATE) {
			showOpenServiceNotification(port, port.status.exposed.visibility !== context.supervisor.PortVisibility.PUBLIC);
			return;
		}
	}));

	let updateTunnelsTokenSource: vscode.CancellationTokenSource | undefined;
	async function updateTunnels(): Promise<void> {
		if (updateTunnelsTokenSource) {
			updateTunnelsTokenSource.cancel();
		}
		updateTunnelsTokenSource = new vscode.CancellationTokenSource();
		const token = updateTunnelsTokenSource.token;
		// not vscode.workspace.tunnels because of https://github.com/microsoft/vscode/issues/124334
		const currentTunnels = (await vscode.commands.executeCommand('gitpod.getTunnels')) as vscode.TunnelDescription[];
		if (token.isCancellationRequested) {
			return;
		}
		gitpodWorkspaceTreeDataProvider.updateTunnels(currentTunnels);
	}
	updateTunnels();
	context.subscriptions.push(vscode.workspace.onDidChangeTunnels(() => updateTunnels()));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.vscode.workspace.openTunnel', (tunnelOptions: vscode.TunnelOptions) => {
		return vscode.workspace.openTunnel(tunnelOptions);
	}));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.api.openTunnel', async (tunnelOptions: vscode.TunnelOptions, _tunnelCreationOptions: vscode.TunnelCreationOptions) => {
		const request = new context.supervisor.TunnelPortRequest();
		request.setPort(tunnelOptions.remoteAddress.port);
		request.setTargetPort(tunnelOptions.localAddressPort || tunnelOptions.remoteAddress.port);
		request.setVisibility(!!tunnelOptions?.public ? context.supervisor.TunnelVisiblity.NETWORK : context.supervisor.TunnelVisiblity.HOST);
		await util.promisify(context.supervisor.port.tunnel.bind(context.supervisor.port, request, context.supervisor.metadata, {
			deadline: Date.now() + context.supervisor.deadlines.normal
		}))();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.api.closeTunnel', async (port: number) => {
		const request = new context.supervisor.CloseTunnelRequest();
		request.setPort(port);
		await util.promisify(context.supervisor.port.closeTunnel.bind(context.supervisor.port, request, context.supervisor.metadata, {
			deadline: Date.now() + context.supervisor.deadlines.normal
		}))();
	}));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.dev.enableForwardedPortsView', () =>
		vscode.commands.executeCommand('setContext', 'forwardedPortsViewEnabled', true)
	));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.dev.connectLocalApp', async () => {
		const apiPortInput = await vscode.window.showInputBox({
			title: 'Connect to Local App',
			prompt: 'Enter Local App API port',
			value: '63100',
			validateInput: value => {
				const port = Number(value);
				if (port <= 0) {
					return 'port should be greater than 0';
				}
				if (port >= 65535) {
					return 'port should be less than 65535';
				}
				return undefined;
			}
		});
		if (apiPortInput) {
			const apiPort = Number(apiPortInput);
			vscode.commands.executeCommand('gitpod.api.connectLocalApp', apiPort);
		}
	}));
}

export function registerCLI(codeServer: GitpodCodeServer, context: GitpodExtensionContext): void {
	const ipcHookCli = context.ipcHookCli;
	if (context.ipcHookCli) {
		function updateIpcHookCli(): void {
			codeServer.connection.sendNotification('setActiveCliIpcHook',
				vscode.window.state.focused ? ipcHookCli : undefined
			);
		}
		updateIpcHookCli();
		context.subscriptions.push(vscode.window.onDidChangeWindowState(() => updateIpcHookCli()));
	}
}

export function registerExtensionManagement(codeServer: GitpodCodeServer, context: GitpodExtensionContext): void {
	const { GitpodPluginModel, isYamlSeq, isYamlScalar } = context.config;
	const gitpodFileUri = vscode.Uri.file(path.join(context.info.getCheckoutLocation(), '.gitpod.yml'));
	async function modifyGipodPluginModel(unitOfWork: (model: GitpodPluginModel) => void): Promise<void> {
		let document: vscode.TextDocument | undefined;
		let content = '';
		try {
			await util.promisify(fs.access.bind(fs))(gitpodFileUri.fsPath, fs.constants.F_OK);
			document = await vscode.workspace.openTextDocument(gitpodFileUri);
			content = document.getText();
		} catch { /* no-op */ }
		const model = new GitpodPluginModel(content);
		unitOfWork(model);
		const edit = new vscode.WorkspaceEdit();
		if (document) {
			edit.replace(gitpodFileUri, document.validateRange(new vscode.Range(
				document.positionAt(0),
				document.positionAt(content.length)
			)), String(model));
		} else {
			edit.createFile(gitpodFileUri, { overwrite: true });
			edit.insert(gitpodFileUri, new vscode.Position(0, 0), String(model));
		}
		await vscode.workspace.applyEdit(edit);
	}
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.extensions.addToConfig', (id: string) => modifyGipodPluginModel(model => model.add(id))));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.extensions.removeFromConfig', (id: string) => modifyGipodPluginModel(model => model.remove(id))));
	context.subscriptions.push(vscode.commands.registerCommand('gitpod.extensions.installFromConfig', (id: string) => codeServer.connection.sendRequest('installExtensionFromConfig', id)));
	const deprecatedUserExtensionMessage = 'user uploaded extensions are deprecated';
	const extensionNotFoundMessageSuffix = ' extension is not found in Open VSX';
	const invalidVSIXLinkMessageSuffix = ' does not point to a valid VSIX file';
	const missingExtensionMessageSuffix = ' extension is not synced, but not added in .gitpod.yml';
	const uninstalledExtensionMessageSuffix = ' extension is not installed, but not removed from .gitpod.yml';
	const gitpodDiagnostics = vscode.languages.createDiagnosticCollection('gitpod');
	const validateGitpodFileDelayer = new ThrottledDelayer(150);
	const validateExtensionseDelayer = new ThrottledDelayer(1000); /** it can be very expensive for links to big extensions */
	let validateGitpodFileTokenSource: vscode.CancellationTokenSource | undefined;
	let resolveAllDeprecated: vscode.CodeAction | undefined;
	function validateGitpodFile(): void {
		resolveAllDeprecated = undefined;
		if (validateGitpodFileTokenSource) {
			validateGitpodFileTokenSource.cancel();
		}
		validateGitpodFileTokenSource = new vscode.CancellationTokenSource();
		const token = validateGitpodFileTokenSource.token;
		validateGitpodFileDelayer.trigger(async () => {
			if (token.isCancellationRequested) {
				return;
			}
			let diagnostics: vscode.Diagnostic[] | undefined;
			function pushDiagnostic(diagnostic: vscode.Diagnostic): void {
				if (!diagnostics) {
					diagnostics = [];
				}
				diagnostics.push(diagnostic);
			}
			function publishDiagnostics(): void {
				if (!token.isCancellationRequested) {
					gitpodDiagnostics.set(gitpodFileUri, diagnostics);
				}
			}
			try {
				const toLink = new Map<string, vscode.Range>();
				const toFind = new Map<string, {
					version?: string,
					range: vscode.Range
				}>();
				let document: vscode.TextDocument | undefined;
				try {
					document = await vscode.workspace.openTextDocument(gitpodFileUri);
				} catch { }
				if (token.isCancellationRequested) {
					return;
				}
				const model = document && new GitpodPluginModel(document.getText());
				const extensions = model && model.document.getIn(['vscode', 'extensions'], true);
				if (document && extensions && isYamlSeq(extensions)) {
					resolveAllDeprecated = new vscode.CodeAction('Resolve all against Open VSX.', vscode.CodeActionKind.QuickFix);
					resolveAllDeprecated.diagnostics = [];
					resolveAllDeprecated.isPreferred = true;
					for (let i = 0; i < extensions.items.length; i++) {
						const item = extensions.items[i];
						if (!isYamlScalar(item) || !item.range) {
							continue;
						}
						const extension = item.value;
						if (!(typeof extension === 'string')) {
							continue;
						}
						let link: vscode.Uri | undefined;
						try {
							link = vscode.Uri.parse(extension.trim(), true);
							if (link.scheme !== 'http' && link.scheme !== 'https') {
								link = undefined;
							}
						} catch { }
						if (link) {
							toLink.set(link.toString(), new vscode.Range(document.positionAt(item.range[0]), document.positionAt(item.range[1])));
						} else {
							const [idAndVersion, hash] = extension.trim().split(':', 2);
							if (hash) {
								const hashOffset = item.range[0] + extension.indexOf(':');
								const range = new vscode.Range(document.positionAt(hashOffset), document.positionAt(item.range[1]));

								const diagnostic = new vscode.Diagnostic(range, deprecatedUserExtensionMessage, vscode.DiagnosticSeverity.Warning);
								diagnostic.source = 'gitpod';
								diagnostic.tags = [vscode.DiagnosticTag.Deprecated];
								pushDiagnostic(diagnostic);
								resolveAllDeprecated.diagnostics.unshift(diagnostic);
							}
							const [id, version] = idAndVersion.split('@', 2);
							toFind.set(id.toLowerCase(), { version, range: new vscode.Range(document.positionAt(item.range[0]), document.positionAt(item.range[1])) });
						}
					}
					if (resolveAllDeprecated.diagnostics.length) {
						resolveAllDeprecated.edit = new vscode.WorkspaceEdit();
						for (const diagnostic of resolveAllDeprecated.diagnostics) {
							resolveAllDeprecated.edit.delete(gitpodFileUri, diagnostic.range);
						}
					} else {
						resolveAllDeprecated = undefined;
					}
					publishDiagnostics();
				}

				await validateExtensionseDelayer.trigger(async () => {
					if (token.isCancellationRequested) {
						return;
					}

					const result = await codeServer.connection.sendRequest('validateExtensions', {
						extensions: [...toFind.entries()].map(([id, { version }]) => ({ id, version })),
						links: [...toLink.keys()]
					}, token);
					if (token.isCancellationRequested) {
						return;
					}

					const notFound = new Set([...toFind.keys()]);
					for (const id of result.extensions) {
						notFound.delete(id.toLowerCase());
					}
					for (const id of notFound) {
						const { range, version } = toFind.get(id)!;
						let message = id;
						if (version) {
							message += '@' + version;
						}
						message += extensionNotFoundMessageSuffix;
						const diagnostic = new vscode.Diagnostic(range, message, vscode.DiagnosticSeverity.Error);
						diagnostic.source = 'gitpod';
						pushDiagnostic(diagnostic);
					}

					for (const link of result.links) {
						toLink.delete(link);
					}
					for (const [link, range] of toLink) {
						const diagnostic = new vscode.Diagnostic(range, link + invalidVSIXLinkMessageSuffix, vscode.DiagnosticSeverity.Error);
						diagnostic.source = 'gitpod';
						pushDiagnostic(diagnostic);
					}

					for (const id of result.missingMachined) {
						const diagnostic = new vscode.Diagnostic(new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 1)), id + missingExtensionMessageSuffix, vscode.DiagnosticSeverity.Warning);
						diagnostic.source = 'gitpod';
						pushDiagnostic(diagnostic);
					}

					for (const id of result.uninstalled) {
						if (notFound.has(id)) {
							continue;
						}
						const extension = toFind.get(id);
						if (extension) {
							let message = id;
							if (extension.version) {
								message += '@' + extension.version;
							}
							message += uninstalledExtensionMessageSuffix;
							const diagnostic = new vscode.Diagnostic(extension.range, message, vscode.DiagnosticSeverity.Warning);
							diagnostic.source = 'gitpod';
							pushDiagnostic(diagnostic);
						}
					}
				});
			} finally {
				publishDiagnostics();
			}
		});
	}
	function createSearchExtensionCodeAction(id: string, diagnostic: vscode.Diagnostic) {
		const title = `Search for ${id} in Open VSX.`;
		const codeAction = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
		codeAction.diagnostics = [diagnostic];
		codeAction.isPreferred = true;
		codeAction.command = {
			title: title,
			command: 'workbench.extensions.search',
			arguments: ['@id:' + id]
		};
		return codeAction;
	}
	function createAddToConfigCodeAction(id: string, diagnostic: vscode.Diagnostic) {
		const title = `Add ${id} extension to .gitpod.yml.`;
		const codeAction = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
		codeAction.diagnostics = [diagnostic];
		codeAction.isPreferred = true;
		codeAction.command = {
			title: title,
			command: 'gitpod.extensions.addToConfig',
			arguments: [id]
		};
		return codeAction;
	}
	function createRemoveFromConfigCodeAction(id: string, diagnostic: vscode.Diagnostic, document: vscode.TextDocument): vscode.CodeAction {
		const title = `Remove ${id} extension from .gitpod.yml.`;
		const codeAction = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
		codeAction.diagnostics = [diagnostic];
		codeAction.isPreferred = true;
		codeAction.command = {
			title: title,
			command: 'gitpod.extensions.removeFromConfig',
			arguments: [document.getText(diagnostic.range)]
		};
		return codeAction;
	}
	function createInstallFromConfigCodeAction(id: string, diagnostic: vscode.Diagnostic) {
		const title = `Install ${id} extension from .gitpod.yml.`;
		const codeAction = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
		codeAction.diagnostics = [diagnostic];
		codeAction.isPreferred = false;
		codeAction.command = {
			title: title,
			command: 'gitpod.extensions.installFromConfig',
			arguments: [id]
		};
		return codeAction;
	}
	function createUninstallExtensionCodeAction(id: string, diagnostic: vscode.Diagnostic) {
		const title = `Uninstall ${id} extension.`;
		const codeAction = new vscode.CodeAction(title, vscode.CodeActionKind.QuickFix);
		codeAction.diagnostics = [diagnostic];
		codeAction.isPreferred = false;
		codeAction.command = {
			title: title,
			command: 'workbench.extensions.uninstallExtension',
			arguments: [id]
		};
		return codeAction;
	}
	context.subscriptions.push(vscode.languages.registerCodeActionsProvider({
		pattern: gitpodFileUri.fsPath
	}, {
		provideCodeActions: (document, _, context) => {
			const codeActions: vscode.CodeAction[] = [];
			for (const diagnostic of context.diagnostics) {
				if (diagnostic.message === deprecatedUserExtensionMessage) {
					if (resolveAllDeprecated) {
						codeActions.push(resolveAllDeprecated);
					}
					const codeAction = new vscode.CodeAction('Resolve against Open VSX.', vscode.CodeActionKind.QuickFix);
					codeAction.diagnostics = [diagnostic];
					codeAction.isPreferred = false;
					const singleEdit = new vscode.WorkspaceEdit();
					singleEdit.delete(document.uri, diagnostic.range);
					codeAction.edit = singleEdit;
					codeActions.push(codeAction);
				}
				const notFoundIndex = diagnostic.message.indexOf(extensionNotFoundMessageSuffix);
				if (notFoundIndex !== -1) {
					const id = diagnostic.message.substr(0, notFoundIndex);
					codeActions.push(createRemoveFromConfigCodeAction(id, diagnostic, document));
					codeActions.push(createSearchExtensionCodeAction(id, diagnostic));
				}
				const missingIndex = diagnostic.message.indexOf(missingExtensionMessageSuffix);
				if (missingIndex !== -1) {
					const id = diagnostic.message.substr(0, missingIndex);
					codeActions.push(createAddToConfigCodeAction(id, diagnostic));
					codeActions.push(createUninstallExtensionCodeAction(id, diagnostic));
				}
				const uninstalledIndex = diagnostic.message.indexOf(uninstalledExtensionMessageSuffix);
				if (uninstalledIndex !== -1) {
					const id = diagnostic.message.substr(0, uninstalledIndex);
					codeActions.push(createRemoveFromConfigCodeAction(id, diagnostic, document));
					codeActions.push(createInstallFromConfigCodeAction(id, diagnostic));
				}
				const invalidVSIXIndex = diagnostic.message.indexOf(invalidVSIXLinkMessageSuffix);
				if (invalidVSIXIndex !== -1) {
					const link = diagnostic.message.substr(0, invalidVSIXIndex);
					codeActions.push(createRemoveFromConfigCodeAction(link, diagnostic, document));
				}
			}
			return codeActions;
		}
	}));
	validateGitpodFile();
	context.subscriptions.push(gitpodDiagnostics);
	context.subscriptions.push(vscode.workspace.onDidChangeTextDocument(e => {
		if (e.document.uri.toString() === gitpodFileUri.toString()) {
			validateGitpodFile();
		}
	}));
	const gitpodFileWatcher = vscode.workspace.createFileSystemWatcher(gitpodFileUri.fsPath);
	context.subscriptions.push(gitpodFileWatcher);
	context.subscriptions.push(gitpodFileWatcher.onDidCreate(() => validateGitpodFile()));
	context.subscriptions.push(gitpodFileWatcher.onDidChange(() => validateGitpodFile()));
	context.subscriptions.push(gitpodFileWatcher.onDidDelete(() => validateGitpodFile()));
	context.subscriptions.push(codeServer.onDidInstallExtension(() => validateGitpodFile()));
	context.subscriptions.push(codeServer.onDidUninstallExtension(() => validateGitpodFile()));
}
