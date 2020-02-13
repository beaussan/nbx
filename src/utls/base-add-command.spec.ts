import { BaseAddCommand } from './base-add-command';
import { filesystem, system } from 'gluegun';
import * as latestVersion from 'latest-version';
const stripANSI = require('strip-ansi');
import { flags } from '@oclif/command';

/* eslint-disable no-console,max-nested-callbacks,@typescript-eslint/ban-ts-ignore */
let consoleLogOutput: string[];
let execPath: string;
const originalCwd = process.cwd();
const originalLog = console.log;

beforeEach(async () => {
  consoleLogOutput = [];
  console.log = (x: any) => consoleLogOutput.push(stripANSI(x));

  const tmpDirName = `${new Date().getTime()}-add-nbx-test`;
  execPath = filesystem.path('/', 'tmp', tmpDirName);
  filesystem.dir(execPath);
  process.chdir(execPath);
  await system.run('git config --global user.email "you@example.com"');
  await system.run('git config --global user.name "Your Name"');
});
afterEach(() => {
  console.log = originalLog;
  process.chdir(originalCwd);
  jest.restoreAllMocks();
  filesystem.remove(execPath);
});

class RunCommand extends BaseAddCommand {
  static flags = {
    ...BaseAddCommand.flags,
    opt: flags.boolean({ default: false }),
  };

  static args = [{ name: 'command', required: true }, { name: 'arg' }];

  async run() {
    const {
      args: { command, arg },
      flags: { opt },
    } = this.parse(RunCommand);
    if (opt) {
      // @ts-ignore
      return this[command](arg, opt);
    }
    // @ts-ignore
    return this[command](arg, false);
  }
}

const initWithConfigAndCommit = async () => {
  await system.run('git init');
  filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
  filesystem.write('package.json', {});
  await system.run('touch yarn.lock');
  await system.run('git add * .nbxrc');
  await system.run('git commit -m "init state"');
};

describe('BaseAddCommand', () => {
  describe('InitGit()', () => {
    it('should error when no config for git is found', async () => {
      expect.assertions(1);
      try {
        await RunCommand.run(['initGit']);
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
    it('should error when the config is not full', async () => {
      expect.assertions(1);
      try {
        filesystem.write('.nbxrc', { toto: 'aaa ' });
        await RunCommand.run(['initGit']);
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
    it('should error when git.user is missing', async () => {
      expect.assertions(1);
      try {
        filesystem.write('.nbxrc', { git: { email: 'aaa' } });
        await RunCommand.run(['initGit']);
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
    it('should error when git.mail is missing', async () => {
      expect.assertions(1);
      try {
        filesystem.write('.nbxrc', { git: { user: 'aaa' } });
        await RunCommand.run(['initGit']);
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
    it('should error when no git in repository', async () => {
      expect.assertions(1);
      try {
        filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
        await RunCommand.run(['initGit']);
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });

    const actions = [
      {
        name: 'added uncomited file',
        actions: ['touch test.md'],
      },
      {
        name: 'added file, not commited',
        actions: ['touch test.md', 'git add test.md', 'git add .nbxrc'],
      },
      {
        name: 'edited commited files',
        actions: [
          'touch test.md',
          'git add test.md',
          'git add .nbxrc',
          'git commit -m "test commit"',
          'echo hello > test.md',
        ],
      },
      {
        name: 'deleted commited file',
        actions: [
          'touch test.md',
          'git add test.md',
          'git add .nbxrc',
          'git commit -m "test commit"',
          'rm -f test.md',
        ],
      },
    ];

    for (const action of actions) {
      it(`should erro when ${action.name}`, async () => {
        filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
        await system.run('git init');
        for (const step of action.actions) {
          // eslint-disable-next-line no-await-in-loop
          await system.run(step);
        }

        expect.assertions(1);
        try {
          await RunCommand.run(['initGit']);
          // eslint-disable-next-line unicorn/catch-error-name
        } catch (e) {
          expect(e).toEqual(new Error('There is unsaved changed in the git repository, aborting'));
        }
      });
    }
    it('should error when the git repository is not clean', async () => {
      await system.run('git init');
      await system.run('touch test.md');
      expect.assertions(1);
      try {
        filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
        await RunCommand.run(['initGit']);
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (e) {
        expect(e).toMatchSnapshot();
      }
    });
    it('should work on a clean git repository', async () => {
      filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
      await system.run('git init');
      await system.run('git add .nbxrc');
      await system.run('pwd');
      await system.run('git commit -m "initial commit"');
      await system.run('git status');
      await RunCommand.run(['initGit']);
      const gitConfig = filesystem.read('.git/config');
      expect(gitConfig).toBeDefined();
      const gitConfigLines = gitConfig?.split('\n')?.map(value => value.trim());
      expect(gitConfigLines).toContainEqual('email = bbb');
      expect(gitConfigLines).toContainEqual('name = aaa');
    });
  });

  describe('hasDirPackageJson', () => {
    it('should return false if no packageJson is in the path', async () => {
      const result = await RunCommand.run(['hasDirPackageJson']);
      expect(result).toBeFalsy();
    });
    it('should return true if no packageJson is in the path', async () => {
      filesystem.write('package.json', {});
      const result = await RunCommand.run(['hasDirPackageJson']);
      expect(result).toBeTruthy();
    });
  });

  describe('hasDependencyInPackageJson', () => {
    it('should return false if no packageJson is in the path', async () => {
      const result = await RunCommand.run(['hasDependencyInPackageJson', 'testDep']);
      expect(result).toBeFalsy();
    });
    it('should return false if the dependencies is not in package json', async () => {
      filesystem.write('package.json', { dependencies: {} });
      const result = await RunCommand.run(['hasDependencyInPackageJson', 'testDep']);
      expect(result).toBeFalsy();
    });
    it('should return false if there is no dependencies in package json', async () => {
      filesystem.write('package.json', {});
      const result = await RunCommand.run(['hasDependencyInPackageJson', 'testDep']);
      expect(result).toBeFalsy();
    });
    it('should return true if no packageJson is in the path', async () => {
      filesystem.write('package.json', { dependencies: { testDep: 'v1.0.0' } });
      const result = await RunCommand.run(['hasDependencyInPackageJson', 'testDep']);
      expect(result).toBeTruthy();
    });
  });

  describe('hasDevDependencyInPackageJson', () => {
    it('should return false if no packageJson is in the path', async () => {
      const result = await RunCommand.run(['hasDevDependencyInPackageJson', 'testDep']);
      expect(result).toBeFalsy();
    });
    it('should return false if the dependencies is not in package json', async () => {
      filesystem.write('package.json', { devDependencies: {} });
      const result = await RunCommand.run(['hasDevDependencyInPackageJson', 'testDep']);
      expect(result).toBeFalsy();
    });
    it('should return false if there is no dependencies in package json', async () => {
      filesystem.write('package.json', {});
      const result = await RunCommand.run(['hasDevDependencyInPackageJson', 'testDep']);
      expect(result).toBeFalsy();
    });
    it('should return true if no packageJson is in the path', async () => {
      filesystem.write('package.json', { devDependencies: { testDep: 'v1.0.0' } });
      const result = await RunCommand.run(['hasDevDependencyInPackageJson', 'testDep']);
      expect(result).toBeTruthy();
    });
  });

  describe('gitAddUnstaged', () => {
    it('should do nothing if nothing has to be done', async () => {
      await system.run('git init');
      filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
      await system.run('touch test.md');
      await system.run('git add * .nbxrc');
      await system.run('git commit -m "test"');
      const before = await system.run('git status -s');

      await RunCommand.run(['gitAddUnstaged']);

      const after = await system.run('git status -s');
      expect(before).toBe(after);
    });
    it('should add uncommited changes', async () => {
      await system.run('git init');
      filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
      await system.run('touch test.1.md');
      await system.run('touch test.2.md');
      await system.run('touch test.3.md');

      await RunCommand.run(['gitAddUnstaged']);

      const after = await system.run('git status -s');
      expect(after).toMatchSnapshot();
    });
  });

  describe('addDevDependency', () => {
    it('should add the dependancy with git', async () => {
      await initWithConfigAndCommit();

      const chalkLatest = await latestVersion('chalk');

      await RunCommand.run(['initGit']);
      await RunCommand.run(['addDevDependency', 'chalk', '--opt', '--no-spinner']);

      const after = await system.run('git log --name-status  --format="%s" -1');
      const afterSlitted = after
        .split('\n')
        .map(val => val.trim())
        .map(val => stripANSI(val))
        .filter(val => val !== '');
      const packageJsonFinal = filesystem.read('package.json', 'json');

      expect(consoleLogOutput).toMatchSnapshot();
      expect(packageJsonFinal).toStrictEqual({ devDependencies: { chalk: chalkLatest } });
      expect(afterSlitted[0]).toBe(
        `:heavy_plus_sign: add chalk@${chalkLatest} as a dev dependency`,
      );
      expect(afterSlitted[1]).toMatch(/package\.json$/);
      expect(afterSlitted[2]).toMatch(/yarn\.lock$/);
    });

    it('should add the dependancy without git', async () => {
      await initWithConfigAndCommit();

      const chalkLatest = await latestVersion('chalk');

      await RunCommand.run(['initGit']);
      await RunCommand.run(['addDevDependency', 'chalk', '--no-spinner']);

      const after = await system.run('git status --short');
      const packageJsonFinal = filesystem.read('package.json', 'json');

      expect(consoleLogOutput).toMatchSnapshot();
      expect(packageJsonFinal).toStrictEqual({ devDependencies: { chalk: chalkLatest } });
      expect(after).toMatchSnapshot();
    });
  });
  describe('addDependency', () => {
    it('should add the dependancy with git', async () => {
      await initWithConfigAndCommit();

      const chalkLatest = await latestVersion('chalk');

      await RunCommand.run(['initGit']);
      await RunCommand.run(['addDependency', 'chalk', '--opt', '--no-spinner']);

      const after = await system.run('git log --name-status  --format="%s" -1');
      const afterSlitted = after
        .split('\n')
        .map(val => val.trim())
        .map(val => stripANSI(val))
        .filter(val => val !== '');
      const packageJsonFinal = filesystem.read('package.json', 'json');

      expect(consoleLogOutput).toMatchSnapshot();
      expect(packageJsonFinal).toStrictEqual({ dependencies: { chalk: chalkLatest } });
      expect(afterSlitted[0]).toBe(`:heavy_plus_sign: add chalk@${chalkLatest} as a dependency`);
      expect(afterSlitted[1]).toMatch(/package\.json$/);
      expect(afterSlitted[2]).toMatch(/yarn\.lock$/);
    });

    it('should add the dependancy without git', async () => {
      await initWithConfigAndCommit();

      const chalkLatest = await latestVersion('chalk');

      await RunCommand.run(['initGit']);
      await RunCommand.run(['addDependency', 'chalk', '--no-spinner']);

      const after = await system.run('git status --short');
      const packageJsonFinal = filesystem.read('package.json', 'json');

      expect(consoleLogOutput).toMatchSnapshot();
      expect(packageJsonFinal).toStrictEqual({ dependencies: { chalk: chalkLatest } });
      expect(after).toMatchSnapshot();
    });
  });
});
