import { BaseCommand } from './base-command';
import { add, commit, config as gitConfig, statusMatrix } from 'isomorphic-git';
import * as latestVersion from 'latest-version';
import { filesystem, system } from 'gluegun';

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
    const changes = (await statusMatrix({ dir: '.', pattern: '**' })).filter(
      ([_, head, workdir, stage]) => !(head === 1 && workdir === 1 && stage === 1),
    );
    if (changes.length > 0) {
      this.error('There is unsaved changed in the git repository, aborting');
    }
  }

  hasDirPackageJson() {
    return filesystem.isFile(filesystem.path('.', 'package.json'));
  }

  hasDevDependencyInPackageJson(name: string): boolean {
    const packageJson = filesystem.read('package.json', 'json');
    return Boolean(packageJson.devDependencies[name]);
  }

  hasDependencyInPackageJson(name: string): boolean {
    const packageJson = filesystem.read('package.json', 'json');
    return Boolean(packageJson.dependencies[name]);
  }

  async gitAddUnstaged() {
    const commitsPromice = (await statusMatrix({ dir: '.', pattern: '**' }))
      .filter(([_, head, workdir, stage]) => !(head === 1 && workdir === 1 && stage === 1))
      .map(arr => arr[0])
      .map(filepath => add({ filepath, dir: '.' }));

    await Promise.all(commitsPromice);
  }

  async addDevDependency(name: string, shouldCommit: boolean): Promise<void> {
    await this.runWithSpinner(`Adding ${name} dependency`, async () => {
      const versionToInstall = await latestVersion(name);
      await system.exec(`yarn add -D ${name}@${versionToInstall}`);
      if (shouldCommit) {
        await add({ filepath: 'package.json', dir: '.' });
        await add({ filepath: 'yarn.lock', dir: '.' });
        await commit({ dir: '.', message: `:heavy_plus_sign: add ${name}@${versionToInstall}` });
      }
    });
  }

  async addDependency(name: string, shouldCommit: boolean): Promise<void> {
    await this.runWithSpinner(`Adding ${name} dependency`, async () => {
      const versionToInstall = await latestVersion(name);
      await system.exec(`yarn add ${name}@${versionToInstall}`);
      if (shouldCommit) {
        await add({ filepath: 'package.json', dir: '.' });
        await add({ filepath: 'yarn.lock', dir: '.' });
        await commit({ dir: '.', message: `:heavy_plus_sign: add ${name}@${versionToInstall}` });
      }
    });
  }
}
