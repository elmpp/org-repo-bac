// oclif custom base command docs - https://tinyurl.com/2n3wch65
// advanced BaseCommand Salesforce example - https://tinyurl.com/2lexro75
import { addr, AddressPathAbsolute, AddressPathRelative, assertIsAddressPathRelative } from "@business-as-code/address";
import { Command, Config, Flags, Interfaces, Performance } from "@oclif/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import ModuleLoader from "@oclif/core/lib/module-loader";
import { fileURLToPath } from "url";
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
import path from 'path'
// import {Interfaces, Command} from '@oclif/core'

// type ServiceMap = Global['Bac'].Services
// type ServiceMap2 = keyof Bac.Services

// enum LogLevel {
//   debug = 'debug',
//   info = 'info',
//   warn = 'warn',
//   error = 'error',
// }

// declare module "@oclif/core/lib/interfaces/pjson" {
//     interface PJSON {
//       oclif: {
//         services?: string;
//       }
//     }
// }
// declare module "@oclif/core/lib/interfaces/plugin" {
//   interface Plugin {
//       oclif: {
//         services?: string;
//     }
//   }
// }

// type PJSON = Interfaces.Plugin['oclif']['']

// export interface Interfaces['PJSON'] {
//   [k: string]: any;
//   dependencies?: {
//       [name: string]: string;
//   };
//   devDependencies?: {
//       [name: string]: string;
//   };
//   oclif: {
//       schema?: number;
//   };
// }

export type FlagsInfer<T extends typeof Command> = Interfaces.InferredFlags<
  typeof BaseCommand["baseFlags"] & T["flags"]
>;
export type ArgsInfer<T extends typeof Command> = Interfaces.InferredArgs<T["args"]>;

// type CommandOptions<T extends typeof Command> = {
//   // flags: Flags<T>
//   // args: Flags<T>
//   parseOutput: ParserOutput;
// };

// // Type-fest - https://tinyurl.com/ybucjwqz
// export type Simplify<T> = {[KeyType in keyof T]: T[KeyType]}
// type ValueOf<T> = T[keyof T]
// export type IsEmptyObject<T extends object> = keyof T extends '' ? true : false
// /** more elegant way of excluding - https://tinyurl.com/yhzkmmxp */
// export type ExcludeMatchingProperties<T, V> = Pick<T, {[K in keyof T]-?: T[K] extends V ? never : K}[keyof T]>
// export type ExcludeEmptyProperties<T> = Pick<T, {[K in keyof T]-?: T[K] extends Object ? keyof T[K] extends '' ? never : K : never}[keyof T]>
// export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
//         ? I
//         : never

// type Services = BacServices
// type Bac2 = Simplify<Bac.Services>
// type Services = UnionToIntersection<ValueOf<ExcludeEmptyProperties<{
//   [Descriptor in keyof Bac]: {
//     [ServiceName in keyof Bac[Descriptor]['services'] as IsEmptyObject<Bac[Descriptor]['services']> extends true ? never : ServiceName]: Bac[Descriptor]['services'][ServiceName]
//   }
// }>>>
// type PluginDescriptors = Simplify<keyof Bac>

export abstract class BaseCommand<T extends typeof Command> extends Command {
  // add the --json flag
  static override enableJsonFlag = true;

  // define flags that can be inherited by any command that extends BaseCommand
  static override baseFlags = {
    "log-level": Flags.custom<LogLevel>({
      summary: "Specify level for logging.",
      options: ["debug", "error", "fatal", "info", "warn"] satisfies LogLevel[],
      helpGroup: "GLOBAL",
    })(),
  };

  protected static oclifConfig: Interfaces.Config;

  protected flags!: FlagsInfer<T>;
  protected args!: ArgsInfer<T>;

  // public override async init(): Promise<void> {
  //   await super.init()
  //   const parseOutput = await this.parse({
  //   // const {args, flags, nonExistentFlags} = await this.parse({
  //     flags: this.ctor.flags,
  //     baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
  //     args: this.ctor.args,
  //     strict: this.ctor.strict,
  //   })
  //   this.flags = parseOutput.flags as Flags<T>
  //   this.args = parseOutput.args as Args<T>
  //   // this.flags = flags as Flags<T>
  //   // this.args = args as Args<T>
  // }

  // static override run<T extends Command>(this: new (argv: string[], config: Config) => T, argv?: string[] | undefined, opts?: Interfaces.LoadOptions): Promise<ReturnType<T['run']>> {
  static override async run<T extends Command>(
    this: new (argv: string[], config: Config) => T,
    argv?: string[] | undefined,
    opts?: Interfaces.LoadOptions
  ): Promise<ReturnType<T["run"]>> {
    // // console.log(`argv, opts :>> `, argv, opts)
    // console.error(`opts.plugins :>> `, opts)

    // // @ts-ignore
    // return BaseCommand.run<T>(argv, opts)

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

    // @ts-ignore
    return cmd._run<ReturnType<T["run"]>>();
  }

  async loadServicesForPlugin({
    plugin,
  }: {
    plugin: Interfaces.Plugin;
  }): Promise<Partial<ServicesStatic>> {
  // }): Promise<ServiceStaticInterface[]> {
    const marker = Performance.mark(
      `plugin.loadServicesForPlugin#${plugin.name}`,
      { plugin: plugin.name }
    );
    // const servicesRelPath = ((plugin.pjson.oclif as any).services as string)
    // console.log(`pluginDescriptor, servicesRelPath :>> `, pluginDescriptor, servicesRelPath)
    // if (!servicesRelPath) return {} as Bac[T]['services']
    // const servicesPath = path.join(plugin.root, servicesRelPath)

    const findExportFromModule = (packageModule: any) => {
      // if (typeof cmd.run === 'function') return cmd
      if (packageModule.services && Array.isArray(packageModule.services))
        return packageModule.services;
      // return Object.values(module).find((anExport: any) => typeof anExport.title === 'function')
    };

    const loadPlugin = async (packagePath: AddressPathAbsolute): Promise<ValueOf<ServicesStatic>[]> => {
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
        // if (!opts.must && error.code === 'MODULE_NOT_FOUND') return
        throw error;
      }

      const services = findExportFromModule(m);
      // console.log(`services :>> `, services)
      if (!services) return [];

      // cmd.id = id
      // cmd.plugin = this

      return services;
    };

    // const findServicePaths = (): AddressPathAbsolute[] => {
    //   const marker = Performance.mark(`plugin.findServicePaths#${pluginDescriptor}`, {plugin: pluginDescriptor})
    //   this.debug(`LoadServicesForPlugin: loading IDs from ${servicesPath}`)
    //   const patterns = [
    //     '**/*.+(js|cjs|mjs|ts|tsx)',
    //     '!**/*.+(d.ts|test.ts|test.js|spec.ts|spec.js)?(x)',
    //   ]
    //   const servicePaths = globby.sync(patterns, {cwd: servicesPath})
    //   .map((p: string) => {
    //     return addr.parseAsType(p, 'portablePathPosixAbsolute')
    //     // const p = path.parse(file)
    //     // const topics = p.dir.split('/')
    //     // const command = p.name !== 'index' && p.name
    //     // const id = [...topics, command].filter(f => f).join(':')
    //     // return id === '' ? '.' : id
    //   })
    //   this.debug('LoadServicesForPlugin: found services', servicePaths)
    //   marker?.addDetails({count: servicePaths.length})
    //   marker?.stop()
    //   return servicePaths
    // }

    // const loadServicePaths = async (servicePaths: AddressPathAbsolute[]): Promise<Bac[T]['services']> => {
    //   // if (!this.commandsDir) return
    //   const findExportFromModule = (module: any) => {
    //     // if (typeof cmd.run === 'function') return cmd
    //     if (module.default && module.default.title) return module.default
    //     return Object.values(module).find((anExport: any) => typeof anExport.title === 'function')
    //   }

    //   type ValueOf<T> = T[keyof T]

    //   const loadModule = async (servicePath: AddressPathAbsolute): Promise<ValueOf<Bac[T]['services']> | undefined> => {
    //     let m
    //     try {
    //       // const p = path.join(plugin.pjson.oclif.commands, ...id.split(':'))
    //       const {isESM, module, filePath} = await ModuleLoader.loadWithData(plugin, servicePath.original)
    //       this.debug(isESM ? 'LoadServicesForPlugin: (import)' : 'LoadServicesForPlugin: (require)', filePath)
    //       m = module
    //     } catch (error: any) {
    //       // if (!opts.must && error.code === 'MODULE_NOT_FOUND') return
    //       throw error
    //     }

    //     const cmd = findExportFromModule(m)
    //     if (!cmd) return

    //     // cmd.id = id
    //     // cmd.plugin = this

    //     return cmd
    //   }

    //   return servicePaths.reduce<Bac[T]['services']>(async (acc, p) => {
    //     const m = await loadModule(p)
    //     if (m) {
    //       // @ts-ignore
    //       acc[m.title] = m
    //     }
    //     return acc
    //   }, {})
    // }

    // const servicePaths = findServicePaths()
    // const pluginServices = await loadServicePaths(servicePaths)

    const services = (await loadPlugin(
      addr.parseAsType(plugin.root, "portablePathPosixAbsolute")
    )).reduce((acc, staticService) => ({...acc, [staticService.title]: staticService}), {} as Partial<ServicesStatic>)


    // console.log(`services :>> `, services)
    // const cmd = await fetch()
    // if (!cmd && opts.must) error(`command ${id} not found`)
    marker?.stop();
    return services;
  }
  // async loadServicesForPlugin<T extends PluginDescriptors>({plugin, pluginDescriptor}: {plugin: Interfaces.Plugin, pluginDescriptor: T}): Promise<Bac[T]['services']> {
  //   const marker = Performance.mark(`plugin.loadServicesForPlugin#${pluginDescriptor}`, {plugin: pluginDescriptor})
  //   const servicesRelPath = ((plugin.pjson.oclif as any).services as string)
  //   console.log(`pluginDescriptor, servicesRelPath :>> `, pluginDescriptor, servicesRelPath)
  //   if (!servicesRelPath) return {} as Bac[T]['services']
  //   const servicesPath = path.join(plugin.root, servicesRelPath)

  //   // const findServicePaths = (): AddressPathAbsolute[] => {
  //   //   const marker = Performance.mark(`plugin.findServicePaths#${pluginDescriptor}`, {plugin: pluginDescriptor})
  //   //   this.debug(`LoadServicesForPlugin: loading IDs from ${servicesPath}`)
  //   //   const patterns = [
  //   //     '**/*.+(js|cjs|mjs|ts|tsx)',
  //   //     '!**/*.+(d.ts|test.ts|test.js|spec.ts|spec.js)?(x)',
  //   //   ]
  //   //   const servicePaths = globby.sync(patterns, {cwd: servicesPath})
  //   //   .map((p: string) => {
  //   //     return addr.parseAsType(p, 'portablePathPosixAbsolute')
  //   //     // const p = path.parse(file)
  //   //     // const topics = p.dir.split('/')
  //   //     // const command = p.name !== 'index' && p.name
  //   //     // const id = [...topics, command].filter(f => f).join(':')
  //   //     // return id === '' ? '.' : id
  //   //   })
  //   //   this.debug('LoadServicesForPlugin: found services', servicePaths)
  //   //   marker?.addDetails({count: servicePaths.length})
  //   //   marker?.stop()
  //   //   return servicePaths
  //   // }

  //   // const loadServicePaths = async (servicePaths: AddressPathAbsolute[]): Promise<Bac[T]['services']> => {
  //   //   // if (!this.commandsDir) return
  //   //   const findExportFromModule = (module: any) => {
  //   //     // if (typeof cmd.run === 'function') return cmd
  //   //     if (module.default && module.default.title) return module.default
  //   //     return Object.values(module).find((anExport: any) => typeof anExport.title === 'function')
  //   //   }

  //   //   type ValueOf<T> = T[keyof T]

  //   //   const loadModule = async (servicePath: AddressPathAbsolute): Promise<ValueOf<Bac[T]['services']> | undefined> => {
  //   //     let m
  //   //     try {
  //   //       // const p = path.join(plugin.pjson.oclif.commands, ...id.split(':'))
  //   //       const {isESM, module, filePath} = await ModuleLoader.loadWithData(plugin, servicePath.original)
  //   //       this.debug(isESM ? 'LoadServicesForPlugin: (import)' : 'LoadServicesForPlugin: (require)', filePath)
  //   //       m = module
  //   //     } catch (error: any) {
  //   //       // if (!opts.must && error.code === 'MODULE_NOT_FOUND') return
  //   //       throw error
  //   //     }

  //   //     const cmd = findExportFromModule(m)
  //   //     if (!cmd) return

  //   //     // cmd.id = id
  //   //     // cmd.plugin = this

  //   //     return cmd
  //   //   }

  //   //   return servicePaths.reduce<Bac[T]['services']>(async (acc, p) => {
  //   //     const m = await loadModule(p)
  //   //     if (m) {
  //   //       // @ts-ignore
  //   //       acc[m.title] = m
  //   //     }
  //   //     return acc
  //   //   }, {})
  //   // }

  //   const servicePaths = findServicePaths()
  //   const pluginServices = await loadServicePaths(servicePaths)

  //   // const cmd = await fetch()
  //   // if (!cmd && opts.must) error(`command ${id} not found`)
  //   marker?.stop()
  //   return pluginServices
  // }

  // async loadServiceFactory({
  //   plugins,
  //   context,
  // }: {
  //   plugins: Interfaces.Plugin[];
  //   context: ContextPrivate;
  // }): Promise<Services> {
  //   const res = await plugins.reduce(
  //     async (accum, plugin) => {
  //       const acc = await accum
  //       const staticPluginServices = await this.loadServicesForPlugin({
  //         plugin,
  //       });
  //       if (!staticPluginServices) {
  //         return acc;
  //       }

  //       // console.log(`staticPluginServices :>> `, staticPluginServices, plugin)

  //       const pluginServices = await staticPluginServices.reduce<
  //         Promise<Services>
  //       >(async (accum, sp) => {
  //         const acc = await accum;
  //         const serviceIns = await sp.initialise(context);
  //         if (!serviceIns) {
  //           this.debug(
  //             `loadServices: service '${sp.title}' does not instantiate`
  //           );
  //           return acc;
  //         }
  //         this.debug(`loadServices: service '${sp.title}' instantiated`);
  //         acc[sp.title as keyof Services] = serviceIns as any; // string key not relatable to instance
  //         return acc;
  //       }, Promise.resolve({}) as Promise<Services>);

  //       return {
  //         ...acc,
  //         // ...(pluginServices.reduce((acc, ps) => ({...acc, ...{ps.title, ps}))),
  //         ...pluginServices,
  //       };
  //     },
  //     Promise.resolve({})
  //   ) as Services;

  //   // console.log(`res :>> `, res)

  //   return res;
  // }
  async loadServiceFactory({
    plugins,
    // context,
    logger,
  }: {
    plugins: Interfaces.Plugin[];
    logger: Context['logger']
    // context: Context;
  }): Promise<Context['serviceFactory']> {

    const staticServices = await plugins.reduce(
      async (accum, plugin) => {
        const acc = await accum
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
      },
      Promise.resolve({})
    ) as ServicesStatic;

    // console.log(`res :>> `, res)

    const factory = async <SName extends keyof Services>(serviceName: SName, options: ServiceInitialiseOptions): Promise<Services[SName]> => {
      const staticService = staticServices[serviceName]
      console.log(`staticServices, serviceName :>> `, staticServices, serviceName)
      const serviceIns = await staticService.initialise(options) as Services[SName];
      console.log(`serviceIns :>> `, serviceIns)
      if (!serviceIns) {
        this.debug(
          `loadServiceFactory: service '${staticService.title}' does not instantiate`
        );
        throw new BacError(MessageName.SERVICE_NOT_FOUND, `Service '${serviceName}' not found. Ensure you have installed relevant plugins`)
      }
      this.debug(`loadServiceFactory: service '${staticService.title}' instantiated`)
      return serviceIns
    }
    factory['availableServices'] = Object.keys(staticServices) as (keyof ServicesStatic)[]
    return factory
  }

  async run(): Promise<void> {
    const parseOutput = await this.parse<FlagsInfer<T>, FlagsInfer<T>, ArgsInfer<T>>();


    // oclif has kindly aggregated all our plugins for us. We should be able to scavenge our additional plugin
    // exports like services

    // console.log(`this.ctor.oclifConfig :>> `, (this.ctor as typeof BaseCommand).oclifConfig)

    // type ServiceMap = Bac.Services
    const oclifConfig = (this.ctor as typeof BaseCommand).oclifConfig;
    // console.log(`oclifConfig.plugins :>> `, oclifConfig.plugins)

    // const oclifCommands = oclifConfig.commands
    // const contextPrivate: Context = {
    //   // cliOptions: parseOutput,
    //   // oclifConfig,
    //   logger: (msg: string, level: LogLevel = "info") => {
    //     if (level === "debug") {
    //       return this.debug(msg);
    //     }
    //     this.log(msg);
    //   },
    // };

    const logger: Context['logger'] = (msg: string, level: LogLevel = "info") => {
      if (level === "debug") {
        return this.debug(msg);
      }
      this.log(msg);
    }

    // const services = await this.loadServices({
    //   plugins: oclifConfig.plugins,
    //   context: contextPrivate,
    // });
    const serviceFactory = await this.loadServiceFactory({
      plugins: oclifConfig.plugins,
      logger,
      // context: contextPrivate,
    })

    // console.log(`services :>> `, services);

    const context: ContextCommand<T> = {
      oclifConfig,
      cliOptions: parseOutput,
      logger,
      serviceFactory,
      workspacePath: getDestinationPath(parseOutput.flags['workspacePath']),
    };

    // const loadServices = (plugins: Interfaces.Plugin[]): Bac.Services => {
    //   const allServices = plugins.reduce((acc, p) => {
    //     const pluginServices =
    //   }, {})
    //   const findService = plugins.find(p => p.)
    //   return {
    //     myService: new MyServiceplu
    //   }
    // }

    // console.log(`args, commandInstance :>> `, args, commandInstance)
    // const services =

    const res = await this.execute(context);

    if (!assertIsOk(res)) {
      const err = res.res
      const oclifError = {
        ...err,
        exitCode: err?.extra?.exitCode ?? 1, // oclif understands error.exitCode - https://github.com/oclif/core/blob/79c41cafe58a27f22b6f7c88e1126c5fd06cb7bb/src/command.ts#L333
      }
      // console.error(`oclifError.message :>> `, oclifError.message)
      process.exitCode = oclifError.exitCode
      // this.error(oclifError, {exit: oclifError.exitCode})
      throw oclifError // will end up in this.catch()
    }
    return
  }

  abstract execute(context: ContextCommand<T>): Promise<Result<unknown, BacError<MessageName, any>>>;

  protected override async catch(
    err: Error & { exitCode?: number }
  ): Promise<any> {

    /** super.catch doesn't seem to log errors outside of json so handle this specifically */
    if (!this.jsonEnabled()) {
      console.error(err)
    }

    // process.exitCode = process.exitCode ?? err.exitCode ?? 1
    // if (this.jsonEnabled()) {
    //   this.logJson(this.toErrorJson(err))
    // } else {
    //   if (!err.message) throw err
    //   try {

    //     // console.log(`err :>> `, err)
    //     // this.logToStderr(err.message)
    //     // this.log(err.message)
    //     // console.error(err)
    //     // ux.action.stop(chalk.bold.red('!'))
    //   } catch {}

    //   throw err
    // }

    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err);
  }

  protected override async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_);
  }
}

const getDestinationPath = (
  pathRelOrAbsoluteNative?: string
): AddressPathAbsolute => {
  let pathAddress: AddressPathAbsolute | AddressPathRelative =
    addr.parsePath(
      pathRelOrAbsoluteNative ?? process.cwd()
    );
  if (assertIsAddressPathRelative(pathAddress)) {
    pathAddress = addr.pathUtils.resolve(
      addr.parsePath(process.cwd()),
      pathAddress
    ) as AddressPathAbsolute;
  }

  // if (!xfs.existsSync(pathAddress.address)) {
  //   throw new BacError(
  //     MessageName.OCLIF_ERROR,
  //     `Config path at '${pathAddress.original}' does not exist, supplied as '${pathRelOrAbsoluteNative}'`
  //   );
  // }
  return pathAddress;
};
