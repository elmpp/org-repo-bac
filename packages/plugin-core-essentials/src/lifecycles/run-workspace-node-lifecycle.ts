import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  DoExecOptions,
  execUtils,
  MoonCommand,
  RunWorkspaceLifecycleBase,
} from "@business-as-code/core";

// declare global {
//   namespace Bac {
//     interface Lifecycles {
//       core: {
//       // ['@business-as-code/plugin-core-essentials']: {
//       runWorkspace: {
//           insType: RunWorkspaceLifecycle;
//           staticType: typeof RunWorkspaceLifecycle;
//         };
//       }
//     }
//   }
// }

/**
 Runs commands via a node process
 */
export class RunWorkspaceNodeLifecycle extends RunWorkspaceLifecycleBase<
  typeof RunWorkspaceNodeLifecycle
> {
  static override title = "node" as const;

  // override get ctor(): typeof RunWorkspaceLifecycle {
  //   return this.constructor as any;
  // }

  override runWorkspace(): (options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    options: {
      command: MoonCommand;
      execOptions: Omit<DoExecOptions, "context" | "cwd">;
    };
  }) => ReturnType<typeof execUtils.doExec> {
    return async ({
      context,
      workspacePath,
      options: { command, execOptions },
    }) => {
      // if (!(await xfs.existsPromise(workspacePath.address))) {
      //   const workspacePathParent = addr.pathUtils.dirname(workspacePath);
      //   if (!(await xfs.existsPromise(workspacePathParent.address))) {
      //     throw new BacError(
      //       MessageName.FS_PATH_FORMAT_ERROR,
      //       `Parent path '${workspacePathParent.original}' must be present when creating workspace at '${workspacePath.original}'`
      //     );
      //   }
      //   await xfs.mkdirpPromise(workspacePath.address);
      // }

      // const moonService = await context.serviceFactory("moon", {
      //   context,
      //   workingPath,
      // });

      return execUtils.doExec({
        command,
        options: {
          ...execOptions,
          cwd: workspacePath, // use runProject#node if needing workingPath
          context,
        },
      });

      // we depend on there being an existing moon task for each platform which we can then append our command to

      // const res = await moonService.runTask({
      //   command: command,
      //   // options: {

      //   // }
      // })

      // return res

      // console.log(`context.cliOptions.flags :>> `, context.cliOptions.flags);
      // console.log(`configPath, cliVersion, cliRegistry :>> `, configPath, cliVersion, cliRegistry)

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

      // return res;
    };
  }
}

// type DDD = Bac.Lifecycles['runWorkspace']['insType']['runWorkspace']
