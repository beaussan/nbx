# nbx

My own personal cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@beaussan/nbx.svg)](https://npmjs.org/package/@beaussan/nbx)
[![CircleCI](https://circleci.com/gh/beaussan/nbx/tree/master.svg?style=shield)](https://circleci.com/gh/beaussan/nbx/tree/master)
[![Codecov](https://codecov.io/gh/beaussan/nbx/branch/master/graph/badge.svg)](https://codecov.io/gh/beaussan/nbx)
[![Downloads/week](https://img.shields.io/npm/dw/@beaussan/nbx.svg)](https://npmjs.org/package/@beaussan/nbx)
[![License](https://img.shields.io/npm/l/@beaussan/nbx.svg)](https://github.com/beaussan/nbx/blob/master/package.json)

<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=shield)](#contributors-)

<!-- ALL-CONTRIBUTORS-BADGE:END -->

<!-- toc -->
* [nbx](#nbx)
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->

# Usage

<!-- usage -->
```sh-session
$ npm install -g @beaussan/nbx
$ nbx COMMAND
running command...
$ nbx (-v|--version|version)
@beaussan/nbx/2.5.0 linux-x64 node-v14.4.0
$ nbx --help [COMMAND]
USAGE
  $ nbx COMMAND
...
```
<!-- usagestop -->

# Commands

<!-- commands -->
* [`nbx add:dep DEP`](#nbx-adddep-dep)
* [`nbx add:prettier`](#nbx-addprettier)
* [`nbx add:tailwind`](#nbx-addtailwind)
* [`nbx help [COMMAND]`](#nbx-help-command)
* [`nbx wall TERMS`](#nbx-wall-terms)

## `nbx add:dep DEP`

proxy to yarn add, plus gitmoji commit

```
USAGE
  $ nbx add:dep DEP

ARGUMENTS
  DEP  The dependency to install

OPTIONS
  -D, --dev       install as a dev dependency
  -h, --help      show CLI help
  -v, --verbose   Verbose output
  --[no-]spinner  Enable spinner in cli output, true by default

EXAMPLES
  $ nbx add:dep -D eslint
  $ nbx add:dep --dev eslint
  $ nbx add:dep chalk
```

_See code: [src/commands/add/dep.ts](https://github.com/beaussan/nbx/blob/v2.5.0/src/commands/add/dep.ts)_

## `nbx add:prettier`

add prettier to project and format it

```
USAGE
  $ nbx add:prettier

OPTIONS
  -h, --help      show CLI help
  -l, --onlyLint  only install for linters
  -v, --verbose   Verbose output
  --[no-]spinner  Enable spinner in cli output, true by default
```

_See code: [src/commands/add/prettier.ts](https://github.com/beaussan/nbx/blob/v2.5.0/src/commands/add/prettier.ts)_

## `nbx add:tailwind`

add tailwindcss to a project

```
USAGE
  $ nbx add:tailwind

OPTIONS
  -h, --help      show CLI help
  -v, --verbose   Verbose output
  --[no-]spinner  Enable spinner in cli output, true by default
```

_See code: [src/commands/add/tailwind.ts](https://github.com/beaussan/nbx/blob/v2.5.0/src/commands/add/tailwind.ts)_

## `nbx help [COMMAND]`

display help for nbx

```
USAGE
  $ nbx help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `nbx wall TERMS`

download a wallpaper from wallhaven using search

```
USAGE
  $ nbx wall TERMS

ARGUMENTS
  TERMS  The search terms for the wallpaper

OPTIONS
  -a, --anime          Enable anime category
  -f, --force          Override the file if found
  -g, --general        Enable general category
  -h, --help           show CLI help
  -o, --output=output  Output for the wallpaper
  -p, --people         Enable people category
  -r, --random         Pick one randomly
  -s, --sketchy        Enables sketchy search
  -v, --verbose        Verbose output
  --[no-]spinner       Enable spinner in cli output, true by default

EXAMPLE
  $ nbx wall -r "cat" -o "wall.jpg" -fg
```

_See code: [src/commands/wall/index.ts](https://github.com/beaussan/nbx/blob/v2.5.0/src/commands/wall/index.ts)_
<!-- commandsstop -->

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://github.com/beaussan"><img src="https://avatars0.githubusercontent.com/u/7281023?v=4" width="100px;" alt=""/><br /><sub><b>Nicolas Beaussart</b></sub></a><br /><a href="https://github.com/beaussan/nbx/commits?author=beaussan" title="Code">💻</a> <a href="#ideas-beaussan" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/beaussan/nbx/commits?author=beaussan" title="Tests">⚠️</a></td>
  </tr>
</table>

<!-- markdownlint-enable -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
