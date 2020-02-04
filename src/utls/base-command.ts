import {Command, flags} from '@oclif/command'
import {Input} from '@oclif/parser'
import {print} from 'gluegun'

export interface BaseCommandFlags {
  verbose: boolean;
}

export interface NbxConfig {
  git: {
    user: string;
    email: string;
  };
}

export abstract class BaseCommand extends Command {
    static flags = {
      verbose: flags.boolean({char: 'v', description: 'Verbose output'}),
      help: flags.help({char: 'h'}),
    };

    flags?: BaseCommandFlags;

    public tools = {
      print: print,
    };

    async init() {
      // do some initialization
      const {flags, args, argv} = this.parse(<Input<any>> this.constructor)
      this.flags = flags

      if (flags.verbose) {
        this.tools.print.debug(args, 'args')
        this.tools.print.debug(argv, 'argv')
        this.tools.print.debug(flags, 'flags')
      }
    }

    vprint(value: any, title?: string) {
      if (this.flags && this.flags.verbose) {
        this.tools.print.debug(value, title)
      }
    }

    async runWithSpinner(name: string, func: (spinner: any) => Promise<any>): Promise<any> {
      const spinner = this.tools.print.spin(name)
      try {
        const maybeRet = await func(spinner)
        if (spinner.isSpinning) {
          spinner.succeed()
        }
        return maybeRet
        // eslint-disable-next-line unicorn/catch-error-name
      } catch (maybeError) {
        spinner.fail(maybeError.message)
        this.error(maybeError)
      }
    }

    async getConfig(): Promise<{ config: NbxConfig; path: string }> {
      const cosmic = await import('cosmiconfig').then(cosmic => cosmic.cosmiconfig)
      const explorer = cosmic('nbx')
      const data = await explorer.search()
      if (!data || data.isEmpty || !data.config) {
        this.error('Config not found. Tried to look for a .nbxrc, .nbxrc.json, .nbxrc.yaml, .nbxrc.yml, .nbxrc.js')
      }
      return {
        config: data?.config,
        path: data?.filepath,
      }
    }
}
