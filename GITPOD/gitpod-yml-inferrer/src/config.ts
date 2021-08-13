
export interface WorkspaceConfig {
    image?: ImageConfig;
    ports?: PortConfig[];
    tasks?: TaskConfig[];
    checkoutLocation?: string;
    workspaceLocation?: string;
    privileged?: boolean;
    gitConfig?: { [config: string]: string };
    github?: GithubAppConfig;
    vscode?: VSCodeConfig;
}

export interface PortConfig {
    port: number;
    targetPort?: number;
    onOpen?: PortOnOpen;
    visibility?: PortVisibility;
}
export type PortOnOpen = 'open-browser' | 'open-preview' | 'notify' | 'ignore';
export type PortVisibility = 'public' | 'private';


export interface PortRangeConfig {
    port: string;
    onOpen?: PortOnOpen;
}

export interface TaskConfig {
    name?: string;
    before?: string;
    init?: string;
    prebuild?: string;
    command?: string;
    env?: { [env: string]: string };
    openIn?: 'bottom' | 'main' | 'left' | 'right';
    openMode?: 'split-top' | 'split-left' | 'split-right' | 'split-bottom' | 'tab-before' | 'tab-after';
}

export type ImageConfig = string | ImageConfigFile;
export interface ImageConfigFile {
    // Path to the Dockerfile relative to repository root
    file: string,
    // Path to the docker build context relative to repository root
    context?: string
}

export type ResolvedPluginKind = 'workspace' | 'builtin';

export interface ResolvedPlugins {
    [pluginId: string]: ResolvedPlugin | undefined
}

export interface ResolvedPlugin {
    fullPluginName: string;
    url: string;
    kind: ResolvedPluginKind;
}

export interface VSCodeConfig {
    extensions?: string[];
    resolvedExtensions?: ResolvedPlugins;
}

export interface GithubAppConfig {
    prebuilds?: GithubAppPrebuildConfig
}
export interface GithubAppPrebuildConfig {
    master?: boolean
    branches?: boolean
    pullRequests?: boolean
    pullRequestsFromForks?: boolean
    addCheck?: boolean
    addBadge?: boolean
    addLabel?: boolean | string
    addComment?: boolean
}
