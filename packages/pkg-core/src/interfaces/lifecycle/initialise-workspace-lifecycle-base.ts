import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { AsyncHook } from "../../hooks";
import { Config } from "../../validation";
import {
  assertIsOk,
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProvider,
  LifecycleSingularReturnByMethod,
  LifecycleStaticInterface,
  Result,
} from "../../__types__";

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
      {
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
        cliPath?: string;
      },
      void,
      "initialiseWorkspace"
    >(["options"], "initialiseWorkspace", "beforeInitialiseWorkspace"),
    initialiseWorkspace: new AsyncHook<
      {
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
        cliPath?: string;
      },
      // } & LifecycleOptionsByProvider<'initialiseWorkspace'>,
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >,
      "initialiseWorkspace"
    >(["options"], "initialiseWorkspace", "initialiseWorkspace"),
    afterInitialiseWorkspace: new AsyncHook<
      {
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
        cliPath?: string;
      },
      void,
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
    const beforeInitialiseWorkspaceHook = ins.beforeInitialiseWorkspace();
    const initialiseWorkspaceHook = ins.initialiseWorkspace();
    const afterInitialiseWorkspaceHook = ins.afterInitialiseWorkspace();

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

  async executeInitialiseWorkspace(
    options: LifecycleOptionsByMethodKeyedByProvider<"initialiseWorkspace">[]
  ): Promise<
    Result<
      LifecycleSingularReturnByMethod<"initialiseWorkspace">,
      { error: BacError }
    >
  > {
    await InitialiseWorkspaceLifecycleBase.hooks.beforeInitialiseWorkspace.callBailAsync(
      {
        options,
      }
    );
    const res =
      await InitialiseWorkspaceLifecycleBase.hooks.initialiseWorkspace.callBailAsync(
        {
          options,
          strict: true,
        }
      );

    if (!assertIsOk(res)) {
      return res
    }

    assertIsResult(res.res.res); // wrapped in provider

    await InitialiseWorkspaceLifecycleBase.hooks.afterInitialiseWorkspace.callBailAsync(
      {
        options,
      }
    );
    return res;
  }

  protected beforeInitialiseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
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
        context: Context;
        workspacePath: AddressPathAbsolute;
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
        context: Context;
        workspacePath: AddressPathAbsolute;
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
