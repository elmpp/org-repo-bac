import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { constants } from "../../constants";
import { DoExecOptionsLite, execUtils } from "../../utils";
import { ServiceInitialiseCommonOptions } from "../../__types__";

// type Options = ServiceInitialiseCommonOptions & {
//   packageManager?: LifecycleProvidersForAsByMethod<
//     "packageManager"
//   >;
// };

/** also see ServiceStaticInterface */
abstract class BasePackageManagerService<Options extends ServiceInitialiseCommonOptions> {

  abstract cliName: string

  // abstract login(): Promise<unknown>

  abstract link(options: {path: string}): Promise<unknown>

  constructor(protected options: Options) {
    // this.options = options;
  }

  async login(options?: DoExecOptionsLite) {
    const cwd = addr.packageUtils.resolveRoot({
      address: addr.parsePackage(
        `@business-as-code/plugin-core-package-manager-pnpm`
      ),
      projectCwd: addr.parsePath(__filename) as AddressPathAbsolute,
      strict: true,
    })

    return this.run({
      command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"${
        this.getNpmRcFilePath().original
      }\"`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: {
        // shell: false
        ...options,
        cwd,
        // cwd: addr.pathUtils.resolve(addr.parsePath(__filename), addr.parsePath('../../../')),
      },
    });
  }

  async install(options?: DoExecOptionsLite) {
    // const cwd = addr.packageUtils.resolveRoot({
    //   address: addr.parsePackage(
    //     `@business-as-code/plugin-core-package-manager-pnpm`
    //   ),
    //   projectCwd: addr.parsePath(__filename) as AddressPathAbsolute,
    //   strict: true,
    // })
console.log(`this.options. :>> `, this.options.context.cliOptions.flags.logLevel)
    return this.run({
      command: `install`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: {
        ...options,
      },
    });
  }

  async run(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): ReturnType<typeof execUtils.doExec>;
  async run(options: {
    command: string;
    options: DoExecOptionsLite;
  }): ReturnType<typeof execUtils.doExec>;
  async run(options: {
    command: string;
    options?: DoExecOptionsLite;
  }): Promise<any> {
    const args = {
      command: `${this.cliName} ${options.command}`,
      options: {
        shell: true,
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.workspacePath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute,
        ...(options.options ?? {}),
      },
    };

    return execUtils.doExec(args);
  }

  protected getNpmRcFilePath(): AddressPathAbsolute {
    return addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.NPM_RC_FILENAME)
    ) as AddressPathAbsolute;
  }

  protected static getWorkingDestinationPath(
    options: ServiceInitialiseCommonOptions
  ): AddressPathAbsolute {
    return addr.pathUtils.join(
      options.workspacePath,
      addr.parsePath(options.workingPath ?? ".")
    ) as AddressPathAbsolute;
  }
}

export {
  BasePackageManagerService
} // this error - "cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module"