import { BaseCommand } from '../../utls/base-command';
import { system, filesystem } from 'gluegun';
import * as prompts from 'prompts';
import { BaseAddCommand } from '../../utls/base-add-command';

export default class Tailwind extends BaseAddCommand {
  static description = 'add tailwindcss to a project';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    if (!this.hasDirPackageJson()) {
      this.error('There is no package.json not found in the current folder');
    }

    if (this.hasDependencyInPackageJson('tailwind')) {
      this.error('Tailwind is already installed in this project.');
    }

    if (this.hasDependencyInPackageJson('@craco/craco')) {
      this.error(
        'Craco is already installed, this may bug so in case, I will stop there.',
      );
    }

    if (!this.hasDependencyInPackageJson('react-scripts')) {
      this.error('This script support only for now create react apps.');
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

    await this.installForCreateReactApps(shouldCommit);
  }

  async installForCreateReactApps(shouldCommit: boolean): Promise<void> {
    await this.addDevDependency('@craco/craco', shouldCommit);
    await this.addDependency('tailwindcss', shouldCommit);

    await this.runWithSpinner(
      'Generating tailwind initial config',
      async () => {
        await system.exec('yarn tailwindcss init --full');

        if (shouldCommit) {
          await this.gitAdd({ filepath: 'tailwind.config.js' });
          await this.gitCommit({
            message: ':wrench: add tailwind config file',
          });
        }
      },
    );
    await this.runWithSpinner('Generating craco postcssconfig', async () => {
      await filesystem.write(
        'craco.config.js',
        `module.exports = {
  style: {
    postcss: {
      plugins: [require('tailwindcss')('./tailwind.config.js')],
    },
  },
};
`,
      );

      if (shouldCommit) {
        await this.gitAdd({ filepath: 'craco.config.js' });
        await this.gitCommit({ message: ':wrench: craco postcss config file' });
      }
    });

    await this.runWithSpinner('Generating tailwind full css', async () => {
      await filesystem.dir('src/css');
      await filesystem.write(
        'src/css/tailwind.css',
        `@tailwind base;

/* Write your own custom base styles here */

/* Start purging... */
@tailwind components;
/* Stop purging. */

/* Start purging... */
@tailwind utilities;
/* Stop purging. */

/* Your own custom utilities */
`,
      );

      if (shouldCommit) {
        await this.gitAdd({ filepath: 'src/css/tailwind.css' });
        await this.gitCommit({ message: ':wrench: add tailwind css file' });
      }
    });

    await this.runWithSpinner('Adding package.json scripts', async () => {
      const packagePath = filesystem.path('.', 'package.json');
      const packageJsonWithDeps = filesystem.read(packagePath, 'json');
      const finalPackageJson = {
        ...packageJsonWithDeps,
        scripts: {
          ...packageJsonWithDeps.scripts,
          start: 'craco start',
          build: 'craco build',
          test: 'craco test',
        },
      };

      await filesystem.write(packagePath, finalPackageJson, { jsonIndent: 2 });

      if (shouldCommit) {
        await this.gitAdd({ filepath: 'package.json' });
        await this.gitCommit({
          message: ':wrench: add script for tailwind to package.json',
        });
      }
    });
  }
}
