import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  DoExecOptionsLite,
  execUtils,
  RunWorkspaceLifecycleBase,
} from "@business-as-code/core";

export class RunWorkspacePackageManagerPnpmLifecycle extends RunWorkspaceLifecycleBase<
  typeof RunWorkspacePackageManagerPnpmLifecycle
> {
  static override title = "packageManagerPnpm" as const;
  static as = "packageManager" as const;

  override runWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: {
          command: string;
          filter?: string;
          execOptions?: DoExecOptionsLite;
        };
      }) => ReturnType<typeof execUtils.doExec>)
    | undefined {

      // console.log(`:>> inside the pnpm lifecycle`);

    return async ({
      context,
      workspacePath,
      options: { command, filter, execOptions = {} },
    }) => {
      const packageManagerService = await context.serviceFactory(
        "packageManager",
        {
          context,
          workingPath: ".",
          packageManager: "packageManagerPnpm",
        }
      );

      return packageManagerService.run({
        command,
        options: execOptions,
      });

      // return execUtils.doExec({
      //   command: ``,
      //   options: {
      //     cwd: workspacePath,
      //     context,
      //   },
      // });
    };
  }
}
