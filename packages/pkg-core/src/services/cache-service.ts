// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import {
  AddressDescriptorUnion,
  AddressPathAbsolute,
  addr,
} from "@business-as-code/address";
import { BacError } from "@business-as-code/error";
import assert from "assert";
import {
  FetchOptions,
  Result,
  ServiceInitialiseCommonOptions,
  assertIsOk,
  fail,
  ok,
} from "../__types__";
import { CacheEntry, XfsCacheManager } from "../xfs-cache-manager";

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
  /** the global cache buster. Should be supplied from constants.GLOBAL_CACHE_KEY */
  globalVersion: number;
  key: string;
  toString(): string;
};

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
  options: Options;
  // @ts-expect-error: set in initialise
  protected cacheManager: XfsCacheManager;

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
      // outputsBaseAddress: addr.pathUtils.join(
      //   options.rootPath,
      //   addr.parseAsType("outputs", "portablePathFilename")
      // ) as AddressPathAbsolute,
    });
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {}

  protected getCacheManagerAttributes({
    address,
  }: {
    address: AddressDescriptorUnion;
  }): { key: string; namespace: string } {
    return {
      key: address.addressNormalized,
      namespace: address.type,
    };
  }

  async has(address: AddressDescriptorUnion): Promise<boolean> {
    const cacheKeyAttributes = this.getCacheManagerAttributes({ address });
    return this.cacheManager.has(cacheKeyAttributes);
  }

  async get(options: { address: AddressDescriptorUnion }): Promise<
    Result<
      | {
          // releaseFs?: () => Promise<void>;
          contentPath: AddressPathAbsolute;
          checksum: CacheKey;
        }
      | undefined,
      { error: BacError }
    >
  > {
    const { address } = options;
    if (!address.type) {
      throw new Error(`address has no type: ${JSON.stringify(address)}`);
    }

    const cacheKeyAttributes = this.getCacheManagerAttributes({ address });

    const cacheEntry = await this.cacheManager.getCacheEntry(
      cacheKeyAttributes
    );
    const meta = await this.cacheManager.getMeta(cacheKeyAttributes);
    const hasEntry = await this.cacheManager.has(cacheKeyAttributes);

    return ok(
      hasEntry
        ? {
            contentPath: cacheEntry.content.main,
            checksum: meta?.contentChecksum!,
          }
        : undefined
    );
  }

  async getWithFetch(options: {
    // address: AddressDescriptorUnion;
    address: AddressDescriptorUnion;
    // address: AddressOtherCache;
    // key: string;
    // namespace?: string;
    cacheOptions: FetchOptions["cacheOptions"];
    // expectedChecksum: string;
    createChecksum: (options: {
      existentChecksum?: CacheKey;
      contentPath: AddressPathAbsolute;
    }) => Promise<CacheKey>;
    onHit: (options: {
      existentChecksum: CacheKey;
      contentPath: AddressPathAbsolute;
    }) => void;
    /** content not found for key/namespace */
    // onMiss: () => void,
    onStale: (options: {
      message: string;
      existentChecksum: CacheKey;
      contentPath: AddressPathAbsolute;
    }) => void;
    /** content found for key/namespace but checksum fail */
    // onChecksumFail: (options: {existentChecksum: CacheKey}) => void,
    /** existentChecksum denotes if content present already */

    /** no content present at all */
    onMiss: (options: { contentPath: AddressPathAbsolute }) => Promise<void>;
  }): Promise<
    Result<
      {
        // releaseFs?: () => Promise<void>;
        contentPath: AddressPathAbsolute;
        checksum: CacheKey;
      },
      { error: BacError }
    >
  > {
    const { address, createChecksum, onHit, onMiss, onStale } = options;
    if (!address.type) {
      throw new Error(`address has no type: ${JSON.stringify(address)}`);
    }

    const cacheKeyAttributes = this.getCacheManagerAttributes({ address });

    const cacheEntry = await this.cacheManager.getCacheEntry(
      cacheKeyAttributes
    );
    const meta = await this.cacheManager.getMeta(cacheKeyAttributes);
    let checksum: CacheKey;

    const hasEntry = await this.cacheManager.has(cacheKeyAttributes);

    const updateCacheEntry = async (options: {
      cacheEntry: CacheEntry;
      checksum: CacheKey;
    }) => {
      await this.cacheManager.set({
        ...cacheKeyAttributes,
        sourceEntry: {
          contentPath: cacheEntry.content.main,
          meta: {
            contentChecksum: checksum,
          },
        },
      });
    };

    const doFetch = async () => {
      await this.cacheManager.prime(cacheEntry);

      if (!hasEntry) {
        await onMiss({ contentPath: cacheEntry.content.main });
        checksum = await createChecksum({
          existentChecksum: undefined,
          contentPath: cacheEntry.content.main,
        });

        await updateCacheEntry({ cacheEntry, checksum });
      } else {
        assert(meta);
        // how to do checksum checks?

        checksum = await createChecksum({
          existentChecksum: meta.contentChecksum,
          contentPath: cacheEntry.content.main,
        });
        const checksumMatchRes = await this.cacheManager.checksumMatch({
          prevChecksum: meta.contentChecksum,
          nextChecksum: checksum,
          cacheEntry,
        });
        // const checksum = await createChecksum({existentChecksum})

        console.log(`checksumMatchRes :>> `, checksumMatchRes);

        if (!assertIsOk(checksumMatchRes)) {
          this.options.context.logger.debug(checksumMatchRes.res.error.message);
          // await clearCacheEntry({cacheEntry})
          // await addCacheEntry({cacheEntry})
          await onStale({
            message: checksumMatchRes.res.error.message,
            existentChecksum: meta.contentChecksum,
            contentPath: cacheEntry.content.main,
          });
        } else {
          await onHit({
            existentChecksum: meta.contentChecksum,
            contentPath: cacheEntry.content.main,
          });
        }

        await updateCacheEntry({ cacheEntry, checksum: checksum });
      }
    };

    try {
      await doFetch();
    } catch (err) {
      return fail({
        error: err as BacError,
      });
    }

    return ok({
      contentPath: cacheEntry.content.main,
      checksum: checksum!,
    });

    // const possiblyStaleEntry = await this.cacheManager

    // if (cacheEntry) {
    //   return ok({ contentPath: cacheEntry.content.main, checksum: 'blah' });
    // } else {
    //   const error = new BacError(
    //     MessageName.UNNAMED,
    //     `Cache entry not found for key: '${key}', namespace: '${namespace}'`
    //   );
    //   this.options.context.logger.debug(error.message);
    //   return fail({
    //     error,
    //   });
    // }
  }
}
