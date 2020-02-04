// import {flags} from '@oclif/command'
import {BaseCommand} from '../../utls/base-command'
import * as latestVersion from 'latest-version'
import {system, filesystem} from 'gluegun'
import * as prompts from 'prompts'
import * as fs from 'fs'
import {plugins, statusMatrix, add, commit, config as gitConfig} from 'isomorphic-git'

plugins.set('fs', fs)

export default class Prettier extends BaseCommand {
  static description = 'describe the command here'

  static examples = [
    `$ nbx wall
hello world from ./src/hello.ts!
`,
  ]

  static flags = {
    ...BaseCommand.flags,
  }

  async run() {
    const packagePath = filesystem.path('.', 'package.json')

    if (filesystem.exists(packagePath) !== 'file') {
      this.error('There is no package.json not found in the current folder')
    }

    const packageJson = filesystem.read(packagePath, 'json')
    if (packageJson.devDependencies.prettier) {
      this.error('Prettier is already installed in this project.')
    }

    const {mask, shouldCommit} = await prompts([
      {
        type: 'text',
        message: 'On what files it should run prettier',
        name: 'mask',
        initial: '**/*.{js,vue,json,ts,tsx,md,yml,html}',
      },
      {
        type: 'confirm',
        message: 'Do you want gitmoji commits with the prettier setup ?',
        name: 'shouldCommit',
        initial: true,
      },
    ], {onCancel: () => this.error('User canceled prompt.')})

    if (shouldCommit) {
      const {config} = await this.getConfig()
      if (!config?.git?.user) {
        this.error('Missing config key git.user for git commits')
      }
      if (!config?.git?.email) {
        this.error('Missing config key git.email for git commits')
      }
      await gitConfig({
        dir: '.',
        path: 'user.name',
        value: config?.git?.user,
      })
      await gitConfig({
        dir: '.',
        path: 'user.email',
        value: config?.git?.email,
      })
      const changes = (await statusMatrix({dir: '.', pattern: '**'}))
      .filter(([_, head, workdir, stage]) => !(head === 1 && workdir === 1 && stage === 1))
      if (changes.length > 0) {
        this.error('There is unsaved changed in the git repository, aborting')
      }
    }

    const addDevDependency = async (name: string): Promise<void> => {
      await this.runWithSpinner(`Adding ${name} dependency`, async () => {
        const versionToInstall = await latestVersion(name)
        await system.exec(`yarn add -D ${name}@${versionToInstall}`)
        if (shouldCommit) {
          await add({filepath: 'package.json', dir: '.'})
          await add({filepath: 'yarn.lock', dir: '.'})
          await commit({dir: '.', message: `:heavy_plus_sign: add ${name}@${versionToInstall}`})
        }
      })
    }

    await addDevDependency('prettier')
    await addDevDependency('husky')
    await addDevDependency('pretty-quick')

    await this.runWithSpinner('Adding package.json scripts', async () => {
      const packageJsonWithDeps = filesystem.read(packagePath, 'json')
      const finalPackageJson = {
        ...packageJsonWithDeps,
        scripts: {
          ...packageJsonWithDeps.scripts,
          // eslint-disable-next-line no-useless-escape
          'format:write': `prettier --write "${mask}"`,
          // eslint-disable-next-line no-useless-escape
          'format:check': `prettier --list-different "${mask}"`,
        },
        husky: {
          hooks: {
            'pre-commit': 'pretty-quick --staged',
          },
        },
      }

      await filesystem.write(packagePath, finalPackageJson, {jsonIndent: 2})
      await system.exec('yarn')

      if (shouldCommit) {
        await add({filepath: 'package.json', dir: '.'})
        await commit({dir: '.', message: ':wrench: add script and husky to package.json'})
      }
    })

    await this.runWithSpinner('Adding .prettierrc config file', async () => {
      const prettierRcFile = {
        semi: true,
        singleQuote: true,
        printWidth: 120,
        quoteProps: 'consistent',
        trailingComma: 'all',
      }

      await filesystem.write(filesystem.path('.', '.prettierrc'), prettierRcFile, {jsonIndent: 2})

      if (shouldCommit) {
        await add({filepath: '.prettierrc', dir: '.'})
        await commit({dir: '.', message: ':wrench: add prettierrc config file'})
      }
    })

    await this.runWithSpinner('Updating code to match prettier style', async () => {
      await system.exec('yarn format:write')

      if (shouldCommit) {
        const commitsPromice = (await statusMatrix({dir: '.', pattern: '**'}))
        .filter(([_, head, workdir, stage]) => !(head === 1 && workdir === 1 && stage === 1))
        .map(arr => arr[0])
        .map(filepath => add({filepath, dir: '.'}))

        await Promise.all(commitsPromice)
        await commit({dir: '.', message: ':art: apply prettier style to project'})
      }
    })
  }
}
