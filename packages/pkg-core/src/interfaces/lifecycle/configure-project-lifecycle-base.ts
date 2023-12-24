import { AddressPathAbsolute } from '@business-as-code/address'
import { BacError } from '@business-as-code/error'
// import { AsyncSeriesBailHook, AsyncSeriesHook } from "tapable";
import {
  Context,
  ContextCommand,
  LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray,
  LifecycleReturnByMethodSingular,
  LifecycleStaticInterface,
  Result,
  assertIsResult
} from '../../__types__'
import { AsyncHook, TapFn } from '../../hooks'
import { CommonExecuteOptions } from './__types__'
import { mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray } from './util'
import { Config } from '../../validation'

export class ConfigureProjectLifecycleBase<
  T extends LifecycleStaticInterface = typeof ConfigureProjectLifecycleBase<any>
> {
  static lifecycleTitle = 'configureProject' as const
  static title = ''

  get ctor(): T {
    return this.constructor as unknown as T
  }
  get title() {
    return this.ctor.as ?? this.ctor.title
  }

  static hooks = {
    beforeConfigureProject: new AsyncHook<'configureProject'>(
      ['options'],
      'configureProject',
      'beforeconfigureProject'
    ),
    /** configure project should coordinate configures at the project level */
    configureProject: new AsyncHook<'configureProject'>(
      ['options'],
      'configureProject',
      'configureProject'
    ),
    afterConfigureProject: new AsyncHook<'configureProject'>(
      ['options'],
      'configureProject',
      'afterConfigureProject'
    )
  }

  /** @internal */
  static initialise<T extends ConfigureProjectLifecycleBase>(
    this: { new (): T },
    options: { context: ContextCommand<any> }
  ) {
    const { context } = options
    const ins = new this()
    const beforeConfigureProjectHook =
      ins.beforeConfigureProject() as TapFn<'configureProject'>
    const configureProjectHook =
      ins.configureProject() as TapFn<'configureProject'>
    const afterConfigureProjectHook =
      ins.afterConfigureProject() as TapFn<'configureProject'>

    if (beforeConfigureProjectHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.beforeConfigureProject`
      )
      ins.ctor.hooks.beforeConfigureProject.tapAsync(
        ins.title,
        beforeConfigureProjectHook
      )
    }
    if (configureProjectHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.configureProject`
      )
      ins.ctor.hooks.configureProject.tapAsync(ins.title, configureProjectHook)
    }
    if (afterConfigureProjectHook) {
      context.logger.debug(
        `lifecycleHook loaded: ${ins.ctor.title}.afterConfigureProject`
      )
      ins.ctor.hooks.afterConfigureProject.tapAsync(
        ins.title,
        afterConfigureProjectHook
      )
    }
  }

  async executeConfigureProject(options: {
    common: CommonExecuteOptions
    options: LifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<'configureProject'>
  }): Promise<
    Result<
      LifecycleReturnByMethodSingular<'configureProject'>,
      { error: BacError }
    >
  > {
    const optionsWithCommon =
      mapLifecycleOptionsByMethodKeyedByProviderWithoutCommonArray<'configureProject'>(
        options
      )

    await ConfigureProjectLifecycleBase.hooks.beforeConfigureProject.callBailAsync(
      {
        options: optionsWithCommon
      }
    )
    const res =
      await ConfigureProjectLifecycleBase.hooks.configureProject.callBailAsync({
        options: optionsWithCommon,
        strict: true
      })
    assertIsResult(res)
    await ConfigureProjectLifecycleBase.hooks.afterConfigureProject.callBailAsync(
      {
        options: optionsWithCommon
      }
    )
    return res
  }

  protected beforeConfigureProject():
    | ((options: {
        context: Context
        projectPath: AddressPathAbsolute
        workingPath: string
        options: any
        config?: Config
      }) => Promise<unknown | void>)
    | void {}

  protected configureProject():
    | ((options: {
        context: Context
        projectPath: AddressPathAbsolute
        workingPath: string
        options: any
        config?: Config
      }) => Promise<unknown | void>)
    | void {}

  protected afterConfigureProject():
    | ((options: {
        context: Context
        projectPath: AddressPathAbsolute
        workingPath: string
        options: any
        config?: Config
      }) => Promise<unknown | void>)
    | void {}
}
