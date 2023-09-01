import {
  AddressDescriptor,
  AddressOtherCache,
  AddressPathAbsolute,
  AddressType,
  AddressUrlGit,
  addr,
} from "@business-as-code/address";
import {
  CacheSourceEntry,
  Context,
  FetchContentLifecycleBase,
  FetchOptions,
  FetchResult,
  Result,
  assertIsOk,
  expectIsOk,
  ok,
} from "@business-as-code/core";
import { CacheKey } from "@business-as-code/core/services/cache-service";
import { BacError } from "@business-as-code/error";

// declare global {
//   namespace Bac {
//     interface Lifecycles {
//       core: {
//       // ['@business-as-code/plugin-core-essentials']: {
//       fetchContent: {
//           insType: FetchContentLifecycle;
//           staticType: typeof FetchContentLifecycle;
//         };
//       }
//     }
//   }
// }

export function assertIsAddressGit(address: any): address is AddressUrlGit {
  return (
    ["gitHttpRepoUrl", "gitSshRepoUrl"] as (keyof AddressType)[]
  ).includes(address.type);
}
export function assertIsAddressGitSsh(
  address: any
): address is AddressDescriptor<"gitSshRepoUrl"> {
  return (
    ["gitHttpRepoUrl", "gitSshRepoUrl"] as (keyof AddressType)[]
  ).includes(address.type);
}

export class FetchContentGitLifecycle extends FetchContentLifecycleBase<
  typeof FetchContentGitLifecycle
> {
  static override title = "git" as const;

  // override get ctor(): typeof FetchContentLifecycle {
  //   return this.constructor as any;
  // }

  override fetchContent(): (options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: FetchOptions;
  }) => Promise<Result<FetchResult, { error: BacError }> | void> {
    return async (options) => {
      const {
        options: { sourceAddress, cacheService, cacheOptions = {} },
      } = options;

      if (!assertIsAddressGit(sourceAddress)) {
        return;
      }
      // const expectedChecksum = options.checksums.get(locator.locatorHash) || null;

      let applicableAddress = sourceAddress;
      /** gitssh descriptors may include branch/commit/tag query params which don't apply when fetching */
      if (assertIsAddressGitSsh(sourceAddress)) {
        applicableAddress = addr.urlUtils.clone(sourceAddress, {
          params: new URLSearchParams(),
        });
      }

      const fetchRes = await cacheService.fetchFromCache({
        address: "" as unknown as AddressOtherCache,
        key: applicableAddress.addressNormalized,
        // namespace,
        cacheOptions,
        // expectedChecksum: "",
        createChecksum: async ({ existentChecksum, contentPath }) => {
          return this.createChecksum({
            ...options,
            options: {
              ...options.options,
              address: applicableAddress,
              cacheService,
            },
            contentPath,
            existentChecksum,
          });
        },
        onHit: () =>
          options.context.logger.debug(
            `Cache hit. Address: '${applicableAddress.addressNormalized}'`
          ),
        onMiss: () =>
          options.context.logger.debug(
            `Cache miss. Address: '${applicableAddress.addressNormalized}'. Will be cloned from source`
          ),
        onChecksumFail: ({ existentChecksum }) =>
          options.context.logger.debug(
            `Cache checksum fail (prev: '${existentChecksum.toString()}'). Address: '${
              applicableAddress.addressNormalized
            }'. Will be updated from source`
          ),
        // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
        loader: async ({ existentChecksum, contentPath }) => {
          return await this.fetchFromNetwork({
            ...options,
            options: {
              ...options.options,
              address: applicableAddress,
              cacheService,
            },
            contentPath,
            existentChecksum,
          });
        },
      });

      console.log(`cacheEntryRes :>> `, fetchRes);

      expectIsOk(fetchRes);
      return ok({
        checksum: fetchRes.res.checksum,
        path: fetchRes.res.entry.content.main,
      });

      // const [packageFs, releaseFs, checksum] = await cacheService.fetchFromCache(locator, expectedChecksum, {
      //   onHit: () => options.report.reportCacheHit(locator),
      //   onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
      //   loader: () => this.fetchFromNetwork(options),
      //   ...options.cacheOptions,
      // });

      // return {
      //   packageFs,
      //   releaseFs,
      //   prefixPath: structUtils.getIdentVendorPath(locator),
      //   checksum,
      // };

      // if (!assertIsOk(res)) {
      //   switch (res.res.error.reportCode) {
      //     case MessageName.SCHEMATICS_ERROR:
      //       context.logger.error(res.res.error.message);
      //       break;
      //     case MessageName.SCHEMATICS_INVALID_ADDRESS:
      //       context.logger.error(res.res.error.message);
      //       break;
      //     case MessageName.SCHEMATICS_NOT_FOUND:
      //       context.logger.error(res.res.error.message);
      //       break;
      //   }
      // }

      // return res;
    };
  }

  protected async createChecksum(options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: Omit<FetchOptions, "address"> & { address: AddressUrlGit };
    // where to add the content
    contentPath: AddressPathAbsolute;
    // existent checksum if content found (but failed checksum)
    existentChecksum?: CacheKey;
  }) {
    return {} as CacheKey;
  }

  protected async fetchFromNetwork(options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: Omit<FetchOptions, "address"> & { address: AddressUrlGit };
    // where to add the content
    contentPath: AddressPathAbsolute;
    // existent checksum if content found (but failed checksum)
    existentChecksum?: CacheKey;
  }): Promise<Result<CacheSourceEntry, { error: BacError }>> {
    const {
      contentPath,
      context,
      existentChecksum,
      options: { address },
    } = options;

    const gitService = await context.serviceFactory("git", {
      context,
      workspacePath: contentPath,
      workingPath: "",
    });

    async function updateFromSource() {}

    async function cloneFromSource() {
      const cloneOpts: Parameters<typeof gitService.clone>[1] = {
        // do we even want to support private key here? Probs not. It's GH deployment keys that we will bother with
      };
      const cloneRes = await gitService.clone(
        address.addressNormalized,
        cloneOpts
      );

      if (!assertIsOk(cloneRes)) {
        return fail(cloneRes.res);
      }
      return ok({
        content: cloneRes.res,
        meta: {
          destinationPath: "",
        },
      });
    }

    if (existentChecksum) {
      await updateFromSource();
    } else {
      await cloneFromSource();
    }

    return ok({
      outputs: {
        stdout: "",
        stderr: "",
      },
      content: contentPath, // the cache manager should be smart enough to know this is already a destination location
    });

    // const sourceBuffer = await httpUtils.get(
    //   this.getLocatorUrl(locator, opts),
    //   {
    //     configuration: opts.project.configuration,
    //   }
    // );

    // return await xfs.mktempPromise(async (extractPath) => {
    //   const extractTarget = new CwdFS(extractPath);

    //   await tgzUtils.extractArchiveTo(sourceBuffer, extractTarget, {
    //     stripComponents: 1,
    //   });

    //   const repoUrlParts = gitUtils.splitRepoUrl(locator.reference);
    //   const packagePath = ppath.join(extractPath, `package.tgz`);

    //   await scriptUtils.prepareExternalProject(extractPath, packagePath, {
    //     configuration: opts.project.configuration,
    //     report: opts.report,
    //     workspace: repoUrlParts.extra.workspace,
    //     locator,
    //   });

    //   const packedBuffer = await xfs.readFilePromise(packagePath);

    //   return await tgzUtils.convertToZip(packedBuffer, {
    //     compressionLevel: opts.project.configuration.get(`compressionLevel`),
    //     prefixPath: structUtils.getIdentVendorPath(locator),
    //     stripComponents: 1,
    //   });
    // });
  }
}

// type DDD = Bac.Lifecycles['fetchContent']['insType']['fetchContent']
