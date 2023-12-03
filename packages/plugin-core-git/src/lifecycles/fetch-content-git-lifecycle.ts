import {
  AddressDescriptor,
  AddressPathAbsolute,
  AddressType,
  AddressUrlGit,
  addr,
} from "@business-as-code/address";
import {
  CacheKey,
  Context,
  FetchContentLifecycleBase,
  FetchOptions,
  FetchResult,
  Result,
  constants,
  expectIsOk,
} from "@business-as-code/core";
import { BacError } from "@business-as-code/error";
import { xfs } from "@business-as-code/fslib";

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

      // console.log(`options :>> `, options)

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

      const fetchRes = await cacheService.get({
        address: applicableAddress,
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
        // onMiss: async () =>
        //   options.context.logger.debug(
        //     `Cache miss. Address: '${applicableAddress.addressNormalized}'. Will be cloned from source`
        //   ),
        onStale: async ({ contentPath, existentChecksum }) => {
          options.context.logger.debug(
            `Cache checksum fail (prev: '${existentChecksum?.globalVersion}::${existentChecksum?.key}). Address: '${applicableAddress.addressNormalized}'. Will be updated from source`
          );
          await this.updateFromNetwork({
            ...options,
            options: {
              ...options.options,
              address: applicableAddress,
              cacheService,
            },
            destinationPath: contentPath,
            existentChecksum,
          });
        },
        // onMiss: () => options.report.reportCacheMiss(locator, `${structUtils.prettyLocator(options.project.configuration, locator)} can't be found in the cache and will be fetched from GitHub`),
        onMiss: async ({ contentPath }) => {
          options.context.logger.debug(
            `Cache Miss. Address: '${applicableAddress.addressNormalized}'. Will be cloned from source`
          );
          await this.cloneFromNetwork({
            ...options,
            options: {
              ...options.options,
              address: applicableAddress,
              cacheService,
            },
            destinationPath: contentPath,
          });
        },
      });

      // console.log(`fetchRes :>> `, require('util').inspect(fetchRes, {showHidden: false, depth: undefined, colors: true}))

      // expectIsOk(fetchRes);
      return fetchRes;
    };
  }

  protected async cloneFromNetwork(options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: Omit<FetchOptions, "address"> & { address: AddressUrlGit };
    // where to add the content
    destinationPath: AddressPathAbsolute;
  }): Promise<void> {
    const {
      destinationPath,
      context,
      options: { address },
    } = options;

    const gitService = await context.serviceFactory("git", {
      context,
      workspacePath: destinationPath,
      workingPath: ".",
    });

    async function cloneFromSource() {
      context.logger.debug(
        `fetchContentGitLifecycle: adding new cache entry from source. Source: '${address.addressNormalized}', destination: '${destinationPath.addressNormalized}'`
      );

      const cloneOpts: Parameters<typeof gitService.clone>[1] = {
        sshStrictHostCheckingDisable: true, // let's disable this for now
        // do we even want to support private key here? Probs not. It's GH deployment keys that we will bother with
      };
      const cloneRes = await gitService.clone(
        address.addressNormalized,
        cloneOpts
      );

      expectIsOk(cloneRes);
    }

    await xfs.mkdirpPromise(destinationPath.address)
    await cloneFromSource();
  }

  protected async updateFromNetwork(options: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: Omit<FetchOptions, "address"> & { address: AddressUrlGit };
    // where to add the content
    destinationPath: AddressPathAbsolute;
    existentChecksum?: CacheKey;
  }): Promise<undefined> {
    const {
      destinationPath,
      context,
      existentChecksum,
      options: { address },
    } = options;

    const gitService = await context.serviceFactory("git", {
      context,
      workspacePath: destinationPath,
      workingPath: ".",
    });

    async function updateFromSource() {
      context.logger.debug(
        `fetchContentGitLifecycle: updating existent cache entry from source. Source: '${address.addressNormalized}', destination: '${destinationPath.addressNormalized}', existent checksum: '${existentChecksum}'`
      );

      const cloneOpts: Parameters<typeof gitService.clone>[1] = {
        // do we even want to support private key here? Probs not. It's GH deployment keys that we will bother with
      };
      const cloneRes = await gitService.pull(
        address.addressNormalized,
        cloneOpts
      );

      expectIsOk(cloneRes);
    }

    await updateFromSource();
  }

  protected async createChecksum({
    existentChecksum,
    context,
    workspacePath,
    contentPath,
  }: {
    context: Context;
    workspacePath: AddressPathAbsolute;
    // workingPath: string;
    options: Omit<FetchOptions, "address"> & { address: AddressUrlGit };
    // where to find the content
    contentPath: AddressPathAbsolute;
    // existent checksum if content found (but failed checksum)
    existentChecksum?: CacheKey;
  }): Promise<CacheKey> {
    // let's always just return a git HEAD SHA
    const gitService = await context.serviceFactory("git", {
      context,
      workspacePath: contentPath,
      workingPath: ".",
    });

    const res = await gitService.revParse("HEAD");
    expectIsOk(res);
    return {
      globalVersion: constants.GLOBAL_CACHE_KEY,
      key: res.res,
    };

    // if (existentChecksum) {

    // }
  }
}

// type DDD = Bac.Lifecycles['fetchContent']['insType']['fetchContent']
