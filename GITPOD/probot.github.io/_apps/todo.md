---
title: todo
description: Creates new issues from actionable comments in your code.
slug: todo
screenshots:
  - https://user-images.githubusercontent.com/10660468/31048765-83569c30-a5f2-11e7-933a-a119d43ad029.png
authors:
  - JasonEtco
repository: JasonEtco/todo
host: https://todo-github-app.now.sh
stars: 160
updated: 2018-08-26 20:45:59 UTC
installations: 221
organizations:
  - nteract
  - mas-cli
  - thibmaek
  - Laravel-Backpack
  - heinrichreimer
  - Radarr
  - caarlos0
  - SpoonX
  - timvideos
  - getantibody
---

## Usage

If I pushed this:

```js
/**
 * @todo Take over the world
 * @body Humans are weak; Robots are strong. We must cleanse the world of the virus that is humanity.
 */
function ruleOverPunyHumans() {
  // We must strategize beep boop
}
```

`todo` would create a new issue:

![todo](https://user-images.githubusercontent.com/10660468/31048765-83569c30-a5f2-11e7-933a-a119d43ad029.png)

## Configuring for your project

There are a couple of configuration options in case you need to change the default behaviour. Note that the defaults are likely fine for most projects, so you might not need to change them.

Add a `todo` object in your `.github/config.yml` file like this:

```yml
todo:
  keyword: "@makeAnIssue"
```

### Available options

| Name          | Type                              | Description                                                                                                                                                                                                                               | Default |
| ------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| autoAssign    | `string`, `string[]` or `boolean` | Should `todo` automatically assign a user to the new issue? If `true`, it'll assign whoever pushed the code. If a string, it'll assign that user by username. You can also give it an array of usernames or `false` to not assign anyone. | `true`  |
| keyword       | `string`                          | The keyword to use to generate issue titles                                                                                                                                                                                               | `@todo` |
| blobLines     | `number` or `false`               | The number of lines of code to show, starting from the keyword.                                                                                                                                                                           | 5       |
| caseSensitive | `boolean`                         | Should the keyword be case sensitive?                                                                                                                                                                                                     | false   |
