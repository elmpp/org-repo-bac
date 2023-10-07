// import {xfs} from '@business-as-code/common'
import {
  addr,
  AddressDescriptorUnion,
  AddressPathAbsolute,
  AddressPathRelative,
  AddressType,
  assertIsAddressPathAbsolute,
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
// import { AddressCacheManager, type CacheEntry } from "./xfs-cache-manager";
import { BacError } from "@business-as-code/error";
import assert, { strict } from "assert";
import { constants } from "../constants";
import { MD4, MD5 } from "bun";
// export { CacheEntry };

type CacheEntry = {
  meta: {
    _base: AddressPathAbsolute;
    _namespaceBase: AddressPathAbsolute;
    main: AddressPathAbsolute;
  };
  // content: AddressPathAbsolute;
  // content: {
  //   _base: AddressPathAbsolute;
  //   _namespaceBase: AddressPathAbsolute;
  //   main: AddressPathAbsolute;
  // };
};
// export type CacheEntry<WithContent extends boolean> = WithContent extends true
//   ? Required<CacheEntryBase>
//   : CacheEntryBase;

type GetEntry = {
  // sourceAddress: AddressDescriptorUnion;
  contentPathRelative?: AddressPathRelative;
  contentPath: AddressPathAbsolute;
  metaPathRelative: AddressPathRelative;
  metaPath: AddressPathAbsolute;
  checksum: CacheKey;
  existentChecksum?: CacheKey;
  checksumValid: boolean;
};
// type GetEntry<WithContent extends boolean> = WithContent extends boolean
//   ? SetRequired<_GetEntry, "contentPath" | "contentPathRelative">
//   : _GetEntry;

export type Meta = {
  // destinationPath: AddressPathAbsolute;
  contentChecksum: CacheKey;
};

export type CacheSourceEntry = {
  // outputs: Outputs;
  // meta: Meta;
  contentPath?: AddressPathAbsolute;
  meta: Meta;
};

type Options = ServiceInitialiseCommonOptions & {
  metaBaseAddress: AddressPathAbsolute;
  // contentBaseAddress?: AddressPathAbsolute;
} & {
  createAttributes: (address: AddressDescriptorUnion) => {
    key: string;
    namespace?: string;
  };
};
export class AddressCacheManager {
  options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  static async initialise(options: Options) {
    const ins = new AddressCacheManager(options);
    return ins;
  }

  // /** using a contentPath, should be able to guess a namespace/key if within the rootPath */
  // protected async getCacheEntry(
  //   contentPath: AddressDescriptorUnion
  /** using a contentPath, should be able to guess a namespace/key if within the rootPath */
  protected async getCacheEntry(
    contentPath: AddressPathAbsolute
  ): Promise<CacheEntry> {

    // const theoreticalContentPath = addr.pathUtils.join(this.options.metaBaseAddress)

    // const cacheKeyAttributes = this.options.createAttributes(contentPath);
    const cacheKeyAttributes: {key: string; namespace?: string} = {
      key: fsUtils.sanitise(addr.pathUtils.basename(contentPath).addressNormalized + `_${Bun.hash(contentPath.addressNormalized)}`.substring(0, 5)),
      // namespace: 'lets just have flat meta files based on fs location of the meta' // ignore
    }

    this.validateAttributes(cacheKeyAttributes);

    const { key, namespace } = cacheKeyAttributes;

    // const key = fsUtils.sanitise(unsanitisedKey);
    // const namespace = fsUtils.sanitise(unsanitisedNamespace);

    // console.log(`cacheKeyAttributes, address :>> `, cacheKeyAttributes, contentPath)

    /** for xfs, these locations are deterministic; i.e. they won't be the result of a save (like for a db) */
    return {
      meta: {
        _base: addr.pathUtils.join(
          this.options.metaBaseAddress,
          namespace
            ? addr.parseAsType(namespace, "portablePathFilename")
            : undefined
          // addr.parseAsType(key, "portablePathFilename") // do not include namespace - for meta we want flat files
        ) as AddressPathAbsolute,
        _namespaceBase: addr.pathUtils.join(
          this.options.metaBaseAddress,
          namespace
            ? addr.parseAsType(namespace, "portablePathFilename")
            : undefined
        ) as AddressPathAbsolute,
        main: addr.pathUtils.join(
          this.options.metaBaseAddress,
          namespace
            ? addr.parseAsType(namespace, "portablePathFilename")
            : undefined,
          addr.parseAsType(key + ".json", "portablePathFilename")
          // addr.parseAsType("main.json", "portablePathFilename") // meta does keep it's data within here
        ) as AddressPathAbsolute,
      },
      // content: address,
      // content: assertIsAddressPathAbsolute(address) ? address : this.options.
      // content: {
      //   _base: addr.pathUtils.join(
      //     this.options.contentBaseAddress,
      //     namespace
      //       ? addr.parseAsType(namespace, "portablePathFilename")
      //       : undefined,
      //     addr.parseAsType(key, "portablePathFilename")
      //   ) as AddressPathAbsolute,
      //   _namespaceBase: addr.pathUtils.join(
      //     this.options.contentBaseAddress,
      //     namespace
      //       ? addr.parseAsType(namespace, "portablePathFilename")
      //       : undefined
      //   ) as AddressPathAbsolute,
      //   main: addr.pathUtils.join(
      //     this.options.contentBaseAddress,
      //     namespace
      //       ? addr.parseAsType(namespace, "portablePathFilename")
      //       : undefined,
      //     addr.parseAsType(key, "portablePathFilename")
      //     // addr.parseAsType("main", "portablePathFilename") // content does not need internal namespacing
      //   ) as AddressPathAbsolute,
      // },
    };
  }

  // async getAddress(options: {key: string, namespace?: string}): AddressPathAbsolute {

  // }

  /**
   This method provides the compatibility for other address types to be used
   */
   async createContentPaths({rootPath, address}: // key,
   // namespace,
   {
     rootPath: AddressPathAbsolute;
     address: AddressDescriptorUnion;
     // key: string;
     // namespace?: keyof AddressType;
   }): Promise<{
     absolute: AddressPathAbsolute;
     relative: AddressPathRelative;
     namespace: AddressPathAbsolute;
   }> {
    const { key, namespace } = this.options.createAttributes(address);
    const rcContentFilename = addr.parsePath(constants.RC_CONTENT_FOLDER)
    const namespaceAddress = addr.pathUtils.join(
      rootPath,
      rcContentFilename,
      namespace ? addr.parsePath(namespace) : undefined
    ) as AddressPathAbsolute;
    const relativeAddress = addr.pathUtils.join(
      rcContentFilename,
      namespace ? addr.parsePath(namespace) : undefined,
      addr.parsePath(key)
    ) as AddressPathRelative;
    const contentAddress = addr.pathUtils.join(
      namespaceAddress,
      addr.parsePath(key)
    ) as AddressPathAbsolute;

     await xfs.mkdirpPromise(namespaceAddress.address);
     return {
       relative: relativeAddress,
       absolute: contentAddress,
       namespace: namespaceAddress,
     };
   }

  /**
   This method provides the compatibility for other address types to be used
   */
  async primeContent(options: // key,
  // namespace,
  {
    rootPath: AddressPathAbsolute;
    address: AddressDescriptorUnion;
    // key: string;
    // namespace?: keyof AddressType;
  }) {
    const {namespace: namespacePath} = await this.createContentPaths(options)

    await xfs.mkdirpPromise(namespacePath.address);
  }

  /**
   Readies a cache location by creating a namespace only. Returns a path to the full location where client should create content
   This method provides the compatibility for other address types to be used
   */
  protected async primeMeta(cacheEntry: CacheEntry): Promise<void> {
    // const namespaceAddress = addr.pathUtils.join(
    //   rootPath,
    //   namespace ? addr.parsePath(namespace) : undefined
    // );
    // const contentAddress = addr.pathUtils.join(
    //   namespaceAddress,
    //   addr.parsePath(key)
    // ) as AddressPathAbsolute;
    await xfs.mkdirpPromise(cacheEntry.meta._namespaceBase.address);
    // return contentAddress;
  }

  /** all params required in order to compute checksum */
  async get(options: {
    /** this should be the contentPath; i.e. the destination path. Source path is known to client */
    address: AddressPathAbsolute;
    // address: AddressDescriptorUnion;
    // address: AddressOtherCache;
    // key: string;
    // namespace?: string;
    cacheOptions: FetchOptions["cacheOptions"];
    // expectedChecksum: string;
    createChecksum: (options: {
      existentChecksum?: CacheKey;
      /** path to the content in the cache, if found */
      contentPath: AddressPathAbsolute;
    }) => Promise<CacheKey>;
    /** if content exists + valid meta record held */
    onHit: (options: {
      existentChecksum: CacheKey;
      contentPath: AddressPathAbsolute;
    }) => void;
    /** if content exists + invalid meta record held */
    onStale: (options: {
      message: string;
      /** undefined when content first created */
      existentChecksum?: CacheKey;
      /** path to the content in the cache. Stale means it exists */
      contentPath: AddressPathAbsolute;
    }) => void;
    /** if content does not exist */
    onMiss: (options: {
      contentPath: AddressPathAbsolute; // where it should be
    }) => Promise<void>;
  }): Promise<Result<GetEntry, { error: BacError }>> {

    const { address: contentPath, createChecksum, onHit, onMiss, onStale } = options;
    if (!contentPath.type) {
      throw new Error(`address has no type: ${JSON.stringify(contentPath)}`);
    }

    // const cacheKeyAttributes = this.options.createAttributes(address);
// console.log(`contentPath :>> `, contentPath)

    // const cacheEntry = await this.getCacheEntry(contentPath);

    // await this.primeMeta(cacheEntry);
    const cacheEntry = await this.getCacheEntry(contentPath);

    await this.primeMeta(cacheEntry);

    const meta = await this.getMeta(cacheEntry);

    let checksum: CacheKey;
    let checksumValid: boolean = false;

    const hasMeta = await this._hasMeta(cacheEntry);
    const hasContent = await this._hasContent(contentPath);

    const updateCacheEntry = async (options: {
      cacheEntry: CacheEntry;
      checksum: CacheKey;
    }) => {

      await this.set({
        // ...cacheKeyAttributes,
        cacheEntry,
        sourceEntry: {
          contentPath,
          meta: {
            contentChecksum: checksum,
          },
        },
      });
    };

    const doFetch = async () => {
      // await this.prime(cacheEntry);

      /** special case - we class this as a stale situation where checksum should be created */
      if (!hasMeta && hasContent) {
        await onStale({
          message: `Appears that this is the first time indexing existent content`,
          existentChecksum: undefined,
          contentPath,
        });
        checksum = await createChecksum({
          existentChecksum: undefined,
          contentPath,
        });

        checksumValid = true;

        await updateCacheEntry({
          cacheEntry,
          checksum,
        });
      } else if (!hasMeta && !hasContent) {
        await onMiss({
          contentPath,
        });

        checksum = await createChecksum({
          existentChecksum: undefined,
          contentPath,
        });

        checksumValid = true; // checksum valid means whether we're ok to trust it

        await updateCacheEntry({
          cacheEntry,
          checksum,
        });
      } else {
        assert(meta);
        // how to do checksum checks?

        checksum = await createChecksum({
          existentChecksum: meta.contentChecksum,
          contentPath,
        });
        const checksumMatchRes = await this.checksumMatch({
          prevChecksum: meta.contentChecksum,
          nextChecksum: checksum,
          cacheEntry,
          contentPath,
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
            contentPath,
          });
        } else {
          checksumValid = true;
          await onHit({
            existentChecksum: meta.contentChecksum,
            contentPath,
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
    //         srcAddress: cacheEntry.content,
    //         destAddress: cacheEntry.content,
    //         options: { strict: true },
    //       } :>> `, {
    //         srcAddress: this.options.contentBaseAddress,
    //         destAddress: cacheEntry.content,
    //         options: { strict: true },
    //       })

    return ok({
      // sourceAddress: address,
      // contentPathRelative: (cacheEntry.content
      //   ? addr.pathUtils.relative({
      //       srcAddress: this.options.contentBaseAddress!,
      //       destAddress: cacheEntry.content,
      //       options: { strict: true },
      //     })
      //   : undefined)!, // not always the case, obvs
      contentPath,
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

    // const possiblyStaleEntry = await this.addressCacheManager

    // if (cacheEntry) {
    //   return ok({ contentPath.main, checksum: 'blah' });
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

  // ----------------------

  // async hasMeta(address: AddressDescriptorUnion) {
  //   return this._hasMeta(await this.getCacheEntry(address))
  // }
  async hasMeta(address: AddressPathAbsolute) {
    return this._hasMeta(await this.getCacheEntry(address))
  }
  async hasContent(address: AddressPathAbsolute) {
    return this._hasContent(address)
  }

  protected async _hasMeta(cacheEntry: CacheEntry) {
    // const cacheEntry = await this.getCacheEntry({ key, namespace });

    // const hasContent =
    //   cacheEntry.content &&
    //   (await xfs.existsPromise(cacheEntry.content.address));
    const hasMeta = !!(await xfs.existsPromise(cacheEntry.meta.main.address));

    // if (
    //   Boolean(hasContent) !== Boolean(hasMeta) // XOR
    //   // Boolean(hasContent) !== Boolean(hasMeta) // XOR
    // ) {
    //   throw new Error(
    //     `AddressCacheManager corruption: uncoupled state '${JSON.stringify(
    //       cacheEntry, null, 2
    //     )}'. hasContent: '${hasContent}', hasMeta: '${hasMeta}'`
    //   );
    // }
    // return hasContent && hasMeta;
    return hasMeta;
  }

  protected async _hasContent(contentPath: AddressPathAbsolute) {
    const res = await xfs.existsPromise(contentPath.address)
    return !!(await xfs.existsPromise(contentPath.address));
  }

  // protected async hasNamespace({ namespace }: { namespace: string }) {
  //   const cacheEntry = await this.getCacheEntry({ key: "dummy", namespace });

  //   return xfs.existsPromise(cacheEntry.meta._namespaceBase.address);
  // }

  protected validateAttributes({
    key,
    namespace,
  }: {
    key: string;
    namespace?: string;
  }) {
    const sanitisedKey = fsUtils.sanitise(key);
    const sanitisedNamespace = fsUtils.sanitise(namespace || "");

    if (
      sanitisedKey !== key ||
      (namespace && sanitisedNamespace !== namespace)
    ) {
      throw new Error(
        `AddressCacheManager attributes not sanitised sufficiently for filesystem storage. key: '${key}', namespace: '${namespace}' vs sanitised '${sanitisedKey}', namespace: '${sanitisedNamespace}'`
      );
    }
  }

  protected async set({
    cacheEntry,
    contentPath,
    sourceEntry,
  }: {
    cacheEntry: CacheEntry;
    contentPath?: AddressPathAbsolute;
    sourceEntry: CacheSourceEntry;
  }) {
    if (
      sourceEntry.contentPath &&
      contentPath && contentPath.addressNormalized !==
        sourceEntry.contentPath.addressNormalized
    ) {
      AddressCacheManager.copyContent({
        sourcePath: sourceEntry.contentPath,
        destinationPath: contentPath,
      });
    }
    await xfs.writeFilePromise(
      cacheEntry.meta.main.address,
      JSON.stringify(sourceEntry.meta),
      "utf-8"
    );

    return cacheEntry;
  }

  // async remove(cacheEntry: CacheEntry) {
  //   // await xfs.removePromise(cacheEntry.outputs._base.address);
  //   cacheEntry.content &&
  //     (await xfs.removePromise(cacheEntry.content.address));
  //   await xfs.removePromise(cacheEntry.meta._base.address);
  //   return this;
  // }
  // async removeNamespace({ namespace }: { namespace: string }) {
  //   const cacheEntry = await this.getCacheEntry({ key: "dummy", namespace });
  //   console.log(`removing namespace  :>> `, namespace);
  //   // await xfs.removePromise(cacheEntry.outputs._namespaceBase.address);
  //   cacheEntry.content &&
  //     (await xfs.removePromise(cacheEntry.content._namespaceBase.address));
  //   await xfs.removePromise(cacheEntry.meta._namespaceBase.address);

  //   return this;
  // }

  // async clearAll() {
  //   // await xfs.removePromise(this.options.outputsBaseAddress.address);
  //   this.options.contentBaseAddress &&
  //     (await xfs.removePromise(this.options.contentBaseAddress.address));
  //   await xfs.removePromise(this.options.metaBaseAddress.address);
  //   return this;
  // }

  // /** sets up a cache location */
  // async prime(cacheEntry: CacheEntry): Promise<AddressPathAbsolute {
  //   // await xfs.mkdirpPromise(
  //   //   addr.pathUtils.dirname(cacheEntry.outputs.stdout).address
  //   // );
  //   // await xfs.mkdirpPromise(
  //   //   addr.pathUtils.dirname(cacheEntry.outputs.stderr).address
  //   // );
  //   cacheEntry.content &&
  //     (await xfs.mkdirpPromise(cacheEntry.content.address));

  //     console.log(`cacheEntry :>> `, cacheEntry)
  //   await xfs.mkdirpPromise(cacheEntry.meta._base.address);
  // }

  // async getCacheEntry({
  //   key,
  //   namespace,
  // }: {
  //   key: string;
  //   namespace?: string;
  // }): Promise<CacheEntry> {
  //   this.validateAttributes({ key, namespace });
  //   // const key = fsUtils.sanitise(unsanitisedKey);
  //   // const namespace = fsUtils.sanitise(unsanitisedNamespace);

  //   /** for xfs, these locations are deterministic; i.e. they won't be the result of a save (like for a db) */
  //   const base = {
  //     // outputs: {
  //     //   _base: addr.pathUtils.join(
  //     //     this.options.outputsBaseAddress,
  //     //     addr.parseAsType(namespace, "portablePathFilename"),
  //     //     addr.parseAsType(key, "portablePathFilename")
  //     //   ) as AddressPathAbsolute,
  //     //   _namespaceBase: addr.pathUtils.join(
  //     //     this.options.outputsBaseAddress,
  //     //     addr.parseAsType(namespace, "portablePathFilename")
  //     //   ) as AddressPathAbsolute,
  //     //   stdout: addr.pathUtils.join(
  //     //     this.options.outputsBaseAddress,
  //     //     addr.parseAsType(namespace, "portablePathFilename"),
  //     //     addr.parseAsType(key, "portablePathFilename"),
  //     //     addr.parseAsType("unformatted", "portablePathFilename")
  //     //   ) as AddressPathAbsolute,
  //     //   stderr: addr.pathUtils.join(
  //     //     this.options.outputsBaseAddress,
  //     //     addr.parseAsType(namespace, "portablePathFilename"),
  //     //     addr.parseAsType(key, "portablePathFilename"),
  //     //     addr.parseAsType("formatted", "portablePathFilename")
  //     //   ) as AddressPathAbsolute,
  //     // },
  //     meta: {
  //       _base: addr.pathUtils.join(
  //         this.options.metaBaseAddress,
  //         namespace
  //           ? addr.parseAsType(namespace, "portablePathFilename")
  //           : undefined,
  //         // addr.parseAsType(key, "portablePathFilename") // do not include namespace - for meta we want flat files
  //       ) as AddressPathAbsolute,
  //       _namespaceBase: addr.pathUtils.join(
  //         this.options.metaBaseAddress,
  //         namespace
  //           ? addr.parseAsType(namespace, "portablePathFilename")
  //           : undefined
  //       ) as AddressPathAbsolute,
  //       main: addr.pathUtils.join(
  //         this.options.metaBaseAddress,
  //         namespace
  //           ? addr.parseAsType(namespace, "portablePathFilename")
  //           : undefined,
  //         addr.parseAsType(key + '.json', "portablePathFilename"),
  //         // addr.parseAsType("main.json", "portablePathFilename") // meta does keep it's data within here
  //       ) as AddressPathAbsolute,
  //     },
  //     content: undefined,
  //   } as CacheEntry;

  //   if (this.options.contentBaseAddress) {
  //     return {
  //       ...base,
  //       content: {
  //         _base: addr.pathUtils.join(
  //           this.options.contentBaseAddress,
  //           namespace
  //             ? addr.parseAsType(namespace, "portablePathFilename")
  //             : undefined,
  //           addr.parseAsType(key, "portablePathFilename")
  //         ) as AddressPathAbsolute,
  //         _namespaceBase: addr.pathUtils.join(
  //           this.options.contentBaseAddress,
  //           namespace
  //             ? addr.parseAsType(namespace, "portablePathFilename")
  //             : undefined
  //         ) as AddressPathAbsolute,
  //         main: addr.pathUtils.join(
  //           this.options.contentBaseAddress,
  //           namespace
  //             ? addr.parseAsType(namespace, "portablePathFilename")
  //             : undefined,
  //           addr.parseAsType(key, "portablePathFilename")
  //           // addr.parseAsType("main", "portablePathFilename") // content does not need internal namespacing
  //         ) as AddressPathAbsolute,
  //       },
  //     } as CacheEntry;
  //   }
  //   return base;
  // }

  // async has(address: AddressDescriptorUnion): Promise<boolean | undefined> {
  //   const cacheKeyAttributes = this.getCacheManagerAttributes({ address });
  //   return this.has(cacheKeyAttributes);
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
  //     contentPath: WithContent extends true ? AddressPathAbsolute : undefined;
  //   }) => void;
  //   /** content not found for key/namespace */
  //   // onMiss: () => void,
  //   onStale: (options: {
  //     message: string;
  //     existentChecksum: CacheKey;
  //     /** path to the content in the cache. Stale means it exists */
  //     contentPath: WithContent extends true ? AddressPathAbsolute : undefined;
  //   }) => void;
  //   /** content found for key/namespace but checksum fail */
  //   // onChecksumFail: (options: {existentChecksum: CacheKey}) => void,
  //   /** existentChecksum denotes if content present already */

  //   /** we do not hold a record for this - i.e. no meta. Not called when options.contentBase not supplied */
  //   onMiss: (options: {
  //     /** path to the content in the cache, if found */
  //     contentPath: WithContent extends true ? AddressPathAbsolute : undefined;
  //   }) => Promise<void>;
  // }): Promise<Result<GetEntry<WithContent>, { error: BacError }>> {
  //   const { address, createChecksum, onHit, onMiss, onStale } = options;
  //   if (!address.type) {
  //     throw new Error(`address has no type: ${JSON.stringify(address)}`);
  //   }

  //   const cacheKeyAttributes = this.options.createAttributes(address);

  //   const cacheEntry = await this.getCacheEntry(
  //     cacheKeyAttributes
  //   );
  //   const meta = await this.getMeta(cacheKeyAttributes);
  //   let checksum: CacheKey;
  //   let checksumValid: boolean = false;

  //   const hasEntry = await this.has(cacheKeyAttributes);

  //   const updateCacheEntry = async (options: {
  //     cacheEntry: CacheEntry;
  //     checksum: CacheKey;
  //   }) => {
  //     await this.set({
  //       ...cacheKeyAttributes,
  //       sourceEntry: {
  //         contentPath,
  //         meta: {
  //           contentChecksum: checksum,
  //         },
  //       },
  //     });
  //   };

  //   const doFetch = async () => {
  //     await this.prime(cacheEntry);

  //     if (!hasEntry) {
  //       await onMiss({
  //         // @ts-expect-error: conditional meh
  //         contentPath: (cacheEntry.content ??
  //           (address as AddressPathAbsolute))!,
  //       });
  //       checksum = await createChecksum({
  //         existentChecksum: undefined,
  //         contentPath,
  //       });

  //       checksumValid = true; // checksum valid means whether we're ok to trust it

  //       // const checksumMatchRes = await this.checksumMatch({
  //       //   prevChecksum: undefined,
  //       //   nextChecksum: checksum,
  //       //   cacheEntry,
  //       // });

  //       await updateCacheEntry({
  //         cacheEntry,
  //         checksum,
  //       });
  //     } else {
  //       assert(meta);
  //       // how to do checksum checks?

  //       checksum = await createChecksum({
  //         existentChecksum: meta.contentChecksum,
  //         contentPath,
  //       });
  //       const checksumMatchRes = await this.checksumMatch({
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
  //           // @ts-expect-error: conditional meh
  //           contentPath,
  //         });
  //       } else {
  //         checksumValid = true;
  //         await onHit({
  //           existentChecksum: meta.contentChecksum,
  //           // @ts-expect-error: conditional meh
  //           contentPath,
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

  //   // console.log(`cacheEntry :>> `, cacheEntry.content);
  //   // console.log(`{
  //   //         srcAddress: cacheEntry.content,
  //   //         destAddress: cacheEntry.content,
  //   //         options: { strict: true },
  //   //       } :>> `, {
  //   //         srcAddress: this.options.contentBaseAddress,
  //   //         destAddress: cacheEntry.content,
  //   //         options: { strict: true },
  //   //       })

  //   return ok({
  //     sourceAddress: address,
  //     contentPathRelative: (cacheEntry.content
  //       ? addr.pathUtils.relative({
  //           srcAddress: this.options.contentBaseAddress!,
  //           destAddress: cacheEntry.content,
  //           options: { strict: true },
  //         })
  //       : undefined)!, // not always the case, obvs
  //     contentPath, // not always the case, obvs
  //     metaPathRelative: addr.pathUtils.relative({
  //       srcAddress: this.options.metaBaseAddress!,
  //       destAddress: cacheEntry.meta.main,
  //       options: { strict: true },
  //     }),
  //     metaPath: cacheEntry.meta.main,
  //     checksum: checksum!,
  //     existentChecksum: meta?.contentChecksum,
  //     checksumValid,
  //   });

  //   // const possiblyStaleEntry = await this.addressCacheManager

  //   // if (cacheEntry) {
  //   //   return ok({ contentPath.main, checksum: 'blah' });
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

  protected async checksumMatch({
    prevChecksum,
    nextChecksum,
    cacheEntry,
    contentPath,
  }: {
    prevChecksum?: CacheKey;
    nextChecksum: CacheKey;
    cacheEntry: CacheEntry;
    contentPath: AddressPathAbsolute;
  }): Promise<Result<true, { error: Error }>> {
    // if (!prevChecksum) return fail(false);
    if (prevChecksum?.globalVersion !== nextChecksum.globalVersion) {
      return fail({
        error: new Error(
          `Checksum miss: global keys do not match. This normally happens following a global cache invalidation. Existing: '${
            prevChecksum ? AddressCacheManager.debugCacheKey(prevChecksum) : "n/a"
          }', expected: '${
            nextChecksum ? AddressCacheManager.debugCacheKey(nextChecksum) : "n/a"
          }' when validating cache entry '${
            contentPath.original ?? "n/a"
          }'`
        ),
      });
    }
    if (prevChecksum.key !== nextChecksum.key) {
      return fail({
        error: new Error(
          `Checksum miss: checksum keys do not match. Existing: '${
            prevChecksum ? AddressCacheManager.debugCacheKey(prevChecksum) : "n/a"
          }', expected: '${
            nextChecksum ? AddressCacheManager.debugCacheKey(nextChecksum) : "n/a"
          }' when validating cache entry '${
            contentPath.original ?? "n/a"
          }'`
        ),
      });
    }
    return ok(true);
  }

  static debugCacheKey(cacheKey: CacheKey): string {
    return `${cacheKey.globalVersion}::${cacheKey.key}`;
  }

  protected async getMeta(cacheEntry: CacheEntry): Promise<Meta | undefined> {
    // const cacheEntry = await this.getCacheEntry({ key, namespace });

    const tryGetMeta = async (
      path: AddressPathAbsolute
    ): Promise<Meta | undefined> => {
      if (await xfs.existsPromise(path.address)) {
        const parsed = JSONParse(
          await xfs.readFilePromise(path.address, "utf-8")
        ) as Meta;
        return parsed;
      }
      return undefined;
    };

    try {
      const meta = await tryGetMeta(cacheEntry.meta.main);
      return meta;
    } catch (err) {
      return undefined;
    }

    // const valCount = Object.values(ret).filter((o) => o !== undefined).length;
    // if (valCount > 0 && valCount < 1) {
    //   throw new Error(
    //     `Meta non-atomic error. Only '${valCount}' metas found. CacheEntry: '${require("util").inspect(
    //       cacheEntry,
    //       { showHidden: false, depth: 2, colors: true }
    //     )}'`
    //   );
    // }
    // if (valCount !== 1) {
    //   return;
    // }
    // return ret;
  }

  /**
   Recommended way to copy content into a cache location. It uses the source location as a hint to whether the content
   is created as a file or a directory
   */
  static async copyContent({
    sourcePath,
    destinationPath,
  }: {
    sourcePath: AddressPathAbsolute;
    /** destinationPath here must be the full absolute path to the desired place, be it a directory or a file */
    destinationPath: AddressPathAbsolute;
  }) {
    // if (!(await xfs.existsPromise(sourcePath.address))) {
    //   throw new Error(
    //     `Unable to copy non-existent content from '${sourcePath.original}' -> '${destinationPath.original}'`
    //   );
    // }
    const sourceStat = await xfs.lstatPromise(sourcePath.address);
    if (!sourceStat) {
      throw new Error(
        `Unable to copy non-existent content from '${sourcePath.original}' -> '${destinationPath.original}'`
      );
    }

    const sourcePathWildcarded = sourceStat.isDirectory()
      ? (`${sourcePath.address}/*` as PortablePath)
      : sourcePath.address;

    await xfs.copyPromise(destinationPath.address, sourcePathWildcarded, {
      overwrite: false,
    });
  }
}
