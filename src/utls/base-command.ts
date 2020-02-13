import { Command, flags } from '@oclif/command';
import { Input } from '@oclif/parser';
import { print } from 'gluegun';

export interface BaseCommandFlags {
  verbose: boolean;
  spinner: boolean;
}

export interface NbxConfig {
  git: {
    user: string;
    email: string;
  };
}

export interface SpinnerInterface {
  warn: (message: string) => void;
  fail: (message: string) => void;
  succeed: (message?: string) => void;
  isSpinning: boolean;
}

export class MyNoSpinner implements SpinnerInterface {
  get isSpinning(): boolean {
    return this._isSpinning;
  }

  private _isSpinning = false;

  constructor(message: string) {
    this._isSpinning = true;
    print.info(message);
  }

  public fail(message: string): void {
    this._isSpinning = false;
    print.error(message);
  }

  public succeed(message?: string): void {
    this._isSpinning = false;
    print.success(message ?? 'The step was done without any error.');
  }

  public warn(message: string): void {
    print.warning(message);
  }
}

export abstract class BaseCommand extends Command {
  static flags = {
    verbose: flags.boolean({ char: 'v', description: 'Verbose output' }),
    spinner: flags.boolean({
      description: 'Enable spinner in cli output, true by default',
      allowNo: true,
      default: true,
    }),
    help: flags.help({ char: 'h' }),
  };

  flags?: BaseCommandFlags;

  public tools = {
    print: print,
  };

  async init() {
    // do some initialization
    const { flags, args, argv } = this.parse(this.constructor as Input<any>);
    this.flags = flags;

    if (flags.verbose) {
      this.tools.print.debug(args, 'args');
      this.tools.print.debug(argv, 'argv');
      this.tools.print.debug(flags, 'flags');
    }
  }

  vprint(value: any, title?: string) {
    if (this.flags?.verbose) {
      this.tools.print.debug(value, title);
    }
  }

  async runWithSpinner<T>(
    name: string,
    func: (spinner: SpinnerInterface) => Promise<T>,
  ): Promise<T> {
    let spinner: SpinnerInterface;
    if (this.flags?.spinner) {
      spinner = this.tools.print.spin(name);
    } else {
      spinner = new MyNoSpinner(name);
    }
    try {
      const maybeRet = await func(spinner);
      if (spinner.isSpinning) {
        spinner.succeed();
      }
      return maybeRet;
      // eslint-disable-next-line unicorn/catch-error-name
    } catch (maybeError) {
      spinner.fail(maybeError.message);
      this.error(maybeError);
    }
  }

  async getConfig(): Promise<{ config: NbxConfig; path: string }> {
    const cosmic = await import('cosmiconfig').then(cosmic => cosmic.cosmiconfig);
    const explorer = cosmic('nbx');
    const data = await explorer.search();
    if (!data || data.isEmpty || !data.config) {
      this.error(
        'Config not found. Tried to look for a .nbxrc, .nbxrc.json, .nbxrc.yaml, .nbxrc.yml, .nbxrc.js',
      );
    }
    return {
      config: data?.config,
      path: data?.filepath,
    };
  }
}
