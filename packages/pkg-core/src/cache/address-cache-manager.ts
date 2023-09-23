// import {xfs} from '@business-as-code/common'
import {
  addr,
  AddressDescriptorUnion,
  AddressPathAbsolute,
  AddressPathRelative,
} from "@business-as-code/address";
import { PortablePath, xfs } from "@business-as-code/fslib";
// import { fsUtils } from "./utils";
import { JSONParse } from "../utils/format-utils";
import {
  assertIsOk,
  CacheKey,
  fail,
  FetchOptions,
  ok,
  Result,
  ServiceInitialiseCommonOptions,
  SetOptional,
  SetRequired,
} from "../__types__";
import { fsUtils } from "../utils";
import { XfsCacheManager, type CacheEntry } from "./xfs-cache-manager";
import { BacError } from "@business-as-code/error";
import assert, { strict } from "assert";
export { CacheEntry };

type _GetEntry = {
  sourceAddress: AddressDescriptorUnion;
  contentPathRelative?: AddressPathRelative;
  contentPath?: AddressPathAbsolute;
  metaPathRelative: AddressPathRelative;
  metaPath: AddressPathAbsolute;
  checksum: CacheKey;
  existentChecksum?: CacheKey;
  checksumValid: boolean;
};
type GetEntry<WithContent extends boolean> = WithContent extends boolean
  ? SetRequired<_GetEntry, "contentPath" | "contentPathRelative">
  : _GetEntry;

type Options = ServiceInitialiseCommonOptions &
  Parameters<(typeof XfsCacheManager)["initialise"]>[0] & {
    createAttributes: (address: AddressDescriptorUnion) => {
      key: string;
      namespace?: string;
    };
  };
export class AddressCacheManager<WithContent extends boolean> {
  // @ts-ignore: set in super
  options: Options;

  // @ts-ignore initialise set
  protected xfsCacheManager: XfsCacheManager<WithContent>;

  constructor(options: Options) {
    this.options = options;
  }

  static async initialise(
    options: Options & Parameters<(typeof XfsCacheManager)["initialise"]>[0]
  ) {
    const ins = new AddressCacheManager(options);
    ins.xfsCacheManager = await XfsCacheManager.initialise(options);
    return ins;
  }

  protected getCacheManagerAttributes({
    address,
  }: {
    address: AddressDescriptorUnion;
  }): { key: string; namespace?: string } {
    return this.options.createAttributes(address);
  }

  async has(address: AddressDescriptorUnion): Promise<boolean | undefined> {
    const cacheKeyAttributes = this.getCacheManagerAttributes({ address });
    return this.xfsCacheManager.has(cacheKeyAttributes);
  }

  /** all params required in order to compute checksum */
  async get(options: {
    // address: AddressDescriptorUnion;
    address: AddressDescriptorUnion;
    // address: AddressOtherCache;
    // key: string;
    // namespace?: string;
    cacheOptions: FetchOptions["cacheOptions"];
    // expectedChecksum: string;
    createChecksum: (options: {
      existentChecksum?: CacheKey;
      /** path to the content in the cache, if found */
      contentPath?: AddressPathAbsolute;
    }) => Promise<CacheKey>;
    onHit: (options: {
      existentChecksum: CacheKey;
      /** path to the content in the cache, if found */
      contentPath: WithContent extends true ? AddressPathAbsolute : undefined;
    }) => void;
    /** content not found for key/namespace */
    // onMiss: () => void,
    onStale: (options: {
      message: string;
      existentChecksum: CacheKey;
      /** path to the content in the cache. Stale means it exists */
      contentPath: WithContent extends true ? AddressPathAbsolute : undefined;
    }) => void;
    /** content found for key/namespace but checksum fail */
    // onChecksumFail: (options: {existentChecksum: CacheKey}) => void,
    /** existentChecksum denotes if content present already */

    /** we do not hold a record for this - i.e. no meta. Not called when options.contentBase not supplied */
    onMiss: (options: {
      /** path to the content in the cache, if found */
      contentPath: WithContent extends true ? AddressPathAbsolute : undefined;
    }) => Promise<void>;
  }): Promise<Result<GetEntry<WithContent>, { error: BacError }>> {
    const { address, createChecksum, onHit, onMiss, onStale } = options;
    if (!address.type) {
      throw new Error(`address has no type: ${JSON.stringify(address)}`);
    }

    const cacheKeyAttributes = this.getCacheManagerAttributes({ address });

    const cacheEntry = await this.xfsCacheManager.getCacheEntry(
      cacheKeyAttributes
    );
    const meta = await this.xfsCacheManager.getMeta(cacheKeyAttributes);
    let checksum: CacheKey;
    let checksumValid: boolean = false;

    const hasEntry = await this.xfsCacheManager.has(cacheKeyAttributes);

    const updateCacheEntry = async (options: {
      cacheEntry: CacheEntry<boolean>;
      checksum: CacheKey;
    }) => {
      await this.xfsCacheManager.set({
        ...cacheKeyAttributes,
        sourceEntry: {
          contentPath: cacheEntry.content?.main,
          meta: {
            contentChecksum: checksum,
          },
        },
      });
    };

    const doFetch = async () => {
      await this.xfsCacheManager.prime(cacheEntry);

      if (!hasEntry) {
        await onMiss({
          // @ts-expect-error: conditional meh
          contentPath:
            (cacheEntry.content?.main ?? (address as AddressPathAbsolute))!,
        });
        checksum = await createChecksum({
          existentChecksum: undefined,
          contentPath: cacheEntry.content?.main,
        });

        checksumValid = true; // checksum valid means whether we're ok to trust it

        // const checksumMatchRes = await this.xfsCacheManager.checksumMatch({
        //   prevChecksum: undefined,
        //   nextChecksum: checksum,
        //   cacheEntry,
        // });

        await updateCacheEntry({
          cacheEntry,
          checksum,
        });
      } else {
        assert(meta);
        // how to do checksum checks?

        checksum = await createChecksum({
          existentChecksum: meta.contentChecksum,
          contentPath: cacheEntry.content?.main,
        });
        const checksumMatchRes = await this.xfsCacheManager.checksumMatch({
          prevChecksum: meta.contentChecksum,
          nextChecksum: checksum,
          cacheEntry,
        });
        // const checksum = await createChecksum({existentChecksum})

        // console.log(`checksumMatchRes :>> `, checksumMatchRes);

        if (!assertIsOk(checksumMatchRes)) {
          this.options.context.logger.debug(checksumMatchRes.res.error.message);
          // await clearCacheEntry({cacheEntry})
          // await addCacheEntry({cacheEntry})
          await onStale({
            message: checksumMatchRes.res.error.message,
            existentChecksum: meta.contentChecksum,
            // @ts-expect-error: conditional meh
            contentPath: cacheEntry.content?.main!,
          });
        } else {
          checksumValid = true;
          await onHit({
            existentChecksum: meta.contentChecksum,
            // @ts-expect-error: conditional meh
            contentPath: cacheEntry.content?.main,
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

    // console.log(`cacheEntry :>> `, cacheEntry.content);
    // console.log(`{
    //         srcAddress: cacheEntry.content?.main!,
    //         destAddress: cacheEntry.content!._base,
    //         options: { strict: true },
    //       } :>> `, {
    //         srcAddress: this.options.contentBaseAddress,
    //         destAddress: cacheEntry.content!._base,
    //         options: { strict: true },
    //       })

    return ok({
      sourceAddress: address,
      contentPathRelative: (cacheEntry.content?.main!
        ? addr.pathUtils.relative({
            srcAddress: this.options.contentBaseAddress!,
            destAddress: cacheEntry.content!._base,
            options: { strict: true },
          })
        : undefined)!, // not always the case, obvs
      contentPath: cacheEntry.content?.main!, // not always the case, obvs
      metaPathRelative: addr.pathUtils.relative({
        srcAddress: this.options.metaBaseAddress!,
        destAddress: cacheEntry.meta.main,
        options: { strict: true },
      }),
      metaPath: cacheEntry.meta.main,
      checksum: checksum!,
      existentChecksum: meta?.contentChecksum,
      checksumValid,
    });

    // const possiblyStaleEntry = await this.xfsCacheManager

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
