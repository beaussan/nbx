import { filesystem, system } from 'gluegun';
const stripANSI = require('strip-ansi');
import * as latestVersion from 'latest-version';
import Dep from '../../commands/add/dep';

jest.setTimeout(90000);

/* eslint-disable no-console,max-nested-callbacks,@typescript-eslint/ban-ts-ignore */
let consoleLogOutput: string[];
let execPath: string;
const originalCwd = process.cwd();
const originalLog = console.log;

beforeEach(async () => {
  consoleLogOutput = [];
  console.log = (x: any) => consoleLogOutput.push(stripANSI(x));

  const tmpDirName = `${new Date().getTime()}-${Math.random() * 100}-add-nbx-test`;
  execPath = filesystem.path('/', 'tmp', tmpDirName);
  filesystem.dir(execPath);
  process.chdir(execPath);
});
afterEach(() => {
  console.log = originalLog;
  process.chdir(originalCwd);
  jest.restoreAllMocks();
  filesystem.remove(execPath);
});

const initWithConfigAndCommit = async () => {
  await system.run('git init');
  filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
  filesystem.write('package.json', {});
  await system.run('touch yarn.lock');
  await system.run('echo node_modules > .gitignore');
  await system.run('git add * .nbxrc .gitignore');
  try {
    await system.run('git config user.email "you@example.com"');
    await system.run('git config user.name "Your Name"');
  } catch {}
  await system.run('git commit -m "init state"');
};

describe('dep', () => {
  it('should print help correctly', async () => {
    try {
      await Dep.run(['-h']);
    } catch {}
    expect(consoleLogOutput).toMatchSnapshot();
  });
  it('should fail if no package.json found', async () => {
    expect.assertions(1);
    try {
      filesystem.remove('package.json');
      await Dep.run(['chalk', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
  it('should fail if dependancy is already in package.json', async () => {
    expect.assertions(1);
    try {
      filesystem.write('package.json', { dependencies: { chalk: '2.3.2' } });
      await Dep.run(['chalk', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });
  it('should fail if dev dependancy is already in package.json', async () => {
    expect.assertions(1);
    try {
      filesystem.write('package.json', { devDependencies: { chalk: '2.3.2' } });
      await Dep.run(['chalk', '--dev', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      expect(e).toMatchSnapshot();
    }
  });

  it('should work with dependency', async () => {
    await initWithConfigAndCommit();
    const latestChalk = await latestVersion('chalk');

    await Dep.run(['chalk', '--no-spinner']);

    const packageJson = filesystem.read('package.json', 'json');
    expect(consoleLogOutput).toMatchSnapshot();
    expect(packageJson).toStrictEqual({
      dependencies: {
        chalk: latestChalk,
      },
    });
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toStrictEqual([
      `:heavy_plus_sign: add chalk@${latestChalk} as a dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      'init state',
      'A\t.gitignore',
      'A\t.nbxrc',
      'A\tpackage.json',
      'A\tyarn.lock',
    ]);
  });

  it('should work with a dev dependency', async () => {
    await initWithConfigAndCommit();
    const latestChalk = await latestVersion('chalk');

    await Dep.run(['chalk', '-D', '--no-spinner']);

    const packageJson = filesystem.read('package.json', 'json');
    expect(consoleLogOutput).toMatchSnapshot();
    expect(packageJson).toStrictEqual({
      devDependencies: {
        chalk: latestChalk,
      },
    });
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toStrictEqual([
      `:heavy_plus_sign: add chalk@${latestChalk} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      'init state',
      'A\t.gitignore',
      'A\t.nbxrc',
      'A\tpackage.json',
      'A\tyarn.lock',
    ]);
  });
});
