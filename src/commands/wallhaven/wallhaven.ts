import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'wallhaven',
  description: 'Fetch a wallpaper on wallhaven',
  alias: ['w'],
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters,
      print: { info, error, spin },
      wallhaven: { search, downloadWallpaper },
      utils: { verboseDebug },
    } = toolbox



    const showHelp = () => {
      info('Usage: nbx wallhaven <terms ...>')
      info('')
      info('Options')
      info('   -r, --random        Pick one randomly')
      info('   --general           Enable general category')
      info('   --anime             Enable anime category')
      info('   --people            Enable people category')
      info('   -o --output [file]  Path to output the file')
      info('   -h, --help          Output usage information')
      info('   -v, --verbose       Verbose output')
    }

    // set up initial props (to pass into templates)
    const o = parameters.options
    const props = {
      random: Boolean(o.r || o.random),
      terms: parameters.string,
      sketchy: Boolean(o.sketchy),
      general: Boolean(o.general),
      anime: Boolean(o.anime),
      people: Boolean(o.people),
      useCustomOutput: Boolean(o.o || o.output),
      customOutput: o.o || o.output,
      help: Boolean(o.h || o.help),
      verbose: Boolean(o.v || o.verbose),
    }

    verboseDebug(props, 'Params')

    if (props.help) {
      showHelp()
      return
    }

    if (!props.general && !props.anime && !props.people) {
      error('You must use at least one category flag\n')
      showHelp()
      process.exit(0)
    }

    if (!props.terms) {
      error('You should use search terms\n')
      showHelp()
      process.exit(0)
    }

    const spinFetchList = spin('Searching wallpapers');
    const data = await search(props);
    spinFetchList.succeed();

    const firstImage = data[0];
    verboseDebug(firstImage, 'Image raw data')

    const filename = props.useCustomOutput ? props.customOutput : `wallhaven-${firstImage.id}.jpg`;

    const spinner = spin('Downloading wallpaper');
    await downloadWallpaper(filename, firstImage.path);
    spinner.succeed();
  }
}
