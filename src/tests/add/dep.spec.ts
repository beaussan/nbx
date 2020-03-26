import { filesystem } from 'gluegun';
import * as latestVersion from 'latest-version';
import Dep from '../../commands/add/dep';
import { expectFailCli, expectGitCommits, testCli } from '../test-helpers.spec';

jest.setTimeout(90000);

testCli({
  runCommand: (args: string[]) => Dep.run(args),
  name: 'nbx add:dep',
  defaultArgs: ['--no-spinner'],
  tests: [
    {
      name: 'fail if no package.json found',
      runner: expectFailCli({
        args: ['chalk'],
        errorMessage:
          'There is no package.json not found in the current folder',
        before: async () => {
          filesystem.remove('package.json');
        },
      }),
    },
    /*
     */
    {
      name: 'fail if dependancy is already in package.json',
      runner: expectFailCli({
        args: ['chalk'],
        errorMessage: 'chalk is already installed in this project.',
        packageJson: { dependencies: { chalk: '2.3.2' } },
        withGitSetup: true,
      }),
    },

    {
      name: 'fail if dev dependancy is already in package.json',
      runner: expectFailCli({
        args: ['chalk', '-D'],
        errorMessage: 'chalk is already installed in this project.',
        packageJson: { devDependencies: { chalk: '2.3.2' } },
        withGitSetup: true,
      }),
    },
    {
      name: 'work with dependency',
      runner: expectGitCommits({
        args: ['chalk'],
        expectGitLog: async () => {
          const latestChalk = await latestVersion('chalk');
          return [
            `:heavy_plus_sign: add chalk@${latestChalk} as a dependency`,
            'M\tpackage.json',
            'M\tyarn.lock',
          ];
        },
        checks: async () => {
          const latestChalk = await latestVersion('chalk');

          const packageJson = filesystem.read('package.json', 'json');
          expect(packageJson).toStrictEqual({
            dependencies: {
              chalk: latestChalk,
            },
          });
        },
      }),
    },
    {
      name: 'work with a dev dependency',
      runner: expectGitCommits({
        args: ['chalk', '-D'],
        expectGitLog: async () => {
          const latestChalk = await latestVersion('chalk');
          return [
            `:heavy_plus_sign: add chalk@${latestChalk} as a dev dependency`,
            'M\tpackage.json',
            'M\tyarn.lock',
          ];
        },
        checks: async () => {
          const latestChalk = await latestVersion('chalk');

          const packageJson = filesystem.read('package.json', 'json');
          expect(packageJson).toStrictEqual({
            devDependencies: {
              chalk: latestChalk,
            },
          });
        },
      }),
    },
  ],
});
