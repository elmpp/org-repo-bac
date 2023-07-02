import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import {
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleOptionsByMethodAndProvider,
  LifecycleStaticInterface,
  Result,
} from "../__types__";
import { InferHookReturn } from "./__types__";

/**
 execute a command across many projects within a workspace. Will use moon via the arbitrary extra command feature - https://tinyurl.com/24459t9e
 */
export class RunWorkspaceLifecycleBase<T extends LifecycleStaticInterface> {
  static lifecycleTitle = "runWorkspace" as const;

  get ctor(): T {
    return this.constructor as unknown as T;
  }

  static hooks = {
    beforeRunWorkspace: new AsyncSeriesHook<{
      context: Context;
      workspacePath: AddressPathAbsolute;
      workingPath: string;
      options: unknown;
    }>(["options"]),
    runWorkspace: new AsyncSeriesBailHook<
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
          error: BacError;
        }
      >
    >(["options"]),
    afterRunWorkspace: new AsyncSeriesHook<{
      context: Context;
      workspacePath: AddressPathAbsolute;
      workingPath: string;
      options: unknown;
    }>(["options"]),
  };

  /** @internal */
  static initialise<T extends RunWorkspaceLifecycleBase<any>>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const ins = new this();
    const beforeRunWorkspaceHook = ins.beforeRunWorkspace();
    const runWorkspaceHook = ins.runWorkspace();
    const afterRunWorkspaceHook = ins.afterRunWorkspace();

    if (beforeRunWorkspaceHook) {
      ins.ctor.hooks.beforeRunWorkspace.tapPromise(
        ins.ctor.title,
        beforeRunWorkspaceHook
      );
    }
    if (runWorkspaceHook) {
      ins.ctor.hooks.runWorkspace.tapPromise(ins.ctor.title, runWorkspaceHook);
    }
    if (afterRunWorkspaceHook) {
      ins.ctor.hooks.afterRunWorkspace.tapPromise(
        ins.ctor.title,
        afterRunWorkspaceHook
      );
    }
  }

  // async executeRunWorkspace(options: InferHookParams<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>): Promise<InferHookReturn<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>> {
  async executeRunWorkspace(
    options: LifecycleOptionsByMethodAndProvider<"runWorkspace", "core">
  ): Promise<
    InferHookReturn<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>
  > {

    await RunWorkspaceLifecycleBase.hooks.beforeRunWorkspace.promise(options);
    const res = await RunWorkspaceLifecycleBase.hooks.runWorkspace.promise(
      options
    );
    assertIsResult(res);
    await RunWorkspaceLifecycleBase.hooks.afterRunWorkspace.promise(options);
    return res;
  }

  protected beforeRunWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}

  protected runWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}

  protected afterRunWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}
}
