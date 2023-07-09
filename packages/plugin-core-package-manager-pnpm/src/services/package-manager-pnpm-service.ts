import {
  constants,
  DoExecOptionsLite,
  execUtils,
  LifecycleProvidersForAsByMethod,
  ServiceInitialiseCommonOptions,
} from "@business-as-code/core";
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { xfs } from "@business-as-code/fslib";
import { BacError as _BacError } from "@business-as-code/error";

declare global {
  namespace Bac {
    interface Services {
      packageManagerPnpm: {
        as: "packageManager";
        insType: PackageManagerPnpmService;
        staticType: typeof PackageManagerPnpmService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  packageManager?: LifecycleProvidersForAsByMethod<
    "packageManager"
  >;
};

export class PackageManagerPnpmService {
  static title = "packageManagerPnpm" as const;
  static as = "packageManager" as const;

  // options: Options;

  get ctor(): typeof PackageManagerPnpmService {
    return this.constructor as unknown as typeof PackageManagerPnpmService;
  }
  get title(): (typeof PackageManagerPnpmService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof PackageManagerPnpmService)["title"];
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    // default to pnpm
    if (
      options.packageManager ??
      "packageManagerPnpm" !== "packageManagerPnpm"
    ) {
      return;
    }

    const ins = new PackageManagerPnpmService(options);

    const workspacePathAbsolute =
      PackageManagerPnpmService.getWorkingDestinationPath(options);

    if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
      options.context.logger.warn(
        `packagePackageManagerPnpmService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`
      );
      return ins;
    }

    return ins;
  }

  constructor(protected options: Options) {
    // this.options = options;
  }

  protected static getWorkingDestinationPath(
    options: Options
  ): AddressPathAbsolute {
    return addr.pathUtils.join(
      options.workspacePath,
      addr.parsePath(options.workingPath ?? ".")
    ) as AddressPathAbsolute;
  }

  protected getNpmRcFilePath(): AddressPathAbsolute {
    return addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.NPM_RC_FILENAME)
    ) as AddressPathAbsolute;
  }

  async login() {
    const cwd = addr.packageUtils.resolveRoot({
      address: addr.parsePackage(
        `@business-as-code/plugin-core-package-manager-pnpm`
      ),
      projectCwd: addr.parsePath(__filename) as AddressPathAbsolute,
      strict: true,
    })
    console.log(`cwd :>> `, cwd)
    return this.run({
      command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"${
        this.getNpmRcFilePath().original
      }\"`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: {
        // shell: false
        cwd,
        // cwd: addr.pathUtils.resolve(addr.parsePath(__filename), addr.parsePath('../../../')),
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
      command: `pnpm ${options.command}`,
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

  static something() {}
  async somethingelse() {}
}
