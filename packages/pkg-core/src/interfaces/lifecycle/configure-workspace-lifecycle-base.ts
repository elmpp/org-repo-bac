import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { AsyncHook } from "../../hooks";
import {
  Context,
  ContextCommand,
  LifecycleMappedReturnByMethod, LifecycleOptionsByMethodKeyedByProviderArray,
  LifecycleStaticInterface,
  Result
} from "../../__types__";

/**
 the configure-workspace lifecycle acts upon a workspace's user configuration. It is responsible for
 processing the input user configuration into its final form (aka lock file). The lock file is what
 ultimately enables the synchronising of upstream content
 */
export class ConfigureWorkspaceLifecycleBase<
  T extends LifecycleStaticInterface = typeof ConfigureWorkspaceLifecycleBase<any>
> {
  static lifecycleTitle = "configureWorkspace" as const;
  static title = " ";

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeConfigureWorkspace: new AsyncHook<{}, void, "configureWorkspace">(
      ["options"],
      "configureWorkspace",
      "beforeConfigureWorkspace"
    ),
    /** configure workspace should coordinate configures at the project level */
    configureWorkspace: new AsyncHook<
      {},
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >,
      "configureWorkspace"
    >(["options"], "configureWorkspace", "configureWorkspace"),
    // configureWorkspace: new AsyncSeriesBailHook<
    //   {
    //     context: Context;
    //     workspacePath: AddressPathAbsolute;
    //     workingPath: string;
    //     config: Config;
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
    afterConfigureWorkspace: new AsyncHook<{}, void, "configureWorkspace">(
      ["options"],
      "configureWorkspace",
      "afterConfigureWorkspace"
    ),
  };

  /** @internal */
  static initialise<T extends ConfigureWorkspaceLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options;
    const ins = new this();
    const beforeConfigureWorkspaceHook = ins.beforeConfigureWorkspace();
    const configureWorkspaceHook = ins.configureWorkspace();
    const afterConfigureWorkspaceHook = ins.afterConfigureWorkspace();

    if (beforeConfigureWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeConfigureWorkspace`
      );
      ins.ctor.hooks.beforeConfigureWorkspace.tapAsync(
        ins.title,
        beforeConfigureWorkspaceHook
      );
    }
    if (configureWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.configureWorkspace`
      );
      ins.ctor.hooks.configureWorkspace.tapAsync(
        ins.title,
        configureWorkspaceHook
      );
    }
    if (afterConfigureWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterConfigureWorkspace`
      );
      ins.ctor.hooks.afterConfigureWorkspace.tapAsync(
        ins.title,
        afterConfigureWorkspaceHook
      );
    }
  }

  async executeConfigureWorkspace(
    options: LifecycleOptionsByMethodKeyedByProviderArray<"configureWorkspace">
  ): Promise<LifecycleMappedReturnByMethod<"configureWorkspace">> {
    await ConfigureWorkspaceLifecycleBase.hooks.beforeConfigureWorkspace.mapAsync(
      { options }
    );

    const res =
      await ConfigureWorkspaceLifecycleBase.hooks.configureWorkspace.mapAsync({
        options,
        strict: true,
      });
    // console.log(`res :>> `, res);

    // assertIsResult(res.res); // wrapped in provider

    await ConfigureWorkspaceLifecycleBase.hooks.afterConfigureWorkspace.mapAsync(
      { options }
    );
    return res;
  }

  protected beforeConfigureWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        // config: Config;
        options: any;
      }) => Promise<unknown>)
    | undefined {
    return;
  }

  protected configureWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        // config: Config;
        options: any;
      }) => Promise<unknown>)
    | undefined {
    return;
  }

  protected afterConfigureWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        // config: Config;
        options: any;
      }) => Promise<unknown>)
    | undefined {
    return;
  }
}
