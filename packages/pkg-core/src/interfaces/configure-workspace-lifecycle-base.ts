import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { Config } from "prettier";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { assertIsResult, Context, ContextCommand, LifecycleStaticInterface, Result } from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";


/**
 the configure-workspace lifecycle acts upon a workspace's user configuration. It is responsible for
 processing the input user configuration into its final form (aka lock file). The lock file is what
 ultimately enables the synchronising of upstream content
 */
export class ConfigureWorkspaceLifecycleBase<T extends LifecycleStaticInterface> {

  static lifecycleTitle = 'configureWorkspace' as const

  get ctor(): T {
    return this.constructor as unknown as T;
  }

  static hooks = {
    beforeConfigureWorkspace: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      }>([
      "options",
    ]),
    /** configure workspace should coordinate configures at the project level */
    configureWorkspace: new AsyncSeriesBailHook<
      {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      },
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError,
        }
      >
    >(["options"]),
    // configureWorkspace: new AsyncSeriesBailHook<
    //   {
    //     context: Context;
    //     workspacePath: AddressPathAbsolute;
    //     workingPath: string;
    //     config?: Config;
    //   },
    //   Result<
    //     {
    //       destinationPath: AddressPathAbsolute;
    //     },
    //     {
    //       error: BacError,
    //     }
    //   >
    // >(["options"]),
    afterConfigureWorkspace: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      }>([
      "options",
    ]),
  };

  /** @internal */
  static initialise<T extends ConfigureWorkspaceLifecycleBase<any>>(this: { new(): T }, options:  { context: ContextCommand<any> }) {
    const ins = new this();
    const beforeConfigureWorkspaceHook = ins.beforeConfigureWorkspace()
    const configureWorkspaceHook = ins.configureWorkspace()
    const afterConfigureWorkspaceHook = ins.afterConfigureWorkspace()

    if (beforeConfigureWorkspaceHook) {
      ins.ctor.hooks.beforeConfigureWorkspace.tapPromise(ins.ctor.title, beforeConfigureWorkspaceHook)
    }
    if (configureWorkspaceHook) {
      ins.ctor.hooks.configureWorkspace.tapPromise(ins.ctor.title, configureWorkspaceHook)
    }
    if (afterConfigureWorkspaceHook) {
      ins.ctor.hooks.afterConfigureWorkspace.tapPromise(ins.ctor.title, afterConfigureWorkspaceHook)
    }
  }

  async executeConfigureWorkspace(options: InferHookParams<typeof ConfigureWorkspaceLifecycleBase.hooks.configureWorkspace>): Promise<InferHookReturn<typeof ConfigureWorkspaceLifecycleBase.hooks.configureWorkspace>> {
    await  ConfigureWorkspaceLifecycleBase.hooks.beforeConfigureWorkspace.promise(options)
    const res = await  ConfigureWorkspaceLifecycleBase.hooks.configureWorkspace.promise(options);
    assertIsResult(res)
    await  ConfigureWorkspaceLifecycleBase.hooks.afterConfigureWorkspace.promise(options)
    return res
  }

  protected beforeConfigureWorkspace(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config;
  }) => Promise<unknown>) | void {}

  protected configureWorkspace(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config;
  }) => Promise<unknown>) | void {}

  protected afterConfigureWorkspace(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config;
  }) => Promise<unknown>) | void {}
}