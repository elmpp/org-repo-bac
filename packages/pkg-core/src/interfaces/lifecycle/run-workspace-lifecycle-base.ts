import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { AsyncHook } from "../../hooks";
// import { AsyncSeriesBailHook, AsyncSeriesHook, Hook } from "tapable";
import {
  assertIsResult,
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProvider,
  LifecycleSingularReturnByMethod,
  LifecycleStaticInterface,
  Result,
} from "../../__types__";
// import { InferHookReturn } from "./__types__";

// /** skips hooks when the provider does not match. Interception docs - https://tinyurl.com/2dzb777b */
// function addProviderInterception<T extends AsyncSeriesBailHook<any, any, any>, PMethod extends LifecycleImplementedMethods, PProvider extends LifecycleProviders>(hook: T, providerMethod: PMethod, providerName: PProvider): Omit<T, 'promise'> & {promise: (options: LifecycleOptionsByMethod<"runWorkspace">) => Promise<LifecycleReturnsByProvider<PMethod>>} {
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
//     promise: async (options: LifecycleOptionsByMethod<"runWorkspace">) => hook.promise(options)
//   }
// }

/**
 execute a command across many projects within a workspace. Will use moon via the arbitrary extra command feature - https://tinyurl.com/24459t9e
 */
export class RunWorkspaceLifecycleBase<
  T extends LifecycleStaticInterface = typeof RunWorkspaceLifecycleBase<any>
> {
  static lifecycleTitle = "runWorkspace" as const;
  static title = "";

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeRunWorkspace: new AsyncHook<
      {},
      void,
      "runWorkspace"
    >(["options"], "runWorkspace", "beforeRunWorkspace"),
    runWorkspace: new AsyncHook<
      {},
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >,
      "runWorkspace"
    >(["options"], "runWorkspace", "runWorkspace"),
    afterRunWorkspace: new AsyncHook<
      {},
      void,
      "runWorkspace"
    >(["options"], "runWorkspace", "afterRunWorkspace"),
    // runWorkspace: new AsyncHook< THIS NEED TO BE ITS OWN CLASS SO INFERENCE WORKS OK
    //   {
    //     context: Context;
    //     workspacePath: AddressPathAbsolute;
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
    // >(["options"]), 'runWorkspace', 'core'),
    // runWorkspace: addProviderInterception(new AsyncSeriesBailHook< THIS NEED TO BE ITS OWN CLASS SO INFERENCE WORKS OK
    //   {
    //     context: Context;
    //     workspacePath: AddressPathAbsolute;
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
    // >(["options"]), 'runWorkspace', 'core'),
    // afterRunWorkspace: new AsyncSeriesHook<{
    //   context: Context;
    //   workspacePath: AddressPathAbsolute;
    //   workingPath: string;
    //   options: unknown;
    // }>(["options"]),
  };

  /** @internal */
  static initialise<T extends RunWorkspaceLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options;
    const ins = new this();
    const beforeRunWorkspaceHook = ins.beforeRunWorkspace();
    const runWorkspaceHook = ins.runWorkspace();
    const afterRunWorkspaceHook = ins.afterRunWorkspace();

    if (beforeRunWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeRunWorkspace`
      );
      ins.ctor.hooks.beforeRunWorkspace.tapAsync(
        ins.title,
        beforeRunWorkspaceHook
      );
    }
    if (runWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.runWorkspace`
      );
      ins.ctor.hooks.runWorkspace.tapAsync(ins.title, runWorkspaceHook);
      // console.log(
      //   `ins.ctor.hooks.runWorkspace.taps :>> `,
      //   ins.ctor.hooks.runWorkspace.taps
      // );
    }
    if (afterRunWorkspaceHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterRunWorkspace`
      );
      ins.ctor.hooks.afterRunWorkspace.tapAsync(
        ins.title,
        afterRunWorkspaceHook
      );
    }

    // addProviderInterception(ins.ctor.hooks.beforeRunWorkspace, ins.ctor.title)
    // addProviderInterception(ins.ctor.hooks.runWorkspace, ins.ctor.title)
    // addProviderInterception(ins.ctor.hooks.afterRunWorkspace, ins.ctor.title)
  }

  // async executeRunWorkspace(options: InferHookParams<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>): Promise<InferHookReturn<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>> {
  async executeRunWorkspace(
    options: LifecycleOptionsByMethodKeyedByProvider<"runWorkspace">[]
    // options: LifecycleOptionsByMethodAndProvider<"runWorkspace", "core">
  ): Promise<
    LifecycleSingularReturnByMethod<"runWorkspace">
    // InferAsyncHookReturn<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>
  > {
    await RunWorkspaceLifecycleBase.hooks.beforeRunWorkspace.callBailAsync(
      {
        options,
      }
    );
    // type DDDD = InferAsyncHookReturn<typeof RunWorkspaceLifecycleBase.hooks.runWorkspace>
    const res =
      await RunWorkspaceLifecycleBase.hooks.runWorkspace.callBailAsync(
        {
          options,
          strict: true,
        }
      );
    assertIsResult(res);
    await RunWorkspaceLifecycleBase.hooks.afterRunWorkspace.callBailAsync(
      {
        options,
      }
    );
    return res;
  }

  protected beforeRunWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}

  protected runWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}

  protected afterRunWorkspace():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: any;
      }) => Promise<unknown>)
    | void {}
}
