import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { AsyncHook } from "../hooks";
// import { AsyncSeriesBailHook, AsyncSeriesHook, Hook } from "tapable";
import {
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProvider,
  LifecycleReturnsByMethod,
  LifecycleStaticInterface,
  Result,
} from "../__types__";
// import { InferHookReturn } from "./__types__";

// /** skips hooks when the provider does not match. Interception docs - https://tinyurl.com/2dzb777b */
// function addProviderInterception<T extends AsyncSeriesBailHook<any, any, any>, PMethod extends LifecycleImplementedMethods, PProvider extends LifecycleProviders>(hook: T, providerMethod: PMethod, providerName: PProvider): Omit<T, 'promise'> & {promise: (options: LifecycleOptionsByMethod<"runProject">) => Promise<LifecycleReturnsByProvider<PMethod>>} {
//   hook.intercept({
//     register: (tapInfo) => {
//       return {
//         ...tapInfo,
//         fn: (...runtimeArgs: {provider: string, options?: {context?: Context}}[]) => {
//           if (runtimeArgs.length > 1) {
//             throw new Error(`All hooks are expected to use destructured option objects. '${JSON.stringify(runtimeArgs)}'`)
//           }
//           const options = runtimeArgs[0]
//           if (!options.provider) {
//             throw new Error(`All hooks are expected to use destructured option objects. '${JSON.stringify(options)}'`)
//           }
//           if (options.provider !== providerName) {
//             options?.options?.context?.logger.debug(`Lifecycle method skipped: name: '${tapInfo.name}', provider: '${providerName}', hook provider: '${options.provider}'`)
//             return
//           }

//           options?.options?.context?.logger.debug(`Lifecycle method matched: name: '${tapInfo.name}', provider: '${providerName}', hook provider: '${options.provider}'`)
//           return tapInfo.fn(...runtimeArgs)
//         }
//       }
//     }
//   })
//   return {
//     ...hook,
//     promise: async (options: LifecycleOptionsByMethod<"runProject">) => hook.promise(options)
//   }
// }

/**
 execute a command across many projects within a project. Will use moon via the arbitrary extra command feature - https://tinyurl.com/24459t9e
 */
export class RunProjectLifecycleBase<T extends LifecycleStaticInterface = typeof RunProjectLifecycleBase<any>> {
  static lifecycleTitle = "runProject" as const;
  static title = ''

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeRunProject: new AsyncHook<
      {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
      },
      void,
      "runProject"
    >(["options"], "runProject", "beforeRunProject"),
    runProject: new AsyncHook<
      {
        context: Context;
        projectPath: AddressPathAbsolute;
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
      >,
      "runProject"
    >(["options"], "runProject", "runProject"),
    afterRunProject: new AsyncHook<
      {
        context: Context;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: unknown;
      },
      void,
      "runProject"
    >(["options"], "runProject", "afterRunProject"),
    // runProject: new AsyncHook< THIS NEED TO BE ITS OWN CLASS SO INFERENCE WORKS OK
    //   {
    //     context: Context;
    //     projectPath: AddressPathAbsolute;
    //     workingPath: string;
    //     options: unknown;
    //   },
    //   Result<
    //     {
    //       destinationPath: AddressPathAbsolute;
    //     },
    //     {
    //       error: BacError;
    //     }
    //   >
    // >(["options"]), 'runProject', 'core'),
    // runProject: addProviderInterception(new AsyncSeriesBailHook< THIS NEED TO BE ITS OWN CLASS SO INFERENCE WORKS OK
    //   {
    //     context: Context;
    //     projectPath: AddressPathAbsolute;
    //     workingPath: string;
    //     options: unknown;
    //   },
    //   Result<
    //     {
    //       destinationPath: AddressPathAbsolute;
    //     },
    //     {
    //       error: BacError;
    //     }
    //   >
    // >(["options"]), 'runProject', 'core'),
    // afterRunProject: new AsyncSeriesHook<{
    //   context: Context;
    //   projectPath: AddressPathAbsolute;
    //   workingPath: string;
    //   options: unknown;
    // }>(["options"]),
  };

  /** @internal */
  static initialise<T extends RunProjectLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const {context} = options
    const ins = new this();
    const beforeRunProjectHook = ins.beforeRunProject();
    const runProjectHook = ins.runProject();
    const afterRunProjectHook = ins.afterRunProject();

    if (beforeRunProjectHook) {
      context.logger.debug(`lifecycleHook loaded: ${ins.ctor.title}.beforeRunProject`)
      ins.ctor.hooks.beforeRunProject.tapAsync(
        ins.title,
        beforeRunProjectHook
        );
      }
      if (runProjectHook) {
      context.logger.debug(`lifecycleHook loaded: ${ins.ctor.title}.runProject`)
      ins.ctor.hooks.runProject.tapAsync(ins.title, runProjectHook);
    }
    if (afterRunProjectHook) {
      context.logger.debug(`lifecycleHook loaded: ${ins.ctor.title}.afterRunProject`)
      ins.ctor.hooks.afterRunProject.tapAsync(
        ins.title,
        afterRunProjectHook
      );
    }

    // addProviderInterception(ins.ctor.hooks.beforeRunProject, ins.ctor.title)
    // addProviderInterception(ins.ctor.hooks.runProject, ins.ctor.title)
    // addProviderInterception(ins.ctor.hooks.afterRunProject, ins.ctor.title)
  }

  // async executeRunProject(options: InferHookParams<typeof RunProjectLifecycleBase.hooks.runProject>): Promise<InferHookReturn<typeof RunProjectLifecycleBase.hooks.runProject>> {
  async executeRunProject(
    options: LifecycleOptionsByMethodKeyedByProvider<"runProject">[]
    // options: LifecycleOptionsByMethodAndProvider<"runProject", "core">
  ): Promise<
    LifecycleReturnsByMethod<"runProject">
    // InferAsyncHookReturn<typeof RunProjectLifecycleBase.hooks.runProject>
  > {
    await RunProjectLifecycleBase.hooks.beforeRunProject.callLifecycleBailAsync({
      options
    });
    // type DDDD = InferAsyncHookReturn<typeof RunProjectLifecycleBase.hooks.runProject>
    const res =
      await RunProjectLifecycleBase.hooks.runProject.callLifecycleBailAsync({
        options,
        strict: true,
  });
    assertIsResult(res);
    await RunProjectLifecycleBase.hooks.afterRunProject.callLifecycleBailAsync({
      options
    });
    return res;
  }

  protected beforeRunProject():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}

  protected runProject():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}

  protected afterRunProject():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        projectPath: AddressPathAbsolute;
        workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}
}
