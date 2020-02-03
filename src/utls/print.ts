import * as importedColors from 'colors/safe'

type NbxPrintColors = typeof importedColors & {
    highlight: (t: string) => string;
    info: (t: string) => string;
    warning: (t: string) => string;
    success: (t: string) => string;
    error: (t: string) => string;
    line: (t: string) => string;
    muted: (t: string) => string;
}
// We're extending `colors` with a few more attributes
const colors = importedColors as NbxPrintColors
colors.setTheme({
  highlight: 'cyan',
  info: 'reset',
  warning: 'yellow',
  success: 'green',
  error: 'red',
  line: 'grey',
  muted: 'grey',
})

/**
 * Print a blank line.
 */
function newline() {
  // eslint-disable-next-line no-console
  console.log('')
}

/**
 * Prints a divider line
 */
function divider() {
  // eslint-disable-next-line no-console
  console.log(colors.line('---------------------------------------------------------------'))
}

/**
 * Prints text without theming.
 *
 * Use this when you're writing stuff outside the toolbox of our
 * printing scheme.  hint: rarely.
 *
 * @param message The message to write.
 */
function fancy(message: any): void {
  // eslint-disable-next-line no-console
  console.log(message)
}

/**
 * Writes a normal information message.
 *
 * This is the default type you should use.
 *
 * @param message The message to show.
 */
function info(message: string): void {
  // eslint-disable-next-line no-console
  console.log(colors.info(message))
}

/**
 * Writes an error message.
 *
 * This is when something horribly goes wrong.
 *
 * @param message The message to show.
 */
function error(message: string): void {
  // eslint-disable-next-line no-console
  console.log(colors.error(message))
}

/**
 * Writes a warning message.
 *
 * This is when the user might not be getting what they're expecting.
 *
 * @param message The message to show.
 */
function warning(message: string): void {
  // eslint-disable-next-line no-console
  console.log(colors.warning(message))
}

/**
 * Writes a debug message.
 *
 * This is for devs only.
 *
 * @param message The message to show.
 */
function debug(message: string, title = 'DEBUG'): void {
  const topLine = `vvv -----[ ${title} ]----- vvv`
  const botLine = `^^^ -----[ ${title} ]----- ^^^`

  // eslint-disable-next-line no-console
  console.log(colors.rainbow(topLine))
  // eslint-disable-next-line no-console
  console.log(message)
  // eslint-disable-next-line no-console
  console.log(colors.rainbow(botLine))
}

/**
 * Writes a success message.
 *
 * When something is successful.  Use sparingly.
 *
 * @param message The message to show.
 */
function success(message: string): void {
  // eslint-disable-next-line no-console
  console.log(colors.success(message))
}

/**
 * Creates a spinner and starts it up.
 *
 * @param config The text for the spinner or an ora configuration object.
 * @returns The spinner.
 */
function spin(config?: string | object): any {
  return require('ora')(config || '').start()
}

const checkmark = colors.success('✔︎')
const xmark = colors.error('ⅹ')

export const print = {
  colors,
  newline,
  divider,
  fancy,
  info,
  error,
  warning,
  debug,
  success,
  spin,
  checkmark,
  xmark,
}
