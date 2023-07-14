import { addr, AddressPathAbsolute } from "@business-as-code/address";
import {
  assertIsOk,
  Config,
  Context,
  InitialiseWorkspaceLifecycleBase,
  ServiceMap,
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

// declare global {
//   namespace Bac {
//     interface Lifecycles {
//       core: {
//       // ['@business-as-code/plugin-core-essentials']: {
//       initialiseWorkspace: {
//           insType: InitialiseWorkspaceLifecycle;
//           staticType: typeof InitialiseWorkspaceLifecycle;
//         };
//       }
//     }
//   }
// }

export class InitialiseWorkspaceCoreLifecycle extends InitialiseWorkspaceLifecycleBase<
  typeof InitialiseWorkspaceCoreLifecycle
> {
  static override title = "core" as const;

  // override get ctor(): typeof InitialiseWorkspaceLifecycle {
  //   return this.constructor as any;
  // }

  override initialiseWorkspace(): (options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: {
      // a: 'a'
      name: string;
      config: Config;
      configPath: string;
      cliVersion: string;
      cliRegistry: string;
    }
  }) => ReturnType<ServiceMap["schematics"][number]["runSchematic"]> {
    return async ({ context, workspacePath, options: {name, config, configPath, cliVersion, cliRegistry} }) => {
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

      const schematicsService = await context.serviceFactory("schematics", {
        context,
        workingPath: '.',
      });

      // console.log(`context.cliOptions.flags :>> `, context.cliOptions.flags);
      // console.log(`configPath, cliVersion, cliRegistry :>> `, configPath, cliVersion, cliRegistry)

      const res = await schematicsService.runSchematic({
        address: `@business-as-code/plugin-core-essentials#namespace=initialise-workspace`,
        context,
        options: {
          name,
          configPath,
          cliVersion,
          cliRegistry,

          // ...context.cliOptions.flags,
          // name: context.cliOptions.flags.name,
          // // workspacePath: context.cliOptions.flags.workspacePath,
          // configPath: context.cliOptions.flags.configPath,
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

      return res;
    };
  }
}

// type DDD = Bac.Lifecycles['initialiseWorkspace']['insType']['initialiseWorkspace']
