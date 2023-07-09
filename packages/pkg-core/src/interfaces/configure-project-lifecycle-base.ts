import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { Config } from "prettier";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { AsyncHook } from "../hooks";
import {
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProviderArray,
  LifecycleReturnsByMethod,
  LifecycleStaticInterface,
  Result,
} from "../__types__";

export class ConfigureProjectLifecycleBase<
  T extends LifecycleStaticInterface = typeof ConfigureProjectLifecycleBase<any>
> {
  static lifecycleTitle = "configureProject" as const;
  static title = "";

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeConfigureProject: new AsyncHook<
      {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
        config?: Config;
      },
      void,
      "configureProject"
    >(["options"], "configureProject", "beforeconfigureProject"),
    /** configure project should coordinate configures at the project level */
    configureProject: new AsyncHook<
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
          error: BacError;
        }
      >,
      "configureProject"
    >(["options"], "configureProject", "configureProject"),
    afterConfigureProject: new AsyncHook<
      {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
        config?: Config;
      },
      void,
      "configureProject"
    >(["options"], "configureProject", "afterConfigureProject"),
  };

  /** @internal */
  static initialise<T extends ConfigureProjectLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options;
    const ins = new this();
    const beforeConfigureProjectHook = ins.beforeConfigureProject();
    const configureProjectHook = ins.configureProject();
    const afterConfigureProjectHook = ins.afterConfigureProject();

    if (beforeConfigureProjectHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeConfigureProject`
      );
      ins.ctor.hooks.beforeConfigureProject.tapAsync(
        ins.title,
        beforeConfigureProjectHook
      );
    }
    if (configureProjectHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.configureProject`
      );
      ins.ctor.hooks.configureProject.tapAsync(ins.title, configureProjectHook);
    }
    if (afterConfigureProjectHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterConfigureProject`
      );
      ins.ctor.hooks.afterConfigureProject.tapAsync(
        ins.title,
        afterConfigureProjectHook
      );
    }
  }

  async executeConfigureProject(
    options: LifecycleOptionsByMethodKeyedByProviderArray<"configureProject">
  ): Promise<LifecycleReturnsByMethod<"configureProject">> {
    await ConfigureProjectLifecycleBase.hooks.beforeConfigureProject.callLifecycleBailAsync(
      {
        options,
      }
    );
    const res =
      await ConfigureProjectLifecycleBase.hooks.configureProject.callLifecycleBailAsync(
        {
          options,
          strict: true,
        }
      );
    assertIsResult(res);
    await ConfigureProjectLifecycleBase.hooks.afterConfigureProject.callLifecycleBailAsync(
      {
        options,
      }
    );
    return res;
  }

  protected beforeConfigureProject():
    | ((options: {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown>)
    | void {}

  protected configureProject():
    | ((options: {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown>)
    | void {}

  protected afterConfigureProject():
    | ((options: {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: any;
        config?: Config;
      }) => Promise<unknown>)
    | void {}
}
