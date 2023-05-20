import { logging } from "@angular-devkit/core";
import { AddressPathAbsolute } from "@business-as-code/address";
import { Command, Interfaces } from "@oclif/core";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import {
  ArgsInfer,
  BaseParseOutput,
  FlagsInfer,
} from "../commands/base-command";
import { Lifecycles } from "../lifecycles";
import { ValueOf } from "./util";

export * from "./type-utils";
export * from "./util";

export type Outputs = {
  stdout: string;
  stderr: string;
};

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";


/** instance types of all loaded services */
export type Services = {
  [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]["insType"];
};

/** instance types of all loaded services */
export type ServicesStatic = {
  [ServiceName in keyof Bac.Services]: Bac.Services[ServiceName]["clzType"];
};

// /** internal ball of values. Do not store or make available elsewhere. @internal */
// export type ContextPrivate = {
//   // /** values coming out of oclif command phase */
//   // cliOptions: ParserOutput<T['flags'], T['flags'], T['args']>
//   /** @internal */
//   oclifConfig: Interfaces.Config
//   /** @todo */
//   logger: (msg: string, level?: LogLevel) => void
// }

/** ball of values made available to command methods. Includes oclif cliOptions */
export type ContextCommand<T extends typeof Command> = {
  /** values coming out of oclif command phase */
  cliOptions: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
    BaseParseOutput;
  serviceFactory: (<SName extends keyof ServicesStatic>(
    serviceName: SName,
    options: ServiceInitialiseLiteOptions<SName>
    // options: ServiceInitialiseCommonOptions
  ) => Promise<Services[SName]>) & { availableServices: (keyof Services)[] };
  logger: logging.Logger;
  // logger: (msg: string, level?: LogLevel) => void;
  /** @internal */
  oclifConfig: Interfaces.Config;
  /**
   This is the process' absolute path, and is dependent upon cli --workspacePath option or process.cwd()
   Note that this will differ from values in services etc
   */
  workspacePath: AddressPathAbsolute;

  lifecycles: Lifecycles;
};

/** ball of values made available to "userspace" methods */
export type Context = {
  /** common values coming out of the command phase (i.e. the baseFlags/baseArgs) */
  cliOptions: BaseParseOutput;
  // cliOptions: ParserOutput<BaseFlags, BaseFlags, {}>;
  // services: Services
  serviceFactory: (<SName extends keyof ServicesStatic>(
    serviceName: SName,
    options: ServiceInitialiseLiteOptions<SName>
  ) => Promise<Services[SName]>) & { availableServices: (keyof Services)[] };
  logger: logging.Logger;
  /** @internal */
  oclifConfig: Interfaces.Config;
  /**
   This is the process' absolute path, and is dependent upon cli --workspacePath option or process.cwd()
   Note that this will differ from values in services etc
   */
  workspacePath: AddressPathAbsolute;
};

// type MyInstanceType<T extends new (...args: any) => any> = T extends new (...args: any) => infer R ? R : any;
// export type Static<TClass extends IStaticInterface & { new(...args: any[]): any }, IStaticInterface>
//   = MyInstanceType<TClass>;

export type ServiceInitialiseCommonOptions = {
  context: Context;
  /** service instances are recreated when targeting different directories */
  workspacePath: AddressPathAbsolute;
  /** relative path that is joined to destinationPath. Useful for cwd() of clients, e.g. git, pwd */
  workingPath: string;
};
export type ServiceInitialiseOptions<SName extends keyof Services> = Parameters<
  ServicesStatic[SName]["initialise"]
>[0];
export type ServiceInitialiseLiteOptions<SName extends keyof Services> = Omit<Parameters<
  ServicesStatic[SName]["initialise"]
>[0], 'workspacePath'>; // workspacePath found inside the context
// export type ServiceInitialiseOptions = { context: Context; workingPath: AddressPathRelative }; // workingPath must be runtime value for services

export type ServiceStaticInterface = {
  title: string;
  initialise(
    options: ServiceInitialiseCommonOptions
  ): Promise<ValueOf<Services> | undefined>;
  // initialise<T extends {new (...args: any[]): T}>(options: ContextPrivate): Promise<T>;
  // new (...args: any[]): any;
};

export type Plugin = {
  services?: ServiceStaticInterface[];
  /** gives opportunity to subscribe to hooks */
  initialise?: (options: { context: ContextCommand<any> }) => void;
};

// export type ServiceStaticInterface<T extends {new (...args: any): any}> = Static<T, _ServiceStaticInterface>

// export interface ServiceStaticInterface<T extends {new (...args: any[]): any}> {
//   initialise<T extends {new (...args: any[]): T}>(options: ContextPrivate): Promise<T>;
//   new (): any;
//  }
// export type ServiceStaticInterface = {
//   initialise<T>(options: ContextPrivate): T
// }

// expectTypeOf<ContextCommand<any>>().toMatchTypeOf<Context>(); // Context must be a subset of ContextCommand to enable the commands to use the serviceFactory
