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
      packageManagerYarn: {
        as: "packageManager";
        insType: PackageManagerYarnService;
        staticType: typeof PackageManagerYarnService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  packageManager?: LifecycleProvidersForAsByMethod<
    "packageManager"
  >;
};

export class PackageManagerYarnService {
  static title = "packageManagerYarn" as const;
  static as = "packageManager" as const;

  // options: Options;

  get ctor(): typeof PackageManagerYarnService {
    return this.constructor as unknown as typeof PackageManagerYarnService;
  }
  get title(): (typeof PackageManagerYarnService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof PackageManagerYarnService)["title"];
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    if (options.packageManager !== "packageManagerYarn") {
      return;
    }

    const ins = new PackageManagerYarnService(options);

    const workspacePathAbsolute =
      PackageManagerYarnService.getWorkingDestinationPath(options);

    if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
      options.context.logger.warn(
        `packagePackageManagerYarnService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`
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
    return this.run({
      command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"${
        this.getNpmRcFilePath().original
      }\"`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`
      options: {
        // shell: false
        cwd: addr.packageUtils.resolveRoot({
          address: addr.parsePackage(
            `@business-as-code/plugin-core-package-manager-pnpm`,
          ),
          projectCwd: addr.parsePath(__filename) as AddressPathAbsolute,
          }),
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
        ...(options.options ?? {}),
        context: this.options.context,
        cwd: addr.pathUtils.join(
          this.options.workspacePath,
          addr.parsePath(this.options.workingPath)
        ) as AddressPathAbsolute,
      },
    };

    // if (options.options?.throwOnFail) {
    //   return doExecThrow(args);
    // }
    return execUtils.doExec(args);
  }

  static something() {}
  async somethingelse() {}
}
