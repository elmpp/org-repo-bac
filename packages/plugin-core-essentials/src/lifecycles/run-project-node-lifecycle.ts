import { addr, AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  DoExecOptions,
  execUtils,
  MoonCommand,
  RunProjectLifecycleBase,
} from "@business-as-code/core";

/**
 Runs the applicable package manager service
 */
export class RunProjectNodeLifecycle extends RunProjectLifecycleBase<
  typeof RunProjectNodeLifecycle
> {
  static override title = "node" as const;

  override runProject(): (options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    options: {
      command: MoonCommand;
      execOptions: Omit<DoExecOptions, "context" | "cwd">;
    };
  }) => ReturnType<typeof execUtils.doExec> {
    return async ({
      context,
      workspacePath,
      workingPath,
      options: { command, execOptions },
    }) => {

      // const packageManagerService = context.serviceFactory('packageManager', {context, workingPath})

      const cwd = addr.pathUtils.join(
        workspacePath,
        addr.parsePath(workingPath)
      ) as AddressPathAbsolute;

      return execUtils.doExec({
        command,
        options: {
          ...execOptions,
          cwd,
          context,
        },
      });
    };
  }
}
