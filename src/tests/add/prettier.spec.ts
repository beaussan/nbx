import { filesystem, system } from 'gluegun';
const stripANSI = require('strip-ansi');
import * as prompts from 'prompts';
import * as latestVersion from 'latest-version';
import Prettier from '../../commands/add/prettier';

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
  filesystem.write('test.html', '<html><body><a>testokiii</a></body></html>');
  await system.run('touch yarn.lock');
  await system.run('echo node_modules > .gitignore');
  await system.run('git add * .nbxrc .gitignore');
  try {
    await system.run('git config user.email "you@example.com"');
    await system.run('git config user.name "Your Name"');
  } catch {}
  await system.run('git commit -m "init state"');
};

describe('prettier', () => {
  it('should print help correctly', async () => {
    try {
      await Prettier.run(['-h']);
    } catch {}
    expect(consoleLogOutput).toMatchSnapshot();
  });

  it('should work without commits', async () => {
    await initWithConfigAndCommit();
    prompts.inject(['**/*.{js,vue,json,ts,tsx,md,yml,html}', false]);
    const [latestHusky, latestPrettier, latestPrettyQuick] = await Promise.all([
      latestVersion('husky'),
      latestVersion('prettier'),
      latestVersion('pretty-quick'),
    ]);

    await Prettier.run(['--no-spinner']);

    const packageJson = filesystem.read('package.json', 'json');
    const htmlFile = filesystem.read('test.html', 'utf8');
    expect(consoleLogOutput).toMatchSnapshot();
    expect(packageJson).toStrictEqual({
      devDependencies: {
        'husky': latestHusky,
        'prettier': latestPrettier,
        'pretty-quick': latestPrettyQuick,
      },
      husky: {
        hooks: {
          'pre-commit': 'pretty-quick --staged',
        },
      },
      scripts: {
        'format:check': 'prettier --list-different "**/*.{js,vue,json,ts,tsx,md,yml,html}"',
        'format:write': 'prettier --write "**/*.{js,vue,json,ts,tsx,md,yml,html}"',
      },
    });
    expect(htmlFile).toMatchSnapshot();
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toHaveLength(6);
  });
  it('should work with commits', async () => {
    await initWithConfigAndCommit();
    prompts.inject(['**/*.{js,vue,json,ts,tsx,md,yml,html}', true]);
    const [latestHusky, latestPrettier, latestPrettyQuick] = await Promise.all([
      latestVersion('husky'),
      latestVersion('prettier'),
      latestVersion('pretty-quick'),
    ]);

    await Prettier.run(['--no-spinner']);

    const packageJson = filesystem.read('package.json', 'json');
    const htmlFile = filesystem.read('test.html', 'utf8');
    expect(consoleLogOutput).toMatchSnapshot();
    expect(packageJson).toStrictEqual({
      devDependencies: {
        'husky': latestHusky,
        'prettier': latestPrettier,
        'pretty-quick': latestPrettyQuick,
      },
      husky: {
        hooks: {
          'pre-commit': 'pretty-quick --staged',
        },
      },
      scripts: {
        'format:check': 'prettier --list-different "**/*.{js,vue,json,ts,tsx,md,yml,html}"',
        'format:write': 'prettier --write "**/*.{js,vue,json,ts,tsx,md,yml,html}"',
      },
    });
    expect(htmlFile).toMatchSnapshot();
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toStrictEqual([
      ':art: apply prettier style to project',
      'M\tpackage.json',
      'M\ttest.html',
      ':wrench: add prettierrc config file',
      'A\t.prettierrc',
      ':wrench: add script and husky to package.json',
      'M\tpackage.json',
      `:heavy_plus_sign: add pretty-quick@${latestPrettyQuick} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      `:heavy_plus_sign: add husky@${latestHusky} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      `:heavy_plus_sign: add prettier@${latestPrettier} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      'init state',
      'A\t.gitignore',
      'A\t.nbxrc',
      'A\tpackage.json',
      'A\ttest.html',
      'A\tyarn.lock',
    ]);
  });
});
