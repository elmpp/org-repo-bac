// oclif custom base command docs - https://tinyurl.com/2n3wch65
// advanced BaseCommand Salesforce example - https://tinyurl.com/2lexro75
import { logging } from "@angular-devkit/core";
import { createConsoleLogger } from "@angular-devkit/core/node";
import {
  addr,
  AddressPathAbsolute,
  AddressPathRelative,
  assertIsAddressPathRelative
} from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
import {
  Command,
  Config,
  Errors,
  Flags,
  Interfaces, Performance,
  ux
} from "@oclif/core";
import { PrettyPrintableError } from "@oclif/core/lib/interfaces";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import ModuleLoader from "@oclif/core/lib/module-loader";
import * as ansiColors from "ansi-colors";
import { fileURLToPath } from "url";
import { BacService } from "../services";
import { SchematicsService } from "../services/schematics-service";
import {
  assertIsOk,
  Context,
  ContextCommand,
  LogLevel,
  Result,
  ServiceInitialiseOptions,
  Services,
  ServicesStatic,
  ValueOf
} from "../__types__";

// export type FlagsInfer<T extends typeof Command> = Interfaces.InferredFlags<
//   typeof BaseCommand["baseFlags"] & T["flags"]
// >
export type FlagsInfer<T extends typeof Command> = Interfaces.InferredFlags<
  T["baseFlags"] & T["flags"]
>
// export type FlagsInfer<T extends typeof Command> = NullishToOptional<Interfaces.InferredFlags<
//   T["baseFlags"] & T["flags"]
// >>
// export type FlagsInfer<T> = T extends {flags: unknown} ? Interfaces.InferredFlags<
//   typeof BaseCommand["baseFlags"] & T["flags"]
// > : never;
export type ArgsInfer<T extends typeof Command> = Interfaces.InferredArgs<
  T["args"]
>;

const colors = ansiColors.create();

export type BaseParseOutput = {
  flags: {
    ["logLevel"]: LogLevel;
    // ["options"]: Record<string, any>;
  };
};

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // add the --json flag
  static override enableJsonFlag = true;

  // define flags that can be inherited by any command that extends BaseCommand
  static override baseFlags = {
    "logLevel": Flags.custom<LogLevel>({
      summary: "Specify level for logging.",
      options: ["debug", "error", "fatal", "info", "warn"] satisfies LogLevel[],
      helpGroup: "GLOBAL",
      default: "info",
      required: true,
    })(),
    // "options": Flags.custom<Record<string, unknown>>({
    //   summary: "Additional ",
    //   // options: ["debug", "error", "fatal", "info", "warn"] satisfies LogLevel[],
    //   helpGroup: "GLOBAL",
    //   default: {},
    // })(),
  } satisfies { [key in keyof BaseParseOutput["flags"]]: any };

  // @ts-ignore: not set in constructor
  protected logger: logging.Logger;
  protected static oclifConfig: Interfaces.Config;

  // protected flags!: any;
  // protected args!: any;
  protected flags!: FlagsInfer<T>;
  protected args!: ArgsInfer<T>;

  static override async run<T extends Command>(
    this: new (argv: string[], config: Config) => T,
    argv?: string[] | undefined,
    opts?: Interfaces.LoadOptions
  ): Promise<ReturnType<T["run"]>> {
    if (!argv) argv = process.argv.slice(2);

    // Handle the case when a file URL string is passed in such as 'import.meta.url'; covert to file path.
    if (typeof opts === "string" && opts.startsWith("file://")) {
      opts = fileURLToPath(opts);
    }

    const config = await Config.load(
      opts || require.main?.filename || __dirname
    );
    const cmd = new this(argv, config);
    if (!cmd.id) {
      const id = cmd.constructor.name.toLowerCase();
      cmd.id = id;
      // @ts-ignore
      cmd.ctor.id = id;
    }
    // @ts-ignore
    cmd.ctor.oclifConfig = opts;

    // await (cmd as T & { initialise: () => Promise<void> }).initialise();

    // @ts-ignore
    return cmd._run<ReturnType<T["run"]>>();
  }

  /** Our custom initialise hook. Do not use 'init' which is an oclif base method */
  async initialise(options: {
    config: Config;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>;
  }) {
    this.logger = this.createLogger(options);
  }

  // public override async init(): Promise<void> {
  //   await super.init()
  //   const {args, flags} = await this.parse({
  //     flags: this.ctor.flags,
  //     baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
  //     args: this.ctor.args,
  //     strict: this.ctor.strict,
  //   })
  //   console.log(`args, flags :>> `, args, flags)
  //   this.flags = flags as FlagsInfer<T>
  //   this.args = args as ArgsInfer<T>
  // }

  override warn(input: string | Error) {
    if (!this.jsonEnabled()) {
      this.logger.warn(BacError.fromError(input).toString());
      Errors.warn(input);
    }
    return input;
  }
  override error(
    input: string | Error,
    options: {
      code?: string;
      exit: false;
    } & PrettyPrintableError
  ): void;
  override error(
    input: string | Error,
    options?: {
      code?: string;
      exit?: number;
    } & PrettyPrintableError
  ): never;
  override error(
    input: string | Error,
    options: {
      code?: string;
      exit?: number | false;
    } & PrettyPrintableError = {}
  ) {
    this.logger.error(BacError.fromError(input).toString());
    /** Oclif GH - https://github.com/oclif/core/blob/79c41cafe58a27f22b6f7c88e1126c5fd06cb7bb/src/command.ts#L245 */
    return super.error(input, options as any);
    // return Errors.error(input, options as any);
  }
  //   override error(input: string | Error, options: {
  //     code?: string;
  //     exit: false;
  // } & PrettyPrintableError): void
  //   override error(input: string | Error, options?: {
  //     code?: string;
  //     exit?: number;
  // } & PrettyPrintableError) {
  //       return Errors.error(input, options) as any;
  //   }
  override log(message = "", ...args: any[]) {
    if (!this.jsonEnabled()) {
      this.logger.log(
        "debug",
        message,
        args.reduce((acc, a, k) => ({ ...acc, k: a }), {})
      );
      // message =
      //   typeof message === "string" ? message : (0, util_1.inspect)(message);
      // stream_1.stdout.write((0, util_1.format)(message, ...args) + "\n");
    }
  }
  override logToStderr(message = "", ...args: any[]) {
    if (!this.jsonEnabled()) {
      this.logger.log(
        "error",
        message,
        args.reduce((acc, a, k) => ({ ...acc, k: a }), {})
      );
      // message =
      //   typeof message === "string" ? message : (0, util_1.inspect)(message);
      // stream_1.stderr.write((0, util_1.format)(message, ...args) + "\n");
    }
  }

  /**
   standardise on the schematic logger for compatibility. Oclif hides usage behind a .log method so easily transformed
   */
  protected createLogger({
    parseOutput,
  }: {
    config: Config;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>;
  }): logging.Logger {
    const logger = createConsoleLogger(
      parseOutput.flags["logLevel"] === "debug",
      process.stdout,
      process.stderr,
      {
        info: (s) => s,
        debug: (s) => {
          // console.log(s); // not required
          return s;
        },
        // debug: (s) => s,
        warn: (s) => colors.bold.yellow(s),
        error: (s) => colors.bold.red(s),
        fatal: (s) => colors.bold.red(s),
      }
    );
    return logger;
  }

  async loadServicesForPlugin({
    plugin,
  }: {
    plugin: Interfaces.Plugin;
  }): Promise<Partial<ServicesStatic>> {
    const marker = Performance.mark(
      `plugin.loadServicesForPlugin#${plugin.name}`,
      { plugin: plugin.name }
    );

    const findExportFromModule = (packageModule: any) => {
      if (packageModule.services && Array.isArray(packageModule.services))
        return packageModule.services;
    };

    const loadPlugin = async (
      packagePath: AddressPathAbsolute
    ): Promise<ValueOf<ServicesStatic>[]> => {
      let m;
      try {
        // const p = path.join(plugin.pjson.oclif.commands, ...id.split(':'))
        const { isESM, module, filePath } = await ModuleLoader.loadWithData(
          plugin,
          packagePath.original
        );
        this.debug(
          isESM
            ? "LoadServicesForPlugin: (import)"
            : "LoadServicesForPlugin: (require)",
          filePath
        );
        m = module;
      } catch (error: any) {
        throw error;
      }

      const services = findExportFromModule(m);
      if (!services) return [];
      return services;
    };

    const services = (
      await loadPlugin(
        addr.parseAsType(plugin.root, "portablePathPosixAbsolute")
      )
    ).reduce(
      (acc, staticService) => ({
        ...acc,
        [staticService.title]: staticService,
      }),
      {} as Partial<ServicesStatic>
    );

    marker?.stop();
    return services;
  }

  // protected override async parse<F extends FlagOutput, B extends FlagOutput, A extends ArgOutput>(options?: Input<F, B, A>, argv = this.argv): Promise<ParserOutput<F, B, A>> {
  //   if (!options) options = this.ctor as Input<F, B, A>
  //   const opts = {context: this, ...options}
  //   // the spread operator doesn't work with getters so we have to manually add it here
  //   opts.flags = options?.flags
  //   opts.args = options?.args
  //   const results = await Parser.parse<F, B, A>(argv, opts)
  //   this.warnIfFlagDeprecated(results.flags ?? {})

  //   return results
  // }

  protected async loadServiceFactory({
    plugins,
  }: {
    plugins: Interfaces.Plugin[];
    logger: Context["logger"];
  }): Promise<Context["serviceFactory"]> {
    const coreServices = {
      schematics: SchematicsService,
      bac: BacService,
    };

    const staticServices = (await plugins.reduce(async (accum, plugin) => {
      const acc = await accum;
      const staticPluginServices = await this.loadServicesForPlugin({
        plugin,
      });
      if (!staticPluginServices) {
        return acc;
      }

      return {
        ...acc,
        ...staticPluginServices,
      };
    }, Promise.resolve(coreServices))) as ServicesStatic;

    // console.log(`res :>> `, res)

    const factory = async <SName extends keyof Services>(
      serviceName: SName,
      initialiseOptions: ServiceInitialiseOptions<SName>
      // initialiseOptions: ServiceOptions<SName>
    ): Promise<Services[SName]> => {
      const staticService = staticServices[serviceName];
      // console.log(`staticServices :>> `, staticServices)
      // console.log(`staticService, serviceName :>> `, staticService, serviceName)
      const serviceIns = (await staticService.initialise(
        initialiseOptions as any // more weird static class stuff
      )) as Services[SName];

      if (!serviceIns) {
        this.debug(
          `loadServiceFactory: service '${staticService.title}' does not instantiate`
        );
        throw new BacError(
          MessageName.SERVICE_NOT_FOUND,
          `Service '${serviceName}' not found. Ensure you have installed relevant plugins`
        );
      }
      this.debug(
        `loadServiceFactory: service '${staticService.title}' instantiated`
      );
      return serviceIns;
    };
    factory["availableServices"] = Object.keys(
      staticServices
    ) as (keyof ServicesStatic)[];
    return factory;
  }

  async run(): Promise<void> {

    const parseOutput = await this.parse({
      flags: {
        ...this.ctor.flags,
        ...(this.ctor as typeof BaseCommand).baseFlags,
      },
      // flags: this.ctor.flags,
      // baseFlags: (this.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    }) as ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput;
    // const parseOutput = (await this.parse<
    //   FlagsInfer<T>,
    //   FlagsInfer<T>,
    //   ArgsInfer<T>
    // >()) as ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
    //   BaseParseOutput;
      // console.log(`parseOutput :>> `, parseOutput)

    await this.initialise({ parseOutput, config: this.config });
    const context = await this.createContext(parseOutput);

    const res = await this.execute(context);

    if (!assertIsOk(res)) {
      const err = res.res.error;
      ;(err as any).exitCode = err?.extra?.exitCode ?? 1 // make it look like an OclifError
      throw err; // will end up in this.catch()
    }
    return;
  }

  // static async runDirect<T extends typeof Command>(
  static async runDirect<T extends typeof Command>(
    this: new (...args: any[]) => T,
    // this: new (config: Config, parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>) => T,
    // argv?: string[] | undefined,
    opts: Interfaces.LoadOptions,
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>
  ): Promise<Result<unknown, { error: Error }>> {
    const config = await Config.load(
      opts || require.main?.filename || __dirname
    );
    const cmd = new this([] as any[], config);
    if (!cmd.id) {
      const id = cmd.constructor.name.toLowerCase();
      cmd.id = id;
      // @ts-ignore
      cmd.ctor.id = id;
    }
    // @ts-ignore
    cmd.ctor.oclifConfig = config;

    // await (cmd as T & { initialise: () => Promise<void> }).initialise();

    // @ts-ignore
    const directRes = await cmd.runDirect<ReturnType<T["run"]>>(parseOutput);
    return directRes;
  }

  /**
   @internal
   */
  async runDirect(
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput
  ): Promise<Result<unknown, unknown>> {
    await this.initialise({ parseOutput, config: this.config });
    const context = await this.createContext(parseOutput);
    const res = await this.execute(context);
    return res;
  }

  protected async createContext(
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput
  ): Promise<ContextCommand<T>> {
    // type ServiceMap = Bac.Services
    const oclifConfig = (this.ctor as typeof BaseCommand).oclifConfig;

    // const logger: Context["logger"] = (
    //   msg: string,
    //   level: LogLevel = "info"
    // ) => {
    //   if (level === "debug") {
    //     return this.debug(msg);
    //   }
    //   this.log(msg);
    // };

    const serviceFactory = await this.loadServiceFactory({
      plugins: oclifConfig.plugins,
      logger: this.logger,
    });

    const context: ContextCommand<T> = {
      oclifConfig,
      cliOptions: parseOutput,
      logger: this.logger,
      serviceFactory,
      workspacePath: this.getWorkspacePath(parseOutput.flags["workspacePath"]),
    };
    return context;
  }

  abstract execute(
    context: ContextCommand<T>
  ): Promise<Result<unknown, { error: BacError<MessageName, any> }>>;

  protected override async catch(
    err: Error & { exitCode?: number }
  ): Promise<any> {
    return super.catch(err);

    process.exitCode = process.exitCode ?? err.exitCode ?? 1
    if (this.jsonEnabled()) {
      this.logJson(this.toErrorJson(err))
    } else {
      if (!err.message) throw err
      try {
        ux.action.stop(colors.red('!'))
      } catch {}

      throw err
    }



    // /** super.catch doesn't seem to log errors outside of json so handle this specifically */
    // if (!this.jsonEnabled()) {
    //   // console.error(err);
    // }


    // // add any custom logic to handle errors from the command
    // // or simply return the parent class error handling
    // return err; // parent class error handler actually strips properties
    // // return super.catch(err);
  }

  // called after run and catch regardless of whether or not the command errored
  protected override async finally(_: Error | undefined): Promise<any> {
    try {
      const config = Errors.config;
      if (config.errorLogger) {
        await config.errorLogger.flush();
      }
    }
    catch (error) {
        // console.error(error);
    }
  }

  protected getWorkspacePath = (
    pathRelOrAbsoluteNative?: string
  ): AddressPathAbsolute => {
    if (!pathRelOrAbsoluteNative) {
      throw new BacError(
        MessageName.WORKSPACE_CWD_UNRESOLVABLE,
        `The workspace path cannot be resolved. Perhaps you're missing '--workspacePath' option?`
      );
    }
    let pathAddress: AddressPathAbsolute | AddressPathRelative = addr.parsePath(
      // pathRelOrAbsoluteNative ?? process.cwd() // do not fall back to cwd() yet - should be explicit until we can detect existing project
      pathRelOrAbsoluteNative
    );
    if (assertIsAddressPathRelative(pathAddress)) {
      pathAddress = addr.pathUtils.resolve(
        addr.parsePath(process.cwd()),
        pathAddress
      ) as AddressPathAbsolute;
    }

    return pathAddress;
  };
}
