import { BaseCommand } from '../../utls/base-command';
// eslint-disable-next-line  unicorn/no-abusive-eslint-disable,@typescript-eslint/ban-ts-ignore
// @ts-ignore
import * as blinkstick from 'blinkstick';

interface WallhavenItem {
  id: string;
  url: string;
  path: string;
}

export default class Blinkstick extends BaseCommand {
  static description = 'set a color to the blinkstick led';

  static examples = [
    `$ nbx blink red`,
    `$ nbx blink green`,
    `$ nbx blink blue`,
  ];

  static args = [
    {
      name: 'color',
      description: 'The search terms for the wallpaper',
      required: true,
    },
  ];

  static flags = {
    ...BaseCommand.flags,
  };

  async run() {
    const {
      args: { color },
    } = this.parse(Blinkstick);

    const device = blinkstick.findFirst();

    if (!device) {
      this.error('No blinkstick found.');
    }

    [...new Array(10).keys()].forEach((index) => {
      device.setColor(color, { index });
    });

    this.tools.print.info('All good :)');
  }
}
