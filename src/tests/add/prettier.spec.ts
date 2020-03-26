import { filesystem } from 'gluegun';
import * as prompts from 'prompts';
import * as latestVersion from 'latest-version';
import Prettier from '../../commands/add/prettier';
import {
  expectFailCli,
  expectFailGitCommits,
  expectGitCommits,
  testCli,
  TestRun,
} from '../test-helpers.spec';

jest.setTimeout(90000);

const beforeCreateHtml = async () => {
  filesystem.write('test.html', '<html><body><a>testokiii</a></body></html>');
};

const checkFiles = async (extraDevDeps = {}) => {
  const [latestHusky, latestPrettier, latestPrettyQuick] = await Promise.all([
    latestVersion('husky'),
    latestVersion('prettier'),
    latestVersion('pretty-quick'),
  ]);
  const packageJson = filesystem.read('package.json', 'json');
  const htmlFile = filesystem.read('test.html', 'utf8');
  expect(packageJson).toStrictEqual({
    devDependencies: {
      ...extraDevDeps,
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
      'format:check':
        'prettier --list-different "**/*.{js,vue,json,ts,tsx,md,yml,html}"',
      'format:write':
        'prettier --write "**/*.{js,vue,json,ts,tsx,md,yml,html}"',
    },
  });
  expect(htmlFile).toMatchSnapshot();
};

export const expectEslintWithParams = ({
  eslintName,
  eslintJson,
  expectedEslint,
}: {
  eslintName: string;
  eslintJson: object | string;
  expectedEslint: object;
}): TestRun =>
  expectGitCommits({
    before: async () => {
      await beforeCreateHtml();
      filesystem.write(eslintName, eslintJson);
      prompts.inject(['**/*.{js,vue,json,ts,tsx,md,yml,html}', true, true]);
    },
    checks: async () => {
      const [
        latestEslintPluginPrettier,
        latestEslintConfigPrettier,
      ] = await Promise.all([
        latestVersion('eslint-plugin-prettier'),
        latestVersion('eslint-config-prettier'),
      ]);
      await checkFiles({
        'eslint-plugin-prettier': latestEslintPluginPrettier,
        'eslint-config-prettier': latestEslintConfigPrettier,
      });
      const eslintOutput = filesystem.read(eslintName, 'json');
      expect(eslintOutput).toStrictEqual(expectedEslint);
    },
    expectGitLog: async () => {
      const [
        latestHusky,
        latestPrettier,
        latestPrettyQuick,
        latestEslintPluginPrettier,
        latestEslintConfigPrettier,
      ] = await Promise.all([
        latestVersion('husky'),
        latestVersion('prettier'),
        latestVersion('pretty-quick'),
        latestVersion('eslint-plugin-prettier'),
        latestVersion('eslint-config-prettier'),
      ]);
      return [
        ':wrench: update eslint to use prettier',
        `M\t${eslintName}`,
        `:heavy_plus_sign: add eslint-plugin-prettier@${latestEslintPluginPrettier} as a dev dependency`,
        'M\tpackage.json',
        'M\tyarn.lock',
        `:heavy_plus_sign: add eslint-config-prettier@${latestEslintConfigPrettier} as a dev dependency`,
        'M\tpackage.json',
        'M\tyarn.lock',
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
      ];
    },
  });

export const expectTslintWithParams = ({
  tslintJson,
  expectedTslint,
}: {
  tslintJson: object | string;
  expectedTslint: object;
}): TestRun =>
  expectGitCommits({
    before: async () => {
      await beforeCreateHtml();
      filesystem.write('tslint.json', tslintJson);
      prompts.inject(['**/*.{js,vue,json,ts,tsx,md,yml,html}', true, true]);
    },
    checks: async () => {
      const [
        latestTslintConfigPrettier,
        latestTslintPluginPrettier,
      ] = await Promise.all([
        latestVersion('tslint-config-prettier'),
        latestVersion('tslint-plugin-prettier'),
      ]);
      await checkFiles({
        'tslint-config-prettier': latestTslintConfigPrettier,
        'tslint-plugin-prettier': latestTslintPluginPrettier,
      });
      const tslintOutput = filesystem.read('tslint.json', 'json');
      expect(tslintOutput).toStrictEqual(expectedTslint);
    },
    expectGitLog: async () => {
      const [
        latestHusky,
        latestPrettier,
        latestPrettyQuick,
        latestTslintPluginPrettier,
        latestTslintConfigPrettier,
      ] = await Promise.all([
        latestVersion('husky'),
        latestVersion('prettier'),
        latestVersion('pretty-quick'),
        latestVersion('tslint-config-prettier'),
        latestVersion('tslint-plugin-prettier'),
      ]);
      return [
        ':wrench: update tslint to use prettier',
        `M\ttslint.json`,
        `:heavy_plus_sign: add tslint-plugin-prettier@${latestTslintConfigPrettier} as a dev dependency`,
        'M\tpackage.json',
        'M\tyarn.lock',
        `:heavy_plus_sign: add tslint-config-prettier@${latestTslintPluginPrettier} as a dev dependency`,
        'M\tpackage.json',
        'M\tyarn.lock',
        ':art: apply prettier style to project',
        'M\tpackage.json',
        'M\ttest.html',
        'M\ttslint.json',
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
      ];
    },
  });

testCli({
  runCommand: (args: string[]) => Prettier.run(args),
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
      name: 'fail if prettier is found in package.json',
      runner: expectFailGitCommits({
        errorMessage: 'Prettier is already installed in this project.',
        packageJson: {
          devDependencies: {
            prettier: '2.0.0',
          },
        },
      }),
    },
    {
      name: 'work without commits',
      runner: expectGitCommits({
        expectGitLog: [],
        checks: checkFiles,
        before: async () => {
          await beforeCreateHtml();
          prompts.inject(['**/*.{js,vue,json,ts,tsx,md,yml,html}', false]);
        },
      }),
    },
    {
      name: 'work with commits',
      runner: expectGitCommits({
        expectGitLog: async () => {
          const [
            latestHusky,
            latestPrettier,
            latestPrettyQuick,
          ] = await Promise.all([
            latestVersion('husky'),
            latestVersion('prettier'),
            latestVersion('pretty-quick'),
          ]);
          return [
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
          ];
        },
        checks: checkFiles,
        before: async () => {
          await beforeCreateHtml();
          prompts.inject(['**/*.{js,vue,json,ts,tsx,md,yml,html}', true]);
        },
      }),
    },
    {
      name: 'work with tslint and commits and with an empty config',
      runner: expectTslintWithParams({
        tslintJson: {},
        expectedTslint: {
          extends: ['tslint-plugin-prettier', 'tslint-config-prettier'],
          rules: {
            prettier: true,
          },
        },
      }),
    },
    {
      name: 'work with tslint and commits and with an existing rules config',
      runner: expectTslintWithParams({
        tslintJson: {
          rules: {
            toto: true,
          },
        },
        expectedTslint: {
          extends: ['tslint-plugin-prettier', 'tslint-config-prettier'],
          rules: {
            toto: true,
            prettier: true,
          },
        },
      }),
    },
    {
      name:
        'work with tslint and commits and with an existing extends as string',
      runner: expectTslintWithParams({
        tslintJson: {
          extends: 'my-think',
          rules: {
            toto: true,
          },
        },
        expectedTslint: {
          extends: [
            'my-think',
            'tslint-plugin-prettier',
            'tslint-config-prettier',
          ],
          rules: {
            toto: true,
            prettier: true,
          },
        },
      }),
    },
    {
      name:
        'work with tslint and commits and with an existing extends as array',
      runner: expectTslintWithParams({
        tslintJson: {
          extends: ['my-think'],
          rules: {
            toto: true,
          },
        },
        expectedTslint: {
          extends: [
            'my-think',
            'tslint-plugin-prettier',
            'tslint-config-prettier',
          ],
          rules: {
            toto: true,
            prettier: true,
          },
        },
      }),
    },
    {
      name: 'work with eslint and commits and with an empty .eslintrc',
      runner: expectEslintWithParams({
        eslintName: '.eslintrc',
        eslintJson: {},
        expectedEslint: {
          extends: ['plugin:prettier/recommended'],
        },
      }),
    },
    {
      name: 'work with eslint and commits and with extends as array .eslintrc',
      runner: expectEslintWithParams({
        eslintJson: {
          extends: ['test'],
        },
        eslintName: '.eslintrc',
        expectedEslint: {
          extends: ['test', 'plugin:prettier/recommended'],
        },
      }),
    },
    {
      name:
        'work with eslint and commits and with extends as array .eslintrc.json',
      runner: expectEslintWithParams({
        eslintJson: '{}\n',
        eslintName: '.eslintrc.json',
        expectedEslint: {
          extends: ['plugin:prettier/recommended'],
        },
      }),
    },
    {
      name: 'work with eslint and commits and with extends as string .eslintrc',
      runner: expectEslintWithParams({
        eslintJson: {
          extends: 'test',
        },
        eslintName: '.eslintrc',
        expectedEslint: {
          extends: ['test', 'plugin:prettier/recommended'],
        },
      }),
    },
  ],
});
