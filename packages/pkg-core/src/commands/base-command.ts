// oclif custom base command docs - https://tinyurl.com/2n3wch65
// advanced BaseCommand Salesforce example - https://tinyurl.com/2lexro75
import { logging } from "@angular-devkit/core";
import { ProcessOutput } from "@angular-devkit/core/node";
import {
  addr,
  AddressPathAbsolute,
  AddressPathRelative,
  assertIsAddressPathRelative,
} from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
import * as oclif from "@oclif/core";
import { PrettyPrintableError } from "@oclif/core/lib/interfaces";
import { ParserOutput } from "@oclif/core/lib/interfaces/parser";
import * as ansiColors from "ansi-colors";
import debugLoggerModule from 'debug';
import { EOL } from "os";
import { filter } from "rxjs/operators";
import { fileURLToPath } from "url";
import * as util from "util";
import {
  assertIsOk,
  assertIsResult,
  Context,
  ContextCommand,
  Logger,
  LogLevel,
  logLevelMatching,
  Plugin,
  Result,
  ServiceInitialiseLiteOptions,
  ServiceMap,
  ServiceStaticMap
} from "../__types__";
import { constants } from "../constants";
import {
  ConfigureWorkspaceLifecycleBase,
  FetchContentLifecycleBase,
  InitialiseWorkspaceLifecycleBase,
  RunProjectLifecycleBase,
  // RunProjectLifecycleBase,
  RunWorkspaceLifecycleBase,
} from "../interfaces";
import { ConfigureProjectLifecycleBase } from "../interfaces/lifecycle/configure-project-lifecycle-base";
import { BacService, CacheService, ExecService, MoonService } from "../services";
import { SchematicsService } from "../services/schematics-service";
import { fsUtils, objectUtils } from "../utils";
import { findUp, loadModule } from "../utils/fs-utils";

// export type FlagsInfer<T extends typeof oclif.Command> = oclif.Interfaces.InferredFlags<
//   typeof BaseCommand["baseFlags"] & T["flags"]
// >
export type FlagsInfer<T extends typeof oclif.Command> =
  oclif.Interfaces.InferredFlags<T["baseFlags"] & T["flags"]>;
// export type FlagsInfer<T extends typeof oclif.Command> = NullishToOptional<oclif.Interfaces.InferredFlags<
//   T["baseFlags"] & T["flags"]
// >>
// export type FlagsInfer<T> = T extends {flags: unknown} ? oclif.Interfaces.InferredFlags<
//   typeof BaseCommand["baseFlags"] & T["flags"]
// > : never;
export type ArgsInfer<T extends typeof oclif.Command> =
  oclif.Interfaces.InferredArgs<T["args"]>;

const colors = ansiColors.create();

export type BaseParseOutput = {
  flags: {
    ["logLevel"]: LogLevel;
    ["json"]: boolean;
    // ["workspacePath"]?: string;
    // ["options"]: Record<string, any>;
  };
};

export abstract class BaseCommand<
  T extends typeof oclif.Command
> extends oclif.Command {
  // add the --json flag
  static override enableJsonFlag = true;

  // define flags that can be inherited by any command that extends BaseCommand
  static override baseFlags = {
    logLevel: oclif.Flags.custom<LogLevel>({
      summary: "Specify level for logging.",
      env: 'BAC_LOG_LEVEL',
      options: ["debug", "error", "fatal", "info", "warn"] satisfies LogLevel[],
      helpGroup: "GLOBAL",
      default: 'info',
      // default: async () => process.env.BAC_LOG_LEVEL ?? 'info',
      // default: "info",
      required: true,
    })(),
    json: oclif.Flags.boolean({
      required: false,
    }),
    // "options": oclif.Flags.custom<Record<string, unknown>>({
    //   summary: "Additional ",
    //   // options: ["debug", "error", "fatal", "info", "warn"] satisfies LogLevel[],
    //   helpGroup: "GLOBAL",
    //   default: {},
    // })(),
  } satisfies { [key in keyof BaseParseOutput["flags"]]: any };

  // @ts-ignore - set in initialise and used optionally in .log()
  protected logger: Logger;
  protected static oclifConfig: oclif.Interfaces.Config;
  /** set during successful run/runDirect */
  private context?: ContextCommand<T>;

  // protected flags!: any;
  // protected args!: any;
  protected flags!: FlagsInfer<T> & { logLevel: LogLevel };
  // protected flags!: FlagsInfer<T>;
  protected args!: ArgsInfer<T>;

  constructor(argv: string[], config: oclif.Config) {
    super(argv, config);
    this.id = this.ctor.id;
    // try {
    //   this.debug = require('debug')(this.id ? `${this.config.bin}:${this.id}` : this.config.bin)
    // } catch {
    //   this.debug = () => {}
    // }

    /** oclif expects .debug to have debug's util.format api - https://tinyurl.com/2j67ajot */
    this.debug = (...args: any[]) => {
      return this.logger?.debug(util.format(...args));
    };
  }

  static override async run<T extends oclif.Command>(
    this: new (argv: string[], config: oclif.Config) => T,
    argv?: string[] | undefined,
    opts?: oclif.Interfaces.LoadOptions
  ): Promise<ReturnType<T["run"]>> {
    if (!argv) argv = process.argv.slice(2);

    // Handle the case when a file URL string is passed in such as 'import.meta.url'; covert to file path.
    if (typeof opts === "string" && opts.startsWith("file://")) {
      opts = fileURLToPath(opts);
    }

    const config = await oclif.Config.load(
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
    const res = await cmd._run<ReturnType<T["run"]>>();
    return res;
  }

  /** Our custom initialise hook. Do not use 'init' which is an oclif base method */
  async initialise(options: {
    config: oclif.Config;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>;
  }) {
    this.logger = this.createLogger(options);
    this.addDebugLogger({ logger: this.logger, ...options })

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
      // oclif.Errors.warn(BacError.fromError(input).toString());
      oclif.Errors.warn(input);
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
    // console.log(`input :>> `, input)

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
  override log(message: any = "", ...args: any[]) {
    if (!this.jsonEnabled()) {
      // console.log(`message :>> `, message)
      // console.log(`this.logger :>> `, this.logger, this)
      this.logger?.log(
        "info",
        message,
        args.reduce((acc, a, k) => ({ ...acc, k: a }), {})
      );
      // message =
      //   typeof message === "string" ? message : (0, util_1.inspect)(message);
      // stream_1.stdout.write((0, util_1.format)(message, ...args) + "\n");
    }
  }
  /** logging that is unaffected by the logLevel */
  logToStdout(message: any = "") {
    if (!this.jsonEnabled()) {
      // console.log(`message :>> `, message)
      // console.log(`this.logger :>> `, this.logger, this)
      this.logger.stdout(
        message
        // args.reduce((acc, a, k) => ({ ...acc, k: a }), {})
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

  /** many libraries rely directly on the debug logger module - https://tinyurl.com/ymvxgb7a */
  protected addDebugLogger(options: {
    logger: Logger, config: oclif.Config;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>;
  }) {
    // debugLoggerModule.log = options.logger.log
    // debugLoggerModule.log = console.log.bind(console)
    debugLoggerModule.log = options.logger.debug.bind(options.logger)
    if (logLevelMatching(options.parseOutput.flags["logLevel"], "debug", options.parseOutput.flags.json)) {
      debugLoggerModule.enable('*') // perhaps be more selective here?
    }
  }

  /**
   standardise on the schematic logger for compatibility. Oclif hides usage behind a .log method so easily transformed
   */
  protected createLogger({
    parseOutput,
  }: {
    config: oclif.Config;
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>;
  }): Logger {
    /**
     * Angular console logger - https://github.com/angular/angular-cli/blob/8095268fa4e06c70f2f11323cff648fc6d4aba7d/packages/angular_devkit/core/node/cli-logger.ts#L19
     */
    function createConsoleLogger(
      // verbose = false,
      // logLevel: LogLevel,
      stdout: ProcessOutput = process.stdout,
      stderr: ProcessOutput = process.stderr,
      masks?: Partial<Record<logging.LogLevel, (s: string) => string>>
    ): Logger {
      const logger = new logging.IndentLogger("cling") as Logger;
      // console.log(`parseOutput.flags["logLevel"], parseOutput.flags["json"] :>> `, parseOutput.flags["logLevel"], parseOutput.flags["json"])
      logger
        .pipe(
          filter((entry) => {
            return logLevelMatching(
              parseOutput.flags["logLevel"],
              entry.level,
              parseOutput.flags["json"]
            );
          })
        )
        .subscribe((entry) => {
          // const color = colors && colors[entry.level];
          const mask = masks && masks[entry.level];
          let output = stdout;

          switch (entry.level) {
            case "warn":
            case "fatal":
            case "error":
              output = stderr;
              break;
          }

          // If we do console.log(message) or process.stdout.write(message + '\n'), the process might
          // stop before the whole message is written and the stream is flushed. This happens when
          // streams are asynchronous.
          //
          // NodeJS IO streams are different depending on platform and usage. In POSIX environment,
          // for example, they're asynchronous when writing to a pipe, but synchronous when writing
          // to a TTY. In windows, it's the other way around. You can verify which is which with
          // stream.isTTY and platform, but this is not good enough.
          // In the async case, one should wait for the callback before sending more data or
          // continuing the process. In our case it would be rather hard to do (but not impossible).
          //
          // Instead we take the easy way out and simply chunk the message and call the write
          // function while the buffer drain itself asynchronously. With a smaller chunk size than
          // the buffer, we are mostly certain that it works. In this case, the chunk has been picked
          // as half a page size (4096/2 = 2048), minus some bytes for the color formatting.
          // On POSIX it seems the buffer is 2 pages (8192), but just to be sure (could be different
          // by platform).
          //
          // For more details, see https://nodejs.org/api/process.html#process_a_note_on_process_i_o
          const chunkSize = 2000; // Small chunk.
          let message = entry.message;
          if (!message.length) return; // we return '' when --json

          // console.log(`message :>> `, message)
          // let written = false
          while (message) {
            const chunk = message.slice(0, chunkSize);
            const masked = mask ? mask(chunk) : chunk;
            message = message.slice(chunkSize);
            output.write(masked);
            // if (masked.length) {
            //   written = true
            // }
          }

          // if (written) {
          output.write("\n");
          // }
        });
      logger.stdout = (s: string) => {
        stdout.write(s + EOL);
      };

      return logger;
    }

    const logger = createConsoleLogger(
      // logLevelMatching("debug", parseOutput.flags["logLevel"], parseOutput.flags["json"]),

      process.stdout,
      process.stderr,
      {
        info: (s: string) => s,
        debug: (s: string) => {
          // console.log(s); // not required
          return s;
        },
        // debug: (s: string) => s,
        warn: (s: string) => colors.bold.yellow(s),
        error: (s: string) => colors.bold.red(s),
        fatal: (s: string) => colors.bold.red(s),
      }
      // objectMapAndFilter(
      //   {
      //     info: (s: string) => s,
      //     debug: (s: string) => {
      //       // console.log(s); // not required
      //       return s;
      //     },
      //     // debug: (s: string) => s,
      //     warn: (s: string) => colors.bold.yellow(s),
      //     error: (s: string) => colors.bold.red(s),
      //     fatal: (s: string) => colors.bold.red(s),
      //   },
      //   (fn, logLevel) =>
      //     logLevelMatching(logLevel, parseOutput.flags["logLevel"], parseOutput.flags['json'])
      //       ? fn
      //       : (s) => ''
      // )
    );
    return logger;
  }

  protected loadPluginExport = async ({
    pluginPath,
    plugin,
    debug,
  }: {
    pluginPath: AddressPathAbsolute;
    plugin: oclif.Interfaces.Plugin;
    debug?: boolean;
  }): Promise<Plugin> => {
    try {
      // const p = path.join(plugin.pjson.oclif.commands, ...id.split(':'))
      // const { isESM, module, filePath } = await ModuleLoader.loadWithData(
      //   plugin,
      //   pluginPath.original
      // );
      // debug &&
      //   this.debug(
      //     isESM
      //       ? "LoadServicesForPlugin: (import)"
      //       : "LoadServicesForPlugin: (require)",
      //     filePath
      //   );

      // console.log(`plugin.type :>> `, plugin.type)

      const { module } = await loadModule(plugin);

      if (
        !module.plugin &&
        plugin.type === "user" &&
        plugin.name !== "@business-as-code/cli"
      ) {
        // this.error(`Plugin package does not have a named export 'plugin'. Package: '${plugin.name}', plugin type: '${plugin.type}', package path: '${pluginPath.original}'`)
        // return {}
      }
      return module?.plugin ?? {};
    } catch (error: any) {
      throw error;
    }
  };

  protected async initialisePlugins({
    context,
  }: {
    context: ContextCommand<T>;
  }) {
    context.logger.debug(
      `plugin.initialisePlugins: '${context.oclifConfig.plugins.length
      }' plugins found. '${context.oclifConfig.plugins
        .map((p) => `${p.name}:${p.root}`)
        .join("\n")}'`
    );
    await Promise.all(
      context.oclifConfig.plugins.map(async (plugin) =>
        this.loadLifecycleImplementationsForPlugin({ plugin, context })
      )
    );
  }

  protected async loadLifecycleImplementationsForPlugin({
    plugin,
    context,
  }: {
    plugin: oclif.Interfaces.Plugin;
    context: ContextCommand<T>;
  }) {
    const marker = oclif.Performance.mark(
      `plugin.loadInitialiserForPlugin#${plugin.name}`,
      { plugin: plugin.name }
    );

    const initialiseFunc = await this.loadPluginExport({
      pluginPath: addr.parseAsType(plugin.root, "portablePathPosixAbsolute"),
      plugin,
      debug: true,
    }).then((mod) => {
      // console.log(`plugin.loadInitialiserForPlugin#${plugin.name} does not define an initialise function`)
      if (!(mod.lifecycles ?? []).length) {
        this.debug(
          `plugin.loadLifecycleImplementationsForPlugin#${plugin.name} does not define any lifecycles`
        );
        return;
      }

      // // load lifecycle into tapable
      // return mod.initialise

      this.debug(
        `plugin.loadLifecycleImplementationsForPlugin#${plugin.name
        } defines lifecycles: '${mod.lifecycles
          ?.map((l) => `${l.lifecycleTitle}: ${l.title}`)
          .join(", ")}'`
      );

      for (const lifecycleImplementation of mod.lifecycles!) {
        lifecycleImplementation.initialise({
          context,
        });
      }
    });

    marker?.stop();
    return initialiseFunc;
  }
  // protected async loadInitialiserForPlugin({
  //   plugin,
  //   parseOutput,
  // }: {
  //   plugin: oclif.Interfaces.Plugin;
  //   parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
  //     BaseParseOutput;
  // }): Promise<NonNullable<Plugin["initialise"]>> {
  //   const marker = oclif.Performance.mark(
  //     `plugin.loadInitialiserForPlugin#${plugin.name}`,
  //     { plugin: plugin.name }
  //   );

  //   const noop = (...args: any[]) => {};
  //   const initialiseFunc = await this.loadPluginExport({
  //     pluginPath: addr.parseAsType(plugin.root, "portablePathPosixAbsolute"),
  //     plugin,
  //     debug: true,
  //   }).then((mod) => {
  //     // console.log(`plugin.loadInitialiserForPlugin#${plugin.name} does not define an initialise function`)
  //     if (!mod.initialise) {
  //       this.debug(`plugin.loadInitialiserForPlugin#${plugin.name} does not define an initialise function`)
  //       return noop
  //     }
  //     return mod.initialise

  //   }
  //   );

  //   marker?.stop();
  //   return initialiseFunc;
  // }

  protected async loadServicesForPlugin({
    plugin,
  }: {
    plugin: oclif.Interfaces.Plugin;
  }): Promise<Partial<ServiceStaticMap>> {
    const marker = oclif.Performance.mark(
      `plugin.loadServicesForPlugin#${plugin.name}`,
      { plugin: plugin.name }
    );

    const pluginServices = (
      await this.loadPluginExport({
        pluginPath: addr.parseAsType(plugin.root, "portablePathPosixAbsolute"),
        plugin,
        debug: true,
      }).then((pluginMod) =>
        pluginMod.services && Array.isArray(pluginMod.services)
          ? pluginMod.services
          : []
      )
    ).reduce(
      (acc, staticService) => ({
        ...acc,
        [staticService.as ?? staticService.title]: [staticService],
      }),
      {}
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
    workspacePath: originalWorkspacePath,
  }: {
    plugins: oclif.Interfaces.Plugin[];
    logger: Context["logger"];
    workspacePath: AddressPathAbsolute;
  }): Promise<Context["serviceFactory"]> {
    const coreServices = {
      bac: [BacService],
      cache: [CacheService],
      exec: [ExecService],
      moon: [MoonService],
      schematics: [SchematicsService],
    };

    const staticServices = (await plugins.reduce(async (accum, plugin) => {
      const acc = await accum;
      const staticPluginServices = await this.loadServicesForPlugin({
        plugin,
      });
      if (!staticPluginServices) {
        return acc;
      }

      // return Object.assign({}, acc, staticPluginServices);
      const res = objectUtils.deepMerge(
        acc,
        staticPluginServices
      );
      return res

      // return {
      //   ...acc,
      //   ...staticPluginServices,
      // };
    }, Promise.resolve(coreServices) as unknown as Promise<ServiceStaticMap>)) as unknown as ServiceStaticMap;

    // console.log(`res :>> `, res)

    const factory = async <SName extends keyof ServiceMap>(
      serviceName: SName,
      initialiseOptionsLite: ServiceInitialiseLiteOptions<SName>
      // initialiseOptions: ServiceOptions<SName>
    ): Promise<ServiceMap[SName][number]> => {
      const staticServiceArr = staticServices[serviceName];
      // console.log(`staticServices :>> `, staticServices)
      // console.log(`staticService, serviceName :>> `, staticService, serviceName)
      if (!staticServiceArr) {
        // console.log(`staticServices :>> `, staticServices);
        this.error(
          `Attempting initialisation of unknown service '${serviceName}'. Loaded services: '${Object.keys(
            staticServices
          ).join(", ")}'`
        );
      }

      function deriveNextWorkspacePath() {
        return initialiseOptionsLite?.workspacePath ?? originalWorkspacePath;
        // return initialiseOptionsLite?.workspacePath ?? originalWorkspacePath;
      }

      const nextContext = {
        ...initialiseOptionsLite.context,
        workspacePath: deriveNextWorkspacePath(),
      };

      const initialiseOptions: Parameters<ServiceStaticMap[SName][number]["initialise"]>[0] = {
        workspacePath: originalWorkspacePath, // we DO allow passing through of workspacePath
        ...initialiseOptionsLite,
        context: nextContext,
      }

      const initialiseService = async (
        // staticService: ValueOf<ServiceStaticMap>[number]
        staticService: ServiceStaticMap[SName][number]
      ) => {
        /**
         * workspacePath should always spring back to the original bootstrapped value if not explicitly given!!
         * This next value should propogate through to all derivative values such as context
         */
        // function deriveNextWorkspacePath() {
        //   return initialiseOptionsLite?.workspacePath ?? originalWorkspacePath;
        //   // return initialiseOptionsLite?.workspacePath ?? originalWorkspacePath;
        // }

        // const nextContext = {
        //   ...initialiseOptionsLite.context,
        //   workspacePath: deriveNextWorkspacePath(),
        // };

        // const initialiseOptions: Parameters<ServiceStaticMap[SName][number]["initialise"]>[0] = {
        //   workspacePath: originalWorkspacePath, // we DO allow passing through of workspacePath
        //   ...initialiseOptionsLite,
        //   context: nextContext,
        // }

        /** bit naughty but we need to infer */
        const serviceIns = (await (staticService as ServiceStaticMap[SName][number]).initialise(
          initialiseOptions
        )) as ServiceMap[SName][number];

        (function validateService() {
          if (!initialiseOptionsLite.workingPath) return;

          const serviceOptions = (serviceIns as any) as Parameters<
            typeof staticService.initialise
          >[0];

          // console.log(
          //   `serviceOptions && serviceOptions.workspacePath.original :>> `,
          //   serviceOptions && serviceOptions?.workspacePath?.original
          // );
          // console.log(
          //   `serviceOptions.context.workspacePath.original :>> `,
          //   serviceOptions?.context?.workspacePath?.original
          // );
          // console.log(`serviceIns.ctor.name :>> `, serviceIns.ctor.name);
          // console.log(
          //   `nextContext.workspacePath, initialiseOptionsLite.workspacePath :>> `,
          //   nextContext.workspacePath,
          //   initialiseOptionsLite.workspacePath
          // );
          // console.log(`serviceOptions :>> `, serviceOptions)

          if (
            serviceOptions?.workspacePath?.original !==
            serviceOptions?.context?.workspacePath.original
          ) {
            throw new Error(
              `Intended new workspacePath parameter option has not been propogated to the context option. Service: '${serviceIns.ctor.name}'. Supplied new workspacePath: '${serviceOptions?.workspacePath.original}' has not been propogated to the instance options.context.workspacePath: '${serviceOptions?.context?.workspacePath.original}'. It was supplied to instance as nextContext.workspacePath: '${nextContext.workspacePath.original}'.
              initialiseOptionsLite.workspacePath: '${initialiseOptionsLite?.workspacePath?.original}'
              `
            );
          }
        })();

        if (!serviceIns) {
          this.debug(
            `loadServiceFactory: service '${staticService.title}' does not instantiate`
          );
          return;
        }
        this.debug(
          `loadServiceFactory: service '${staticService.title}' instantiated`
        );
        return serviceIns;
      };

      // console.log(`staticServiceArr :>> `, staticServiceArr);

      const res = (
        await Promise.all(
          staticServiceArr.map(async (s) => initialiseService(s))
        )
      ).filter(Boolean);

      if (res.length > 1) {
        throw new Error(
          `loadServiceFactory: Multiple services self-reported as initialised`
        );
      }
      if (res.length === 0) {
        console.log(`initialiseOptions :>> `, serviceName, Object.keys(initialiseOptions), Object.keys(initialiseOptionsLite))
        console.error((new Error()))
        throw new BacError(
          MessageName.SERVICE_NOT_FOUND,
          `Service '${serviceName}' not found. Ensure you have installed relevant plugins. Available: '${Object.keys(
            staticServices
          ).join(", ")}'`
        );
      }

      // console.log(`res :>> `, res);

      return res[0]!;
    };
    factory["availableServices"] = Object.keys(
      staticServices
    ) as (keyof ServiceStaticMap)[];
    return factory;
  }

  // static async runDirect<T extends typeof oclif.Command>(
  static async runDirect<T extends typeof oclif.Command>(
    this: new (...args: any[]) => T,
    // this: new (config: Config, parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>) => T,
    // argv?: string[] | undefined,
    opts: oclif.Interfaces.LoadOptions,
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>
  ): Promise<Result<unknown, { error: Error }>> {
    const config = await oclif.Config.load(
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

    // console.log(`parseOutput :>> `, require('util').inspect(parseOutput, {showHidden: false, depth: undefined, colors: true}))

    // @ts-ignore
    const directRes = await cmd.runDirect<ReturnType<T["run"]>>(parseOutput);
    return directRes;
  }

  // /**
  //  catastrophic process error. Replaces - https://github.com/oclif/core/blob/ca88895bcfdca2d1c1ae5eda6e879ae6b1ac4122/src/errors/handle.ts#L10
  //  */
  // static handleError({
  //   err,
  //   exitProcess,
  //   extra,
  // }: {
  //   err: Error & Partial<PrettyPrintableError> & Partial<OclifError>;
  //   exitProcess: boolean;
  //   extra?: {
  //     args: string[];
  //     cwd: string;
  //     logLevel: LogLevel;
  //     packageManager?: ServiceProvidersForAsByMethod<"packageManager">;
  //   };
  // }) {
  //   // console.log(`:>> handling error`, extra, err, exitProcess);

  //   // const logger = process.stderr.write; // reference does not seem to work

  //   try {
  //     // console.log(`err :>> `, err.stack)
  //     // if (!err) err = new Error("no error?");
  //     if (err.message === "SIGINT") process.exit(1);
  //     // console.log(`err.message :>> `, err.message)

  //     // const shouldPrint = !(err instanceof ExitError)
  //     // const pretty = prettyPrint(err)
  //     // const stack = clean(err.stack || '', {pretty: true})
  //     // const stack = err.stack || "";

  //     // if (shouldPrint) {
  //     //   logger(err.stack)
  //     //   // console.error(pretty ? pretty : stack)
  //     // }

  //     // console.log(`err.message :>> `, err.message)
  //     let wrapped = BacError.fromError(err, {messagePrefix: `Failure during command invocation.`})
  //     // process.stderr.write(`:>> BBBBBBBBB`);
  //     // let msg = `Failure during command invocation.`

  //     // console.log(`err.message :>> `, err.message)

  //     // const errWrapped = BacErrorWrapper()

  //     // console.log(`extra :>> `, extra)
  //     if (extra) {
  //       wrapped = BacError.fromError(err, {messagePrefix: `Failure during command invocation. Command: '${extra.args.join(
  //         " "
  //       )}'. Cwd: '${extra.cwd}'. Full command: 'cd ${
  //         extra.cwd
  //       }; ${extra.packageManager ? extra.packageManager.replace('packageManager', '').toLowerCase() : 'bun --bun'} bac-test ${extra.args.join(" ")}'`})
  //       // process.stdout.write(
  //       //   `Failure during command invocation. Command: '${extra.args.join(
  //       //     " "
  //       //   )}'. Cwd: '${extra.cwd}'. Full command: 'cd ${
  //       //     extra.cwd
  //       //   }; ${extra.packageManager ? extra.packageManager.replace('packageManager', '').toLowerCase() : 'bun --bun'} bac-test ${extra.args.join(" ")}'` + EOL
  //       // );
  //     }

  //     // const wrappedErr = new BacErrorWrapper(MessageName.UNNAMED, msg, err)
  //     const exitCode =
  //       err.oclif?.exit !== undefined && err.oclif?.exit !== false
  //         ? err.oclif?.exit
  //         : 1;


  //     if (process.stderr.write && err.code !== "EEXIT") {


  //       // console.log(`err :>> `, err.stack) // you're probably still waiting for this to be fixed - https://github.com/oven-sh/bun/issues/3311
  //       process.stderr.write(wrapped.stack ?? wrapped.message + EOL)
  //       // console.error(wrapped.stack)

  //       // config.errorLogger.flush()
  //       try {
  //         return exitProcess && process.exit(exitCode);
  //       } catch (err2) {
  //         process.stderr.write(err2 as any);
  //       }
  //     } else {
  //       exitProcess && process.exit(exitCode);
  //     }
  //   } catch (error: any) {
  //     // logger(err.stack)
  //     // logger(error.stack)
  //     exitProcess && process.exit(1);
  //   }
  // }

  protected override async _run<T>(): Promise<T> {
    let err: Error | undefined;
    let result;
    try {
      // remove redirected env var to allow subsessions to run autoupdated client
      delete process.env[this.config.scopedEnvVarKey("REDIRECTED")];
      await this.init();
      result = await this.run();
    } catch (error: any) {
      err = error;
      await this.catch(error);
    } finally {
      await this.finally(err);
    }

    // // we want to adjust the original outputting logic - https://github.com/oclif/core/blob/79c41cafe58a27f22b6f7c88e1126c5fd06cb7bb/src/command.ts#L226
    // if (result) {
    //   if (
    //     !this.jsonEnabled() &&
    //     !logLevelMatching(
    //       "error",
    //       this.context!.cliOptions.flags.logLevel,
    //       this.context!.cliOptions.flags.json
    //     )
    //   ) {
    //     throw new BacError(
    //       MessageName.COMMAND_DANGEROUS_RETURN,
    //       `Command '${
    //         this.ctor.name
    //       }' has returned a value but the current output settings do not guarantee clean outputting. --json: '${!!this.jsonEnabled()}', logLevel: '${
    //         this.context!.cliOptions.flags.logLevel
    //       }'.\n Run again with either --json or --logLevel=error.\n Also ensure you have no console.*() usage`
    //     );
    //   }

    //   this.logJson(this.toSuccessJson(result));

    //   // if (this.jsonEnabled()) {
    //   //   this.logJson(this.toSuccessJson(result))
    //   // }
    //   // else if (typeof result === 'string') {
    //   //   this.logger.info(result)
    //   // }
    //   // else {
    //   //   console.log(`result :>> `, result)
    //   //   throw new BacError(MessageName.COMMAND_INVALID_RETURN, `Invalid return from execute method. Command: '${this.ctor.name}'. Should be a string/json value only`)
    //   // }
    // }

    return result as T;
  }

  protected override logJson(json: unknown): void {
    if (
      !this.jsonEnabled() &&
      !logLevelMatching(
        "error",
        this.context!.cliOptions.flags.logLevel,
        this.context!.cliOptions.flags.json
      )
    ) {
      throw new BacError(
        MessageName.COMMAND_DANGEROUS_JSON,
        `Command '${this.ctor.name
        }' has called logJson but current output settings do not guarantee clean outputting. --json: '${!!this.jsonEnabled()}', logLevel: '${this.context!.cliOptions.flags.logLevel
        }'.\n Run again with either --json or --logLevel=error.\n Also ensure you have no console.*() usage`
      );
    }

    oclif.ux.styledJSON(json);
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
    const context = (this.context = await this.createContext({ parseOutput }));
    await this.initialisePlugins({ context });

    const res = await this.execute(context);

    assertIsResult(res)
    // if (!res.success) {
    if (!assertIsOk(res)) {
      console.log(`failing res during command execution: '${this.ctor.name}' :>> `, require('util').inspect(res, { showHidden: false, depth: undefined, colors: true }))

      const err = res.res.error;
      (err as any).exitCode = err?.extra?.exitCode ?? 1; // make it look like an OclifError
      throw err; // will end up in this.catch()
    }

    // return res.res; // return ok payload to support Oclif's --json support - https://tinyurl.com/2bt2z7x7 (see this._run)
  }

  /**
   @internal
   */
  async runDirect(
    parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
      BaseParseOutput
  ): Promise<Result<unknown, any>> {
    await this.initialise({ parseOutput, config: this.config });
    const context = (this.context = await this.createContext({ parseOutput }));
    await this.initialisePlugins({ context });
    const res = await this.execute(context);
    return res;
  }

  protected async createContext({
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

    const workspacePath = await this.getWorkspacePath(
      parseOutput.flags["workspacePath"]
    );

    const serviceFactory = await this.loadServiceFactory({
      plugins: oclifConfig.plugins,
      logger: this.logger,
      workspacePath,
    });

    const contextCommand: ContextCommand<T> = {
      oclifConfig,
      cliOptions: parseOutput,
      logger: this.logger,
      serviceFactory,
      workspacePath,
      toJSON: () => "__complex__",
      // lifecycles: setupLifecycles({context}),
      lifecycles: {
        initialiseWorkspace: new InitialiseWorkspaceLifecycleBase<any>(),
        configureWorkspace: new ConfigureWorkspaceLifecycleBase<any>(),
        configureProject: new ConfigureProjectLifecycleBase<any>(),
        fetchContent: new FetchContentLifecycleBase<any>(),
        runProject: new RunProjectLifecycleBase<any>(),
        runWorkspace: new RunWorkspaceLifecycleBase<any>(),
        // synchroniseWorkspace: new SynchroniseWorkspaceLifecycleBase<any>(),
      },
      detectedPackageManager: await fsUtils.detectPackageManager({ workspacePath: workspacePath }),
    };
    return contextCommand;
  }

  // protected async initialisePlugins({
  //   parseOutput,
  //   context,
  // }: {
  //   context: ContextCommand<T>;
  //   parseOutput: ParserOutput<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>> &
  //     BaseParseOutput;
  // }) {
  //   const oclifConfig = (this.ctor as typeof BaseCommand).oclifConfig;

  //   // strategy: loop through all registered services and initialise blindly.
  //   // don't need to worry about multiple subscriptions etc due to tapable
  //   // being compiled - https://tinyurl.com/2jlzp5vr

  //   // hookmap - https://tinyurl.com/2mqyusrc
  //   // inspired by webpack's api - https://webpack.js.org/contribute/writing-a-plugin/
  //   // const createLifecycles = () => {
  //   //   return lifecycles;
  //   // };

  //   // await Promise.all(
  //   //   oclifConfig.plugins.map(async (plugin) => {
  //   //     const pluginInitialiserFunc = await this.loadInitialiserForPlugin({
  //   //       parseOutput,
  //   //       plugin,
  //   //     });
  //   //     return pluginInitialiserFunc({ context });
  //   //   }).concat(Object.values(coreHooks).map(async coreHook => {
  //   //     return coreHook({ context });
  //   //   }))
  //   // ).catch(err => {
  //   //   throw err
  //   //   console.log(`err :>> `, err)
  //   // })
  //   // await Promise.all(
  //   //   oclifConfig.plugins.map(async (plugin) => {
  //   //     const pluginInitialiserFunc = await this.loadInitialiserForPlugin({
  //   //       parseOutput,
  //   //       plugin,
  //   //     });
  //   //     return pluginInitialiserFunc({ context });
  //   //   }).concat(Object.values(coreHooks).map(async coreHook => {
  //   //     return coreHook({ context });
  //   //   }))
  //   // ).catch(err => {
  //   //   throw err
  //   //   console.log(`err :>> `, err)
  //   // })

  //   // (await oclifConfig.plugins.forEach(async (accum, plugin) => {
  //   //   const acc = await accum;
  //   //   // const staticPluginServices = await this.loadServicesForPlugin({
  //   //   //   plugin,
  //   //   // });
  //   //   // if (!staticPluginServices) {
  //   //   //   return acc;
  //   //   // }

  //   //   const pluginInitialiserFunc = await this.loadInitialiserForPlugin({
  //   //     parseOutput,
  //   //     plugin,
  //   //   })

  //   //   return {
  //   //     ...acc,
  //   //     ...staticPluginServices,
  //   //   };
  //   // }, Promise.resolve(coreServices))) as ServicesStatic;
  // }

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
        oclif.ux.action.stop(colors.red("!"));
        // Note this should be the only place where caught errors are to be output!!!
      } catch { }
      // return
      // throw err

      // WE DO NOT WANT TO OUTPUT HERE - THIS IS DONE ONLY IN BASECOMMAND.HANDLEERROR()

      // process.stderr.write(`${os.EOL.repeat(2)}
      //   ${colors.red(BacError.getMessageForError(err))}
      //   ${os.EOL.repeat(2)}
      // `);

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
  protected override async finally(err: Error | undefined): Promise<any> {
    // if (err) {
    //   BaseCommand.handleError({err, exitProcess: false})
    // }

    try {
      const config = oclif.Errors.config;
      if (config.errorLogger) {
        await config.errorLogger.flush();
      }
    } catch (error) {
      // console.error(error);
    }
  }

  protected async getWorkspacePath(
    pathRelOrAbsoluteNative?: string
  ): Promise<AddressPathAbsolute> {
    if (!pathRelOrAbsoluteNative) {
      // when not supplied we derive it from the current install
      const workspacePathByDotfile = await findUp(
        addr.parsePath(__dirname) as AddressPathAbsolute,
        constants.RC_FILENAME
      );

      if (workspacePathByDotfile) {
        return workspacePathByDotfile;
      }

      throw new BacError(
        MessageName.WORKSPACE_CWD_UNRESOLVABLE,
        `The workspace path cannot be resolved. Perhaps you're missing '--workspacePath' option?.`
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
  }
}

// /**
//    catastrophic process error. Replaces - https://github.com/oclif/core/blob/ca88895bcfdca2d1c1ae5eda6e879ae6b1ac4122/src/errors/handle.ts#L10
//    */
// export function handleCommandError({
//     err,
//     exitProcess,
//     extra,
//   }: {
//     err: Error & Partial<PrettyPrintableError> & Partial<OclifError>;
//     exitProcess: boolean;
//     extra?: {
//       args: string[];
//       cwd: string;
//       logLevel: LogLevel;
//       packageManager?: ServiceProvidersForAsByMethod<"packageManager">;
//     };
//   }) {
//     // console.log(`:>> handling error`, extra, err, exitProcess);

//     // const logger = process.stderr.write; // reference does not seem to work

//     try {
//       // console.log(`err :>> `, err.stack)
//       // if (!err) err = new Error("no error?");
//       if (err.message === "SIGINT") process.exit(1);
//       // console.log(`err.message :>> `, err.message)

//       // const shouldPrint = !(err instanceof ExitError)
//       // const pretty = prettyPrint(err)
//       // const stack = clean(err.stack || '', {pretty: true})
//       // const stack = err.stack || "";

//       // if (shouldPrint) {
//       //   logger(err.stack)
//       //   // console.error(pretty ? pretty : stack)
//       // }

//       // console.log(`err.message :>> `, err.message)
//       let wrapped = BacError.fromError(err, {messagePrefix: `Failure during command invocation.`})
//       // process.stderr.write(`:>> BBBBBBBBB`);
//       // let msg = `Failure during command invocation.`

//       // console.log(`err.message :>> `, err.message)

//       // const errWrapped = BacErrorWrapper()

//       // console.log(`extra :>> `, extra)
//       if (extra) {
//         wrapped = BacError.fromError(err, {messagePrefix: `Failure during command invocation. Command: '${extra.args.join(
//           " "
//         )}'. Cwd: '${extra.cwd}'. Full command: 'cd ${
//           extra.cwd
//         }; ${extra.packageManager ? extra.packageManager.replace('packageManager', '').toLowerCase() : 'bun --bun'} bac-test ${extra.args.join(" ")}'`})
//         // process.stdout.write(
//         //   `Failure during command invocation. Command: '${extra.args.join(
//         //     " "
//         //   )}'. Cwd: '${extra.cwd}'. Full command: 'cd ${
//         //     extra.cwd
//         //   }; ${extra.packageManager ? extra.packageManager.replace('packageManager', '').toLowerCase() : 'bun --bun'} bac-test ${extra.args.join(" ")}'` + EOL
//         // );
//       }

//       // const wrappedErr = new BacErrorWrapper(MessageName.UNNAMED, msg, err)
//       const exitCode =
//         err.oclif?.exit !== undefined && err.oclif?.exit !== false
//           ? err.oclif?.exit
//           : 1;


//       if (process.stderr.write && err.code !== "EEXIT") {


//         // console.log(`err :>> `, err.stack) // you're probably still waiting for this to be fixed - https://github.com/oven-sh/bun/issues/3311
//         process.stderr.write(wrapped.stack ?? wrapped.message + EOL)
//         // console.error(wrapped.stack)

//         // config.errorLogger.flush()
//         try {
//           return exitProcess && process.exit(exitCode);
//         } catch (err2) {
//           process.stderr.write(err2 as any);
//         }
//       } else {
//         exitProcess && process.exit(exitCode);
//       }
//     } catch (error: any) {
//       // logger(err.stack)
//       // logger(error.stack)
//       exitProcess && process.exit(1);
//     }
//   }

