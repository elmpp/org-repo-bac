import { AddressPathAbsolute } from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import {
  assertIsResult,
  Context,
  ContextCommand,
  FetchOptions,
  FetchResult,
  LifecycleReturnByMethodArray,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray,
  LifecycleStaticInterface,
  Result
} from "../../__types__";
import { AsyncHook, TapFn } from "../../hooks";
import { Config } from "../../validation";
import { CommonExecuteOptions } from "./__types__";
import { mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray } from "./util";

/**
 Fetch is an auxilary lifecycle that isn't part of the other user-initiated types.
 It allows fetching of differing contents to be implemented modularly. For instance: Github repos, Git repos etc

 Inspired by Yarn2's implementation - https://github.com/yarnpkg/berry/blob/ca475757fe85cdc2c4b4441f6d65d38fdab230ad/packages/plugin-github/sources/GithubFetcher.ts#L24
 */
export class FetchContentLifecycleBase<
  T extends LifecycleStaticInterface = typeof FetchContentLifecycleBase<any>
> {
  static lifecycleTitle = "fetchContent" as const;
  static title = "";

  get ctor(): T {
    return this.constructor as unknown as T;
  }
  get title() {
    return this.ctor.as ?? this.ctor.title;
  }

  static hooks = {
    beforeFetchContent: new AsyncHook<
      {
        config?: Config;
        // unknown;
      },
      void,
      "fetchContent"
    >(["options"], "fetchContent", "beforeFetchContent"),
    fetchContent: new AsyncHook<
      {
        config?: Config;
        // unknown;
      },
      Result<
        {
          destinationPath: AddressPathAbsolute;
        },
        {
          error: BacError;
        }
      >,
      "fetchContent"
    >(["options"], "fetchContent", "fetchContent"),
    afterFetchContent: new AsyncHook<
      {
        config?: Config;
        // unknown;
      },
      void,
      "fetchContent"
    >(["options"], "fetchContent", "afterFetchContent"),
  };

  /** @internal */
  static initialise<T extends FetchContentLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options;
    const ins = new this();
    const beforeFetchContentHook = ins.beforeFetchContent() as TapFn<'fetchContent'>;
    const fetchContentHook = ins.fetchContent() as TapFn<'fetchContent'>;
    const afterFetchContentHook = ins.afterFetchContent() as TapFn<'fetchContent'>;

    if (beforeFetchContentHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeFetchContent`
      );
      ins.ctor.hooks.beforeFetchContent.tapAsync(
        ins.title,
        beforeFetchContentHook
      );
    }
    if (fetchContentHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.fetchContent`
      );
      ins.ctor.hooks.fetchContent.tapAsync(ins.title, fetchContentHook);
    }
    if (afterFetchContentHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterFetchContent`
      );
      ins.ctor.hooks.afterFetchContent.tapAsync(
        ins.title,
        afterFetchContentHook
      );
    }
  }

  async executeFetchContent(options: {
    common: CommonExecuteOptions,
    options: LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<"fetchContent">
  }
  ): Promise<
    Result<LifecycleReturnByMethodArray<"fetchContent">, { error: BacError }>
  > {

    const optionsWithCommon = mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<'fetchContent'>(options)

    await FetchContentLifecycleBase.hooks.beforeFetchContent.mapAsync({
      options: optionsWithCommon,
    });

    const res = await FetchContentLifecycleBase.hooks.fetchContent.mapAsync({
      options: optionsWithCommon,
      strict: true,
    });
    assertIsResult(res);
    await FetchContentLifecycleBase.hooks.afterFetchContent.mapAsync({
      options: optionsWithCommon,
    });
    return res;
  }

  protected beforeFetchContent():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: FetchOptions;
      }) => Promise<unknown | void>)
    | void {}

  protected fetchContent():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: FetchOptions;
      }) => Promise<Result<FetchResult, {error: BacError}> | void>)
    | void {}

  protected afterFetchContent():
    | ((options: {
        context: Context;
        workspacePath: AddressPathAbsolute;
        // workingPath: string;
        options: FetchOptions;
      }) => Promise<unknown | void>)
    | void {}
}
