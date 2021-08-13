# A Datasette template on Gitpod

This is a [Datasette](https://datasette.io/) template configured for ephemeral development environments on [Gitpod](https://www.gitpod.io/).

## Next Steps

Click the button below to start a new development environment:

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
