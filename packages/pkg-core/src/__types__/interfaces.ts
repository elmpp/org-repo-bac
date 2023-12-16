import {
  AddressDescriptorUnion,
  AddressPathAbsolute,
  AddressOtherCache,
} from "@business-as-code/address";
import { ServiceMap } from "./services";
import { CacheKey } from "./util";
// import { AddressCacheManager } from "../cache/address-cache-manager";

/** constrain the options of the fetch lifecycle implementations - Yarn2 - https://github.com/yarnpkg/berry/blob/985bed20234cd03ce7565da1d2558036e9507d1b/packages/yarnpkg-core/sources/Fetcher.ts#L13*/
export type FetchOptions = {
  /** where content is coming from */
  sourceAddress: AddressDescriptorUnion;
  // /** optionally specify the location in the cache */
  cacheAddress?: AddressOtherCache;
  /** where content will be going. To specify a cache address, use a AddressPathCache */
  destinationAddress: AddressDescriptorUnion;
  // cacheService: ServiceMap["cache"][0];
  cacheService: ServiceMap["cache"][0];
  // cacheManager: AddressCacheManager;
  // cacheOptions?: {};
};

/** all fetchers should return same type - Yarn2 - https://github.com/yarnpkg/berry/blob/985bed20234cd03ce7565da1d2558036e9507d1b/packages/yarnpkg-core/sources/Fetcher.ts#L20 */
export type FetchResult = {
  // packageFs: FakeFS<PortablePath>;

  // /**
  //  * If set, this function will be called once the fetch result isn't needed
  //  * anymore. Typically used to release the ZipFS memory.
  //  */
  // releaseFs?: () => void;

  /**
   * The path where the package can be found within the `packageFs`. This is
   * typically the `node_modules/<scope>/<name>` path.
   */
  contentPath: AddressPathAbsolute;

  // /**
  //  * The "true" place where we can find the sources. We use that in order to
  //  * compute the `file:` and `link:` relative paths.
  //  */
  // originalPath?: AddressType;

  /**
   * The checksum for the fetch result.
   */
  checksum: CacheKey;

  // /** Serves as a default  */
  // canonicalChecksum?: string;
};
