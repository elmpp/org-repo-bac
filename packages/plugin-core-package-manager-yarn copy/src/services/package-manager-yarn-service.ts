import { AddressPackageStringified } from '@business-as-code/address'
import {
  BasePackageManagerService,
  DoExecOptionsLite,
  LifecycleProvidersForAsByMethod,
  PackageManagerExecOptions,
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils
} from '@business-as-code/core'
import {
  BacError,
  MessageName,
  BacError as _BacError
} from '@business-as-code/error'
import { xfs } from '@business-as-code/fslib'

declare global {
  namespace Bac {
    interface Services {
      packageManagerYarn: {
        as: 'packageManager'
        insType: PackageManagerYarnService
        staticType: typeof PackageManagerYarnService
      }
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  packageManager?: LifecycleProvidersForAsByMethod<'packageManager'>
}

export class PackageManagerYarnService extends BasePackageManagerService<Options> {
  static title = 'packageManagerYarn' as const
  static as = 'packageManager' as const

  cliName = 'yarn'

  // options: Options;

  get ctor(): typeof PackageManagerYarnService {
    return this.constructor as unknown as typeof PackageManagerYarnService
  }
  get title(): (typeof PackageManagerYarnService)['title'] {
    return (this.constructor as any)
      .title as unknown as (typeof PackageManagerYarnService)['title']
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    const packageManager =
      options.packageManager ?? options.context.detectedPackageManager

    if (packageManager !== 'packageManagerYarn') {
      return
    }

    const ins = new PackageManagerYarnService(options)

    const workspacePathAbsolute =
      PackageManagerYarnService.getWorkingDestinationPath(options)

    if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
      options.context.logger.warn(
        `packagePackageManagerYarnService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`
      )
      return ins
    }

    return ins
  }

  async link({ path }: { path: string }) {
    return this.exec({
      command: `link ${path}`
    })
  }

  /** yarn config list */
  override async configList(options: {
    // development?: boolean;
    verbose?: boolean
    options?: PackageManagerExecOptions
  }) {
    // console.log(`optionssss :>> `, options)
    return this.exec({
      command: `config list`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: options.options
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
    if (options.options?.registry) {
      throw new BacError(
        MessageName.UNNAMED,
        `Yarn package manager service does not support runtime options.registry. Only .npmrc files`
      )
    }

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
