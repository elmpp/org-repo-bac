import { Plugin } from "../__types__";

export const runWorkspace: NonNullable<Plugin['initialise']> = (initialiseOptions) => {
  initialiseOptions.context.lifecycles.run.hooks.runWorkspace.tapPromise('@business-as-code/core', async ({context, workingPaths}) => {
    return {
      success: true,
      res: {},
    }

    // if (!(await xfs.existsPromise(destinationPath.address))) {
    //   const workspacePathParent = addr.pathUtils.dirname(destinationPath);
    //   if (!(await xfs.existsPromise(workspacePathParent.address))) {
    //     throw new BacError(
    //       MessageName.FS_PATH_FORMAT_ERROR,
    //       `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${destinationPath.original}'`
    //     );
    //   }
    //   await xfs.mkdirpPromise(destinationPath.address);
    // }

    // const schematicsService = await context.serviceFactory('schematics', {context, destinationPath, workingPath})

    // const res = await schematicsService.runSchematic({
    //   address: `@business-as-code/plugin-core-essentials#namespace=initialise-workspace`,
    //   context,
    //   options: {
    //     ...context.cliOptions.flags,
    //     // name: context.cliOptions.flags.name,
    //     // // destinationPath: context.cliOptions.flags.workspacePath,
    //     // configPath: context.cliOptions.flags.configPath,

    //     // name: 'cunt',
    //     // author: 'boloerguie',



    //   },
    //   // destinationPath: workspacePath,
    //   // dryRun: false,
    //   // force: true,
    //   // workingPath: addr.pathUtils.dot,
    // });

    // if (!assertIsOk(res)) {
    //   switch (res.res.error.reportCode) {
    //     case MessageName.SCHEMATICS_ERROR:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
    //       context.logger.error(res.res.error.message);
    //       break;
    //     case MessageName.SCHEMATICS_NOT_FOUND:
    //       context.logger.error(res.res.error.message);
    //       break;
    //   }
    // }

    // return res

  })
}