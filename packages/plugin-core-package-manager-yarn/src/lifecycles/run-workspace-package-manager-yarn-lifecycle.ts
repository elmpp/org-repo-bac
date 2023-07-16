import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  DoExecOptionsLite,
  execUtils,
  RunWorkspaceLifecycleBase,
} from "@business-as-code/core";

export class RunWorkspacePackageManagerYarnLifecycle extends RunWorkspaceLifecycleBase<
  typeof RunWorkspacePackageManagerYarnLifecycle
> {
  static override title = "packageManagerYarn" as const;
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
    // console.log(`:>> inside the yarn lifecycle`);

    return;

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
          packageManager: "packageManagerYarn",
        }
      );

      return packageManagerService.run({
        command,
        options: execOptions,
      });
    };
  }
}
