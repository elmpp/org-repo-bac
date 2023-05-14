import { Plugin } from "@business-as-code/core";

export const beforeInitialiseWorkspace: NonNullable<Plugin['initialise']> = (initialiseOptions) => {
  initialiseOptions.context.lifecycles.initialise.hooks.beforeInitialiseWorkspace.tapPromise('@business-as-code/plugin-core-essentials', async ({context, destinationPath, workingPath}) => {

    context.logger.info(`WHAT IS UP YO`)

  })
}