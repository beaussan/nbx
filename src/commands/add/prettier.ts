// import {flags} from '@oclif/command'
import { BaseCommand } from '../../utls/base-command';
import { system, filesystem } from 'gluegun';
import * as prompts from 'prompts';
import { BaseAddCommand } from '../../utls/base-add-command';
import { flags } from '@oclif/command';

export default class Prettier extends BaseAddCommand {
  static description = 'add prettier to project and format it';

  static flags = {
    ...BaseCommand.flags,
    onlyLint: flags.boolean({
      default: false,
      char: 'l',
      description: 'only install for linters',
    }),
  };

  async run() {
    if (!this.hasDirPackageJson()) {
      this.error('There is no package.json not found in the current folder');
    }

    const { shouldCommit } = await prompts(
      [
        {
          type: 'confirm',
          message: 'Do you want gitmoji commits with the prettier setup ?',
          name: 'shouldCommit',
          initial: true,
        },
      ],
      { onCancel: () => this.error('User canceled prompt.') },
    );

    if (shouldCommit) {
      await this.initGit();
    }
    const {
      flags: { onlyLint },
    } = this.parse(Prettier);

    if (onlyLint) {
      await this.handleMaybeEslint(shouldCommit);
      await this.handleMaybeTslint(shouldCommit);
      return;
    }

    if (this.hasDevDependencyInPackageJson('prettier')) {
      this.error('Prettier is already installed in this project.');
    }

    const { mask } = await prompts(
      [
        {
          type: 'text',
          message: 'On what files it should run prettier',
          name: 'mask',
          initial: '**/*.{js,vue,json,ts,tsx,md,yml,html}',
        },
      ],
      { onCancel: () => this.error('User canceled prompt.') },
    );

    await this.addDevDependency('prettier', shouldCommit);
    await this.addDevDependency('husky', shouldCommit);
    await this.addDevDependency('pretty-quick', shouldCommit);

    await this.runWithSpinner('Adding package.json scripts', async () => {
      const packagePath = filesystem.path('.', 'package.json');
      const packageJsonWithDeps = filesystem.read(packagePath, 'json');
      const finalPackageJson = {
        ...packageJsonWithDeps,
        scripts: {
          ...packageJsonWithDeps.scripts,
          'format:write': `prettier --write "${mask}"`,
          'format:check': `prettier --list-different "${mask}"`,
        },
        husky: {
          ...packageJsonWithDeps.husky,
          hooks: {
            ...packageJsonWithDeps?.husky?.hooks,
            'pre-commit': 'pretty-quick --staged',
          },
        },
      };

      await filesystem.write(packagePath, finalPackageJson, { jsonIndent: 2 });
      await system.exec('yarn');

      if (shouldCommit) {
        await this.gitAdd({ filepath: 'package.json' });
        await this.gitCommit({
          message: ':wrench: add script and husky to package.json',
        });
      }
    });

    await this.runWithSpinner('Adding .prettierrc config file', async () => {
      const prettierRcFile = {
        semi: true,
        singleQuote: true,
        printWidth: 80,
        quoteProps: 'consistent',
        trailingComma: 'all',
      };

      await filesystem.write(
        filesystem.path('.', '.prettierrc'),
        prettierRcFile,
        {
          jsonIndent: 2,
        },
      );

      if (shouldCommit) {
        await this.gitAdd({ filepath: '.prettierrc' });
        await this.gitCommit({
          message: ':wrench: add prettierrc config file',
        });
      }
    });

    await this.runWithSpinner(
      'Updating code to match prettier style',
      async () => {
        await system.exec('yarn format:write');

        if (shouldCommit) {
          await this.gitAddUnstaged();
          await this.gitCommit({
            message: ':art: apply prettier style to project',
          });
        }
      },
    );

    await this.handleMaybeEslint(shouldCommit);
    await this.handleMaybeTslint(shouldCommit);
  }

  async findEslint(): Promise<string | null> {
    for (const filename of ['.eslintrc', '.eslintrc.json']) {
      if (filesystem.isFile(filename)) {
        return filename;
      }
    }
    return null;
  }

  async handleMaybeEslint(shouldCommit: boolean) {
    const eslintFileName = await this.findEslint();
    if (eslintFileName === null) {
      return;
    }
    const eslintPath = filesystem.path('.', eslintFileName);

    const { shouldOverrideEslint } = await prompts(
      [
        {
          type: 'confirm',
          message:
            'Eslint found in the project, do you want to add eslint prettier config ?',
          name: 'shouldOverrideEslint',
          initial: true,
        },
      ],
      { onCancel: () => this.error('User canceled prompt.') },
    );

    if (!shouldOverrideEslint) {
      return;
    }
    await this.addDevDependency('eslint-config-prettier', shouldCommit);
    await this.addDevDependency('eslint-plugin-prettier', shouldCommit);

    await this.runWithSpinner(`Updating ${eslintFileName}`, async () => {
      const eslintConfig = filesystem.read(eslintPath, 'json');
      const finalEslintConfig = {
        ...eslintConfig,
        extends: [
          ...(typeof eslintConfig?.extends === 'string'
            ? [eslintConfig.extends]
            : Array.isArray(eslintConfig?.extends)
            ? eslintConfig.extends
            : []),
          'plugin:prettier/recommended',
        ],
      };

      await filesystem.write(eslintPath, finalEslintConfig, { jsonIndent: 2 });

      if (shouldCommit) {
        await this.gitAdd({ filepath: eslintFileName });
        await this.gitCommit({
          message: ':wrench: update eslint to use prettier',
        });
      }
    });
  }

  async handleMaybeTslint(shouldCommit: boolean) {
    const tslintPath = filesystem.path('.', 'tslint.json');
    if (!filesystem.isFile(tslintPath)) {
      return;
    }

    const { shouldOverrideTslint } = await prompts(
      [
        {
          type: 'confirm',
          message:
            'Tslint found in the project, do you want to add tslint prettier config ?',
          name: 'shouldOverrideTslint',
          initial: true,
        },
      ],
      { onCancel: () => this.error('User canceled prompt.') },
    );

    if (!shouldOverrideTslint) {
      return;
    }
    await this.addDevDependency('tslint-config-prettier', shouldCommit);
    await this.addDevDependency('tslint-plugin-prettier', shouldCommit);

    await this.runWithSpinner(`Updating tslint.json`, async () => {
      const tslintConfig = filesystem.read(tslintPath, 'json');
      const finalEslintConfig = {
        ...tslintConfig,
        extends: [
          ...(typeof tslintConfig?.extends === 'string'
            ? [tslintConfig.extends]
            : Array.isArray(tslintConfig?.extends)
            ? tslintConfig.extends
            : []),
          'tslint-plugin-prettier',
          'tslint-config-prettier',
        ],
        rules: {
          ...(tslintConfig.rules ?? {}),
          prettier: true,
        },
      };

      await filesystem.write(tslintPath, finalEslintConfig, { jsonIndent: 2 });

      if (shouldCommit) {
        await this.gitAdd({ filepath: 'tslint.json' });
        await this.gitCommit({
          message: ':wrench: update tslint to use prettier',
        });
      }
    });
  }
}
