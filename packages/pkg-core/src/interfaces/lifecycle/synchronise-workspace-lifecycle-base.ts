import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { AsyncHook } from "../../hooks";
import { Config } from "../../validation";
import {
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProviderArray,
  LifecycleReturnsByMethod,
  LifecycleStaticInterface,
  Result,
} from "../../__types__";

export class SynchroniseWorkspaceLifecycleBase<
  T extends LifecycleStaticInterface = typeof SynchroniseWorkspaceLifecycleBase<any>
> {
  static lifecycleTitle = "synchroniseWorkspace" as const;
  static title = "";

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeSynchroniseWorkspace: new AsyncHook<
      {
        config?: Config,
        // unknown;
      },
      void,
      "synchroniseWorkspace"
    >(["options"], "synchroniseWorkspace", "beforeSynchroniseWorkspace"),
    synchroniseWorkspace: new AsyncHook<
      {
        config?: Config,
        // unknown;
      },
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >,
      "synchroniseWorkspace"
    >(["options"], "synchroniseWorkspace", "synchroniseWorkspace"),
    afterSynchroniseWorkspace: new AsyncHook<
    {
      config?: Config,
      // unknown;
    },
      void,
      "synchroniseWorkspace"
    >(["options"], "synchroniseWorkspace", "afterSynchroniseWorkspace"),
  };

  /** @internal */
  static initialise<T extends SynchroniseWorkspaceLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options;
    const ins = new this();
    const beforeSynchroniseWorkspaceHook = ins.beforeSynchroniseWorkspace();
    const synchroniseWorkspaceHook = ins.synchroniseWorkspace();
    const afterSynchroniseWorkspaceHook = ins.afterSynchroniseWorkspace();

    if (beforeSynchroniseWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeSynchroniseWorkspace`
      );
      ins.ctor.hooks.beforeSynchroniseWorkspace.tapAsync(
        ins.title,
        beforeSynchroniseWorkspaceHook
      );
    }
    if (synchroniseWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.synchroniseWorkspace`
      );
      ins.ctor.hooks.synchroniseWorkspace.tapAsync(
        ins.title,
        synchroniseWorkspaceHook
      );
    }
    if (afterSynchroniseWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterSynchroniseWorkspace`
      );
      ins.ctor.hooks.afterSynchroniseWorkspace.tapAsync(
        ins.title,
        afterSynchroniseWorkspaceHook
      );
    }
  }

  async executeSynchroniseWorkspace(
    options: LifecycleOptionsByMethodKeyedByProviderArray<"synchroniseWorkspace">
  ): Promise<LifecycleReturnsByMethod<"synchroniseWorkspace">> {
    await SynchroniseWorkspaceLifecycleBase.hooks.beforeSynchroniseWorkspace.callLifecycleBailAsync(
      { options }
    );
    const res =
      await SynchroniseWorkspaceLifecycleBase.hooks.synchroniseWorkspace.callLifecycleBailAsync(
        { options, strict: true }
      );
    assertIsResult(res);
    await SynchroniseWorkspaceLifecycleBase.hooks.afterSynchroniseWorkspace.callLifecycleBailAsync(
      { options }
    );
    return res;
  }

  protected beforeSynchroniseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown>)
    | void {}

  protected synchroniseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown>)
    | void {}

  protected afterSynchroniseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown>)
    | void {}
}
