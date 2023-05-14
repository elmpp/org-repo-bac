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
  Interfaces,
  Performance,
  ux
} from "@oclif/core";
import { PrettyPrintableError } from "@oclif/core/lib/interfaces";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import ModuleLoader from "@oclif/core/lib/module-loader";
import * as ansiColors from "ansi-colors";
import os from 'os';
import { fileURLToPath } from "url";
import util from 'util';
import { setupLifecycles } from "../lifecycles";
import { BacService } from "../services";
import { SchematicsService } from "../services/schematics-service";
import {
  assertIsOk,
  Context,
  ContextCommand,
  LogLevel,
  Plugin,
  Result,
  ServiceInitialiseOptions,
  Services,
  ServicesStatic
} from "../__types__";

// export type FlagsInfer<T extends typeof Command> = Interfaces.InferredFlags<
//   typeof BaseCommand["baseFlags"] & T["flags"]
// >
export type FlagsInfer<T extends typeof Command> = Interfaces.InferredFlags<
  T["baseFlags"] & T["flags"]
>;
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
    logLevel: Flags.custom<LogLevel>({
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

  // @ts-ignore - set in initialise and used optionally in .log()
  protected logger: logging.Logger;
  protected static oclifConfig: Interfaces.Config;

  // protected flags!: any;
  // protected args!: any;
  protected flags!: FlagsInfer<T>;
  protected args!: ArgsInfer<T>;

  constructor(argv: string[], config: Config) {
    super(argv, config)
    this.id = this.ctor.id
    // try {
    //   this.debug = require('debug')(this.id ? `${this.config.bin}:${this.id}` : this.config.bin)
    // } catch {
    //   this.debug = () => {}
    // }

    /** oclif expects .debug to have debug's util.format api - https://tinyurl.com/2j67ajot */
    this.debug = (...args: any[]) => {
      return this.log(util.format(...args))
    }
  }

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
    // console.log(`this.logger :>> `, this.logger)
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

  // NOTE THAT .DEBUG IS OVERRIDDEN IN THE CONSTRUCTOR, ANNOYINGLY BY OCLIF
  // protected override debug(message = "", ...args: any[]) {
  //   console.log(`message :>> `, message)
  //   return this.log(message, ...args)
  // }
  override log(message = "", ...args: any[]) {
    if (!this.jsonEnabled()) {
      // console.log(`message :>> `, message)
      // console.log(`this.logger :>> `, this.logger, this)
      this.logger?.log(
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

  protected loadPluginExport = async ({
    pluginPath,
    plugin,
    debug,
  }: {
    pluginPath: AddressPathAbsolute;
    plugin: Interfaces.Plugin;
    debug?: boolean;
  }): Promise<Plugin> => {
    try {
      // const p = path.join(plugin.pjson.oclif.commands, ...id.split(':'))
      const { isESM, module, filePath } = await ModuleLoader.loadWithData(
        plugin,
        pluginPath.original
      );
      debug &&
        this.debug(
          isESM
            ? "LoadServicesForPlugin: (import)"
            : "LoadServicesForPlugin: (require)",
          filePath
        );

      // console.log(`plugin.type :>> `, plugin.type)

      if (!module.plugin && plugin.type === 'user' && plugin.name !== '@business-as-code/cli') {
        // this.error(`Plugin package does not have a named export 'plugin'. Package: '${plugin.name}', plugin type: '${plugin.type}', package path: '${pluginPath.original}'`)
        // return {}
      }
      return module?.plugin ?? {};
    } catch (error: any) {
      throw error;
    }
  };

  protected async loadInitialiserForPlugin({
    plugin,
    parseOutput,
  }: {
    plugin: Interfaces.Plugin;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput;
  }): Promise<NonNullable<Plugin["initialise"]>> {
    const marker = Performance.mark(
      `plugin.loadInitialiserForPlugin#${plugin.name}`,
      { plugin: plugin.name }
    );

    const noop = (...args: any[]) => {};
    const initialiseFunc = await this.loadPluginExport({
      pluginPath: addr.parseAsType(plugin.root, "portablePathPosixAbsolute"),
      plugin,
      debug: true,
    }).then((mod) => {
      // console.log(`plugin.loadInitialiserForPlugin#${plugin.name} does not define an initialise function`)
      if (!mod.initialise) {
        this.debug(`plugin.loadInitialiserForPlugin#${plugin.name} does not define an initialise function`)
        return noop
      }
      return mod.initialise

    }
    );

    marker?.stop();
    return initialiseFunc;
  }

  protected async loadServicesForPlugin({
    plugin,
  }: {
    plugin: Interfaces.Plugin;
  }): Promise<Partial<ServicesStatic>> {
    const marker = Performance.mark(
      `plugin.loadServicesForPlugin#${plugin.name}`,
      { plugin: plugin.name }
    );

    const pluginServices = (
      await this.loadPluginExport({
        pluginPath: addr.parseAsType(plugin.root, "portablePathPosixAbsolute"),
        plugin,
        debug: true,
      }).then((pluginMod) =>
        pluginMod.services && Array.isArray(pluginMod.services) ? pluginMod.services : []
      )
    ).reduce(
      (acc, staticService) => ({
        ...acc,
        [staticService.title]: staticService,
      }),
      {} as Partial<ServicesStatic>
    );

    marker?.stop();
    return pluginServices;
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
      if (!staticService) {
        this.error(
          `Attempting initialisation of unknown service '${serviceName}'. Loaded services: '${Object.keys(
            staticServices
          ).join(", ")}'`
        );
      }

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

  async run(): Promise<void> {
    const parseOutput = (await this.parse({
      flags: {
        ...this.ctor.flags,
        ...(this.ctor as typeof BaseCommand).baseFlags,
      },
      // flags: this.ctor.flags,
      // baseFlags: (this.ctor as typeof BaseCommand).baseFlags,
      args: this.ctor.args,
      strict: this.ctor.strict,
    })) as ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput;
    // const parseOutput = (await this.parse<
    //   FlagsInfer<T>,
    //   FlagsInfer<T>,
    //   ArgsInfer<T>
    // >()) as ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
    //   BaseParseOutput;
    // console.log(`parseOutput :>> `, parseOutput)

    await this.initialise({ parseOutput, config: this.config });
    const context = await this.setupContext({ parseOutput });
    await this.initialisePlugins({ context, parseOutput });

    const res = await this.execute(context);

    if (!assertIsOk(res)) {
      const err = res.res.error;
      (err as any).exitCode = err?.extra?.exitCode ?? 1; // make it look like an OclifError
      throw err; // will end up in this.catch()
    }
    return;
  }

  /**
   @internal
   */
  async runDirect(
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput
  ): Promise<Result<unknown, unknown>> {
    await this.initialise({ parseOutput, config: this.config });
    const context = await this.setupContext({ parseOutput });
    await this.initialisePlugins({ context, parseOutput });

    const res = await this.execute(context);
    return res;
  }

  protected async setupContext({
    parseOutput,
  }: {
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput;
  }): Promise<ContextCommand<T>> {
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

    const context = {
      oclifConfig,
      cliOptions: parseOutput,
      logger: this.logger,
      serviceFactory,
      workspacePath: this.getWorkspacePath(parseOutput.flags["workspacePath"]),
    };

    const contextCommand: ContextCommand<T> = {
      ...context,
      lifecycles: setupLifecycles({context}),
    };
    return contextCommand;
  }

  protected async initialisePlugins({
    parseOutput,
    context,
  }: {
    context: ContextCommand<T>;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput;
  }) {
    const oclifConfig = (this.ctor as typeof BaseCommand).oclifConfig;

    // strategy: loop through all registered services and initialise blindly.
    // don't need to worry about multiple subscriptions etc due to tapable
    // being compiled - https://tinyurl.com/2jlzp5vr

    // hookmap - https://tinyurl.com/2mqyusrc
    // inspired by webpack's api - https://webpack.js.org/contribute/writing-a-plugin/
    // const createLifecycles = () => {
    //   return lifecycles;
    // };

    // const hookFactory: HookFactory = ()

    // /** events occurring during bac sync */
    // const workspaceInitHookMap = new HookMap((key: "pre" | "after") => {});

    // const hookMap = new HookMap((key: "workspaceInit" | "workspaceSync") => {
    //   switch (key) {
    //     case "workspaceInit":
    //       break;
    //     case "workspaceSync":
    //       break;
    //     default:
    //       assertUnreachable(key);
    //   }
    // }, "bac");

    // const lifecycles = await createLifecycles()

    await Promise.all(
      oclifConfig.plugins.map(async (plugin) => {
        const pluginInitialiserFunc = await this.loadInitialiserForPlugin({
          parseOutput,
          plugin,
        });
        return pluginInitialiserFunc({ context });
      })
    ).catch(err => {
      throw err
      console.log(`err :>> `, err)
    })

    // (await oclifConfig.plugins.forEach(async (accum, plugin) => {
    //   const acc = await accum;
    //   // const staticPluginServices = await this.loadServicesForPlugin({
    //   //   plugin,
    //   // });
    //   // if (!staticPluginServices) {
    //   //   return acc;
    //   // }

    //   const pluginInitialiserFunc = await this.loadInitialiserForPlugin({
    //     parseOutput,
    //     plugin,
    //   })

    //   return {
    //     ...acc,
    //     ...staticPluginServices,
    //   };
    // }, Promise.resolve(coreServices))) as ServicesStatic;
  }

  abstract execute(
    context: ContextCommand<T>
  ): Promise<Result<unknown, { error: BacError<MessageName, any> }>>;


  /** oclif GH - https://github.com/oclif/core/blob/79c41cafe58a27f22b6f7c88e1126c5fd06cb7bb/src/command.ts#L332 */
  protected override async catch(
    err: Error & { exitCode?: number }
  ): Promise<any> {
    // return super.catch(err); // does not actually log to stderr so define own

    process.exitCode = process.exitCode ?? err.exitCode ?? 1;
    if (this.jsonEnabled()) {
      this.logJson(this.toErrorJson(err));
    } else {
      // if (!err.message) throw err;
      try {
        ux.action.stop(colors.red("!"));
        // Note this should be the only place where caught errors are to be output!!!
      } catch {}

      process.stderr.write(`${os.EOL.repeat(2)}
        ${colors.red(BacError.getMessageForError(err))}
        ${os.EOL.repeat(2)}
      `)
      // console.log(`:>> BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB`, this.jsonEnabled(), BacError.getMessageForError(err));

      throw err; // we DO want to rethrow here after writing to stderr
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
    } catch (error) {
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
