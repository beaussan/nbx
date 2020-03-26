import { filesystem } from 'gluegun';
import * as prompts from 'prompts';
import * as latestVersion from 'latest-version';
import Tailwind from '../../commands/add/tailwind';
import {
  expectFailCli,
  expectFailGitCommits,
  expectGitCommits,
  testCli,
} from '../test-helpers.spec';

jest.setTimeout(90000);

const checkPackgeAndPostcssConfig = async () => {
  const [
    tailwind,
    purgecss,
    autoprefixer,
    npmRunAll,
    postcss,
  ] = await Promise.all([
    latestVersion('tailwindcss'),
    latestVersion('@fullhuman/postcss-purgecss'),
    latestVersion('autoprefixer'),
    latestVersion('npm-run-all'),
    latestVersion('postcss-cli'),
  ]);
  const packageJson = filesystem.read('package.json', 'json');

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
      'build:css':
        'postcss src/css/tailwind.src.css -o src/tailwind.css --env production',
      'build:js': 'react-scripts build',
      'test': 'react-scripts test',
      'eject': 'react-scripts eject',
    },
  });
};

testCli({
  runCommand: (args: string[]) => Tailwind.run(args),
  name: 'nbx add:tailwind',
  defaultArgs: ['--no-spinner'],
  tests: [
    {
      name: 'fail if no package.json found',
      runner: expectFailCli({
        errorMessage:
          'There is no package.json not found in the current folder',
        before: async () => {
          filesystem.remove('package.json');
        },
      }),
    },
    {
      name: 'error if no react is found',
      runner: expectFailGitCommits({
        errorMessage: 'This script support only for now create react apps.',
      }),
    },
    {
      name: 'error if tailwind is found',
      runner: expectFailGitCommits({
        packageJson: {
          dependencies: {
            tailwind: '2.0.0',
          },
        },
        errorMessage: 'Tailwind is already installed in this project.',
      }),
    },
    {
      name: 'work on a react application without commits',
      runner: expectGitCommits({
        packageJson: {
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
        },
        expectGitLog: [],
        before: async () => {
          prompts.inject([false]);
        },
        checks: checkPackgeAndPostcssConfig,
      }),
    },
    {
      name: 'work on a react application with commits',
      runner: expectGitCommits({
        packageJson: {
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
        },
        expectGitLog: async () => {
          const [
            tailwind,
            purgecss,
            autoprefixer,
            npmRunAll,
            postcss,
          ] = await Promise.all([
            latestVersion('tailwindcss'),
            latestVersion('@fullhuman/postcss-purgecss'),
            latestVersion('autoprefixer'),
            latestVersion('npm-run-all'),
            latestVersion('postcss-cli'),
          ]);

          return [
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
          ];
        },
        before: async () => {
          prompts.inject([true]);
        },
        checks: checkPackgeAndPostcssConfig,
      }),
    },
  ],
});
