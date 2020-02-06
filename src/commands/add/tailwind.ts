import { BaseCommand } from '../../utls/base-command';
import { system, filesystem, patching } from 'gluegun';
import * as prompts from 'prompts';
import * as fs from 'fs';
import { plugins, add, commit } from 'isomorphic-git';
import { BaseAddCommand } from '../../utls/base-add-command';

plugins.set('fs', fs);

export default class Tailwind extends BaseAddCommand {
  static description = 'add tailwindcss to a project';

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    if (!this.hasDirPackageJson()) {
      this.error('There is no package.json not found in the current folder');
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
      this.initGit();
    }

    await this.installForCreateReactApps(shouldCommit);
  }

  async installForCreateReactApps(shouldCommit: boolean): Promise<void> {
    await this.addDevDependency('@fullhuman/postcss-purgecss', shouldCommit);
    await this.addDevDependency('autoprefixer', shouldCommit);
    await this.addDevDependency('npm-run-all', shouldCommit);
    await this.addDevDependency('postcss-cli', shouldCommit);
    await this.addDependency('tailwindcss', shouldCommit);

    await this.runWithSpinner('Generating tailwind initial config', async () => {
      await system.exec('yarn tailwindcss init --full');

      if (shouldCommit) {
        await add({ filepath: 'tailwind.config.js', dir: '.' });
        await commit({ dir: '.', message: ':wrench: add tailwind config file' });
      }
    });
    await this.runWithSpinner('Generating postcss', async () => {
      await filesystem.write(
        'postcss.config.js',
        `const purgecss = require('@fullhuman/postcss-purgecss')({
  content: ['./src/**/*.jsx', './src/**/*.js', './src/index.js', './public/index.html'],
  css: ['./src/tailwind.css'],
  // Include any special characters you're using in this regular expression
  defaultExtractor: content => content.match(/[A-Za-z0-9-_:/]+/g) || [],
});
module.exports = {
  plugins: [
    require('tailwindcss')('./tailwind.config.js'),
    require('autoprefixer'),
    ...(process.env.NODE_ENV === 'production' ? [purgecss] : []),
  ],
};
`,
      );

      if (shouldCommit) {
        await add({ filepath: 'postcss.config.js', dir: '.' });
        await commit({ dir: '.', message: ':wrench: add postcss config file' });
      }
    });

    await this.runWithSpinner('Generating tailwind full css', async () => {
      await filesystem.dir('src/css');
      await filesystem.write(
        'src/css/tailwind.src.css',
        `@tailwind base;

@tailwind components;

@tailwind utilities;
`,
      );

      if (shouldCommit) {
        await add({ filepath: 'src/css/tailwind.src.css', dir: '.' });
        await commit({ dir: '.', message: ':wrench: add tailwind css file' });
      }
    });

    await this.runWithSpinner('Adding package.json scripts', async () => {
      const packagePath = filesystem.path('.', 'package.json');
      const packageJsonWithDeps = filesystem.read(packagePath, 'json');
      const finalPackageJson = {
        ...packageJsonWithDeps,
        scripts: {
          ...packageJsonWithDeps.scripts,
          'start': 'npm-run-all -p start:css start:js',
          'build': 'npm-run-all build:css build:js',
          'start:js': 'react-scripts start',
          'build:js': 'react-scripts build',
          'start:css': 'postcss src/css/tailwind.src.css -o src/tailwind.css -w',
          'build:css': 'postcss src/css/tailwind.src.css -o src/tailwind.css --env production',
        },
      };

      await filesystem.write(packagePath, finalPackageJson, { jsonIndent: 2 });

      if (shouldCommit) {
        await add({ filepath: 'package.json', dir: '.' });
        await commit({ dir: '.', message: ':wrench: add script for tailwind to package.json' });
      }
    });

    await this.runWithSpinner('Adding full tailwind css to .gitignore', async () => {
      await patching.append('.gitignore', '\n# ignore tailwind generated css\nsrc/tailwind.css');

      if (shouldCommit) {
        await add({ filepath: '.gitignore', dir: '.' });
        await commit({ dir: '.', message: ':see_no_evil: add generated tailwind to .gitignore' });
      }
    });
  }
}
