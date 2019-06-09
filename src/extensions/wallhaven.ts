import { GluegunToolbox } from 'gluegun'
import { stringify } from 'querystring'

function boolanToNumber(value) {
  return value ? '1' : '0'
}
// add your CLI-specific functionality here, which will then be accessible
// to your commands
module.exports = (toolbox: GluegunToolbox) => {
  const api = toolbox.http.create({
    baseURL: 'https://wallhaven.cc/api/v1/'
  })

  const search = async ({
    random = false,
    sketchy = false,
    terms = '',
    people = false,
    anime = false,
    general = false
  }) => {
    const categories = `${boolanToNumber(general)}${boolanToNumber(
      anime
    )}${boolanToNumber(people)}`
    const params = stringify({
      q: `${terms}`,
      sorting: random ? 'random' : 'relevance',
      categories,
      purity: `1${boolanToNumber(sketchy)}0`,
      atleast: '1920x1080',
      ratios: '16x9'
    })

    const { data } = await api.get(`search?${params}`)
    return data.data
  }

  const downloadWallpaper = async (filename, url) => {
    const writer = toolbox.filesystem.createWriteStream(filename, {});

    const response = await api.axiosInstance.get(url, {
      method: 'GET',
      responseType: 'stream',
    });

    response.data
      .pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  }
  toolbox.wallhaven = {
    search,
    downloadWallpaper,
  }

  // enable this if you want to read configuration in from
  // the current folder's package.json (in a "nbx" property),
  // nbx.config.json, etc.
  // toolbox.config = {
  //   ...toolbox.config,
  //   ...toolbox.config.loadConfig(process.cwd(), "nbx")
  // }
}
