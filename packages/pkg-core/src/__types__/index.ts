import { ParserOutput } from '@oclif/core/lib/interfaces/parser'
import { ValueOf } from './util'

export * from './util'

export type Outputs = {
  stdout: string
  stderr: string
}

/** instance types of all loaded services */
export type Services = {
  [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]['insType']
}
type D1 = keyof Bac.Services['myService']['insType']
type D2 = keyof Bac.Services['myService']['clzType']
/** instance types of all loaded services */
export type ServicesStatic = {
  [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]['clzType']
}

/** internal ball of values */
export type ContextPrivate = {
  /** values coming out of oclif command phase */
  cliOptions: ParserOutput

}

/** ball of values made available to "userspace" methods */
export type Context = ContextPrivate & {
  services: Services
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