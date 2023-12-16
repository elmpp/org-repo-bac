// import {xfs} from '@business-as-code/common'
import { addr, AddressPathAbsolute } from "@business-as-code/address";
import { PortablePath, xfs } from "@business-as-code/fslib";
// import { fsUtils } from "./utils";
import { JSONParse } from "../utils/format-utils";
import { CacheKey, fail, ok, Result } from "../__types__";
import { fsUtils } from "../utils";

export type Meta = {
  // destinationPath: AddressPathAbsolute;
  contentChecksum: CacheKey;
};

/**
 Represents the location of a cache unit. The term 'unit' here is some measure of (stream) output + FS artifacts.
 It may be part of a larger process, e.g. only for a specific package within a repo-wide task

 Locations are done as Address to allow string typing and abstracting of content manipulation
 */
type CacheEntryBase = {
  meta: {
    _base: AddressPathAbsolute;
    _namespaceBase: AddressPathAbsolute;
    main: AddressPathAbsolute;
  };
  content?: {
    _base: AddressPathAbsolute;
    _namespaceBase: AddressPathAbsolute;
    main: AddressPathAbsolute;
  };
};
export type CacheEntry<WithContent extends boolean> = WithContent extends true
  ? Required<CacheEntryBase>
  : CacheEntryBase;

export type CacheSourceEntry = {
  // outputs: Outputs;
  // meta: Meta;
  contentPath?: AddressPathAbsolute;
  meta: Meta;
};

// type S = false
// type DD1 = true extends S ? true : false
// type DD2 = S extends true ? true : false

// type CacheOutputsAddress<TAddressDescriptor extends AddressDescriptorUnion> = {
//   _base: TAddressDescriptor; // enclosing structure for the outputs cache entry's output values (includes key)
//   _namespaceBase: TAddressDescriptor; // enclosing structure for the all output cache entries of a namespace (includes key)
//   unformatted: TAddressDescriptor;
//   formatted: TAddressDescriptor;
//   error: TAddressDescriptor;
// };
// type CacheContentAddress<TAddressDescriptor extends AddressDescriptorUnion> = {
//   _base: TAddressDescriptor; // enclosing structure for the content cache entry's content value (includes key)
//   _namespaceBase: TAddressDescriptor; // enclosing structure for the all content cache entries of a namespace (includes key)
//   main: TAddressDescriptor | undefined; // perhaps in future include any compression within schemes
// };

// type Options<TAddressName extends keyof AddressType> = {contentBaseAddress: AddressDescriptor<TAddressName>, outputsBaseAddress: AddressDescriptor<TAddressName>}
type Options = {
  metaBaseAddress: AddressPathAbsolute;
  contentBaseAddress?: AddressPathAbsolute;
};
// export type Options<WithContent extends boolean> = WithContent extends true ? OptionsBase : Omit<OptionsBase, 'contentBaseAddress'>;

/**
 XfsCacheManager is a lower level cache manager implementation. It appears unused ATM!!!
 */
export class XfsCacheManager<WithContent extends boolean> {
  options: Options;

  constructor(options: Options) {
    this.options = options;
  }

  static async initialise<WithContent extends boolean>(
    options: Options
  ): Promise<XfsCacheManager<WithContent>> {
    // static async initialise(options: Options<false>): Promise<XfsCacheManager<false>>
    // static async initialise(options: Options<true>): Promise<XfsCacheManager<true>>
    // static async initialise(options: Options<boolean>): Promise<XfsCacheManager<boolean>> {
    // const outputsLocationExists = await xfs.existsPromise(
    //   options.outputsBaseAddress.address
    // );
    // if (!outputsLocationExists) {
    //   await xfs.mkdirpPromise(options.outputsBaseAddress.address);
    // }

    if (options.contentBaseAddress) {
      const contentLocationExists = await xfs.existsPromise(
        options.contentBaseAddress.address
      );
      if (!contentLocationExists) {
        await xfs.mkdirpPromise(options.contentBaseAddress.address);
      }
    }
    const metaLocationExists = await xfs.existsPromise(
      options.metaBaseAddress.address
    );
    if (!metaLocationExists) {
      await xfs.mkdirpPromise(options.metaBaseAddress.address);
    }



    return new XfsCacheManager(options);
  }

  async checksumMatch({
    prevChecksum,
    nextChecksum,
    cacheEntry,
  }: {
    prevChecksum?: CacheKey;
    nextChecksum: CacheKey;
    cacheEntry: CacheEntry<WithContent>;
  }): Promise<Result<true, { error: Error }>> {
    // if (!prevChecksum) return fail(false);
    if (prevChecksum?.globalVersion !== nextChecksum.globalVersion) {
      return fail({
        error: new Error(
          `Checksum miss: global keys do not match. This normally happens following a global cache invalidation. Existing: '${prevChecksum.toString()}', expected: '${nextChecksum.toString()}' when validating cache entry '${
            cacheEntry.content?._base ?? "n/a"
          }'`
        ),
      });
    }
    if (prevChecksum.key !== nextChecksum.key) {
      return fail({
        error: new Error(
          `Checksum miss: checksum keys do not match. Existing: '${prevChecksum.toString()}', expected: '${nextChecksum.toString()}' when validating cache entry '${
            cacheEntry.content?._base ?? "n/a"
          }'`
        ),
      });
    }
    return ok(true);
  }

  // async getOutputs({ key, namespace }: { key: string; namespace?: string }) {
  //   const cacheEntry = await this.getCacheEntry({ key, namespace });
  //   const tryGetOutput = async (
  //     path: AddressPathAbsolute
  //   ): Promise<string | undefined> => {
  //     if (await xfs.existsPromise(path.address)) {
  //       return await xfs.readFilePromise(path.address, "utf8");
  //     }
  //   };
  //   const ret: Outputs = {
  //     stdout: (await tryGetOutput(cacheEntry.outputs.stdout))!,
  //     stderr: (await tryGetOutput(cacheEntry.outputs.stderr))!,
  //     // unformatted: (await tryGetOutput(cacheEntry.outputs.unformatted))!,
  //     // formatted: (await tryGetOutput(cacheEntry.outputs.formatted))!,
  //     // error: (await tryGetOutput(cacheEntry.outputs.error))!,
  //     // user: (await tryGetOutput(cacheEntry.outputs.user))!,
  //   };
  //   const valCount = Object.values(ret).filter((o) => o !== undefined).length;
  //   if (valCount > 0 && valCount < 4) {
  //     throw new Error(
  //       `Outputs non-atomic error. Only '${valCount}' outputs found. CacheEntry: '${require("util").inspect(
  //         cacheEntry,
  //         { showHidden: false, depth: 2, colors: true }
  //       )}'`
  //     );
  //   }
  //   if (valCount !== 4) {
  //     return;
  //   }
  //   return ret;
  // }
  async getMeta({
    key,
    namespace,
  }: {
    key: string;
    namespace?: string;
  }): Promise<Meta | undefined> {
    const cacheEntry = await this.getCacheEntry({ key, namespace });

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
  async copyContent({
    key,
    namespace,
    destinationPath,
  }: {
    key: string;
    namespace: string;
    destinationPath: AddressPathAbsolute;
  }) {
    const cacheEntry = await this.getCacheEntry({ key, namespace });
    if (!this.options.contentBaseAddress) {
      throw new Error(
        `XfsCacheManager::copyContent has no content base directory configured`
      );
    }

    await xfs.mkdirpPromise(destinationPath.address);
    cacheEntry.content &&
      (await xfs.copyPromise(
        destinationPath.address,
        `${cacheEntry.content.main.address}/*` as PortablePath,
        { overwrite: true }
      ));
    // await copyPromise({
    //   source: `${cacheEntry.content.main.address}/*` as PortablePath,
    //   destination: destinationPath.address,
    //   options: {mode: 'overwriteIfExistent'},
    // })
    return this;
  }

  async has({ key, namespace }: { key: string; namespace?: string }) {
    const cacheEntry = await this.getCacheEntry({ key, namespace });

    const hasContent =
      cacheEntry.content &&
      (await xfs.existsPromise(cacheEntry.content._base.address));
    const hasMeta = await xfs.existsPromise(cacheEntry.meta.main.address);
    if (
      this.options.contentBaseAddress &&
      Boolean(hasContent) !== Boolean(hasMeta)
    ) {
      throw new Error(
        `XFSCacheManager corruption: uncoupled state '${JSON.stringify(
          cacheEntry
        )}'. hasContent: '${hasContent}', hasMeta: '${hasMeta}'`
      );
    }
    // return hasContent && hasMeta;
    return hasMeta;
  }
  async hasNamespace({ namespace }: { namespace: string }) {
    const cacheEntry = await this.getCacheEntry({ key: "dummy", namespace });

    return xfs.existsPromise(cacheEntry.meta._namespaceBase.address);
  }

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
        `xfsCacheManager attributes not sanitised sufficiently for filesystem storage. key: '${key}', namespace: '${namespace}' vs sanitised '${sanitisedKey}', namespace: '${sanitisedNamespace}'`
      );
    }
  }

  async set({
    key,
    namespace,
    sourceEntry,
  }: {
    key: string;
    namespace?: string;
    sourceEntry: CacheSourceEntry;
  }) {
    this.validateAttributes({
      key,
      namespace,
    });

    const cacheEntry = await this.getCacheEntry({ key, namespace });
    // // meta
    // await xfs.mkdirpPromise(
    //   addr.pathUtils.dirname(cacheEntry.meta.destinationPath).address
    // );
    // await xfs.writeFilePromise(
    //   cacheEntry.meta.destinationPath.address,
    //   sourceEntry.meta.destinationPath.address,
    //   { encoding: "utf8" }
    // );

    // console.log(`cacheEntry :>> `, cacheEntry)

    await this.prime(cacheEntry);

    // outputs
    // await xfs.mkdirpPromise(
    //   addr.pathUtils.dirname(cacheEntry.outputs.stdout).address
    // );
    // await xfs.writeFilePromise(
    //   cacheEntry.outputs.stdout.address,
    //   sourceEntry.outputs.stdout,
    //   { encoding: "utf8" }
    // );
    // // await xfs.mkdirpPromise(
    // //   addr.pathUtils.dirname(cacheEntry.outputs.stderr).address
    // // );
    // await xfs.writeFilePromise(
    //   cacheEntry.outputs.stderr.address,
    //   sourceEntry.outputs.stderr,
    //   { encoding: "utf8" }
    // );

    // console.log(`sourceEntry, cacheEntry :>> `, sourceEntry, cacheEntry)

    // if (sourceEntry.content) {
    // await xfs.mkdirpPromise(cacheEntry.content.main.address);

    // console.log(`cacheEntry.content.main.addressNormalized !== sourceEntry.contentPath.addressNormalized :>> `, cacheEntry.content.main.addressNormalized, sourceEntry.contentPath.addressNormalized, cacheEntry.content.main.addressNormalized === sourceEntry.contentPath.addressNormalized)
    // allow content to be directly added already to destination
    // if (cacheEntry.content.main.addressNormalized !== sourceEntry.contentPath.addressNormalized) {
    if (
      this.options.contentBaseAddress &&
      sourceEntry.contentPath &&
      cacheEntry.content &&
      cacheEntry.content.main.addressNormalized !==
        sourceEntry.contentPath.addressNormalized
    ) {
      await xfs.copyPromise(
        cacheEntry.content.main.address,
        `${sourceEntry.contentPath.address}/*` as PortablePath,
        { overwrite: true }
      );
    }
    await xfs.writeFilePromise(
      cacheEntry.meta.main.address,
      JSON.stringify(sourceEntry.meta),
      "utf-8"
    );

    // await copyPromise({
    //   source: `${sourceEntry.content.address}/*` as PortablePath,
    //   destination: cacheEntry.content.main.address,
    //   options: {mode: 'overwriteIfExistent'},
    // })
    // }

    return cacheEntry;
  }

  async remove(cacheEntry: CacheEntry<WithContent>) {
    // await xfs.removePromise(cacheEntry.outputs._base.address);
    cacheEntry.content &&
      (await xfs.removePromise(cacheEntry.content._base.address));
    await xfs.removePromise(cacheEntry.meta._base.address);
    return this;
  }
  async removeNamespace({ namespace }: { namespace: string }) {
    const cacheEntry = await this.getCacheEntry({ key: "dummy", namespace });
    console.log(`removing namespace  :>> `, namespace);
    // await xfs.removePromise(cacheEntry.outputs._namespaceBase.address);
    cacheEntry.content &&
      (await xfs.removePromise(cacheEntry.content._namespaceBase.address));
    await xfs.removePromise(cacheEntry.meta._namespaceBase.address);

    return this;
  }

  async clearAll() {
    // await xfs.removePromise(this.options.outputsBaseAddress.address);
    this.options.contentBaseAddress &&
      (await xfs.removePromise(this.options.contentBaseAddress.address));
    await xfs.removePromise(this.options.metaBaseAddress.address);
    return this;
  }

  /** sets up a cache location */
  async prime(cacheEntry: CacheEntry<WithContent>) {
    // await xfs.mkdirpPromise(
    //   addr.pathUtils.dirname(cacheEntry.outputs.stdout).address
    // );
    // await xfs.mkdirpPromise(
    //   addr.pathUtils.dirname(cacheEntry.outputs.stderr).address
    // );
    cacheEntry.content &&
      (await xfs.mkdirpPromise(cacheEntry.content._base.address));
    await xfs.mkdirpPromise(cacheEntry.meta._base.address);
  }

  async getCacheEntry({
    key,
    namespace,
  }: {
    key: string;
    namespace?: string;
  }): Promise<CacheEntry<WithContent>> {

    this.validateAttributes({key, namespace})
    // const key = fsUtils.sanitise(unsanitisedKey);
    // const namespace = fsUtils.sanitise(unsanitisedNamespace);

    /** for xfs, these locations are deterministic; i.e. they won't be the result of a save (like for a db) */
    const base = {
      // outputs: {
      //   _base: addr.pathUtils.join(
      //     this.options.outputsBaseAddress,
      //     addr.parseAsType(namespace, "portablePathFilename"),
      //     addr.parseAsType(key, "portablePathFilename")
      //   ) as AddressPathAbsolute,
      //   _namespaceBase: addr.pathUtils.join(
      //     this.options.outputsBaseAddress,
      //     addr.parseAsType(namespace, "portablePathFilename")
      //   ) as AddressPathAbsolute,
      //   stdout: addr.pathUtils.join(
      //     this.options.outputsBaseAddress,
      //     addr.parseAsType(namespace, "portablePathFilename"),
      //     addr.parseAsType(key, "portablePathFilename"),
      //     addr.parseAsType("unformatted", "portablePathFilename")
      //   ) as AddressPathAbsolute,
      //   stderr: addr.pathUtils.join(
      //     this.options.outputsBaseAddress,
      //     addr.parseAsType(namespace, "portablePathFilename"),
      //     addr.parseAsType(key, "portablePathFilename"),
      //     addr.parseAsType("formatted", "portablePathFilename")
      //   ) as AddressPathAbsolute,
      // },
      meta: {
        _base: addr.pathUtils.join(
          this.options.metaBaseAddress,
          namespace ? addr.parseAsType(namespace, "portablePathFilename") : undefined,
          addr.parseAsType(key, "portablePathFilename")
        ) as AddressPathAbsolute,
        _namespaceBase: addr.pathUtils.join(
          this.options.metaBaseAddress,
          namespace ? addr.parseAsType(namespace, "portablePathFilename") : undefined,
        ) as AddressPathAbsolute,
        main: addr.pathUtils.join(
          this.options.metaBaseAddress,
          namespace ? addr.parseAsType(namespace, "portablePathFilename") : undefined,
          addr.parseAsType(key, "portablePathFilename"),
          addr.parseAsType("main.json", "portablePathFilename") // meta does keep it's data within here
        ) as AddressPathAbsolute,
      },
      content: undefined,
    } as CacheEntry<WithContent>;

    if (this.options.contentBaseAddress) {
      return {
        ...base,
        content: {
          _base: addr.pathUtils.join(
            this.options.contentBaseAddress,
            namespace ? addr.parseAsType(namespace, "portablePathFilename") : undefined,
            addr.parseAsType(key, "portablePathFilename")
          ) as AddressPathAbsolute,
          _namespaceBase: addr.pathUtils.join(
            this.options.contentBaseAddress,
            namespace ? addr.parseAsType(namespace, "portablePathFilename") : undefined,
          ) as AddressPathAbsolute,
          main: addr.pathUtils.join(
            this.options.contentBaseAddress,
            namespace ? addr.parseAsType(namespace, "portablePathFilename") : undefined,
            addr.parseAsType(key, "portablePathFilename")
            // addr.parseAsType("main", "portablePathFilename") // content does not need internal namespacing
          ) as AddressPathAbsolute,
        },
      } as CacheEntry<WithContent>;
    }
    return base;
  }
}
