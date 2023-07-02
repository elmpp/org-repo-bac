import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { Config } from "../validation";
import {
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleStaticInterface,
  Result,
} from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";

export class InitialiseWorkspaceLifecycleBase<
  T extends LifecycleStaticInterface
> {
  static lifecycleTitle = "initialiseWorkspace" as const;

  get ctor(): T {
    return this.constructor as unknown as T;
  }

  static hooks = {
    beforeInitialiseWorkspace: new AsyncSeriesHook<{
      context: Context;
      workspacePath: AddressPathAbsolute;
      workingPath: string;
      options: unknown;
      // let's stack the options here as workspace-initialise will not be opened up to providers
      config: Config;
      configPath: string;
      cliVersion: string;
      cliRegistry: string;
    }>(["options"]),
    initialiseWorkspace: new AsyncSeriesBailHook<
      {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
        // let's stack the options here as workspace-initialise will not be opened up to providers
        name: string;
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
      },
      // } & LifecycleOptionsByProvider<'initialiseWorkspace'>,
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >
    >(["options"]),
    afterInitialiseWorkspace: new AsyncSeriesHook<{
      context: Context;
      workspacePath: AddressPathAbsolute;
      workingPath: string;
      options: unknown;
      // let's stack the options here as workspace-initialise will not be opened up to providers
      config: Config;
      configPath: string;
      cliVersion: string;
      cliRegistry: string;
    }>(["options"]),
  };

  /** @internal */
  static initialise<T extends InitialiseWorkspaceLifecycleBase<any>>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const ins = new this();
    const beforeInitialiseWorkspaceHook = ins.beforeInitialiseWorkspace();
    const initialiseWorkspaceHook = ins.initialiseWorkspace();
    const afterInitialiseWorkspaceHook = ins.afterInitialiseWorkspace();

    if (beforeInitialiseWorkspaceHook) {
      ins.ctor.hooks.beforeInitialiseWorkspace.tapPromise(
        ins.ctor.title,
        beforeInitialiseWorkspaceHook
      );
    }
    if (initialiseWorkspaceHook) {
      ins.ctor.hooks.initialiseWorkspace.tapPromise(
        ins.ctor.title,
        initialiseWorkspaceHook
      );
    }
    if (afterInitialiseWorkspaceHook) {
      ins.ctor.hooks.afterInitialiseWorkspace.tapPromise(
        ins.ctor.title,
        afterInitialiseWorkspaceHook
      );
    }
  }

  async executeInitialiseWorkspace(
    options: InferHookParams<
      typeof InitialiseWorkspaceLifecycleBase.hooks.initialiseWorkspace
    >
  ): Promise<
    InferHookReturn<
      typeof InitialiseWorkspaceLifecycleBase.hooks.initialiseWorkspace
    >
  > {
    await InitialiseWorkspaceLifecycleBase.hooks.beforeInitialiseWorkspace.promise(
      options
    );
    const res =
      await InitialiseWorkspaceLifecycleBase.hooks.initialiseWorkspace.promise(
        options
      );

    assertIsResult(res);

    await InitialiseWorkspaceLifecycleBase.hooks.afterInitialiseWorkspace.promise(
      options
    );
    return res;
  }

  protected beforeInitialiseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: any;
        // let's stack the options here as workspace-initialise will not be opened up to providers
        name: string;
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
      }) => Promise<unknown>)
    | undefined {
    return;
  }

  protected initialiseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: any;
        // let's stack the options here as workspace-initialise will not be opened up to providers
        name: string;
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
      }) => Promise<unknown>)
    | undefined {
    return;
  }

  protected afterInitialiseWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        options: any;
        // let's stack the options here as workspace-initialise will not be opened up to providers
        name: string;
        config: Config;
        configPath: string;
        cliVersion: string;
        cliRegistry: string;
      }) => Promise<unknown>)
    | undefined {
    return;
  }
}
