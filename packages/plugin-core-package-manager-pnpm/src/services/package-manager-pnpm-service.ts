import { AddressPackageStringified } from '@business-as-code/address'
import {
  BasePackageManagerService,
  PackageManagerExecOptions,
  ServiceInitialiseCommonOptions,
  ServiceProvidersForAsByMethod
} from '@business-as-code/core'
import { xfs } from '@business-as-code/fslib'

declare global {
  namespace Bac {
    interface Services {
      packageManagerPnpm: {
        as: 'packageManager'
        insType: PackageManagerPnpmService
        staticType: typeof PackageManagerPnpmService
      }
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  packageManager?: ServiceProvidersForAsByMethod<'packageManager'>
}

export class PackageManagerPnpmService extends BasePackageManagerService<Options> {
  static title = 'packageManagerPnpm' as const
  static as = 'packageManager' as const

  cliName = 'pnpm'

  // options: Options;

  get ctor(): typeof PackageManagerPnpmService {
    return this.constructor as unknown as typeof PackageManagerPnpmService
  }
  get title(): (typeof PackageManagerPnpmService)['title'] {
    return (this.constructor as any)
      .title as unknown as (typeof PackageManagerPnpmService)['title']
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    console.log(
      `options.packageManager,  :>> `,
      options.packageManager,
      options.context.detectedPackageManager,
      Object.keys(options)
    )

    const packageManager =
      options.packageManager ?? options.context.detectedPackageManager

    if (
      // default to pnpm
      // (options.packageManager ?? "packageManagerPnpm") !== "packageManagerPnpm"
      packageManager !== 'packageManagerPnpm'
    ) {
      return
    }

    const ins = new PackageManagerPnpmService(options)

    const workspacePathAbsolute =
      PackageManagerPnpmService.getWorkingDestinationPath(options)

    if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
      options.context.logger.warn(
        `packagePackageManagerPnpmService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`
      )
      return ins
    }

    return ins
  }

  /** npm config ls -l */
  async configList(options: {
    // development?: boolean;
    options?: PackageManagerExecOptions
  }) {
    // console.log(`optionssss :>> `, options)
    return this.exec({
      command: `config list`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: options.options
    })
  }

  // constructor(protected options: Options) {
  //   // this.options = options;
  // }

  async link({ path }: { path: string }) {
    return this.exec({
      command: `link ${path}`
    })
  }

  async run(options: {
    command: string
    pkg?: AddressPackageStringified
    options?: PackageManagerExecOptions
  }) {
    /** probably not needed but helps with tests */
    return this.exec({
      command: `run${options.pkg ? ` --filter=${options.pkg}` : ''} ${options.command}`,
      options: options.options
    })
  }

  protected override async exec(options: {
    command: string
    options?: PackageManagerExecOptions
  }): Promise<any> {
    const args = {
      command: options.command,
      options: {
        ...(options.options ?? {}),
        pathBlacklist: [
          ...(options?.options?.pathBlacklist ?? []),
          '/[^:]*bun-node-[0-9a-zA-Z]*'
        ]
      }
    }

    return super.exec(args)
  }
}
