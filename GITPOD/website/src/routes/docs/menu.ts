import type { MenuEntry } from "../../types/menu-entry.type";

function M(title: string, path: string, subMenu?: MenuEntry[]): MenuEntry {
  return {
    title,
    path: "/docs" + (path ? "/" + path : ""),
    subMenu,
  };
}

export const MENU: MenuEntry[] = [
  M("Introduction", ""),
  M("Quickstart", "quickstart", [
    M("Deno", "quickstart/deno"),
    M("Go", "quickstart/go"),
    M("Java Spring", "quickstart/java"),
    M("Node/TypeScript/Express", "quickstart/typescript"),
    M("PHP Drupal", "quickstart/drupal"),
    M("PHP Laravel", "quickstart/laravel"),
    M("Python Django", "quickstart/python"),
    M("Python Flask", "quickstart/flask"),
    M("React", "quickstart/react"),
    M("Ruby on Rails", "quickstart/ruby-on-rails"),
    M("Rust", "quickstart/rust"),
    M("Svelte", "quickstart/svelte"),
    M("Datasette", "quickstart/datasette"),
    M("Nix", "quickstart/nix"),
    M("Haskell", "quickstart/haskell"),
    M("C", "quickstart/c"),
    M("Perl", "quickstart/perl"),
    M("Julia", "quickstart/julia"),
  ]),
  M("Getting Started", "getting-started"),
  M("Configure", "configure", [
    M(".gitpod.yml", "config-gitpod-file"),
    M("Custom Docker Image", "config-docker"),
    M("Start Tasks", "config-start-tasks"),
    M("VS Code Extensions", "vscode-extensions"),
    M("Exposing Ports", "config-ports"),
    M("Prebuilds", "prebuilds"),
    M("Environment Variables", "environment-variables"),
    M("Checkout and Workspace Location", "checkout-location"),
  ]),
  M("Develop", "develop", [
    M("One workspace per task", "workspaces"),
    M("Life of a workspace", "life-of-workspace"),
    M("Contexts", "context-urls"),
    M("Collaboration & Sharing", "sharing-and-collaboration"),
    M("Create a team", "teams"),
    M("Local Companion", "develop/local-companion"),
  ]),
  M("Integrations", "integrations", [
    M("GitLab", "gitlab-integration"),
    M("GitHub", "github-integration"),
    M("Bitbucket", "bitbucket-integration"),
    M("Browser Bookmarklet", "browser-bookmarklet"),
    M("Browser Extension", "browser-extension"),
  ]),
  M("Gitpod Self-Hosted", "self-hosted/latest", [
    M("Installation", "self-hosted/latest/installation"),
    M("Configuration", "self-hosted/latest/configuration"),
    M("Administration", "self-hosted/latest/administration"),
    M("Troubleshooting", "self-hosted/latest/troubleshooting"),
    M("Updating", "self-hosted/latest/updating"),
    M("Releases", "self-hosted/latest/releases"),
  ]),
  M("References", "references", [
    M(".gitpod.yml", "references/gitpod-yml"),
    M("Command Line Interface", "command-line-interface"),
    // M("Custom Docker image", "references/gitpod-dockerfile"),
    // M("Architecture", "references/architecture"),
    // M("Troubleshooting", "references/troubleshooting"),
    M("Languages & Framework", "languages-and-frameworks"),
    M("Roadmap", "references/roadmap"),
  ]),
];

export interface MenuContext {
  prev?: MenuEntry;
  thisEntry?: MenuEntry;
  next?: MenuEntry;
}

export function getMenuContext(
  slug: string,
  menu: MenuEntry[] = MENU,
  context: MenuContext = {}
): MenuContext {
  for (const e of menu) {
    if (context.next) {
      return context;
    }
    if (context.thisEntry) {
      context.next = e;
      return context;
    } else if (e.path === slug) {
      context.thisEntry = e;
    } else {
      context.prev = e;
    }
    if (e.subMenu) {
      getMenuContext(slug, e.subMenu, context);
    }
  }
  return context;
}
