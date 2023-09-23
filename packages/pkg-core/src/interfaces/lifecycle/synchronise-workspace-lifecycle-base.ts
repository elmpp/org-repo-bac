import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import {
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray,
  LifecycleReturnByMethodSingular,
  LifecycleStaticInterface,
  Result,
  assertIsResult,
} from "../../__types__";
import { AsyncHook, TapFn } from "../../hooks";
import { Config } from "../../validation";
import { CommonExecuteOptions } from "./__types__";
import { mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray } from "./util";

/**
 Synchronise acts on already-configured workspace (e.g. ProjectConfig)
 */
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
        config?: Config;
        // unknown;
      },
      void,
      "synchroniseWorkspace"
    >(["options"], "synchroniseWorkspace", "beforeSynchroniseWorkspace"),
    synchroniseWorkspace: new AsyncHook<
      {
        config?: Config;
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
        config?: Config;
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
    const beforeSynchroniseWorkspaceHook =
      ins.beforeSynchroniseWorkspace() as TapFn<"synchroniseWorkspace">;
    const synchroniseWorkspaceHook =
      ins.synchroniseWorkspace() as TapFn<"synchroniseWorkspace">;
    const afterSynchroniseWorkspaceHook =
      ins.afterSynchroniseWorkspace() as TapFn<"synchroniseWorkspace">;

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

  async executeSynchroniseWorkspace(options: {
    common: CommonExecuteOptions;
    options: LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<"synchroniseWorkspace">;
  }): Promise<
    Result<
      LifecycleReturnByMethodSingular<"synchroniseWorkspace">,
      { error: BacError }
    >
  > {
    const optionsWithCommon =
      mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<"synchroniseWorkspace">(
        options
      );

    await SynchroniseWorkspaceLifecycleBase.hooks.beforeSynchroniseWorkspace.callBailAsync(
      { options: optionsWithCommon }
    );

    const res =
      await SynchroniseWorkspaceLifecycleBase.hooks.synchroniseWorkspace.callBailAsync(
        { options: optionsWithCommon, strict: true }
      );

    assertIsResult(res);

    await SynchroniseWorkspaceLifecycleBase.hooks.afterSynchroniseWorkspace.callBailAsync(
      { options: optionsWithCommon }
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
      }) => Promise<unknown | void>)
    | void {}

  protected synchroniseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown | void>)
    | void {}

  protected afterSynchroniseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown | void>)
    | void {}
}
