import { GluegunToolbox } from 'gluegun'

module.exports = (toolbox: GluegunToolbox) => {

  const getWorkScopes = async (): Promise<string[]> => {
    const files = await toolbox.filesystem.list(toolbox.filesystem.homedir() + toolbox.filesystem.separator + 'work');
    return files || [];
  }

  const cloneUrlInScope = async (gitUrl: string, directory: string): Promise<string> => {
    const folderBefore = (await toolbox.filesystem.list(directory)) as string[];

    await toolbox.system.exec(`git clone ${gitUrl}`, { cwd: directory })

    const folderAfter = (await toolbox.filesystem.list(directory)) as string[];

    const newFolder = folderAfter.filter(val => !folderBefore.includes(val));
    toolbox.utils.verboseDebug(newFolder, 'newFolder ?');
    return directory + toolbox.filesystem.separator + newFolder[0];
  }

  const getCloneDirectory = async (scope: string, type: string): Promise<string> => {
    const endPart = scope + toolbox.filesystem.separator + type;
    let directory = toolbox.filesystem.homedir() + toolbox.filesystem.separator + 'work' + toolbox.filesystem.separator + endPart;
    if (['fac', 'perso'].includes(scope)) {
      directory = toolbox.filesystem.homedir() + scope + toolbox.filesystem.separator + endPart;
    }
    return directory;
  }


  toolbox.clone = {
    getWorkScopes,
    cloneUrlInScope,
    getCloneDirectory,
  }
}
