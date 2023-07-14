import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  expectIsOk,
  SynchroniseWorkspaceLifecycleBase,
} from "@business-as-code/core";

/**
 Builds the dev workspace (i.e. this repo), creates a snapshot changeset and publishes to local repository
 */
export class SynchroniseWorkspaceSnapshotDevLifecycle extends SynchroniseWorkspaceLifecycleBase<
  typeof SynchroniseWorkspaceSnapshotDevLifecycle
> {
  static override title = "synchroniseWorkspaceSnapshotDev" as const;

  override synchroniseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: {
          query?: string;
          message: string;
          bump?: "major" | "minor" | "patch";
          registry?: string;
          tag?: string;
        };
      }) => Promise<void>)
    | undefined {
    return async ({
      context,
      workspacePath,
      options: { query, message, bump, registry, tag },
    }) => {
      const moonService = await context.serviceFactory("moon", {
        context,
        workingPath: ".",
      });

      const buildRes = await moonService.runTask({
        command: "build", // not clean
      });
      expectIsOk(buildRes);

      const changesetService = await context.serviceFactory("changeset", {
        context,
        workingPath: ".",
      });

      await changesetService.create({
        message,
        bump,
        query,
      });

      const publishRes = await changesetService.publish({
        registry,
        tag,
      });

      expectIsOk(publishRes);
    };
  }
}
