import { flags } from '@oclif/command';
import { BaseCommand } from '../../utls/base-command';
import axios from 'axios';
import { filesystem } from 'gluegun';

function booleanToNumber(value: boolean): string {
  return value ? '1' : '0';
}

interface WallhavenItem {
  id: string;
  url: string;
  path: string;
}

export default class Wall extends BaseCommand {
  static description = 'download a wallpaper from wallhaven using search';

  static examples = [
    `$ nbx wall -r "cat" -o "wall.jpg" -fg
`,
  ];

  static args = [
    {
      name: 'terms',
      description: 'The search terms for the wallpaper',
      required: true,
    },
  ];

  static flags = {
    ...BaseCommand.flags,
    random: flags.boolean({ char: 'r', description: 'Pick one randomly' }),
    sketchy: flags.boolean({
      char: 's',
      description: 'Enables sketchy search',
    }),
    general: flags.boolean({
      char: 'g',
      description: 'Enable general category',
    }),
    anime: flags.boolean({ char: 'a', description: 'Enable anime category' }),
    people: flags.boolean({ char: 'p', description: 'Enable people category' }),
    output: flags.string({
      char: 'o',
      description: 'Output for the wallpaper',
    }),
    force: flags.boolean({
      char: 'f',
      description: 'Override the file if found',
    }),
  };

  async run() {
    const { args, argv, flags } = this.parse(Wall);
    const { general, anime, people, output, force, random, sketchy } = flags;
    const { terms } = args;

    this.vprint(args, 'args');
    this.vprint(argv, 'argv');
    this.vprint(flags, 'flags');

    if (!general && !anime && !people) {
      this.error('You must use at least one category flag');
    }

    const resultFromSearch = await this.runWithSpinner(
      'Searching wallpapers',
      async () => {
        const categories = `${booleanToNumber(general)}${booleanToNumber(
          anime,
        )}${booleanToNumber(people)}`;
        const {
          data: { data },
        } = await axios.get<{ data: WallhavenItem[] }>(
          'https://wallhaven.cc/api/v1/search',
          {
            params: {
              q: `${terms}`,
              sorting: random ? 'random' : 'relevance',
              categories,
              purity: `1${booleanToNumber(sketchy)}0`,
              atleast: '1920x1080',
              ratios: '16x9',
            },
          },
        );
        return data;
      },
    );

    if (!resultFromSearch || resultFromSearch.length === 0) {
      this.error('No image found, try another search term');
    }

    const firstImage = resultFromSearch[0];
    this.vprint(firstImage, 'Image raw data');

    const filename = output ? output : `wallhaven-${firstImage.id}.jpg`;

    await this.runWithSpinner('Downloading wallpaper', async (spinner) => {
      if (filesystem.exists(filename)) {
        if (force) {
          spinner.warn(`Overriding ${filename}`);
        } else {
          spinner.fail(`The file ${filename} already exist`);
          this.error('The flag force was not set, aborting');
        }
      }

      const writer = filesystem.createWriteStream(filename, {});

      const response = await axios.get(firstImage.path, {
        method: 'GET',
        responseType: 'stream',
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      spinner.succeed(`Successfully wrote ${filename}.`);
    });
  }
}
