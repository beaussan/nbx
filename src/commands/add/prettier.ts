// import {flags} from '@oclif/command'
import { BaseCommand } from '../../utls/base-command';
import { system, filesystem } from 'gluegun';
import * as prompts from 'prompts';
import * as fs from 'fs';
import { plugins, add, commit } from 'isomorphic-git';
import { BaseAddCommand } from '../../utls/base-add-command';

plugins.set('fs', fs);

export default class Prettier extends BaseAddCommand {
  static description = 'describe the command here';

  static examples = [
    `$ nbx wall
hello world from ./src/hello.ts!
`,
  ];

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const packagePath = filesystem.path('.', 'package.json');

    if (filesystem.exists(packagePath) !== 'file') {
      this.error('There is no package.json not found in the current folder');
    }

    const packageJson = filesystem.read(packagePath, 'json');
    if (packageJson.devDependencies.prettier) {
      this.error('Prettier is already installed in this project.');
    }

    const { mask, shouldCommit } = await prompts(
      [
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
      ],
      { onCancel: () => this.error('User canceled prompt.') },
    );

    if (shouldCommit) {
      this.initGit();
    }

    await this.addDevDependency('prettier', shouldCommit);
    await this.addDevDependency('husky', shouldCommit);
    await this.addDevDependency('pretty-quick', shouldCommit);

    await this.runWithSpinner('Adding package.json scripts', async () => {
      const packageJsonWithDeps = filesystem.read(packagePath, 'json');
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
      };

      await filesystem.write(packagePath, finalPackageJson, { jsonIndent: 2 });
      await system.exec('yarn');

      if (shouldCommit) {
        await add({ filepath: 'package.json', dir: '.' });
        await commit({ dir: '.', message: ':wrench: add script and husky to package.json' });
      }
    });

    await this.runWithSpinner('Adding .prettierrc config file', async () => {
      const prettierRcFile = {
        semi: true,
        singleQuote: true,
        printWidth: 120,
        quoteProps: 'consistent',
        trailingComma: 'all',
      };

      await filesystem.write(filesystem.path('.', '.prettierrc'), prettierRcFile, { jsonIndent: 2 });

      if (shouldCommit) {
        await add({ filepath: '.prettierrc', dir: '.' });
        await commit({ dir: '.', message: ':wrench: add prettierrc config file' });
      }
    });

    await this.runWithSpinner('Updating code to match prettier style', async () => {
      await system.exec('yarn format:write');

      if (shouldCommit) {
        await this.gitAddUnstaged();
        await commit({ dir: '.', message: ':art: apply prettier style to project' });
      }
    });

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
          message: 'Eslint found in the project, do you want to add eslint prettier config ?',
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
        extends: [...eslintConfig.extends, 'plugin:prettier/recommended'],
      };

      await filesystem.write(eslintPath, finalEslintConfig, { jsonIndent: 2 });

      if (shouldCommit) {
        await add({ filepath: eslintFileName, dir: '.' });
        await commit({ dir: '.', message: ':wrench: update eslint to use prettier' });
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
          message: 'Tslint found in the project, do you want to add tslint prettier config ?',
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
        extends: [...tslintConfig.extends, 'tslint-plugin-prettier', 'tslint-config-prettier'],
        rules: {
          ...tslintConfig.rules,
          prettier: true,
        },
      };

      await filesystem.write(tslintPath, finalEslintConfig, { jsonIndent: 2 });

      if (shouldCommit) {
        await add({ filepath: 'tslint.json', dir: '.' });
        await commit({ dir: '.', message: ':wrench: update tslint to use prettier' });
      }
    });
  }
}
