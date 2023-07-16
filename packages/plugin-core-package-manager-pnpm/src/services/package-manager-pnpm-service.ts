import {
  BasePackageManagerService, LifecycleProvidersForAsByMethod,
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
} from "@business-as-code/core";
import { BacError as _BacError } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

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

export class PackageManagerPnpmService extends BasePackageManagerService<Options> {
  static title = "packageManagerPnpm" as const;
  static as = "packageManager" as const;

  cliName = 'pnpm'

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

  // constructor(protected options: Options) {
  //   // this.options = options;
  // }



  async link({path}: {path: string}) {
    return this.run({
      command: `link ${path}`,
    });
  }
}
