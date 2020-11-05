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
  const [tailwind, craco] = await Promise.all([
    latestVersion('tailwindcss'),
    latestVersion('@craco/craco'),
  ]);
  const packageJson = filesystem.read('package.json', 'json');

  expect(filesystem.read('src/css/tailwind.css', 'utf8')).toMatchSnapshot();
  expect(filesystem.read('tailwind.config.js', 'utf8')).toBeDefined();
  expect(packageJson).toStrictEqual({
    name: 'sample',
    version: '0.1.0',
    private: true,
    dependencies: {
      'react-scripts': '3.3.1',
      'tailwindcss': tailwind,
    },
    devDependencies: {
      '@craco/craco': craco,
    },
    scripts: {
      start: 'craco start',
      build: 'craco build',
      test: 'craco test',
      eject: 'react-scripts eject',
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
      name: 'error if craco is found',
      runner: expectFailGitCommits({
        packageJson: {
          dependencies: {
            '@craco/craco': '2.0.0',
          },
        },
        errorMessage:
          'Craco is already installed, this may bug so in case, I will stop there.',
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
          const [tailwind, craco] = await Promise.all([
            latestVersion('tailwindcss'),
            latestVersion('@craco/craco'),
          ]);

          return [
            ':wrench: add script for tailwind to package.json',
            'M\tpackage.json',
            ':wrench: add tailwind css file',
            'A\tsrc/css/tailwind.css',
            ':wrench: craco postcss config file',
            'A\tcraco.config.js',
            ':wrench: add tailwind config file',
            'A\ttailwind.config.js',
            `:heavy_plus_sign: add tailwindcss@${tailwind} as a dependency`,
            'M\tpackage.json',
            'M\tyarn.lock',
            `:heavy_plus_sign: add @craco/craco@${craco} as a dev dependency`,
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
