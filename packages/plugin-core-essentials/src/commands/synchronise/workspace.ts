import { AddressPathAbsolute, addr } from '@business-as-code/address'
import {
  BaseCommand,
  ContextCommand,
  FetchOptions,
  Oclif,
  Interfaces as _Interfaces,
  constants,
  expectIsOk,
  ok
} from '@business-as-code/core'

export default class SynchroniseWorkspace extends BaseCommand<
  typeof SynchroniseWorkspace
> {
  static override description = 'Ensures workspace state matches the FS'

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`
  ]

  static override flags = {
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: 'Workspace name',
      required: true
    }),
    force: Oclif.Flags.boolean({
      required: false,
      default: false
    })
  }

  static override args = {}

  async execute(context: ContextCommand<typeof SynchroniseWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = await this.getWorkspacePath()

    // has the configured config file been changed?
    // const moonService = await context.serviceFactory('moon', {
    //   context,
    //   workspacePath: await this.getWorkspacePath(),
    //   workingPath: '.',
    // })
    // const configuredConfigAffected = moonService.

    // NEED A WAY HERE TO LOAD FILES THROUGH THE CACHE MANAGER BUT AT ARBITRARY LOCATIONS. I.E. THE BAC.JS FILE IN WORKSPACE ROOT AND META DIRECTORY IN .BAC/META

    const bacService = await context.serviceFactory('bac', {
      context,
      workspacePath: context.workspacePath,
      workingPath: '.',
      packageManager: context.detectedPackageManager!
    })

    const configCache = await bacService.getConfigEntry()
    expectIsOk(configCache)

    if (
      !configCache.res.checksumValid ||
      !configCache.res.existentChecksum ||
      context.cliOptions.flags.force
    ) {
      const configRes = await bacService.loadConfig()
      expectIsOk(configRes)
      const config = configRes.res

      const configureLifecycleRes =
        await context.lifecycles.configureWorkspace.executeConfigureWorkspace({
          common: {
            context,
            workspacePath: context.workspacePath,
            workingPath: '.'
          },
          options: {
            config
          }
          // provider: "git",
          // options: {
          //   config: configRes.res,
          //   // workingPath: ".",
          //   // config: configRes.res,
          //   // options: {
          //   //   // a: 'a',
          //   //   // name: context.cliOptions.flags.name,
          //   //   // config,
          //   //   // configPath: configPath.original,
          //   //   // cliVersion: context.cliOptions.flags.cliVersion,
          //   //   // cliRegistry: context.cliOptions.flags.cliRegistry,
          //   //   // cliPath: context.cliOptions.flags.cliPath,
          //   // }, // <!-- typed as any atm ¯\_(ツ)_/¯
          // },
          // },
          // ],
        })
      expectIsOk(configureLifecycleRes)

      const cacheService = await context.serviceFactory('cache', {
        context,
        workspacePath: context.workspacePath,
        workingPath: '.',
        rootPath: addr.parsePath(
          constants.CACHE_STORAGE_PATH
        ) as AddressPathAbsolute
      })
      // ensure the cache is at its latest

      // const fetchOptions: FetchOptions = {
      //   cacheService: await context.serviceFactory("cache", {
      //     context: context,
      //     workingPath: ".",
      //     workspacePath: context.workspacePath, // basically ignored within cacheservice
      //     rootPath: addr.parsePath(constants.CACHE_STORAGE_PATH) as AddressPathAbsolute,
      //   }),
      //   // cacheManager: await AddressCacheManager.initialise({
      //   //   context: testContext.context,
      //   //   workingPath: ".",
      //   //   workspacePath: testContext.testEnvVars.workspacePath, // basically ignored within cacheservice
      //   //   rootPath: testContext.testEnvVars.workspacePath,
      //   // }),
      //   sourceAddress: context.workspacePath,
      //   destinationAddress: context.workspacePath,
      // };

      // NEED A WAY TO CYCLE THROUGH THIS EXECUTION. PERHAPS LOOK AT THE MICROSOFT FAMILY OF STUFF - https://github.com/microsoft/p-graph

      const fetchLifecycleRes =
        await context.lifecycles.fetchContent.executeFetchContent({
          common: {
            context,
            workspacePath: context.workspacePath,
            workingPath: '.',
            cacheService
          },
          // options: fetchOptions,
          options: configureLifecycleRes.res.projects
        })

      // console.log(`fetchLifecycleRes :>> `, require('util').inspect(fetchLifecycleRes, {showHidden: false, depth: undefined, colors: true}))

      const subrepoService = await context.serviceFactory('subrepo', {
        context,
        workspacePath: context.workspacePath,
        workingPath: '.'
      })

      console.log(`subrepoService :>> `, subrepoService)

      // const synchroniseLifecycleRes =
      //   await context.lifecycles.synchroniseWorkspace.executeSynchroniseWorkspace(
      //     {
      //       common: {
      //         context,
      //         workspacePath: context.workspacePath,
      //       },
      //       options: [
      //         {
      //           provider: "git",
      //           options: {
      //             // workingPath: ".",
      //             config: configureLifecycleRes.res,
      //             // options: {
      //             //   // a: 'a',
      //             //   // name: context.cliOptions.flags.name,
      //             //   // config,
      //             //   // configPath: configPath.original,
      //             //   // cliVersion: context.cliOptions.flags.cliVersion,
      //             //   // cliRegistry: context.cliOptions.flags.cliRegistry,
      //             //   // cliPath: context.cliOptions.flags.cliPath,
      //             // }, // <!-- typed as any atm ¯\_(ツ)_/¯
      //           },
      //         },
      //       ],
      //     }
      //   );

      // expectIsOk(synchroniseLifecycleRes);
      // return synchroniseLifecycleRes;
    }

    return ok(undefined)
  }
}
