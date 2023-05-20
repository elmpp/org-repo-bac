import { BacError } from "@business-as-code/error";
import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import { assertIsResult, Context, Result } from "../__types__";
import { InferHookParams, InferHookReturn } from "./__types__";

/** Run commands against projects */
export class RunLifecycle {

  hooks = {
    beforeRunProject: new AsyncSeriesHook<{
        context: Context;
        // destinationPath: AddressPathAbsolute;
        workingPath: string;
      }>([
      "options",
    ]),
    runProject: new AsyncSeriesBailHook<
      {
        context: Context;
        // destinationPath: AddressPathAbsolute;
        workingPath: string;
      },
      Result<
        {
          // destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError,
        }
      >
    >(["options"]),
    afterRunProject: new AsyncSeriesHook<{
      context: Context;
      // destinationPath: AddressPathAbsolute;
      workingPath: string;
    }>([
    "options",
  ]),
    beforeRunWorkspace: new AsyncSeriesHook<{
        context: Context;
        // destinationPath: AddressPathAbsolute;
        workingPaths: string[]; // simpler to only accept workpaths here.
      }>([
      "options",
    ]),
    runWorkspace: new AsyncSeriesBailHook<
      {
        context: Context;
        // destinationPath: AddressPathAbsolute;
        workingPaths: string[]; // simpler to only accept workpaths here.
      },
      Result<
        {
          // destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError,
        }
      >
    >(["options"]),
    afterRunWorkspace: new AsyncSeriesHook<{
        context: Context;
        // destinationPath: AddressPathAbsolute;
        workingPaths: string[]; // simpler to only accept workpaths here.
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
  async runWorkspace(
    options: InferHookParams<typeof this.hooks.runWorkspace>
  ): Promise<InferHookReturn<typeof this.hooks.runWorkspace>> {

    await this.hooks.beforeRunWorkspace.promise(options)
    const res = await this.hooks.runWorkspace.promise(options);
    assertIsResult(res)
    await this.hooks.afterRunWorkspace.promise(options)
    return res
  }

  async runProject(
    options: InferHookParams<typeof this.hooks.runProject>
  ): Promise<InferHookReturn<typeof this.hooks.runProject>> {

    await this.hooks.beforeRunProject.promise(options)
    const res = await this.hooks.runProject.promise(options);
    assertIsResult(res)
    await this.hooks.afterRunProject.promise(options)
    return res
  }

  // async afterInitialiseWorkspace(
  //   options: InferHookParams<typeof this.hooks.afterInitialiseWorkspace>
  // ): Promise<InferHookReturn<typeof this.hooks.afterInitialiseWorkspace>> {
  //   return this.hooks.afterInitialiseWorkspace.promise(options);
  // }
}
