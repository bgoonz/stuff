# A Datasette template on Gitpod

This is a [Datasette](https://datasette.io/) template configured for ephemeral development environments on [Gitpod](https://www.gitpod.io/).

## 🌏  Open in the Cloud 

Click any of the buttons below to start a new development environment to demo or contribute to the codebase without having to install anything on your machine:

[![Open in VS Code](https://img.shields.io/badge/Open%20in-VS%20Code-blue?logo=visualstudiocode)](https://vscode.dev/github/gitpod-io/template-datasette)
[![Open in Glitch](https://img.shields.io/badge/Open%20in-Glitch-blue?logo=glitch)](https://glitch.com/edit/#!/import/github/gitpod-io/template-datasette)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/gitpod-io/template-datasette)
[![Edit in Codesandbox](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/github/gitpod-io/template-datasette)
[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/gitpod-io/template-datasette)
[![Open in Repl.it](https://replit.com/badge/github/withastro/astro)](https://replit.com/github/gitpod-io/template-datasette)
[![Open in Codeanywhere](https://codeanywhere.com/img/open-in-codeanywhere-btn.svg)](https://app.codeanywhere.com/#https://github.com/gitpod-io/template-datasette)
[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/gitpod-io/template-datasette)

## Get Started With Your Own Project

### A new project

Click the above "Open in Gitpod" button to start a new workspace. Once you're ready to push your first code changes, Gitpod will guide you to fork this project so you own it.

### An existing project

To get started with Datasette on Gitpod, add a [`.gitpod.yml`](./.gitpod.yml) file which contains the configuration to improve the developer experience on Gitpod. To learn more, please see the [Getting Started](https://www.gitpod.io/docs/getting-started) documentation.

## Notes & caveats

Drag and drop any CSV files you like to this project root and they will be converted into a SQLite database and loaded into a Datasette instance.

You can uncomment lines in `requirements.txt` to install extra plugins.

## Configuring full-text search

Datasette supports SQLite full-text search. You can configure it for a table using the `sqlite-utils` command-line tool.

In the terminal run the following:

```bash
$ cd .data
$ sqlite-utils tables data.db --table --columns
table    columns
-------  ------------------------------------
example  ['headline', 'body', 'url', 'extra']
```

This shows you the tables and columns in your database.

If you want to make the `example` table searchable by `headline` and `body`, run the following command:

    $ sqlite-utils enable-fts data.db example headline body --fts4

Your Datasette instance will now display a search box that can be used to search the text in those columns.
