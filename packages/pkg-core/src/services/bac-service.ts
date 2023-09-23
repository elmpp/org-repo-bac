// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { addr, AddressDescriptorUnion, AddressPath, AddressPathAbsolute, assertIsAddressPathAbsolute } from "@business-as-code/address";
import { execUtils, fsUtils, hashUtils } from "../utils";
import { expectIsOk, ServiceInitialiseCommonOptions } from "../__types__";
import { Config } from "../validation";
import crypto from "crypto";
import {
  BacError,
  BacErrorWrapper,
  MessageName,
} from "@business-as-code/error";
import { constants } from "../constants";
import { tmpResolvableFolder } from "../utils/fs-utils";
import { xfs } from "@business-as-code/fslib";
import { Meta, XfsCacheManager } from "../xfs-cache-manager";
import { CacheService } from "./cache-service";
import { AddressCacheManager } from "../cache/address-cache-manager";

declare global {
  namespace Bac {
    interface Services {
      bac: {
        insType: BacService;
        staticType: typeof BacService;
      };
    }
  }
}

type Options = ServiceInitialiseCommonOptions & {};
type DoExecOptionsLite = Omit<
  Parameters<typeof execUtils.doExec>[0]["options"],
  "context" | "cwd"
>;
// type DoExecOptionsLite = Omit<
//   Parameters<typeof execUtils.doExec>[0]["options"],
//   "context" | "cwd"
// > & {throwOnFail?: boolean}

/**
 Provides programmatic way to interact with a Bac instance.
 Includes an AddressCacheManager for checksummed interaction with config files
 */
export class BacService {
  static title = "bac" as const;
  // title = 'bac' as const
  options: Required<Options>;
  // @ts-expect-error: initialise impl
  cacheManager: AddressCacheManager<false>;

  get ctor(): typeof BacService {
    return this.constructor as unknown as typeof BacService;
  }
  get title(): (typeof BacService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof BacService)["title"];
  }

  static async initialise(options: Options) {
    const ins = new BacService(options);
    await ins.initialise(options);
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {
    this.cacheManager = await AddressCacheManager.initialise({
      context: options.context,
      workspacePath: options.workspacePath,
      workingPath: ".",
      metaBaseAddress: addr.pathUtils.join(
        options.workspacePath,
        addr.parseAsType(constants.RC_FOLDER, "portablePathFilename"),
        addr.parseAsType(constants.RC_META_FOLDER, "portablePathFilename"),
      ) as AddressPathAbsolute,
      createAttributes: (address: AddressDescriptorUnion) => {
        if (!assertIsAddressPathAbsolute(address)) {
          throw new Error(`Can only store using local absolute addresses`)
        }
        const filename = addr.pathUtils.basename(address)
        return {
          key: fsUtils.sanitise(filename.original),
        }
        // key: addr.pathUtils
      }
      // cacheManagerOptions: {
        // contentBaseAddress: addr.pathUtils.join(
        //   options.workspacePath,
        //   addr.parseAsType("content", "portablePathFilename")
        // ) as AddressPathAbsolute,
      // },
    });
    // this.cacheService = await options.context.serviceFactory("cache", {
    //   context: options.context,
    //   workspacePath: options.workspacePath,
    //   workingPath: ".",
    //   metaBaseAddress: addr.pathUtils.join(
    //     options.workspacePath,
    //     addr.parseAsType(constants.RC_FOLDER, "portablePathFilename"),
    //     addr.parseAsType(constants.RC_META_FOLDER, "portablePathFilename"),
    //   ) as AddressPathAbsolute,
    //   createAttributes: (address: AddressDescriptorUnion) => {
    //     if (!assertIsAddressPathAbsolute(address)) {
    //       throw new Error(`Can only store using local absolute addresses`)
    //     }
    //     const filename = addr.pathUtils.basename(address)
    //     return {
    //       key: fsUtils.sanitise(filename.original),
    //     }
    //     // key: addr.pathUtils
    //   }
    //   // cacheManagerOptions: {
    //     // contentBaseAddress: addr.pathUtils.join(
    //     //   options.workspacePath,
    //     //   addr.parseAsType("content", "portablePathFilename")
    //     // ) as AddressPathAbsolute,
    //   // },
    // });
    // this.cacheManager = await XfsCacheManager.initialise({
    //   metaBaseAddress: addr.pathUtils.join(
    //     options.workspacePath,
    //     addr.parseAsType(constants.RC_FOLDER, "portablePathFilename"),
    //     addr.parseAsType(constants.RC_META_FOLDER, "portablePathFilename"),
    //   ) as AddressPathAbsolute,
    // });
  }

  async getConfig(): ReturnType<typeof this.cacheService.get> {
    const configPath = addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.RC_FILENAME)
    ) as AddressPathAbsolute;

    const res = await this.getForAddress(configPath)
    return res
  }

  protected async getForAddress(address: AddressPathAbsolute) {
    return this.cacheService.get({
      address,
      cacheOptions: {},
      onHit(options) {
        // do nothing atm
      },
      async createChecksum(options) {
        const content = await xfs.readFilePromise(address.address, 'utf-8')
        return {
          globalVersion: constants.GLOBAL_CACHE_KEY,
          key: hashUtils.makeHash(content),
        }
      },
      async onMiss(options) {
        // throw new Error(`Expected to find a config file '${address.original}'`)
      },
      onStale(options) {
        // do nothing atm
      },
    })
  }

  /**
   * loads a config file via require. Has fallback behaviour whereby it's copied into the present checkout.
   * This is necessary when other workspace instances are being cliLinked back to this checkout and require()ing
   * their configs isn't possible
   */
  loadConfig(): Config {
    // let configModule: any
    // if (typeof configPath === 'string') {
    //   configModule = require(configPath)
    // }
    // const requirePath = addr.pathUtils.join(base, addr.parsePath(constants.RC_FILENAME))
    // const configModule = require(`../etc/resolvable-tmp/${constants.RC_FILENAME}`)

    // console.log(`configModule :>> `, configModule)

    // assert(configModule.config)

    const importConfig = (configPath: AddressPathAbsolute) => {
      const tmpFilename = addr.parsePath(
        `config-${crypto.randomBytes(16).toString("hex")}`
      );
      const tmpFilepath = addr.pathUtils.join(tmpResolvableFolder, tmpFilename);

      // console.log(`tmpFilepath, ../etc/${tmpFilename.original} :>> `, tmpFilepath, )

      // const sourcePath = addr.pathUtils.join(workspacePath, addr.parsePath(constants.RC_FILENAME))
      xfs.copyFileSync(configPath.address, tmpFilepath.address);

      const configModule = require(`../etc/tmp/${tmpFilename.original}`);
      return configModule;
      // // console.log(`configModule :>> `, configModule)

      // assert(configModule.config)
      // return configModule.config

      // return fsUtils.loadConfig(this._tmpResolvablePath)
    };

    const configPath = addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.RC_FILENAME)
    ) as AddressPathAbsolute;

    const relativePath = addr.pathUtils.relative({
      destAddress: configPath,
      srcAddress: addr.parsePath(__filename) as AddressPathAbsolute,
    });
    try {
      const configModule = require(relativePath.original);
      // const configModule = require.resolve('constants.RC_FILENAME', {paths: [workspacePath.original]})
      if (!configModule.config) {
        throw new BacError(
          MessageName.CONFIGURATION_CONTENT_ERROR,
          `Config not found in existent file '${configPath.original}'. Workspace path supplied: '${this.options.workspacePath.original}'`
        );
      }
      return configModule.config;
    } catch {}

    try {
      const configModule = importConfig(configPath);
      if (!configModule.config) {
        throw new BacError(
          MessageName.CONFIGURATION_CONTENT_ERROR,
          `Config imported from '${configPath.original} but config export not found inside'. Workspace path supplied: '${this.options.workspacePath.original}'`
        );
      }
      return configModule.config;
    } catch (err) {
      throw new BacErrorWrapper(
        MessageName.CONFIGURATION_CONTENT_ERROR,
        `Config not importable()able at '${configPath.original}'. Workspace path supplied: '${this.options.workspacePath.original}'`,
        err as Error
      );
    }
  }

  // async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { throwOnFail: true };
  // }): ReturnType<typeof execUtils.doExecThrow>;
  // async run(options: {
  //   command: string;
  //   options: DoExecOptionsLite & { throwOnFail: false };
  // }): ReturnType<typeof execUtils.doExec>;
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
      command: `pnpm bac ${options.command}`,
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
}
