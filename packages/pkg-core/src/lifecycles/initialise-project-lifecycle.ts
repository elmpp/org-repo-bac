import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { Config } from "../validation";
import { assertIsResult, Context, Result } from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";

/** When a workspace/project is actually created */
export class InitialiseWorkspaceLifecycle {

  hooks = {
    beforeInitialiseWorkspace: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      }>([
      "options",
    ]),
    initialiseWorkspace: new AsyncSeriesBailHook<
      {
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
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
    afterInitialiseWorkspace: new AsyncSeriesHook<{
        context: Context;
        workspacePath: AddressPathAbsolute;
        workingPath: string;
        config?: Config;
      }>([
      "options",
    ]),
  };

  constructor(protected options: {context: Context}) {
    // this.hooks.initialiseWorkspace.intercept({
    //   call: (...args: any[]) => {
    //   console.log(`args :>> `, args)
    //   return args
    //   },
    //   register: (tapInfo) => {
    //     console.log(`tapInfo :>> `, tapInfo)
    //     return tapInfo
    //   }
    // })
  }
  // tapable - https://tinyurl.com/2mqyusrc


  // async beforeInitialiseWorkspace(
  //   options: InferHookParams<typeof this.hooks.beforeInitialiseWorkspace>
  // ): Promise<InferHookReturn<typeof this.hooks.beforeInitialiseWorkspace>> {
  //   return this.hooks.beforeInitialiseWorkspace.promise(options);
  // }
  async initialiseWorkspace(
    options: InferHookParams<typeof this.hooks.initialiseWorkspace>
  ): Promise<InferHookReturn<typeof this.hooks.initialiseWorkspace>> {
    await this.hooks.beforeInitialiseWorkspace.promise(options)
    const res = await this.hooks.initialiseWorkspace.promise(options);
    assertIsResult(res)
    await this.hooks.afterInitialiseWorkspace.promise(options)
    return res
  }
  // async afterInitialiseWorkspace(
  //   options: InferHookParams<typeof this.hooks.afterInitialiseWorkspace>
  // ): Promise<InferHookReturn<typeof this.hooks.afterInitialiseWorkspace>> {
  //   return this.hooks.afterInitialiseWorkspace.promise(options);
  // }
}
