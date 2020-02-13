import { filesystem, system } from 'gluegun';
const stripANSI = require('strip-ansi');
import * as prompts from 'prompts';
import * as latestVersion from 'latest-version';
import Tailwind from '../../commands/add/tailwind';

jest.setTimeout(30000);

/* eslint-disable no-console,max-nested-callbacks,@typescript-eslint/ban-ts-ignore */
let consoleLogOutput: string[];
let execPath: string;
const originalCwd = process.cwd();
const originalLog = console.log;

beforeEach(() => {
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

const initWithConfigAndCommit = async (packageJson = {}) => {
  await system.run('git init');
  filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
  filesystem.write('package.json', packageJson);
  filesystem.write('test.html', '<html><body><a>testokiii</a></body></html>');
  await system.run('touch yarn.lock');
  await system.run('echo node_modules > .gitignore');
  await system.run('git add * .nbxrc .gitignore');
  await system.run('git commit -m "init state"');
};

describe('tailwind', () => {
  it('should print help correctly', async () => {
    try {
      await Tailwind.run(['-h']);
    } catch {}
    expect(consoleLogOutput).toMatchSnapshot();
  });

  it('should error if no react is found', async () => {
    await initWithConfigAndCommit();

    try {
      await Tailwind.run(['--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      expect(e).toEqual(new Error('This script support only for now create react apps.'));
    }
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toHaveLength(6);
  });

  it('should work on a react application without commits', async () => {
    await initWithConfigAndCommit({
      name: 'sample',
      version: '0.1.0',
      private: true,
      dependencies: {
        'react-scripts': '3.3.1',
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
      },
      eslintConfig: {
        extends: 'react-app',
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
      },
    });
    prompts.inject([false]);

    const [tailwind, purgecss, autoprefixer, npmRunAll, postcss] = await Promise.all([
      latestVersion('tailwindcss'),
      latestVersion('@fullhuman/postcss-purgecss'),
      latestVersion('autoprefixer'),
      latestVersion('npm-run-all'),
      latestVersion('postcss-cli'),
    ]);

    await Tailwind.run(['--no-spinner']);

    const status = await system.run('git status --short');

    const packageJson = filesystem.read('package.json', 'json');
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toHaveLength(6);
    expect(status.split('\n')).toStrictEqual([
      ' M .gitignore',
      ' M package.json',
      ' M yarn.lock',
      '?? postcss.config.js',
      '?? src/',
      '?? tailwind.config.js',
      '',
    ]);
    expect(filesystem.read('postcss.config.js', 'utf8')).toMatchSnapshot();
    expect(packageJson).toStrictEqual({
      name: 'sample',
      version: '0.1.0',
      private: true,
      dependencies: {
        'react-scripts': '3.3.1',
        'tailwindcss': tailwind,
      },
      devDependencies: {
        '@fullhuman/postcss-purgecss': purgecss,
        'autoprefixer': autoprefixer,
        'npm-run-all': npmRunAll,
        'postcss-cli': postcss,
      },
      scripts: {
        'start': 'npm-run-all -p start:css start:js',
        'start:css': 'postcss src/css/tailwind.src.css -o src/tailwind.css -w',
        'start:js': 'react-scripts start',
        'build': 'npm-run-all build:css build:js',
        'build:css': 'postcss src/css/tailwind.src.css -o src/tailwind.css --env production',
        'build:js': 'react-scripts build',
        'test': 'react-scripts test',
        'eject': 'react-scripts eject',
      },
      eslintConfig: {
        extends: 'react-app',
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
      },
    });
  });

  it('should work on a react application with commits', async () => {
    await initWithConfigAndCommit({
      name: 'sample',
      version: '0.1.0',
      private: true,
      dependencies: {
        'react-scripts': '3.3.1',
      },
      scripts: {
        start: 'react-scripts start',
        build: 'react-scripts build',
        test: 'react-scripts test',
        eject: 'react-scripts eject',
      },
      eslintConfig: {
        extends: 'react-app',
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
      },
    });
    prompts.inject([true]);

    const [tailwind, purgecss, autoprefixer, npmRunAll, postcss] = await Promise.all([
      latestVersion('tailwindcss'),
      latestVersion('@fullhuman/postcss-purgecss'),
      latestVersion('autoprefixer'),
      latestVersion('npm-run-all'),
      latestVersion('postcss-cli'),
    ]);

    await Tailwind.run(['--no-spinner']);

    const packageJson = filesystem.read('package.json', 'json');
    const after = await system.run('git log --name-status  --format="%s"');
    const afterSlitted = after
      .split('\n')
      .map(val => val.trim())
      .map(val => stripANSI(val))
      .filter(val => val !== '');

    expect(afterSlitted).toStrictEqual([
      ':see_no_evil: add generated tailwind to .gitignore',
      'M\t.gitignore',
      ':wrench: add script for tailwind to package.json',
      'M\tpackage.json',
      ':wrench: add tailwind css file',
      'A\tsrc/css/tailwind.src.css',
      ':wrench: add postcss config file',
      'A\tpostcss.config.js',
      ':wrench: add tailwind config file',
      'A\ttailwind.config.js',
      `:heavy_plus_sign: add tailwindcss@${tailwind} as a dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      `:heavy_plus_sign: add postcss-cli@${postcss} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      `:heavy_plus_sign: add npm-run-all@${npmRunAll} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      `:heavy_plus_sign: add autoprefixer@${autoprefixer} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      `:heavy_plus_sign: add @fullhuman/postcss-purgecss@${purgecss} as a dev dependency`,
      'M\tpackage.json',
      'M\tyarn.lock',
      'init state',
      'A\t.gitignore',
      'A\t.nbxrc',
      'A\tpackage.json',
      'A\ttest.html',
      'A\tyarn.lock',
    ]);
    expect(filesystem.read('postcss.config.js', 'utf8')).toMatchSnapshot();
    expect(packageJson).toStrictEqual({
      name: 'sample',
      version: '0.1.0',
      private: true,
      dependencies: {
        'react-scripts': '3.3.1',
        'tailwindcss': tailwind,
      },
      devDependencies: {
        '@fullhuman/postcss-purgecss': purgecss,
        'autoprefixer': autoprefixer,
        'npm-run-all': npmRunAll,
        'postcss-cli': postcss,
      },
      scripts: {
        'start': 'npm-run-all -p start:css start:js',
        'start:css': 'postcss src/css/tailwind.src.css -o src/tailwind.css -w',
        'start:js': 'react-scripts start',
        'build': 'npm-run-all build:css build:js',
        'build:css': 'postcss src/css/tailwind.src.css -o src/tailwind.css --env production',
        'build:js': 'react-scripts build',
        'test': 'react-scripts test',
        'eject': 'react-scripts eject',
      },
      eslintConfig: {
        extends: 'react-app',
      },
      browserslist: {
        production: ['>0.2%', 'not dead', 'not op_mini all'],
        development: ['last 1 chrome version', 'last 1 firefox version', 'last 1 safari version'],
      },
    });
  });
});
