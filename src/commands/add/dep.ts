// import {flags} from '@oclif/command'
import { BaseCommand } from '../../utls/base-command';
import { BaseAddCommand } from '../../utls/base-add-command';
import { flags } from '@oclif/command';

export default class Dep extends BaseAddCommand {
  static description = 'proxy to yarn add, plus gitmoji commit';

  static examples = [
    `$ nbx add:dep -D eslint`,
    `$ nbx add:dep --dev eslint`,
    `$ nbx add:dep chalk`,
  ];

  static flags = {
    ...BaseCommand.flags,
    dev: flags.boolean({
      default: false,
      char: 'D',
      description: 'install as a dev dependency',
    }),
  };

  static args = [
    { name: 'dep', description: 'The dependency to install', required: true },
  ];

  async run() {
    if (!this.hasDirPackageJson()) {
      this.error('There is no package.json not found in the current folder');
    }
    const {
      args: { dep },
      flags: { dev },
    } = this.parse(Dep);

    if (
      (dev && this.hasDevDependencyInPackageJson(dep)) ||
      this.hasDependencyInPackageJson(dep)
    ) {
      if (this.hasDevDependencyInPackageJson(dep)) {
        this.error(`${dep} is already installed in this project.`);
      }
    }

    await this.initGit();
    if (dev) {
      await this.addDevDependency(dep, true);
    } else {
      await this.addDependency(dep, true);
    }
  }
}
