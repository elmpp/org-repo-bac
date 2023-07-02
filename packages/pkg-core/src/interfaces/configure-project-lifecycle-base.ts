import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { Config } from "prettier";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { assertIsResult, Context, ContextCommand, LifecycleStaticInterface, Result } from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";

export class ConfigureProjectLifecycleBase<T extends LifecycleStaticInterface> {

  static lifecycleTitle = 'configureProject' as const

  get ctor(): T {
    return this.constructor as unknown as T;
  }

  static hooks = {
    beforeConfigureProject: new AsyncSeriesHook<{
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
        config?: Config;
      }>([
      "options",
    ]),
    /** configure project should coordinate configures at the project level */
    configureProject: new AsyncSeriesBailHook<
      {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
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
    afterConfigureProject: new AsyncSeriesHook<{
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
        config?: Config;
      }>([
      "options",
    ]),
  };

  /** @internal */
  static configure<T extends ConfigureProjectLifecycleBase<any>>(this: { new(): T }, options:  { context: ContextCommand<any> }) {
    const ins = new this();
    const beforeConfigureProjectHook = ins.beforeConfigureProject()
    const configureProjectHook = ins.configureProject()
    const afterConfigureProjectHook = ins.afterConfigureProject()

    if (beforeConfigureProjectHook) {
      ins.ctor.hooks.beforeConfigureProject.tapPromise(ins.ctor.title, beforeConfigureProjectHook)
    }
    if (configureProjectHook) {
      ins.ctor.hooks.configureProject.tapPromise(ins.ctor.title, configureProjectHook)
    }
    if (afterConfigureProjectHook) {
      ins.ctor.hooks.afterConfigureProject.tapPromise(ins.ctor.title, afterConfigureProjectHook)
    }
  }

  async executeConfigureProject(options: InferHookParams<typeof ConfigureProjectLifecycleBase.hooks.configureProject>): Promise<InferHookReturn<typeof ConfigureProjectLifecycleBase.hooks.configureProject>> {
    await  ConfigureProjectLifecycleBase.hooks.beforeConfigureProject.promise(options)
    const res = await  ConfigureProjectLifecycleBase.hooks.configureProject.promise(options);
    assertIsResult(res)
    await  ConfigureProjectLifecycleBase.hooks.afterConfigureProject.promise(options)
    return res
  }

  protected beforeConfigureProject(): ((options: {
    context: Context;
    projectPath: AddressPathAbsolute;
    workingPath: string;
    options: any;
    config?: Config;
  }) => Promise<unknown>) | void {}

  protected configureProject(): ((options: {
    context: Context;
    projectPath: AddressPathAbsolute;
    workingPath: string;
    options: any;
    config?: Config;
  }) => Promise<unknown>) | void {}

  protected afterConfigureProject(): ((options: {
    context: Context;
    projectPath: AddressPathAbsolute;
    workingPath: string;
    options: any;
    config?: Config;
  }) => Promise<unknown>) | void {}
}