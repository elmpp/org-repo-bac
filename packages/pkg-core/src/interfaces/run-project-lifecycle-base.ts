import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { assertIsResult, Context, ContextCommand, LifecycleStaticInterface, Result } from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";

/**
 execute a command in a particular project
 */
export class RunProjectLifecycleBase<T extends LifecycleStaticInterface> {

  static lifecycleTitle = 'runProject' as const

  get ctor(): T {
    return this.constructor as unknown as T;
  }

  static hooks = {
    beforeRunProject: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
      }>([
      "options",
    ]),
    runProject: new AsyncSeriesBailHook<
      {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
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
    afterRunProject: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
      }>([
      "options",
    ]),
  };

  /** @internal */
  static initialise<T extends RunProjectLifecycleBase<any>>(this: { new(): T }, options:  { context: ContextCommand<any> }) {
    const ins = new this();
    const beforeRunProjectHook = ins.beforeRunProject()
    const runProjectHook = ins.runProject()
    const afterRunProjectHook = ins.afterRunProject()

    if (beforeRunProjectHook) {
      ins.ctor.hooks.beforeRunProject.tapPromise(ins.ctor.title, beforeRunProjectHook)
    }
    if (runProjectHook) {
      ins.ctor.hooks.runProject.tapPromise(ins.ctor.title, runProjectHook)
    }
    if (afterRunProjectHook) {
      ins.ctor.hooks.afterRunProject.tapPromise(ins.ctor.title, afterRunProjectHook)
    }
  }

  async executeRunProject(options: InferHookParams<typeof RunProjectLifecycleBase.hooks.runProject>): Promise<InferHookReturn<typeof RunProjectLifecycleBase.hooks.runProject>> {
    await  RunProjectLifecycleBase.hooks.beforeRunProject.promise(options)
    const res = await  RunProjectLifecycleBase.hooks.runProject.promise(options);
    assertIsResult(res)
    await  RunProjectLifecycleBase.hooks.afterRunProject.promise(options)
    return res
  }

  protected beforeRunProject(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    options: any;
  }) => Promise<unknown>) | void {}

  protected runProject(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    options: any;
  }) => Promise<unknown>) | void {}

  protected afterRunProject(): ((options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    workingPath: string;
    options: any;
  }) => Promise<unknown>) | void {}
}