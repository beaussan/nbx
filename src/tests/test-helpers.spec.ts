import { Command } from '@oclif/command';
const stripANSI = require('strip-ansi');
import { filesystem, system } from 'gluegun';

export type TestRun = (args: { exec: Function; defaultArgs?: string[] }) => Promise<any>;

export interface TestCase {
  name: string;
  runner: TestRun;
}

export interface TestCliParams {
  tests: TestCase[];
  runCommand: (args: string[]) => PromiseLike<any>;
  name: string;
  defaultArgs?: string[];
}

export const createDefaultNbxConfig = async () => {
  filesystem.write('.nbxrc', { git: { user: 'aaa', email: 'bbb' } });
};

export const initWithConfigAndCommit = async () => {
  await system.run('git init');
  await createDefaultNbxConfig();
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

export const expectGitCommits = ({
  before,
  args,
  expectGitLog,
  checks,
}: {
  args: string[];
  expectGitLog: string[] | (() => Promise<any>);
  before?: () => Promise<any>;
  checks?: () => Promise<any>;
}): TestRun => async ({ exec, defaultArgs = [] }) => {
  await initWithConfigAndCommit();
  await before?.();

  try {
    await exec([...args, ...defaultArgs]);
  } catch {
    fail('Cli errored');
  }

  const after = await system.run('git log --name-status  --format="%s"');
  const afterSlitted = after
    .split('\n')
    .map(val => val.trim())
    .map(val => stripANSI(val))
    .filter(val => val !== '');

  if (expectGitLog instanceof Function) {
    expect(afterSlitted).toStrictEqual([
      ...(await expectGitLog()),
      'init state',
      'A\t.gitignore',
      'A\t.nbxrc',
      'A\tpackage.json',
      'A\tyarn.lock',
    ]);
  } else {
    expect(afterSlitted).toStrictEqual([
      ...expectGitLog,
      'init state',
      'A\t.gitignore',
      'A\t.nbxrc',
      'A\tpackage.json',
      'A\tyarn.lock',
    ]);
  }

  await checks?.();
};

export const expectFailCli = ({
  assertions = 4,
  before,
  args,
  errorMessage,
}: {
  assertions?: number;
  before?: () => Promise<any>;
  args: string[];
  errorMessage: string;
}): TestRun => async ({ exec, defaultArgs = [] }) => {
  expect.assertions(assertions);
  try {
    await before?.();

    await exec([...args, ...defaultArgs]);
    // eslint-disable-next-line unicorn/catch-error-name
  } catch (e) {
    expect(e).toBeDefined();
    expect(e.message).toBeDefined();
    expect(e.message).toBe(errorMessage);
  }
};

export const testCli = ({ tests, runCommand, name, defaultArgs }: TestCliParams) => {
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

  describe(name, () => {
    it('should print help correctly', async () => {
      try {
        await runCommand(['-h']);
      } catch {}
      expect(consoleLogOutput).toMatchSnapshot();
    });

    tests.forEach(testCase => {
      it(`should ${testCase.name}`, async () => {
        await testCase.runner({ exec: runCommand, defaultArgs: defaultArgs });
        expect(consoleLogOutput).toMatchSnapshot();
      });
    });
  });
};

const testHelp = (command: Command) => {
  it('');
};
