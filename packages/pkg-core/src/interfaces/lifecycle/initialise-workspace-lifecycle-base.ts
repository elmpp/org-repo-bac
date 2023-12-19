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
  assertIsOk,
  assertIsResult,
} from "../../__types__";
import { AsyncHook, TapFn } from "../../hooks";
import { CommonExecuteOptions } from "./__types__";
import { mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray } from "./util";

export class InitialiseWorkspaceLifecycleBase<
  T extends LifecycleStaticInterface = typeof InitialiseWorkspaceLifecycleBase<any>
> {
  static lifecycleTitle = "initialiseWorkspace" as const;
  static title = "";

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeInitialiseWorkspace: new AsyncHook<
      "initialiseWorkspace"
    >(["options"], "initialiseWorkspace", "beforeInitialiseWorkspace"),
    initialiseWorkspace: new AsyncHook<
      "initialiseWorkspace"
    >(["options"], "initialiseWorkspace", "initialiseWorkspace"),
    afterInitialiseWorkspace: new AsyncHook<
      "initialiseWorkspace"
    >(["options"], "initialiseWorkspace", "afterInitialiseWorkspace"),
  };

  /** @internal */
  static initialise<T extends InitialiseWorkspaceLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options;
    const ins = new this();
    const beforeInitialiseWorkspaceHook =
      ins.beforeInitialiseWorkspace() as TapFn<"initialiseWorkspace">;
    const initialiseWorkspaceHook =
      ins.initialiseWorkspace() as TapFn<"initialiseWorkspace">;
    const afterInitialiseWorkspaceHook =
      ins.afterInitialiseWorkspace() as TapFn<"initialiseWorkspace">;

    if (beforeInitialiseWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeInitialiseWorkspace`
      );
      ins.ctor.hooks.beforeInitialiseWorkspace.tapAsync(
        ins.title,
        beforeInitialiseWorkspaceHook
      );
    }
    if (initialiseWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.initialiseWorkspace`
      );
      ins.ctor.hooks.initialiseWorkspace.tapAsync(
        ins.title,
        initialiseWorkspaceHook
      );
    }
    if (afterInitialiseWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterInitialiseWorkspace`
      );
      ins.ctor.hooks.afterInitialiseWorkspace.tapAsync(
        ins.title,
        afterInitialiseWorkspaceHook
      );
    }
  }

  async executeInitialiseWorkspace(options: {
    common: CommonExecuteOptions;
    options: LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<"initialiseWorkspace">;
  }): Promise<
    Result<
      LifecycleReturnByMethodSingular<"initialiseWorkspace">,
      { error: BacError }
    >
  > {
    const optionsWithCommon =
      mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<"initialiseWorkspace">(
        options
      );

    await InitialiseWorkspaceLifecycleBase.hooks.beforeInitialiseWorkspace.callBailAsync(
      {
        options: optionsWithCommon,
      }
    );
    const res =
      await InitialiseWorkspaceLifecycleBase.hooks.initialiseWorkspace.callBailAsync(
        {
          options: optionsWithCommon,
          strict: true,
        }
      );

    if (!assertIsOk(res)) {
      return res;
    }

    assertIsResult(res); // wrapped in provider

    await InitialiseWorkspaceLifecycleBase.hooks.afterInitialiseWorkspace.callBailAsync(
      {
        options: optionsWithCommon,
      }
    );
    return res;
  }

  protected beforeInitialiseWorkspace():
    | ((options: {
        // context: Context;
        // workspacePath: AddressPathAbsolute;
        common: CommonExecuteOptions,
        // workingPath: string;
        // options: {
        //   name: string;
        //   config: Config;
        //   configPath: string;
        //   cliVersion: string;
        //   cliRegistry: string;
        // }
        options: any;
      }) => Promise<unknown | void>)
    | undefined {
    return;
  }

  protected initialiseWorkspace():
    | ((options: {
        // context: Context;
        // workspacePath: AddressPathAbsolute;
        common: CommonExecuteOptions,
        // workingPath: string;
        // options: {
        //   name: string;
        //   config: Config;
        //   configPath: string;
        //   cliVersion: string;
        //   cliRegistry: string;
        // }
        options: any;
      }) => Promise<unknown | void>)
    | undefined {
    return;
  }

  protected afterInitialiseWorkspace():
    | ((options: {
        // context: Context;
        // workspacePath: AddressPathAbsolute;
        common: CommonExecuteOptions,
        // workingPath: string;
        options: any;
        // options: {
        //   name: string;
        //   config: Config;
        //   configPath: string;
        //   cliVersion: string;
        //   cliRegistry: string;
        // }
      }) => Promise<unknown | void>)
    | undefined {
    return;
  }
}
