// inspired by the schematics cli module - https://tinyurl.com/2k54dvru
import {
  AddressDescriptorUnion,
  AddressPathAbsolute,
  addr,
} from "@business-as-code/address";
import { ServiceInitialiseCommonOptions } from "../__types__";
import { AddressCacheManager } from "../cache/address-cache-manager";
import { sanitise } from "../utils/fs-utils";
import { constants } from "../constants";

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

// type Options = ServiceInitialiseCommonOptions & Parameters<(typeof XfsCacheManager)["initialise"]>[0];
type Options = ServiceInitialiseCommonOptions & {
  rootPath: AddressPathAbsolute;
};

// type GetEntry = {
//   sourceAddress: AddressDescriptorUnion;
//   contentPath?: AddressPathAbsolute;
//   checksum: CacheKey;
//   existentChecksum?: CacheKey;
//   checksumMatch: boolean;
// }

// type Options = ServiceInitialiseCommonOptions & {
//   /** lives outside of the workspacePath */
//   rootPath: AddressPathAbsolute;
// };
// type DoExecOptionsLite = Omit<
//   Parameters<typeof execUtils.doExec>[0]["options"],
//   "context" | "cwd"
// >
// type DoExecOptionsLite = Omit<
//   Parameters<typeof execUtils.doExec>[0]["options"],
//   "context" | "cwd"
// > & {throwOnFail?: boolean}

/**
 The Cache service provides a namespaced fs storage manager for non-subtree'd content.
 For use mostly within lifecycles where the content-specific methods can provide checksum
 arguments etc
 */
export class CacheService {
  static title = "cache" as const;
  options: Options;

  // @ts-ignore: initialise set
  protected cacheManager: AddressCacheManager; // shame we can't make the service generic :(. It's used differently in BacService

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
    ins.cacheManager = await AddressCacheManager.initialise({
      ...options,
      metaBaseAddress: addr.pathUtils.join(
        options.rootPath,
        addr.parseAsType("meta", "portablePathFilename")
      ) as AddressPathAbsolute,
      createAttributes: (address) => {
        return {
          key: sanitise(address.addressNormalized),
          namespace: sanitise(address.type),
        };
      },
    });
    // ins.cacheManager = await AddressCacheManager.initialise({
    //   contentBaseAddress: addr.pathUtils.join(
    //     options.rootPath,
    //     addr.parseAsType("content", "portablePathFilename")
    //   ) as AddressPathAbsolute,
    //   metaBaseAddress: addr.pathUtils.join(
    //     options.rootPath,
    //     addr.parseAsType("meta", "portablePathFilename")
    //   ) as AddressPathAbsolute,
    //   // outputsBaseAddress: addr.pathUtils.join(
    //   //   options.rootPath,
    //   //   addr.parseAsType("outputs", "portablePathFilename")
    //   // ) as AddressPathAbsolute,
    // });
    return ins;
  }

  constructor(options: Options) {
    this.options = options;
  }

  protected async initialise(options: Options) {}

  // async get(...options: Parameters<(AddressCacheManager['get'])>): ReturnType<AddressCacheManager['get']> {
  //   return this.cacheManager.get(...options)
  // }
  async get({
    /** address here is the sourceAddress, where content comes from. We'll always generate the namespaced location within rootPath */
    address,
    cacheOptions,
    createChecksum,
    onHit,
    onMiss,
    onStale,
  }: Omit<Parameters<AddressCacheManager["get"]>[0], "address"> & {
    address: AddressDescriptorUnion;
  }): ReturnType<AddressCacheManager["get"]> {
    // return this.cacheManager.get(...options)

    const { absolute: contentPath, relative: contentPathRelative } =
      await this.cacheManager.createContentPaths({
        rootPath: this.options.rootPath,
        address,
      });
    await this.cacheManager.primeContent({rootPath: this.options.rootPath, address})

    const fetchRes = await this.cacheManager.get({
      address: contentPath,
      // namespace,
      cacheOptions: {},
      // expectedChecksum: "",
      createChecksum,
      onHit,
      onStale,
      onMiss,
      // onHit: () => {},
      // onStale: async ({ contentPath, existentChecksum }) => {
      //   return await doFetch(sourceAddress, contentPath);
      // },
      // // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
      // onMiss: async ({ contentPath }) => {
      //   console.log(`contentPath :>> `, contentPath);
      //   await doFetch(sourceAddress, contentPath);
      // },
    });

    return fetchRes;
  }
  async has(address: AddressDescriptorUnion): Promise<boolean> {
    const { absolute: contentPath, relative: contentPathRelative } =
      await this.cacheManager.createContentPaths({
        rootPath: this.options.rootPath,
        address,
      });
    const hasMeta = await this.cacheManager.hasMeta(contentPath);
    const hasContent = await this.cacheManager.hasContent(contentPath);

// console.log(`address, contentPath :>> `, address, contentPath)
    console.log(`hasMeta, hasContent :>> `, hasMeta, hasContent)

    return hasMeta && hasContent; // leave any cache dir inconsistencies to the cacheManager
  }

  // protected getCacheManagerAttributes({
  //   address,
  // }: {
  //   address: AddressDescriptorUnion;
  // }): { key: string; namespace?: string } {
  //   return this.options.createAttributes(address)
  // }

  // async has(address: AddressDescriptorUnion): Promise<boolean | undefined> {
  //   const cacheKeyAttributes = this.getCacheManagerAttributes({ address });
  //   return this.cacheManager.has(cacheKeyAttributes);
  // }

  // async get(options: { address: AddressDescriptorUnion }): Promise<
  //   Result<
  //     | GetEntry
  //     | undefined,
  //     { error: BacError }
  //   >
  // > {
  //   const { address } = options;
  //   if (!address.type) {
  //     throw new Error(`address has no type: ${JSON.stringify(address)}`);
  //   }

  //   const cacheKeyAttributes = this.getCacheManagerAttributes({ address });

  //   const cacheEntry = await this.cacheManager.getCacheEntry(
  //     cacheKeyAttributes
  //   );
  //   const meta = await this.cacheManager.getMeta(cacheKeyAttributes);
  //   const hasEntry = await this.cacheManager.has(cacheKeyAttributes);

  //   return ok(
  //     hasEntry
  //       ? {
  //           sourceAddress: address,
  //           contentPath: cacheEntry.content?.main,
  //           checksum: meta?.contentChecksum!,
  //         }
  //       : undefined
  //   );
  // }

  // /** all params required in order to compute checksum */
  // async get(options: {
  //   // address: AddressDescriptorUnion;
  //   address: AddressDescriptorUnion;
  //   // address: AddressOtherCache;
  //   // key: string;
  //   // namespace?: string;
  //   cacheOptions: FetchOptions["cacheOptions"];
  //   // expectedChecksum: string;
  //   createChecksum: (options: {
  //     existentChecksum?: CacheKey;
  //     /** path to the content in the cache, if found */
  //     contentPath?: AddressPathAbsolute;
  //   }) => Promise<CacheKey>;
  //   onHit: (options: {
  //     existentChecksum: CacheKey;
  //     /** path to the content in the cache, if found */
  //     contentPath?: AddressPathAbsolute;
  //   }) => void;
  //   /** content not found for key/namespace */
  //   // onMiss: () => void,
  //   onStale: (options: {
  //     message: string;
  //     existentChecksum: CacheKey;
  //     /** path to the content in the cache, if found */
  //     contentPath?: AddressPathAbsolute;
  //   }) => void;
  //   /** content found for key/namespace but checksum fail */
  //   // onChecksumFail: (options: {existentChecksum: CacheKey}) => void,
  //   /** existentChecksum denotes if content present already */

  //   /** we do not hold a record for this - i.e. no meta. Not called when options.contentBase not supplied */
  //   onMiss: (options: {
  //     /** path to the content in the cache, if found */
  //     contentPath?: AddressPathAbsolute
  //   }) => Promise<void>;
  // }): Promise<
  //   Result<
  //   GetEntry,
  //     { error: BacError }
  //   >
  // > {
  //   const { address, createChecksum, onHit, onMiss, onStale } = options;
  //   if (!address.type) {
  //     throw new Error(`address has no type: ${JSON.stringify(address)}`);
  //   }

  //   const cacheKeyAttributes = this.getCacheManagerAttributes({ address });

  //   const cacheEntry = await this.cacheManager.getCacheEntry(
  //     cacheKeyAttributes
  //   );
  //   const meta = await this.cacheManager.getMeta(cacheKeyAttributes);
  //   let checksum: CacheKey;
  //   let checksumMatch: boolean = false;

  //   const hasEntry = await this.cacheManager.has(cacheKeyAttributes);

  //   const updateCacheEntry = async (options: {
  //     cacheEntry: CacheEntry<boolean>;
  //     checksum: CacheKey;
  //   }) => {
  //     await this.cacheManager.set({
  //       ...cacheKeyAttributes,
  //       sourceEntry: {
  //         contentPath: cacheEntry.content?.main,
  //         meta: {
  //           contentChecksum: checksum,
  //         },
  //       },
  //     });
  //   };

  //   const doFetch = async () => {
  //     await this.cacheManager.prime(cacheEntry);

  //     if (!hasEntry) {
  //       await onMiss({
  //         contentPath:
  //           cacheEntry.content?.main ?? (address as AddressPathAbsolute),
  //       });
  //       checksum = await createChecksum({
  //         existentChecksum: undefined,
  //         contentPath: cacheEntry.content?.main,
  //       });

  //       await updateCacheEntry({
  //         cacheEntry,
  //         checksum
  //       });
  //     } else {
  //       assert(meta);
  //       // how to do checksum checks?

  //       checksum = await createChecksum({
  //         existentChecksum: meta.contentChecksum,
  //         contentPath: cacheEntry.content?.main,
  //       });
  //       const checksumMatchRes = await this.cacheManager.checksumMatch({
  //         prevChecksum: meta.contentChecksum,
  //         nextChecksum: checksum,
  //         cacheEntry,
  //       });
  //       // const checksum = await createChecksum({existentChecksum})

  //       // console.log(`checksumMatchRes :>> `, checksumMatchRes);

  //       if (!assertIsOk(checksumMatchRes)) {
  //         this.options.context.logger.debug(checksumMatchRes.res.error.message);
  //         // await clearCacheEntry({cacheEntry})
  //         // await addCacheEntry({cacheEntry})
  //         await onStale({
  //           message: checksumMatchRes.res.error.message,
  //           existentChecksum: meta.contentChecksum,
  //           contentPath: cacheEntry.content?.main,
  //         });
  //       } else {
  //         checksumMatch = true;
  //         await onHit({
  //           existentChecksum: meta.contentChecksum,
  //           contentPath: cacheEntry.content?.main,
  //         });
  //       }

  //       await updateCacheEntry({ cacheEntry, checksum: checksum });
  //     }
  //   };

  //   try {
  //     await doFetch();
  //   } catch (err) {
  //     return fail({
  //       error: err as BacError,
  //     });
  //   }

  //   return ok({
  //     sourceAddress: address,
  //     contentPath: cacheEntry.content?.main,
  //     checksum: checksum!,
  //     existentChecksum: meta?.contentChecksum,
  //     checksumMatch,
  //   });

  //   // const possiblyStaleEntry = await this.cacheManager

  //   // if (cacheEntry) {
  //   //   return ok({ contentPath: cacheEntry.content.main, checksum: 'blah' });
  //   // } else {
  //   //   const error = new BacError(
  //   //     MessageName.UNNAMED,
  //   //     `Cache entry not found for key: '${key}', namespace: '${namespace}'`
  //   //   );
  //   //   this.options.context.logger.debug(error.message);
  //   //   return fail({
  //   //     error,
  //   //   });
  //   // }
  // }
}
