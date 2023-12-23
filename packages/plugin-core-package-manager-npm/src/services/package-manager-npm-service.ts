import { AddressPackageStringified } from "@business-as-code/address";
import {
  BasePackageManagerService,
  PackageManagerExecOptions,
  ServiceInitialiseCommonOptions,
  ServiceProvidersForAsByMethod
} from "@business-as-code/core";
import { BacError, MessageName } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

declare global {
  namespace Bac {
    interface Services {
      packageManagerNpm: {
        as: "packageManager";
        insType: PackageManagerNpmService;
        staticType: typeof PackageManagerNpmService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {
  packageManager?: ServiceProvidersForAsByMethod<
    "packageManager"
  >;
};

export class PackageManagerNpmService extends BasePackageManagerService<Options> {
  static title = "packageManagerNpm" as const;
  static as = "packageManager" as const;

  cliName = 'Npm'

  // options: Options;

  get ctor(): typeof PackageManagerNpmService {
    return this.constructor as unknown as typeof PackageManagerNpmService;
  }
  get title(): (typeof PackageManagerNpmService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof PackageManagerNpmService)["title"];
  }

  /** whether the service has initialised on a local repo. Prerequisite for most operations. See  */

  static async initialise(options: Options) {
    const packageManager = options.packageManager ?? options.context.detectedPackageManager

    if (packageManager !== "packageManagerNpm") {
      return;
    }

    const ins = new PackageManagerNpmService(options);

    const workspacePathAbsolute =
      PackageManagerNpmService.getWorkingDestinationPath(options);

    if (!(await xfs.existsPromise(workspacePathAbsolute.address))) {
      options.context.logger.warn(
        `packagePackageManagerNpmService: service initialised on a non-existent path '${workspacePathAbsolute.original}'. Is this really what you desire?`
      );
      return ins;
    }

    return ins;
  }

  /** npm config ls -l */
  async configList(options: {
    // development?: boolean;
    options?: PackageManagerExecOptions;
  }) {
    // console.log(`optionssss :>> `, options)
    return this.exec({
      command: `config ls -l`,
      // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
      options: options.options,
    });
  }

  async link({path}: {path: string}) {
    return this.exec({
      command: `link ${path}`,
    });
  }

  // /** Npm config list */
  // override async getConfig(options: {
  //   // development?: boolean;
  //   options?: PackageManagerExecOptions;
  // }) {
  //   // console.log(`optionssss :>> `, options)
  //   return this.exec({
  //     command: `config list`,
  //     // command: `npm-cli-login -u foo -p bar -e matthew.penrice@gmail.com -r http://localhost:4873 --config-path \"../../../.npmrc\"`,
  //     options: options.options,
  //   });
  // }

  async run(options: {
    command: string;
    pkg?: AddressPackageStringified,
    options?: PackageManagerExecOptions;
  }) {

    /** probably not needed but helps with tests */
    return this.exec({
      command: `run${options.pkg ? ` --filter=${options.pkg}` : ''} ${options.command}`,
      options: options.options,
    });
  }

  protected override async exec(options: {
    command: string;
    options?: PackageManagerExecOptions;
  }): Promise<any> {
    const args = {
      command: options.command,
      options: {
        ...(options.options ?? {}),
        pathBlacklist: [
          ...options?.options?.pathBlacklist ?? [],
          '/[^:]*bun-node-[0-9a-zA-Z]*',
        ],
      },
    };

    return super.exec(args);
  }
}
