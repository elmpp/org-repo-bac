import { AddressPackageStringified } from "@business-as-code/address";
import {
  BasePackageManagerService, DoExecOptionsLite, LifecycleProvidersForAsByMethod,
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
} from "@business-as-code/core";
import { BacError as _BacError } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

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

export class PackageManagerYarnService extends BasePackageManagerService<Options> {
  static title = "packageManagerYarn" as const;
  static as = "packageManager" as const;

  cliName = 'yarn'

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
    const packageManager = options.packageManager ?? options.context.detectedPackageManager

    if (packageManager !== "packageManagerYarn") {
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

  async link({path}: {path: string}) {
    return this.exec({
      command: `link ${path}`,
    });
  }

  async run(options: {
    command: string;
    pkg?: AddressPackageStringified,
    options?: DoExecOptionsLite;
  }) {

    /** probably not needed but helps with tests */
    return this.exec({
      command: `run${options.pkg ? ` --filter=${options.pkg}` : ''} ${options.command}`,
      options: options.options,
    });
  }
}
