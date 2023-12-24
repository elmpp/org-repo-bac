import {
  addr,
  AddressPackageStringified,
  AddressPathAbsolute
} from '@business-as-code/address'
import { constants } from '../../constants'
import { DoExecOptionsLite, execUtils } from '../../utils'
import { ServiceInitialiseCommonOptions } from '../../__types__'

// type Options = ServiceInitialiseCommonOptions & {
//   packageManager?: LifecycleProvidersForAsByMethod<
//     "packageManager"
//   >;
// };

export type PackageManagerExecOptions = DoExecOptionsLite & {
  /** will be set via a npm_config_registry env */
  registry?: string
}

/** also see ServiceStaticInterface */
abstract class BasePackageManagerService<
  Options extends ServiceInitialiseCommonOptions
> {
  abstract cliName: string

  // abstract login(): Promise<unknown>

  abstract link(options: { path: string }): ReturnType<typeof execUtils.doExec>

  abstract configList(options: {
    // development?: boolean;
    options?: PackageManagerExecOptions
  }): ReturnType<typeof execUtils.doExec>

  constructor(protected options: Options) {
    // this.options = options;
  }

  async login(options?: PackageManagerExecOptions) {
    const cwd = addr.packageUtils.resolveRoot({
      address: addr.parsePackage(
        `@business-as-code/plugin-core-package-manager-${this.cliName}`
        // `@business-as-code/plugin-core-package-manager-pnpm`
      ),
      projectCwd: addr.parsePath(__filename) as AddressPathAbsolute,
      strict: true
    })

    return this.exec({
      command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"${
        this.getNpmRcFilePath().original
      }\"`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: {
        // shell: false
        ...options,
        cwd
        // cwd: addr.pathUtils.resolve(addr.parsePath(__filename), addr.parsePath('../../../')),
      }
    })
  }

  async add(options: {
    pkg: string
    development?: boolean
    options?: PackageManagerExecOptions
  }) {
    return this.exec({
      command: `add ${options.development ? '-d ' : ''}${options.pkg}`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: options.options
    })
  }

  async install(options?: PackageManagerExecOptions) {
    return this.exec({
      command: `install`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: {
        ...options
      }
    })
  }

  /** hits registry to find details about a package */
  async info(options: {
    pkg: string
    // development?: boolean;
    options?: PackageManagerExecOptions
  }) {
    return this.exec({
      command: `info ${options.pkg}`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: options.options
    })
  }

  abstract run(options: {
    command: string
    pkg?: AddressPackageStringified
    options?: PackageManagerExecOptions
  }): ReturnType<typeof execUtils.doExec>

  protected async exec(options: {
    command: string
    options?: PackageManagerExecOptions
  }): ReturnType<typeof execUtils.doExec>
  protected async exec(options: {
    command: string
    options: PackageManagerExecOptions
  }): ReturnType<typeof execUtils.doExec>
  protected async exec(options: {
    command: string
    options?: PackageManagerExecOptions
  }): Promise<any> {
    const { registry, ...execOptionsLite } = options.options ?? {}

    const args = {
      command: `${this.cliName} ${options.command}`,
      options: {
        shell: true,
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.workspacePath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute,
        ...(registry ? { env: { npm_config_registry: registry } } : {}),
        ...execOptionsLite
      }
    }

    return execUtils.doExec(args)
  }

  protected getNpmRcFilePath(): AddressPathAbsolute {
    return addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.NPM_RC_FILENAME)
    ) as AddressPathAbsolute
  }

  protected static getWorkingDestinationPath(
    options: ServiceInitialiseCommonOptions
  ): AddressPathAbsolute {
    return addr.pathUtils.join(
      options.workspacePath,
      addr.parsePath(options.workingPath ?? '.')
    ) as AddressPathAbsolute
  }
}

export { BasePackageManagerService } // this error - "cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module"
