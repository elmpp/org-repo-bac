// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import {
  addr,
  AddressDescriptorUnion,
  AddressPathAbsolute,
  assertIsAddressPathAbsolute,
} from "@business-as-code/address";
import {
  BacError,
  BacErrorWrapper,
  MessageName,
} from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";
import crypto from "crypto";
import { fail, ok, Result, ServiceInitialiseCommonOptions } from "../__types__";
import { AddressCacheManager } from "../cache/address-cache-manager";
import { constants } from "../constants";
import { execUtils, fsUtils, hashUtils } from "../utils";
import { tmpResolvableFolder } from "../utils/fs-utils";
import { Config } from "../validation";

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

/**
 Provides programmatic way to interact with a Bac instance.
 Includes an AddressCacheManager for checksummed interaction with config files
 */
export class BacService {
  static title = "bac" as const;
  // title = 'bac' as const
  options: Required<Options>;
  // @ts-expect-error: initialise impl
  rcCacheManager: AddressCacheManager<false>;
  // @ts-expect-error: initialise impl
  rcFolderCacheManager: AddressCacheManager<true>;

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
    this.rcCacheManager = await AddressCacheManager.initialise({
      context: options.context,
      workspacePath: options.workspacePath,
      workingPath: ".",
      metaBaseAddress: addr.pathUtils.join(
        options.workspacePath,
        addr.parseAsType(constants.RC_FOLDER, "portablePathFilename"),
        addr.parseAsType(constants.RC_META_FOLDER, "portablePathFilename")
      ) as AddressPathAbsolute,
      createAttributes: (address: AddressDescriptorUnion) => {
        if (!assertIsAddressPathAbsolute(address)) {
          throw new Error(`Can only store using local absolute addresses`);
        }
        const filename = addr.pathUtils.basename(address);
        return {
          key: fsUtils.sanitise(filename.original),
        };
      },
    });
    this.rcFolderCacheManager = await AddressCacheManager.initialise({
      context: options.context,
      workspacePath: options.workspacePath,
      workingPath: ".",
      metaBaseAddress: addr.pathUtils.join(
        options.workspacePath,
        addr.parseAsType(constants.RC_FOLDER, "portablePathFilename"),
        addr.parseAsType(constants.RC_META_FOLDER, "portablePathFilename")
      ) as AddressPathAbsolute,
      contentBaseAddress: addr.pathUtils.join(
        options.workspacePath,
        addr.parseAsType(constants.RC_FOLDER, "portablePathFilename"),
        addr.parseAsType(constants.RC_CONTENT_FOLDER, "portablePathFilename")
      ) as AddressPathAbsolute,
      createAttributes: (address: AddressDescriptorUnion) => {
        if (!assertIsAddressPathAbsolute(address)) {
          throw new Error(`Can only store using local absolute addresses`);
        }
        const filename = addr.pathUtils.basename(address);
        return {
          key: fsUtils.sanitise(filename.original),
        };
      },
    });
  }

  async getConfigEntry() {
    const configPath = addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.RC_FILENAME),
    ) as AddressPathAbsolute;

    const res = await this.getForAddress(configPath, this.rcCacheManager);
    return res;
  }

  async getConfiguredConfigEntry() {
    const configPath = addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.RC_FOLDER),
      addr.parsePath(constants.RC_FILENAME),
    ) as AddressPathAbsolute;

    const res = await this.getForAddress(configPath, this.rcFolderCacheManager);
    return res;
  }

  protected async getForAddress(address: AddressPathAbsolute, cacheManager: AddressCacheManager<true> | AddressCacheManager<false>) {
    return cacheManager.get({
      address,
      cacheOptions: {},
      onHit(options) {
        // do nothing atm
      },
      async createChecksum(options) {
        const content = await xfs.readFilePromise(address.address, "utf-8");
        return {
          globalVersion: constants.GLOBAL_CACHE_KEY,
          key: hashUtils.makeHash(content),
        };
      },
      async onMiss(options) {
        // throw new Error(`Expected to find a config file '${address.original}'`)
      },
      onStale(options) {
        // do nothing atm
      },
    });
  }

  protected async loadForAddress<T>(
    address: AddressPathAbsolute,
    namedExport = "default"
  ): Promise<Result<T, { error: BacError }>> {
    const relativePath = addr.pathUtils.relative({
      destAddress: address,
      srcAddress: addr.parsePath(__filename) as AddressPathAbsolute,
    });
    try {
      const configModule = require(relativePath.original);
      // const configModule = require.resolve('constants.RC_FILENAME', {paths: [workspacePath.original]})
      if (!configModule[namedExport]) {
        throw new BacError(
          MessageName.CONFIGURATION_CONTENT_ERROR,
          `Module not found in existent file '${address.original}'. Workspace path supplied: '${this.options.workspacePath.original}'`
        );
      }
      return ok(configModule[namedExport] as T);
    } catch {}

    try {
      const configModule = importViaCopy(address);

      if (!configModule?.[namedExport]) {
        return fail({
          error: new BacError(
            MessageName.CONFIGURATION_CONTENT_ERROR,
            `Module imported from '${address.original} but config export not found inside'. Workspace path supplied: '${this.options.workspacePath.original}'`
          ),
        });
      }
      return ok(configModule[namedExport] as T);
    } catch (err) {
      return fail({
        error: new BacErrorWrapper(
          MessageName.CONFIGURATION_CONTENT_ERROR,
          `Module not importable()able at '${address.original}'. Workspace path supplied: '${this.options.workspacePath.original}'`,
          err as Error
        ),
      });
    }
  }

  /**
   * loads a config file via require. Has fallback behaviour whereby it's copied into the present checkout.
   * This is necessary when other workspace instances are being cliLinked back to this checkout and require()ing
   * their configs isn't possible
   */
  async loadConfig(): Promise<Result<Config, { error: BacError }>> {
    const configPath = addr.pathUtils.join(
      this.options.workspacePath,
      addr.parsePath(constants.RC_FILENAME)
    ) as AddressPathAbsolute;

    return this.loadForAddress<Config>(configPath, "config");

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

    return execUtils.doExec(args);
  }
}

const importViaCopy = (configPath: AddressPathAbsolute): any => {
  const tmpFilename = addr.parsePath(
    `${crypto.randomBytes(16).toString("hex")}`
  );
  const tmpFilepath = addr.pathUtils.join(tmpResolvableFolder, tmpFilename);

  xfs.copyFileSync(configPath.address, tmpFilepath.address);

  const configModule = require(`../etc/tmp/${tmpFilename.original}`);
  return configModule;
};
