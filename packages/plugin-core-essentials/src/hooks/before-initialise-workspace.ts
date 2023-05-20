import { Plugin } from "@business-as-code/core";

export const beforeInitialiseWorkspace: NonNullable<Plugin['initialise']> = (initialiseOptions) => {
  initialiseOptions.context.lifecycles.initialise.hooks.beforeInitialiseWorkspace.tapPromise('@business-as-code/plugin-core-essentials', async ({context, workspacePath, workingPath}) => {

  })
}