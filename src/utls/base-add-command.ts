import { BaseCommand } from './base-command';
import { add, plugins, commit, config as gitConfig, statusMatrix } from 'isomorphic-git';
import * as latestVersion from 'latest-version';
import { filesystem, system } from 'gluegun';
import * as fs from 'fs';

plugins.set('fs', fs);

export abstract class BaseAddCommand extends BaseCommand {
  static flags = {
    ...BaseCommand.flags,
  };

  async initGit(): Promise<void> {
    const { config } = await this.getConfig();
    if (!config?.git?.user) {
      this.error('Missing config key git.user for git commits');
    }
    if (!config?.git?.email) {
      this.error('Missing config key git.email for git commits');
    }
    try {
      await gitConfig({
        dir: '.',
        path: 'user.name',
        value: config?.git?.user,
      });
      await gitConfig({
        dir: '.',
        path: 'user.email',
        value: config?.git?.email,
      });
    } catch {
      this.error('Could not set git config. Maybe the command was not run in a git repository.');
    }
    const changes = (await statusMatrix({ dir: '.', pattern: '**' })).filter(
      ([_, head, workdir]) => head !== workdir,
    );
    if (changes.length > 0) {
      this.error('There is unsaved changed in the git repository, aborting');
    }
  }

  hasDirPackageJson() {
    return filesystem.isFile(filesystem.path('.', 'package.json'));
  }

  hasDevDependencyInPackageJson(name: string): boolean {
    if (!this.hasDirPackageJson()) {
      return false;
    }
    const packageJson = filesystem.read('package.json', 'json');
    return Boolean(packageJson.devDependencies?.[name]);
  }

  hasDependencyInPackageJson(name: string): boolean {
    if (!this.hasDirPackageJson()) {
      return false;
    }
    const packageJson = filesystem.read('package.json', 'json');
    return Boolean(packageJson.dependencies?.[name]);
  }

  async gitAddUnstaged() {
    const commitsPromice = (await statusMatrix({ dir: '.', pattern: '**' }))
      .filter(([_, head, workdir]) => head !== workdir)
      .map(arr => arr[0])
      .map(filepath => add({ filepath, dir: '.' }));

    await Promise.all(commitsPromice);
  }

  async addDevDependency(name: string, shouldCommit: boolean): Promise<void> {
    await this.runWithSpinner(`Adding ${name} as a dev dependency`, async () => {
      const versionToInstall = await latestVersion(name);
      await system.exec(`yarn add -D ${name}@${versionToInstall}`);
      if (shouldCommit) {
        await add({ filepath: 'package.json', dir: '.' });
        await add({ filepath: 'yarn.lock', dir: '.' });
        await commit({
          dir: '.',
          message: `:heavy_plus_sign: add ${name}@${versionToInstall} as a dev dependency`,
        });
      }
    });
  }

  async addDependency(name: string, shouldCommit: boolean): Promise<void> {
    await this.runWithSpinner(`Adding ${name} as a dependency`, async () => {
      const versionToInstall = await latestVersion(name);
      await system.exec(`yarn add ${name}@${versionToInstall}`);
      if (shouldCommit) {
        await add({ filepath: 'package.json', dir: '.' });
        await add({ filepath: 'yarn.lock', dir: '.' });
        await commit({
          dir: '.',
          message: `:heavy_plus_sign: add ${name}@${versionToInstall} as a dependency`,
        });
      }
    });
  }
}
