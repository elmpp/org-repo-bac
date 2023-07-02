import { logging } from "@angular-devkit/core";
import { AddressPathAbsolute } from "@business-as-code/address";
import { Command, Interfaces } from "@oclif/core";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import {
  ArgsInfer,
  BaseParseOutput,
  FlagsInfer,
} from "../commands/base-command";
import { ConfigureWorkspaceLifecycleBase, InitialiseWorkspaceLifecycleBase, RunProjectLifecycleBase, RunWorkspaceLifecycleBase, SynchroniseWorkspaceLifecycleBase } from "../interfaces";
import { ConfigureProjectLifecycleBase } from "../interfaces/configure-project-lifecycle-base";
// import { Lifecycles } from "../lifecycles";
import { LifecycleStaticInterface } from "./lifecycles";
import {
  ServiceInitialiseLiteOptions,
  ServiceMap,
  ServiceStaticMap,
  ServiceStaticInterface,
} from "./services";

export * from "./type-utils";
export * from "./moon";
export * from "./util";

export * from './services'
export * from './lifecycles'

export type Outputs = {
  stdout: string;
  stderr: string;
};

export type LogLevel = "debug" | "info" | "warn" | "error" | "fatal";

/** ball of values made available to command methods. Includes oclif cliOptions */
export type ContextCommand<T extends typeof Command> = {
  /** values coming out of oclif command phase */
  cliOptions: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
    BaseParseOutput;
  serviceFactory: (<SName extends keyof ServiceStaticMap>(
    serviceName: SName,
    options: ServiceInitialiseLiteOptions<SName>
    // options: ServiceInitialiseCommonOptions
  ) => Promise<ServiceMap[SName]>) & { availableServices: (keyof ServiceMap)[] };
  logger: logging.Logger;
  // logger: (msg: string, level?: LogLevel) => void;
  /** @internal */
  oclifConfig: Interfaces.Config;
  /**
   This is the process' absolute path, and is dependent upon cli --workspacePath option or process.cwd()
   Note that this will differ from values in services etc
   */
  workspacePath: AddressPathAbsolute;

  lifecycles: {
    initialiseWorkspace: InitialiseWorkspaceLifecycleBase<any>,
    configureWorkspace: ConfigureWorkspaceLifecycleBase<any>,
    configureProject: ConfigureProjectLifecycleBase<any>,
    synchroniseWorkspace: SynchroniseWorkspaceLifecycleBase<any>,
    runWorkspace: RunWorkspaceLifecycleBase<any>,
    runProject: RunProjectLifecycleBase<any>,
  };
};

/** ball of values made available to "userspace" methods */
export type Context = {
  /** common values coming out of the command phase (i.e. the baseFlags/baseArgs) */
  cliOptions: BaseParseOutput;
  // cliOptions: ParserOutput<BaseFlags, BaseFlags, {}>;
  // services: Services
  serviceFactory: (<SName extends keyof ServiceStaticMap>(
    serviceName: SName,
    options: ServiceInitialiseLiteOptions<SName>
  ) => Promise<ServiceMap[SName]>) & { availableServices: (keyof ServiceMap)[] };
  logger: logging.Logger;
  /** @internal */
  oclifConfig: Interfaces.Config;
  /**
   This is the process' absolute path, and is dependent upon cli --workspacePath option or process.cwd()
   Note that this will differ from values in services etc
   */
  workspacePath: AddressPathAbsolute;
};

export type Plugin = {
  services?: ServiceStaticInterface[];
  /** gives opportunity to subscribe to hooks */
  // initialise?: (options: { context: ContextCommand<any> }) => void;
  lifecycles?: LifecycleStaticInterface[];
};
