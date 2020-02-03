nbx
===

My own personal cli

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/nbx.svg)](https://npmjs.org/package/nbx)
[![CircleCI](https://circleci.com/gh/beaussart/nbx/tree/master.svg?style=shield)](https://circleci.com/gh/beaussart/nbx/tree/master)
[![Codecov](https://codecov.io/gh/beaussart/nbx/branch/master/graph/badge.svg)](https://codecov.io/gh/beaussart/nbx)
[![Downloads/week](https://img.shields.io/npm/dw/nbx.svg)](https://npmjs.org/package/nbx)
[![License](https://img.shields.io/npm/l/nbx.svg)](https://github.com/beaussart/nbx/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g nbx
$ nbx COMMAND
running command...
$ nbx (-v|--version|version)
nbx/0.0.0 linux-x64 node-v10.16.0
$ nbx --help [COMMAND]
USAGE
  $ nbx COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`nbx hello [FILE]`](#nbx-hello-file)
* [`nbx help [COMMAND]`](#nbx-help-command)
* [`nbx wall TERMS`](#nbx-wall-terms)

## `nbx hello [FILE]`

describe the command here

```
USAGE
  $ nbx hello [FILE]

OPTIONS
  -f, --force
  -h, --help       show CLI help
  -n, --name=name  name to print

EXAMPLE
  $ nbx hello
  hello world from ./src/hello.ts!
```

_See code: [src/commands/hello/index.ts](https://github.com/beaussart/nbx/blob/v0.0.0/src/commands/hello/index.ts)_

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

_See code: [src/commands/wall/index.ts](https://github.com/beaussart/nbx/blob/v0.0.0/src/commands/wall/index.ts)_
<!-- commandsstop -->
