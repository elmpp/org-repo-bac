// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import { AddressPathAbsolute, AddressPathCache, addr } from "@business-as-code/address";
import { BacError, MessageName } from "@business-as-code/error";
import {
  FetchOptions,
  Result,
  ServiceInitialiseCommonOptions,
  fail,
  ok,
} from "../__types__";
import { CacheEntry, CacheSourceEntry, XfsCacheManager } from "../xfs-cache-manager";

declare global {
  namespace Bac {
    interface Services {
      cache: {
        insType: CacheService;
        staticType: typeof CacheService;
      };
    }
  }
}

export type CacheKey = {
  /** the global cache buster. Defaults to constants.GLOBAL_CACHE_KEY */
  globalVersion?: string,
  key: string,
  toString(): string
}

type Options = ServiceInitialiseCommonOptions & {
  /** path to root of instance */
  // workspacePath: AddressPathAbsolute;

  /** lives outside of the workspacePath */
  rootPath: AddressPathAbsolute;
};
// type DoExecOptionsLite = Omit<
//   Parameters<typeof execUtils.doExec>[0]["options"],
//   "context" | "cwd"
// >
// type DoExecOptionsLite = Omit<
//   Parameters<typeof execUtils.doExec>[0]["options"],
//   "context" | "cwd"
// > & {throwOnFail?: boolean}

/**
 Provides programmatic way to interact with a Bac instance
 */
export class CacheService {
  static title = "cache" as const;
  options: Required<Options>;
  // @ts-expect-error: set in initialise
  cacheManager: XfsCacheManager;

  get ctor(): typeof CacheService {
    return this.constructor as unknown as typeof CacheService;
  }
  get title(): (typeof CacheService)["title"] {
    return (this.constructor as any)
      .title as unknown as (typeof CacheService)["title"];
  }

  static async initialise(options: Options, prevInstance?: CacheService) {
    const ins = new CacheService(options);
    await ins.initialise(options);
    ins.cacheManager = await XfsCacheManager.initialise({
      contentBaseAddress: addr.pathUtils.join(
        options.rootPath,
        addr.parseAsType("content", "portablePathFilename")
      ) as AddressPathAbsolute,
      metaBaseAddress: addr.pathUtils.join(
        options.rootPath,
        addr.parseAsType("meta", "portablePathFilename")
      ) as AddressPathAbsolute,
      outputsBaseAddress: addr.pathUtils.join(
        options.rootPath,
        addr.parseAsType("outputs", "portablePathFilename")
      ) as AddressPathAbsolute,
    });
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {}

  async fetchFromCache(options: {
    // address: AddressDescriptorUnion;
    address: AddressPathCache
    key: string;
    namespace?: string;
    cacheOptions: FetchOptions["cacheOptions"];
    // expectedChecksum: string;
    createChecksum: (options: {existentChecksum?: CacheKey, contentPath: AddressPathAbsolute}) => Promise<CacheKey>
    onHit: () => void,
    /** content not found for key/namespace */
    onMiss: () => void,
    /** content found for key/namespace but checksum fail */
    onChecksumFail: (options: {existentChecksum: CacheKey}) => void,
    /** existentChecksum denotes if content present already */
    loader: (options: {existentChecksum?: CacheKey, contentPath: AddressPathAbsolute}) => Promise<Result<CacheSourceEntry, {error: BacError}>>,
  }): Promise<
    Result<
      {
        // releaseFs?: () => Promise<void>;
        entry: CacheEntry;
        checksum: string;
      },
      { error: BacError }
    >
  > {
    const entry = await this.cacheManager.getCacheEntry({
      key: options.key,
      namespace: options.namespace ?? "default",
    });

    if (entry) {
      return ok({ entry });
    } else {
      const error = new BacError(
        MessageName.UNNAMED,
        `Cache entry not found for key: '${options.key}', namespace: '${options.namespace}'`
      );
      this.options.context.logger.debug(error.message);
      return fail({
        error,
      });
    }
  }
}
