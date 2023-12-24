import {
  fsUtils,
  BaseCommand,
  ContextCommand,
  Oclif,
  Interfaces as _Interfaces,
  LifecycleOptionsByMethodKeyedByProviderArray,
  ok,
  expectIsOk
} from '@business-as-code/core'
import { JSONStringify } from '@business-as-code/core/utils/format-utils'
import { xfs } from '@business-as-code/fslib'

export default class ConfigureWorkspace extends BaseCommand<
  typeof ConfigureWorkspace
> {
  static override description = 'Performs the configuration expansion'

  static override examples = [
    `$ oex hello friend --from oclif
hello friend from oclif! (./src/commands/hello/index.ts)
`
  ]

  static override flags = {
    // name: Oclif.Flags.string({
    //   description: "Workspace name",
    //   required: true,
    // }),
    force: Oclif.Flags.boolean({
      required: false,
      default: false
    }),
    workspacePath: Oclif.Flags.directory({
      exists: true,
      description: 'Workspace name',
      required: true
    })
  }

  static override args = {}

  async execute(context: ContextCommand<typeof ConfigureWorkspace>) {
    // console.log(`context.cliOptions :>> `, context.cliOptions)

    // let workspacePath = await this.getWorkspacePath(context.cliOptions.flags.workspacePath);

    // const {config, path: configPath} = await this.getConfig(context);

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
        })

      expectIsOk(configureLifecycleRes)

      await bacService.setConfiguredConfigEntry(configureLifecycleRes.res)

      const configuredCacheEntry = await bacService.getConfiguredConfigEntry()
      expectIsOk(configuredCacheEntry)

      await bacService.setConfiguredConfigEntry(configureLifecycleRes.res)
    } else {
      context.logger.debug(`configure-workspace: cache hit`)
    }

    return ok(undefined)
  }
}
