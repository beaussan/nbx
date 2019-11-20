import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {
  toolbox.utils = {
    verboseDebug: (value: any, title?: string) => {
        const o = toolbox.parameters.options;
        if (Boolean(o.v || o.verbose)) {
          toolbox.print.debug(value, title);
        }
      }
  }
}
