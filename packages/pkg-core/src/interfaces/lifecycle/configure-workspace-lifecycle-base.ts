import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import {
  Context,
  ContextCommand,
  LifecycleStaticInterface,
  Result,
  expectIsOk,
  ok,
} from "../../__types__";
import { constants } from "../../constants";
import { AsyncHook, TapFn } from "../../hooks";
import { Config } from "../../validation";
import { ConfigConfigured } from "../../validation/config";
import { CommonExecuteOptions } from "./__types__";
import { mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray } from "./util";

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
    beforeConfigureWorkspace: new AsyncHook<"configureWorkspace">(
      ["options"],
      "configureWorkspace",
      "beforeConfigureWorkspace"
    ),
    /** configure workspace should coordinate configures at the project level */
    configureWorkspace: new AsyncHook<
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
    afterConfigureWorkspace: new AsyncHook<"configureWorkspace">(
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
    const beforeConfigureWorkspaceHook =
      ins.beforeConfigureWorkspace() as TapFn<"configureWorkspace">;
    const configureWorkspaceHook =
      ins.configureWorkspace() as TapFn<"configureWorkspace">;
    const afterConfigureWorkspaceHook =
      ins.afterConfigureWorkspace() as TapFn<"configureWorkspace">;

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
    options: {
      common: CommonExecuteOptions;
      options: {
        config: Config;
      };
      // options: Config;
    }
    // options: LifecycleOptionsByMethodKeyedByProviderArray<"configureWorkspace">
  ): Promise<
    Result<
      ConfigConfigured,
      // LifecycleMappedReturnByMethod<"configureWorkspace">,
      { error: BacError }
    >
  > {
    const projectSource =
      mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<"configureWorkspace">(
        {
          common: options.common,
          options: options.options.config.projectSource,
        }
      );

    // const configWithCommons = {
    //   projectSource:
    //     mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray({
    //       common: {
    //         context: options.context,
    //         workspacePath: options.workspacePath,
    //       },
    //       options: options.options.config.projectSource,
    //     }),
    // };

    await ConfigureWorkspaceLifecycleBase.hooks.beforeConfigureWorkspace.mapAsync(
      { options: projectSource }
    );

    const projectsRes =
      await ConfigureWorkspaceLifecycleBase.hooks.configureWorkspace.mapAsync({
        options: projectSource,
        // options: {
        //   context: options.context,
        //   workspacePath
        //   ...options.options.projectSource,

        // }
        strict: true,
      });
    // console.log(`res :>> `, projectsRes);

    // assertIsResult(res.res); // wrapped in provider

    expectIsOk(projectsRes);

    await ConfigureWorkspaceLifecycleBase.hooks.afterConfigureWorkspace.mapAsync(
      {
        options: projectSource,
      }
    );

    // return res;
    return ok({
      version: constants.GLOBAL_VERSION,
      projects: projectsRes.res,
    });
  }

  protected beforeConfigureWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        // config: Config;
        options: any;
      }) => Promise<unknown | void>)
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
      }) => Promise<unknown | void>)
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
        // options: {
        //   configuredConfig: ConfigProjectConfig;
        // };
      }) => Promise<unknown | void>)
    | undefined {
    return;
  }
}
