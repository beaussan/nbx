import { GluegunToolbox } from 'gluegun'

module.exports = {
  name: 'clone',
  alias: ['c'],
  run: async (toolbox: GluegunToolbox) => {
    const {
      parameters,
      print: { info, error, spin },
      utils: { verboseDebug },
      prompt: { ask },
      clone: { getWorkScopes, cloneUrlInScope, getCloneDirectory }
    } = toolbox

    const showHelp = () => {
      info('Usage: nbx clone [url]')
      info('')
      info('Options')
      info('   -s, --scope         Scope')
      info('   -t, --type          Type (git, expr, doc)')
      info('   -h, --help          Output usage information')
      info('   -v, --verbose       Verbose output')
    }
    const o = parameters.options
    let props = {
      url: parameters.first,
      scope: o.s || o.scope,
      type: o.t || o.type,
      help: Boolean(o.h || o.help),
      verbose: Boolean(o.v || o.verbose)
    }

    verboseDebug(props, 'Params')

    if (props.help) {
      showHelp()
      return
    }

    if (!props.url) {
      error('You must provide a url to clone\n')
      showHelp()
      process.exit(0)
    }

    let questions = []

    if (!props.type) {
      questions = [
        ...questions,
        {
          choices: ['git', 'expr', 'docs'],
          default: 'git',
          name: 'type',
          message: 'Witch type of project are you gonna clone ?',
          type: 'list'
        }
      ]
    }
    if (!props.scope) {
      const workScopes = await getWorkScopes()
      questions = [
        ...questions,
        {
          choices: ['perso', 'fac', ...workScopes],
          default: 'perso',
          name: 'scope',
          message: 'In what scope do you want to clone into',
          type: 'list'
        }
      ]
    }

    if (questions.length) {
      const res = await ask(questions)
      props = {
        ...props,
        ...res
      }
    }
    verboseDebug(props, 'Params')
    const dir = await getCloneDirectory(props.scope, props.type);
    const spinner = spin(`Cloning into ${dir}`)
    try {
      const path = await cloneUrlInScope(props.url, dir)
      spinner.succeed('Cloned into ' + path);
    } catch (e) {
      spinner.fail();
    }
  }
}
