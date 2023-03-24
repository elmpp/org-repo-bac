// oclif custom base command docs - https://tinyurl.com/2n3wch65
// advanced BaseCommand Salesforce example - https://tinyurl.com/2lexro75
import {Command, Config, Flags, Interfaces, Performance, Plugin} from '@oclif/core'
import ModuleLoader from '@oclif/core/lib/module-loader'
import {addr, AddressPathAbsolute} from '@business-as-code/address'
import { ParserOutput } from '@oclif/core/lib/interfaces/parser'
import {fileURLToPath} from 'url'
import path from 'path'
import * as globby from 'globby'
import { Context, ContextPrivate, Services, ServicesStatic, ServiceStaticInterface, ValueOf } from '../__types__'
// import {Interfaces, Command} from '@oclif/core'

// type ServiceMap = Global['Bac'].Services
// type ServiceMap2 = keyof Bac.Services

enum LogLevel {
  debug = 'debug',
  info = 'info',
  warn = 'warn',
  error = 'error',
}

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

export type Flags<T extends typeof Command> = Interfaces.InferredFlags<typeof BaseCommand['baseFlags'] & T['flags']>
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T['args']>

export type CommandOptions<T extends typeof Command> = {
  // flags: Flags<T>
  // args: Flags<T>
  parseOutput: ParserOutput
}

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
  static override enableJsonFlag = true

  // define flags that can be inherited by any command that extends BaseCommand
  static override baseFlags = {
    'log-level': Flags.custom<LogLevel>({
      summary: 'Specify level for logging.',
      options: Object.values(LogLevel),
      helpGroup: 'GLOBAL',
    })(),
  }

  protected static oclifConfig: Interfaces.Config

  protected flags!: Flags<T>
  protected args!: Args<T>

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
  static override async run<T extends Command>(this: new (argv: string[], config: Config) => T, argv?: string[] | undefined, opts?: Interfaces.LoadOptions): Promise<ReturnType<T['run']>> {

    // // console.log(`argv, opts :>> `, argv, opts)
    // console.error(`opts.plugins :>> `, opts)

    // // @ts-ignore
    // return BaseCommand.run<T>(argv, opts)

    if (!argv) argv = process.argv.slice(2)

    // Handle the case when a file URL string is passed in such as 'import.meta.url'; covert to file path.
    if (typeof opts === 'string' && opts.startsWith('file://')) {
      opts = fileURLToPath(opts)
    }

    const config = await Config.load(opts || require.main?.filename || __dirname)
    const cmd = new this(argv, config)
    if (!cmd.id) {
      const id = cmd.constructor.name.toLowerCase()
      cmd.id = id
      // @ts-ignore
      cmd.ctor.id = id
    }
    // @ts-ignore
    cmd.ctor.oclifConfig = opts

    // @ts-ignore
    return cmd._run<ReturnType<T['run']>>()
  }

  async loadServicesForPlugin({plugin}: {plugin: Interfaces.Plugin}): Promise<ServiceStaticInterface[]> {
    const marker = Performance.mark(`plugin.loadServicesForPlugin#${plugin.name}`, {plugin: plugin.name})
    // const servicesRelPath = ((plugin.pjson.oclif as any).services as string)
    // console.log(`pluginDescriptor, servicesRelPath :>> `, pluginDescriptor, servicesRelPath)
    // if (!servicesRelPath) return {} as Bac[T]['services']
    // const servicesPath = path.join(plugin.root, servicesRelPath)

    const findExportFromModule = (packageModule: any) => {
      // if (typeof cmd.run === 'function') return cmd
      if (packageModule.services && Array.isArray(packageModule.services)) return packageModule.services
      // return Object.values(module).find((anExport: any) => typeof anExport.title === 'function')
    }

    const loadPlugin = async (packagePath: AddressPathAbsolute) => {
      let m
      try {
        // const p = path.join(plugin.pjson.oclif.commands, ...id.split(':'))
        const {isESM, module, filePath} = await ModuleLoader.loadWithData(plugin, packagePath.original)
        console.log(`isESM, module, filePath :>> `, isESM, module, filePath)
        this.debug(isESM ? 'LoadServicesForPlugin: (import)' : 'LoadServicesForPlugin: (require)', filePath)
        m = module
      } catch (error: any) {
        // if (!opts.must && error.code === 'MODULE_NOT_FOUND') return
        throw error
      }

      const services = findExportFromModule(m)
      // console.log(`services :>> `, services)
      if (!services) return

      // cmd.id = id
      // cmd.plugin = this

      return services
    }


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

    const services = await loadPlugin(addr.parseAsType(plugin.root, 'portablePathPosixAbsolute'))
// console.log(`services :>> `, services)
    // const cmd = await fetch()
    // if (!cmd && opts.must) error(`command ${id} not found`)
    marker?.stop()
    return services
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

  async loadServices({plugins, context}: {plugins: Interfaces.Plugin[], context: ContextPrivate}): Promise<Services> {

    const res = plugins.reduce(async (acc, plugin) => {
      const staticPluginServices = await this.loadServicesForPlugin({plugin})
      if (!staticPluginServices) {
        return acc
      }

// console.log(`staticPluginServices :>> `, staticPluginServices, plugin)

      const pluginServices = await staticPluginServices.reduce<Promise<Services>>(async (accum, sp) => {
        const acc = await accum
        const serviceIns = await sp.initialise(context)
        if (!serviceIns) {
          this.debug(`loadServices: service '${sp.title}' does not instantiate`)
          return acc
        }
        acc[sp.title as keyof Services] = serviceIns as any // string key not relatable to instance
        return acc
      }, Promise.resolve({}) as Promise<Services>)

      return {
        ...acc,
        // ...(pluginServices.reduce((acc, ps) => ({...acc, ...{ps.title, ps}))),
        ...pluginServices,
        }
      }

      , {}) as Services

      // console.log(`res :>> `, res)

    return res
  }



  async run(): Promise<void> {
    const parseOutput = await this.parse()

    // oclif has kindly aggregated all our plugins for us. We should be able to scavenge our additional plugin
    // exports like services

    // console.log(`this.ctor.oclifConfig :>> `, (this.ctor as typeof BaseCommand).oclifConfig)

    // type ServiceMap = Bac.Services
    const oclifConfig = (this.ctor as typeof BaseCommand).oclifConfig
    // console.log(`oclifConfig.plugins :>> `, oclifConfig.plugins)

    // const oclifCommands = oclifConfig.commands

    const contextPrivate: ContextPrivate = {
      cliOptions: parseOutput,
    }

    const services = await this.loadServices({plugins: oclifConfig.plugins, context: contextPrivate})

    // console.log(`services :>> `, services)

    const context: Context = {
      ...contextPrivate,
      services,
    }

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

    return this.execute(context)
  }

  abstract execute(context: Context): Promise<void>

  protected override async catch(err: Error & {exitCode?: number}): Promise<any> {
    // add any custom logic to handle errors from the command
    // or simply return the parent class error handling
    return super.catch(err)
  }

  protected override async finally(_: Error | undefined): Promise<any> {
    // called after run and catch regardless of whether or not the command errored
    return super.finally(_)
  }
}