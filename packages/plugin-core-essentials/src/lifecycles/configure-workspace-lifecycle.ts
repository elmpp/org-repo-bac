import { AddressPathAbsolute } from "@business-as-code/address";
import {
  Context,
  ConfigureWorkspaceLifecycleBase,
} from "@business-as-code/core";
import { Config } from "prettier";


export class ConfigureWorkspaceLifecycle extends ConfigureWorkspaceLifecycleBase<
  typeof ConfigureWorkspaceLifecycle
> {
  static title = "core" as const;

  // override get ctor(): typeof ConfigureWorkspaceLifecycle {
  //   return this.constructor as any;
  // }

  override configureWorkspace(): (options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config | undefined;
  }) => Promise<{
    a: "a";
  }> {
    return async ({ context }) => {
      return {
        a: "a",
      };
    };
  }
}

// type DDD = Bac.Lifecycles['configureWorkspace']['insType']['configureWorkspace']
