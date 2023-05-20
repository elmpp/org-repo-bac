import { addr } from "@business-as-code/address";
import { assertIsOk, Plugin } from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

export const initialiseWorkspace: NonNullable<Plugin['initialise']> = (initialiseOptions) => {
  initialiseOptions.context.lifecycles.initialise.hooks.initialiseWorkspace.tapPromise('@business-as-code/plugin-core-essentials', async ({context, workspacePath, workingPath}) => {

    if (!(await xfs.existsPromise(workspacePath.address))) {
      const workspacePathParent = addr.pathUtils.dirname(workspacePath);
      if (!(await xfs.existsPromise(workspacePathParent.address))) {
        throw new BacError(
          MessageName.FS_PATH_FORMAT_ERROR,
          `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${workspacePath.original}'`
        );
      }
      await xfs.mkdirpPromise(workspacePath.address);
    }

    const schematicsService = await context.serviceFactory('schematics', {context, workingPath})

    const res = await schematicsService.runSchematic({
      address: `@business-as-code/plugin-core-essentials#namespace=workspace-init`,
      context,
      options: {
        ...context.cliOptions.flags,
        // name: context.cliOptions.flags.name,
        // // workspacePath: context.cliOptions.flags.workspacePath,
        // configPath: context.cliOptions.flags.configPath,

        // name: 'cunt',
        // author: 'boloerguie',



      },
      // destinationPath: workspacePath,
      // dryRun: false,
      // force: true,
      // workingPath: addr.pathUtils.dot,
    });

    if (!assertIsOk(res)) {
      switch (res.res.error.reportCode) {
        case MessageName.SCHEMATICS_ERROR:
          context.logger.error(res.res.error.message);
          break;
        case MessageName.SCHEMATICS_INVALID_ADDRESS:
          context.logger.error(res.res.error.message);
          break;
        case MessageName.SCHEMATICS_NOT_FOUND:
          context.logger.error(res.res.error.message);
          break;
      }
    }

    return res

  })
}