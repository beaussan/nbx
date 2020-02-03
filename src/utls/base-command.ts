import {Command, flags} from '@oclif/command'
import {print} from './print'
import {Input } from '@oclif/parser'
import { args } from '@oclif/parser'

export interface BaseCommandFlags {
  verbose: boolean;
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
      const {flags} = this.parse(<Input<any>> this.constructor)
      this.flags = flags
    }

    vprint(value: any, title?: string) {
      if (this.flags && this.flags.verbose) {
        this.tools.print.debug(value, title)
      }
    }
}
