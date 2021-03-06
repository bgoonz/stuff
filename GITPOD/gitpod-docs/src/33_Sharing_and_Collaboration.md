# Collaboration & Sharing of Workspaces

There are two diffeent ways to share your workspaces, you can share

- [Sharing Running Workspaces](#sharing-running-workspaces)
- [Sharing Snapshots](#sharing-snapshots)

## Sharing Running Workspaces

Sharing running workspaces allows to quickly look at the same workspace together with a (remote) colleague.
It is similar to collaborating on Google Docs, in that you can see who is online and look at the same code and processes.

All users in one workspace share the Theia backend and the filesystem. Opened editors, terminals,
and other UI state are currently not shared.

### How To Share and Unshare a Running Workspace

Running workspaces can be shared from the [dashboard](60_Dashboard.md) or from within the IDE. In the IDE,
right-click on the user's avatar and choose

`Share Running Workspace`.

Provide the URL shown in the dialog to
anyone you want to share your workspace with.

![](./images/share-running-ws.gif)

> **Security note:**
>
> Beware, anybody with this URL and a Gitpod account will be able to access the workspace as long as
> it is shared and running.
>
> Every action towards git in a shared workspace happens on behalf of the workspace owner's account without further authorization. It is highly recommended to give workspace URLs only to
> trusted users and unshare workspaces as soon as sharing them is no longer necessary.
>
> **A running Gitpod workspace really is your personal machine.**

By unsharing the workspace, the link becomes useless to anybody but the
workspace owner. All users that are currently looking at your workspace will be shown as avatars in
the top right corner of the IDE.

## Sharing Snapshots

You can take snapshot URLs of your workspaces at any time and share them with others.
Anyone clicking on such a snapshot link will get a complete clone of your workspace, including the

- state of the workspace
- the IDE layout

Even initially workspaces based snapshot are treated as restarts, so you can configure them to launch
differently than if you had created a fresh workspace from git. Also, this is useful if you want to create
easy to consume reproducible workspace states, for issues, stackoverflow answers, trainings, etc.

Unlike sharing running workspaces snapshoted workspaces are full copies. This means users can do what ever
they like with the content. And of course, no access to any of your credentials is shared.

Read more about this feature [here](https://medium.com/gitpod/code-never-lies-creating-reproducibles-for-any-programming-language-7946021a68f2).

### How To Take a Snapshot URL

Creating a snapshot is simple. You can either use the **command palette** (<kbd>F1</kbd>) or find the action item in
the avatar menu on the top right.

![](./images/share-snapshot.png)

Once you execute it, the snapshot is taken and the URL is shown in a dialog.
