import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { AsyncHook } from "../hooks";
import { Config } from "../validation";
import {
  assertIsResult,
  Context,
  ContextCommand, LifecycleOptionsByMethodKeyedByProvider, LifecycleReturnsByMethod,
  LifecycleStaticInterface,
  Result
} from "../__types__";

export class InitialiseWorkspaceLifecycleBase<
  T extends LifecycleStaticInterface = typeof InitialiseWorkspaceLifecycleBase<any>
> {
  static lifecycleTitle = "initialiseWorkspace" as const;
  static title = ''

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeInitialiseWorkspace: new AsyncHook<{
      context: Context;
      workspacePath: AddressPathAbsolute;
      workingPath: string;
      options: unknown;
      // let's stack the options here as workspace-initialise will not be opened up to providers
      config: Config;
      configPath: string;
      cliVersion: string;
      cliRegistry: string;
    }, void, 'initialiseWorkspace'>(["options"], 'initialiseWorkspace', 'beforeInitialiseWorkspace'),
    initialiseWorkspace: new AsyncHook<
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
      >,
      'initialiseWorkspace'
    >(["options"], 'initialiseWorkspace', 'initialiseWorkspace'),
    afterInitialiseWorkspace: new AsyncHook<{
      context: Context;
      workspacePath: AddressPathAbsolute;
      workingPath: string;
      options: unknown;
      // let's stack the options here as workspace-initialise will not be opened up to providers
      config: Config;
      configPath: string;
      cliVersion: string;
      cliRegistry: string;
    }, void, 'initialiseWorkspace'>(["options"], 'initialiseWorkspace', 'afterInitialiseWorkspace'),
  };

  /** @internal */
  static initialise<T extends InitialiseWorkspaceLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const {context} = options
    const ins = new this();
    const beforeInitialiseWorkspaceHook = ins.beforeInitialiseWorkspace();
    const initialiseWorkspaceHook = ins.initialiseWorkspace();
    const afterInitialiseWorkspaceHook = ins.afterInitialiseWorkspace();

    if (beforeInitialiseWorkspaceHook) {
      context.logger.debug(`lifecycleHook loaded: ${ins.ctor.title}.beforeInitialiseWorkspace`)
      ins.ctor.hooks.beforeInitialiseWorkspace.tapAsync(
        ins.title,
        beforeInitialiseWorkspaceHook
        );
      }
      if (initialiseWorkspaceHook) {
      context.logger.debug(`lifecycleHook loaded: ${ins.ctor.title}.initialiseWorkspace`)
      ins.ctor.hooks.initialiseWorkspace.tapAsync(
        ins.title,
        initialiseWorkspaceHook
        );
      }
      if (afterInitialiseWorkspaceHook) {
      context.logger.debug(`lifecycleHook loaded: ${ins.ctor.title}.afterInitialiseWorkspace`)
      ins.ctor.hooks.afterInitialiseWorkspace.tapAsync(
        ins.title,
        afterInitialiseWorkspaceHook
      );
    }
  }

  async executeInitialiseWorkspace(
    options: LifecycleOptionsByMethodKeyedByProvider<"initialiseWorkspace">[]
  ): Promise<
  LifecycleReturnsByMethod<"initialiseWorkspace">
  > {
    await InitialiseWorkspaceLifecycleBase.hooks.beforeInitialiseWorkspace.callLifecycleBailAsync({
      options
    });
    const res =
      await InitialiseWorkspaceLifecycleBase.hooks.initialiseWorkspace.callLifecycleBailAsync({
        options,
        strict: true,
  });

    assertIsResult(res);

    await InitialiseWorkspaceLifecycleBase.hooks.afterInitialiseWorkspace.callLifecycleBailAsync({
      options
    });
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
