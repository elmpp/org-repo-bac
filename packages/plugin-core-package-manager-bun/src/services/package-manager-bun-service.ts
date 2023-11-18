import {
  AddressPackage,
  AddressPackageStringified,
  AddressPathAbsolute,
  addr,
} from "@business-as-code/address";
import {
  BasePackageManagerService,
  DoExecOptionsLite,
  LifecycleProvidersForAsByMethod,
  ServiceInitialiseCommonOptions,
  execUtils as _execUtils,
} from "@business-as-code/core";
import { BacError as _BacError } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

declare global {
  namespace Bac {
    interface Services {
      packageManagerBun: {
        as: "packageManager";
        insType: PackageManagerBunService;
        staticType: typeof PackageManagerBunService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  packageManager?: LifecycleProvidersForAsByMethod<"packageManager">;
};

export class PackageManagerBunService extends BasePackageManagerService<Options> {
  static title = "packageManagerBun" as const;
  static as = "packageManager" as const;

  cliName = "bun";

  // options: Options;

  get ctor(): typeof PackageManagerBunService {
    return this.constructor as unknown as typeof PackageManagerBunService;
  }
  get title(): (typeof PackageManagerBunService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof PackageManagerBunService)["title"];
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    const packageManager =
      options.packageManager ?? options.context.detectedPackageManager;

    // default to bun
    if (packageManager !== "packageManagerBun") {
      return;
    }

    const ins = new PackageManagerBunService(options);

    const workspacePathAbsolute =
      PackageManagerBunService.getWorkingDestinationPath(options);

    if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
      options.context.logger.warn(
        `packagePackageManagerBunService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`
      );
      return ins;
    }

    return ins;
  }

  // constructor(protected options: Options) {
  //   // this.options = options;
  // }

  async link({
    path,
    pkg,
    save,
  }: {
    path: string;
    pkg: AddressPackageStringified;
    save?: boolean;
  }) {

    console.log(`:>> linking here ${pkg}, ${path}`);


    /** probably not needed but helps with tests */
    await this.exec({
      command: `unlink`,
      options: {
        cwd: addr.parsePath(path) as AddressPathAbsolute,
      },
    });

    // bun link docs - https://tinyurl.com/yunss749
    await this.exec({
      command: `link`,
      options: {
        cwd: addr.parsePath(path) as AddressPathAbsolute,
      },
    });

    // run link second time in the workspace
    return this.exec({
      command: `link ${pkg}${save ? " --save" : ""}`,
    });
  }

  async run(options: {
    command: string;
    pkg?: AddressPackageStringified;
    options?: DoExecOptionsLite;
  }) {
    let cwd: AddressPathAbsolute | undefined = undefined
    if (options.pkg) {
      const packageAddress = addr.parsePackage(options.pkg);
      /** need to verify where the workspace lives */
      cwd = addr.packageUtils.resolveRoot({
        address: packageAddress,
        projectCwd: this.options.context.workspacePath,
        strict: true,
      });

    }

    /** probably not needed but helps with tests */
    return this.exec({
      command: `run ${options.command}`,
      options: {
        ...options.options,
        ...(cwd ? {cwd} : {}),
      }
    });
  }
}
