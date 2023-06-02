import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { Config } from "prettier";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { assertIsResult, Context, ContextCommand, LifecycleStaticInterface, Result } from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";

export class SynchroniseWorkspaceLifecycleBase<T extends LifecycleStaticInterface> {

  static lifecycleTitle = 'synchroniseWorkspace' as const

  get ctor(): T {
    return this.constructor as unknown as T;
  }

  static hooks = {
    beforeSynchroniseWorkspace: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      }>([
      "options",
    ]),
    synchroniseWorkspace: new AsyncSeriesBailHook<
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
    afterSynchroniseWorkspace: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      }>([
      "options",
    ]),
  };

  /** @internal */
  static initialise<T extends SynchroniseWorkspaceLifecycleBase<any>>(this: { new(): T }, options:  { context: ContextCommand<any> }) {
    const ins = new this();
    const beforeSynchroniseWorkspaceHook = ins.beforeSynchroniseWorkspace()
    const synchroniseWorkspaceHook = ins.synchroniseWorkspace()
    const afterSynchroniseWorkspaceHook = ins.afterSynchroniseWorkspace()

    if (beforeSynchroniseWorkspaceHook) {
      ins.ctor.hooks.beforeSynchroniseWorkspace.tapPromise(ins.ctor.title, beforeSynchroniseWorkspaceHook)
    }
    if (synchroniseWorkspaceHook) {
      ins.ctor.hooks.synchroniseWorkspace.tapPromise(ins.ctor.title, synchroniseWorkspaceHook)
    }
    if (afterSynchroniseWorkspaceHook) {
      ins.ctor.hooks.afterSynchroniseWorkspace.tapPromise(ins.ctor.title, afterSynchroniseWorkspaceHook)
    }
  }

  async executeSynchroniseWorkspace(options: InferHookParams<typeof SynchroniseWorkspaceLifecycleBase.hooks.synchroniseWorkspace>): Promise<InferHookReturn<typeof SynchroniseWorkspaceLifecycleBase.hooks.synchroniseWorkspace>> {
    await  SynchroniseWorkspaceLifecycleBase.hooks.beforeSynchroniseWorkspace.promise(options)
    const res = await  SynchroniseWorkspaceLifecycleBase.hooks.synchroniseWorkspace.promise(options);
    assertIsResult(res)
    await  SynchroniseWorkspaceLifecycleBase.hooks.afterSynchroniseWorkspace.promise(options)
    return res
  }

  protected beforeSynchroniseWorkspace(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config;
  }) => Promise<unknown>) | void {}

  protected synchroniseWorkspace(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config;
  }) => Promise<unknown>) | void {}

  protected afterSynchroniseWorkspace(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    config?: Config;
  }) => Promise<unknown>) | void {}
}