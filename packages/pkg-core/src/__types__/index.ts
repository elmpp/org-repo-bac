import { logging } from '@angular-devkit/core'
import { AddressPathAbsolute } from '@business-as-code/address'
import { Command, Interfaces } from '@oclif/core'
import { ParserOutput } from '@oclif/core/lib/interfaces/parser'
import {
  ArgsInfer,
  BaseParseOutput,
  FlagsInfer
} from '../commands/base-command'
import {
  ConfigureProjectLifecycleBase,
  ConfigureWorkspaceLifecycleBase,
  FetchContentLifecycleBase,
  InitialiseWorkspaceLifecycleBase,
  RunProjectLifecycleBase,
  // RunProjectLifecycleBase,
  RunWorkspaceLifecycleBase
} from '../interfaces'
// import { Lifecycles } from "../lifecycles";
import {
  LifecycleStaticInterface,
  ServiceProvidersForAsByMethod
} from './lifecycles'
import {
  ServiceInitialiseLiteOptions,
  ServiceMap,
  ServiceStaticInterface,
  ServiceStaticMap
} from './services'

export * from './interfaces'
export * from './lib'
export * from './lifecycles'
export * from './moon'
export * from './services'
export * from './type-utils'
export * from './util'

export type Outputs = {
  stdout: string
  stderr: string
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

export const logLevelMatching = (
  logLevel: LogLevel,
  currentLogLevel: LogLevel,
  json: boolean | undefined
): boolean => {
  const logLevels: LogLevel[] = ['debug', 'info', 'warn', 'error', 'fatal']
  return (
    (json ? logLevels.indexOf('error') : logLevels.indexOf(logLevel)) <=
    logLevels.indexOf(currentLogLevel)
  )
}

/** ball of values made available to command methods. Includes oclif cliOptions */
export type ContextCommand<T extends typeof Command> = {
  /** values coming out of oclif command phase */
  cliOptions: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
    BaseParseOutput
  serviceFactory: (<SName extends keyof ServiceStaticMap>(
    serviceName: SName,
    options: ServiceInitialiseLiteOptions<SName>
    // options: ServiceInitialiseCommonOptions
  ) => Promise<ServiceMap[SName][number]>) & {
    availableServices: (keyof ServiceMap)[]
  }
  logger: Logger
  // logger: (msg: string, level?: LogLevel) => void;
  /** @internal */
  oclifConfig: Interfaces.Config
  detectedPackageManager?: ServiceProvidersForAsByMethod<'packageManager'>
  /**
   This is the process' absolute path, and is dependent upon cli --workspacePath option or process.cwd()
   Note that this will differ from values in services etc
   */
  workspacePath: AddressPathAbsolute

  lifecycles: {
    initialiseWorkspace: InitialiseWorkspaceLifecycleBase<any>
    configureWorkspace: ConfigureWorkspaceLifecycleBase<any>
    configureProject: ConfigureProjectLifecycleBase<any>
    // synchroniseWorkspace: SynchroniseWorkspaceLifecycleBase<any>;
    runWorkspace: RunWorkspaceLifecycleBase<any>
    runProject: RunProjectLifecycleBase<any>
    fetchContent: FetchContentLifecycleBase<any>
  }
  /** @internal @private @ignore @hidden @deprecated */
  toJSON: () => string
}

/** ball of values made available to "userspace" methods */
export type Context = {
  /** common values coming out of the command phase (i.e. the baseFlags/baseArgs) */
  cliOptions: BaseParseOutput
  // cliOptions: ParserOutput<BaseFlags, BaseFlags, {}>;
  // services: Services
  serviceFactory: (<SName extends keyof ServiceStaticMap>(
    serviceName: SName,
    options: ServiceInitialiseLiteOptions<SName>
  ) => Promise<ServiceMap[SName][number]>) & {
    availableServices: (keyof ServiceMap)[]
  }
  logger: Logger
  /** @internal */
  oclifConfig: Interfaces.Config
  detectedPackageManager?: ServiceProvidersForAsByMethod<'packageManager'>
  /**
   This is the process' absolute path, and is dependent upon cli --workspacePath option or process.cwd()
   Note that this will differ from values in services etc
   */
  workspacePath: AddressPathAbsolute

  lifecycles: {
    initialiseWorkspace: InitialiseWorkspaceLifecycleBase<any>
    configureWorkspace: ConfigureWorkspaceLifecycleBase<any>
    configureProject: ConfigureProjectLifecycleBase<any>
    // synchroniseWorkspace: SynchroniseWorkspaceLifecycleBase<any>;
    runWorkspace: RunWorkspaceLifecycleBase<any>
    runProject: RunProjectLifecycleBase<any>
    fetchContent: FetchContentLifecycleBase<any>
  }

  /** @internal @private @ignore @hidden @deprecated */
  toJSON: () => string
}

export type Plugin = {
  services?: ServiceStaticInterface[]
  // /** allows a plugin chance to execute somestu */
  // initialise?: (options: { context: ContextCommand<any> }) => void;
  lifecycles?: LifecycleStaticInterface[]
}

export type Logger = logging.Logger & {
  /** logger that is unaffected by the current logLevel */
  stdout: (message: string) => void
  // stderr: (message: string, metadata?: JsonObject) => void;
}
