# nbx

My own personal cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nbx.svg)](https://npmjs.org/package/nbx)
[![CircleCI](https://circleci.com/gh/beaussart/nbx/tree/master.svg?style=shield)](https://circleci.com/gh/beaussan/nbx/tree/master)
[![Codecov](https://codecov.io/gh/beaussan/nbx/branch/master/graph/badge.svg)](https://codecov.io/gh/beaussan/nbx)
[![Downloads/week](https://img.shields.io/npm/dw/nbx.svg)](https://npmjs.org/package/nbx)
[![License](https://img.shields.io/npm/l/nbx.svg)](https://github.com/beaussan/nbx/blob/master/package.json)

<!-- toc -->

- [nbx](#nbx)
- [Usage](#usage)
- [Commands](#commands)
  <!-- tocstop -->

# Usage

<!-- usage -->

```sh-session
$ npm install -g @beaussan/nbx
$ nbx COMMAND
running command...
$ nbx (-v|--version|version)
@beaussan/nbx/2.0.1 linux-x64 node-v13.7.0
$ nbx --help [COMMAND]
USAGE
  $ nbx COMMAND
...
```

<!-- usagestop -->

# Commands

<!-- commands -->

- [`nbx add:prettier`](#nbx-addprettier)
- [`nbx help [COMMAND]`](#nbx-help-command)
- [`nbx wall TERMS`](#nbx-wall-terms)

## `nbx add:prettier`

describe the command here

```
USAGE
  $ nbx add:prettier

OPTIONS
  -h, --help     show CLI help
  -v, --verbose  Verbose output

EXAMPLE
  $ nbx wall
  hello world from ./src/hello.ts!
```

_See code: [src/commands/add/prettier.ts](https://github.com/beaussan/nbx/blob/v2.0.1/src/commands/add/prettier.ts)_

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

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v2.2.3/src/commands/help.ts)_

## `nbx wall TERMS`

describe the command here

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

EXAMPLE
  $ nbx wall
  hello world from ./src/hello.ts!
```

_See code: [src/commands/wall/index.ts](https://github.com/beaussan/nbx/blob/v2.0.1/src/commands/wall/index.ts)_

<!-- commandsstop -->
