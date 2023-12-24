// import {xfs} from '@business-as-code/common'
import {
  addr,
  AddressDescriptorUnion,
  AddressPathAbsolute
} from '@business-as-code/address'
import { ServiceInitialiseCommonOptions } from '../__types__'
import { sanitise } from '../utils/fs-utils'
import { AddressAbsoluteCacheManager } from './address-absolute-cache-manager'

type Options = ServiceInitialiseCommonOptions & {
  rootPath: AddressPathAbsolute
}

/**
 AddressCacheManager is a step up from AddressAbsoluteCacheManager, in that it manages both content and meta
 information. Also, it accepts AddressDescriptorUnion
 */
export class AddressCacheManager {
  options: Options

  // @ts-ignore: initialise set
  protected cacheManagerAbsolute: AddressAbsoluteCacheManager

  constructor(options: Options) {
    this.options = options
  }

  static async initialise(options: Options) {
    const ins = new AddressCacheManager(options)
    ins.cacheManagerAbsolute = await AddressAbsoluteCacheManager.initialise({
      ...options,
      metaBaseAddress: addr.pathUtils.join(
        options.rootPath,
        addr.parseAsType('meta', 'portablePathFilename')
      ) as AddressPathAbsolute,
      createAttributes: (address) => {
        return {
          key: sanitise(address.addressNormalized),
          namespace: sanitise(address.type)
        }
      }
    })
    return ins
  }

  async get({
    /** address here is the sourceAddress, where content comes from. We'll always generate the namespaced location within rootPath */
    address,
    // cacheOptions,
    createChecksum,
    onHit,
    onMiss,
    onStale
  }: Omit<Parameters<AddressAbsoluteCacheManager['get']>[0], 'address'> & {
    address: AddressDescriptorUnion
  }): ReturnType<AddressAbsoluteCacheManager['get']> {
    // return this.cacheManager.get(...options)

    const { absolute: contentPath, relative: contentPathRelative } =
      await this.cacheManagerAbsolute.createContentPaths({
        rootPath: this.options.rootPath,
        address
      })
    await this.cacheManagerAbsolute.primeContent({
      rootPath: this.options.rootPath,
      address
    })

    const fetchRes = await this.cacheManagerAbsolute.get({
      address: contentPath,
      // cacheOptions: {},
      createChecksum,
      onHit,
      onStale,
      onMiss
    })

    return fetchRes
  }
  async has(address: AddressDescriptorUnion): Promise<boolean> {
    const { absolute: contentPath, relative: contentPathRelative } =
      await this.cacheManagerAbsolute.createContentPaths({
        rootPath: this.options.rootPath,
        address
      })
    const hasMeta = await this.cacheManagerAbsolute.hasMeta(contentPath)
    const hasContent = await this.cacheManagerAbsolute.hasContent(contentPath)

    // console.log(`address, contentPath :>> `, address, contentPath)
    return hasMeta && hasContent // leave any cache dir inconsistencies to the cacheManager
  }
}
