# A Svelte template on Gitpod

This is a [Svelte](https://svelte.dev) template configured for ephemeral development environments on [Gitpod](https://www.gitpod.io/).

## SvelteKit

If you are looking for a SvelteKit example, please use https://github.com/gitpod-io/template-sveltekit.

## Next Steps

Click the button below to start a new development environment:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/gitpod-io/template-sveltejs)

## Get Started With Your Own Project

### A new project

Click the above "Open in Gitpod" button to start a new workspace. Once you're ready to push your first code changes, Gitpod will guide you to fork this project so you own it.

### An existing project

To get started with Svelte on Gitpod, add a [`.gitpod.yml`](./.gitpod.yml) file which contains the configuration to improve the developer experience on Gitpod. To learn more, please see the [Getting Started](https://www.gitpod.io/docs/getting-started) documentation.

In addition, please perform the following steps:
1. Set an environment variable
    ```bash
    export CLIENT_URL="$(gp url 35729)/livereload.js?snipver=1&port=443"
    ```
1. Pass the env value to the livereload module in [`rollup.config.js:65`](https://github.com/gitpod-io/sveltejs-template/blob/587088aae9cb7331c27591b7f8cef9d58c037e46/rollup.config.js#L66-L69)
    ```js
    !production && livereload({
      watch: 'public',
      clientUrl: process.env.CLIENT_URL
    }),
    ```
    This will set `CLIENT_URL` with the workspace url of `35729` (default port for livereload).
