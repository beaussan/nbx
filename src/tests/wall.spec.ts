import { filesystem } from 'gluegun';
import Wall from '../commands/wall';
const stripANSI = require('strip-ansi');

jest.setTimeout(90000);
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

describe('wall command', () => {
  it('should print help correctly', async () => {
    try {
      await Wall.run(['-h']);
    } catch {}
    expect(consoleLogOutput).toMatchSnapshot();
  });

  it('should error when no flag is used', async () => {
    try {
      await Wall.run(['cats']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      expect(e).toEqual(new Error('You must use at least one category flag'));
    }
  });

  it('should download wallpaper and console output', async () => {
    try {
      await Wall.run(['cats', '-g', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch {}
    const lastEdited = consoleLogOutput.map((item, idx, arr) => {
      if (idx === arr.length - 1) {
        return item.replace(/wallhaven-.*\.jpg/g, 'wallhaven-thing.jpg');
      }
      return item;
    });
    expect(lastEdited).toMatchSnapshot();
    const files = filesystem.list('.');
    expect(files && files[0]).toMatch(/wallhaven-.*/);
  });

  it('should download wallpaper and console output to specific file', async () => {
    try {
      await Wall.run(['cats', '-owall.jpg', '-g', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch {}
    expect(consoleLogOutput).toMatchSnapshot();
    const files = filesystem.list('.');
    expect(files && files[0]).toBe('wall.jpg');
  });

  it('should print a warning when output exists', async () => {
    expect.assertions(4);
    filesystem.write('wall.jpg', { name: 'hello' });
    try {
      await Wall.run(['cats', '-owall.jpg', '-g', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (e) {
      expect(e).toEqual(new Error('The flag force was not set, aborting'));
    }
    expect(consoleLogOutput).toMatchSnapshot();
    const files = filesystem.list('.');
    expect(files && files[0]).toBe('wall.jpg');
    expect(filesystem.read('wall.jpg', 'json')).toStrictEqual({ name: 'hello' });
  });

  it('should print a warning when output exists with the force flag', async () => {
    expect.assertions(2);
    filesystem.write('wall.jpg', {});
    try {
      await Wall.run(['cats', '-owall.jpg', '-f', '-g', '--no-spinner']);
      // eslint-disable-next-line unicorn/catch-error-name
    } catch {}
    expect(consoleLogOutput).toMatchSnapshot();
    const files = filesystem.list('.');
    expect(files && files[0]).toBe('wall.jpg');
  });
});
