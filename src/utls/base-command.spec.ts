import { BaseCommand, MyNoSpinner } from './base-command';
import { filesystem } from 'gluegun';
const stripANSI = require('strip-ansi');
/* eslint-disable no-console,max-nested-callbacks */

let consoleLogOutput: string[];
const originalLog = console.log;
const originalCwd = process.cwd();

beforeEach(() => {
  consoleLogOutput = [];
  console.log = (x: any) => consoleLogOutput.push(stripANSI(x));
});
afterEach(() => {
  console.log = originalLog;
  process.chdir(originalCwd);
  jest.restoreAllMocks();
});

describe('MyNoSpinner', () => {
  it('should start with a spinning state', () => {
    const spinner = new MyNoSpinner('AA');

    expect(spinner.isSpinning).toBeTruthy();
  });

  it('should display the start message', () => {
    const message = 'hello from the spinner';
    // eslint-disable-next-line no-new
    new MyNoSpinner(message);

    expect(consoleLogOutput).toMatchSnapshot();
  });

  it('should display the start message and success message', () => {
    const message = 'hello from the spinner';
    const spinner = new MyNoSpinner(message);
    spinner.succeed('SUCCESS');
    expect(spinner.isSpinning).toBeFalsy();

    expect(consoleLogOutput).toMatchSnapshot();
  });

  it('should display the start message and fail message', () => {
    const message = 'hello from the spinner';
    const spinner = new MyNoSpinner(message);
    spinner.fail('FAIL');
    expect(spinner.isSpinning).toBeFalsy();

    expect(consoleLogOutput).toMatchSnapshot();
  });

  it('should display the start message and success message', () => {
    const message = 'hello from the spinner';
    const spinner = new MyNoSpinner(message);
    spinner.warn('WARNING');
    expect(spinner.isSpinning).toBeTruthy();
    spinner.succeed('SUCCESS');
    expect(spinner.isSpinning).toBeFalsy();

    expect(consoleLogOutput).toMatchSnapshot();
  });
});

class SampleCommand extends BaseCommand {
  static flags = {
    ...BaseCommand.flags,
  };

  static args = [{ name: 'firstArg' }, { name: 'secondArg' }];

  async run() {
    this.vprint({ code: 'aaaa' }, 'SAMPLE');
    return 'hello';
  }
}

class ConfigCommand extends BaseCommand {
  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    return this.getConfig();
  }
}

describe('BaseCommand', () => {
  describe('flags', () => {
    describe('verbose', () => {
      it('should print args when run', async () => {
        await SampleCommand.run(['-v', 'firstArg', 'secondArg']);
        expect(consoleLogOutput).toMatchSnapshot();
      });
      it('should not print args when run', async () => {
        await SampleCommand.run(['firstArg', 'secondArg']);
        expect(consoleLogOutput).toHaveLength(0);
      });
    });
    describe('spinner', () => {
      it('should be enable by default', async () => {
        await SampleCommand.run(['-v']);
        expect(consoleLogOutput).toContainEqual({ verbose: true, spinner: true });
      });
      it('can be disabled', async () => {
        await SampleCommand.run(['-v', '--no-spinner']);
        expect(consoleLogOutput).toContainEqual({ verbose: true, spinner: false });
      });
    });
    describe('help', () => {
      it('should be set to h', async () => {
        try {
          await SampleCommand.run(['-h']);
        } catch {}
        expect(consoleLogOutput).toMatchSnapshot();
      });
      it('should be set to help', async () => {
        try {
          await SampleCommand.run(['--help']);
        } catch {}
        expect(consoleLogOutput).toMatchSnapshot();
      });
    });
  });

  describe('commands', () => {
    describe('getConfig', () => {
      it('should throw an error when no config is found', async () => {
        expect.assertions(1);
        try {
          process.chdir('/');
          await ConfigCommand.run([]);
          // eslint-disable-next-line unicorn/catch-error-name
        } catch (e) {
          expect(e).toMatchSnapshot();
        }
      });

      for (const jsonConfigFileName of ['.nbxrc', '.nbxrc.json']) {
        it(`should find configuration in the same folder with the name ${jsonConfigFileName}`, async () => {
          expect.assertions(1);
          const config = { git: { user: 'AAAA', email: 'BBBB' } };
          const tmpDirName = `${new Date().getTime()}-base-nbx-test`;
          const execPath = filesystem.path('/', 'tmp', tmpDirName);
          filesystem.dir(execPath);
          const path = filesystem.path(execPath, jsonConfigFileName);
          filesystem.write(path, config);

          process.chdir(execPath);
          try {
            const value = await ConfigCommand.run([]);
            expect(value).toStrictEqual({ config, path });
          } finally {
            filesystem.remove(path);
            filesystem.remove(execPath);
          }
        });
      }
    });
    describe('runWithSpinner', () => {
      it('should success automatically', async () => {
        class SpinnerSuccessCommand extends BaseCommand {
          static flags = {
            ...BaseCommand.flags,
          };

          async run() {
            await this.runWithSpinner('Should be good', async () => {
              return '';
            });
          }
        }
        await SpinnerSuccessCommand.run(['--no-spinner']);

        expect(consoleLogOutput).toMatchSnapshot();
      });
      it('should not double success', async () => {
        class SpinnerSuccessCommand extends BaseCommand {
          static flags = {
            ...BaseCommand.flags,
          };

          async run() {
            await this.runWithSpinner('Should be good', async spinner => {
              spinner.succeed('Yay, done.');
              return '';
            });
          }
        }
        await SpinnerSuccessCommand.run(['--no-spinner']);

        expect(consoleLogOutput).toMatchSnapshot();
      });
      it('should fail on error', async () => {
        class SpinnerSuccessCommand extends BaseCommand {
          static flags = {
            ...BaseCommand.flags,
          };

          async run() {
            try {
              await this.runWithSpinner('Should be good', async () => {
                throw new Error('FAILED !!!');
              });
            } finally {
              // eslint-disable-next-line no-unsafe-finally
              return 'done';
            }
          }
        }
        try {
          await SpinnerSuccessCommand.run(['--no-spinner']);
        } finally {
          expect(consoleLogOutput).toMatchSnapshot();
        }
      });
      it('should run default spinner without flag', async () => {
        class SpinnerSuccessCommand extends BaseCommand {
          static flags = {
            ...BaseCommand.flags,
          };

          async run() {
            await this.runWithSpinner('Should be good', async () => {
              return '';
            });
          }
        }
        try {
          await SpinnerSuccessCommand.run([]);
        } finally {
          expect(consoleLogOutput).toHaveLength(0);
        }
      });
      it('should return the function value', async () => {
        class SpinnerSuccessCommand extends BaseCommand {
          static flags = {
            ...BaseCommand.flags,
          };

          async run() {
            const ret = await this.runWithSpinner('Should be good', async spinner => {
              spinner.succeed('Yay, done.');
              return 'DONE';
            });
            expect(ret).toEqual('DONE');
          }
        }
        await SpinnerSuccessCommand.run(['--no-spinner']);

        expect(consoleLogOutput).toMatchSnapshot();
      });
    });
  });
});
