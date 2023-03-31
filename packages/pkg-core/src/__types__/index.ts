import { Command, Interfaces } from '@oclif/core'
import { ParserOutput } from '@oclif/core/lib/interfaces/parser'
import { ValueOf } from './util'
import { FlagsInfer, ArgsInfer } from '../commands/base-command'

export * from './type-utils'
export * from './util'

export type Outputs = {
  stdout: string
  stderr: string
}

export type LogLevel =
  | 'debug'
  | 'info'
  | 'warn'
  | 'error'
  | 'fatal'

/** instance types of all loaded services */
export type Services = {
  [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]['insType']
}

/** instance types of all loaded services */
export type ServicesStatic = {
  [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]['clzType']
}

/** internal ball of values. Do not store or make available elsewhere. @internal */
export type ContextPrivate = {
  // /** values coming out of oclif command phase */
  // cliOptions: ParserOutput<T['flags'], T['flags'], T['args']>
  /** @internal */
  oclifConfig: Interfaces.Config
  /** @todo */
  logger: (msg: string, level?: LogLevel) => void
}

/** ball of values made available to command methods. Includes oclif cliOptions */
export type ContextCommand<T extends typeof Command> = {
  /** values coming out of oclif command phase */
  cliOptions: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>
  services: Services
  /** @todo */
  logger: (msg: string, level?: LogLevel) => void
}

/** ball of values made available to "userspace" methods */
export type Context = {
  services: Services
  /** @todo */
  logger: (msg: string, level?: LogLevel) => void
}

// type MyInstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
// export type Static<TClass extends IStaticInterface & { new(...args: any[]): any }, IStaticInterface>
//   = MyInstanceType<TClass>;

export type ServiceStaticInterface = {
  title: string
  initialise(options: ContextPrivate): Promise<ValueOf<Services> | undefined>;
  // initialise<T extends {new (...args: any[]): T}>(options: ContextPrivate): Promise<T>;
  // new (...args: any[]): any;
}

// export type ServiceStaticInterface<T extends {new (...args: any): any}> = Static<T, _ServiceStaticInterface>

// export interface ServiceStaticInterface<T extends {new (...args: any[]): any}> {
//   initialise<T extends {new (...args: any[]): T}>(options: ContextPrivate): Promise<T>;
//   new (): any;
//  }
// export type ServiceStaticInterface = {
//   initialise<T>(options: ContextPrivate): T
// }