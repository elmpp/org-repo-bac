// import {xfs} from '@business-as-code/common'
import { addr, AddressPathAbsolute } from '@business-as-code/address'
import { Outputs } from '@business-as-code/core'
import { PortablePath, xfs } from '@business-as-code/fslib'
import { SourceCacheEntryAddress } from './__types__'

export type Meta = {
  destinationPath: AddressPathAbsolute
}
// type Options<TAddressName extends keyof AddressType> = {contentBaseAddress: AddressDescriptor<TAddressName>, outputsBaseAddress: AddressDescriptor<TAddressName>}
export type Options = {outputsBaseAddress: AddressPathAbsolute; metaBaseAddress: AddressPathAbsolute; contentBaseAddress: AddressPathAbsolute}


export class XfsCacheManager {

  options: Options

  constructor(options: Options) {
    this.options = options
  }

  static async initialise(options: Options) {

    const outputsLocationExists = await xfs.existsPromise(options.outputsBaseAddress.address)
    const contentLocationExists = await xfs.existsPromise(options.contentBaseAddress.address)
    if (!outputsLocationExists) {
      await xfs.mkdirpPromise(options.outputsBaseAddress.address)
    }
    if (!contentLocationExists) {
      await xfs.mkdirpPromise(options.contentBaseAddress.address)
    }

    return new XfsCacheManager(options)
  }

  async getOutputs({key, namespace}: {key: string, namespace: string}) {
    const cacheEntry = await this.getCacheEntry({key, namespace})
    const tryGetOutput = async (path: AddressPathAbsolute): Promise<string | undefined> => {
      if (await xfs.existsPromise(path.address)) {
        return await xfs.readFilePromise(path.address, 'utf8')
      }
    }
    const ret: Outputs = {
      stdout: (await tryGetOutput(cacheEntry.outputs.stdout))!,
      stderr: (await tryGetOutput(cacheEntry.outputs.stderr))!,
      // unformatted: (await tryGetOutput(cacheEntry.outputs.unformatted))!,
      // formatted: (await tryGetOutput(cacheEntry.outputs.formatted))!,
      // error: (await tryGetOutput(cacheEntry.outputs.error))!,
      // user: (await tryGetOutput(cacheEntry.outputs.user))!,
    }
    const valCount = Object.values(ret).filter(o => o !== undefined).length
    if (valCount > 0 && valCount < 4) {
      throw new Error(`Outputs non-atomic error. Only '${valCount}' outputs found. CacheEntry: '${require('util').inspect(cacheEntry, {showHidden: false, depth: 2, colors: true})}'`)
    }
    if (valCount !== 4) {
      return
    }
    return ret
  }
  async getMeta({key, namespace}: {key: string, namespace: string}) {
    const cacheEntry = await this.getCacheEntry({key, namespace})
    const tryGetMeta = async (path: AddressPathAbsolute): Promise<AddressPathAbsolute | undefined> => {
      if (await xfs.existsPromise(path.address)) {
        return addr.parsePPath(await xfs.readFilePromise(path.address, 'utf8')) as AddressPathAbsolute // (stored as PortablePath)
      }
    }
    const ret: Meta = {
      destinationPath: (await tryGetMeta(cacheEntry.meta.destinationPath))!,
    }
    const valCount = Object.values(ret).filter(o => o !== undefined).length
    if (valCount > 0 && valCount < 1) {
      throw new Error(`Meta non-atomic error. Only '${valCount}' metas found. CacheEntry: '${require('util').inspect(cacheEntry, {showHidden: false, depth: 2, colors: true})}'`)
    }
    if (valCount !== 1) {
      return
    }
    return ret
  }
  async copyContent({key, namespace, destinationPath}: {key: string, namespace: string, destinationPath: AddressPathAbsolute}) {
    const cacheEntry = await this.getCacheEntry({key, namespace})
    await xfs.mkdirpPromise(destinationPath.address)
    await xfs.copyPromise(
      destinationPath.address,
      `${cacheEntry.content.main.address}/*` as PortablePath,
      {overwrite: true},
    )
    // await copyPromise({
    //   source: `${cacheEntry.content.main.address}/*` as PortablePath,
    //   destination: destinationPath.address,
    //   options: {mode: 'overwriteIfExistent'},
    // })
    return this
  }

  async has({key, namespace}: {key: string, namespace: string}) {

    const cacheEntry = await this.getCacheEntry({key, namespace})

    return xfs.existsPromise(cacheEntry.outputs._base.address)
  }
  async hasNamespace({namespace}: {namespace: string}) {

    const cacheEntry = await this.getCacheEntry({key: 'dummy', namespace})

    return xfs.existsPromise(cacheEntry.outputs._namespaceBase.address)
  }

  async set({key, namespace, sourceEntry}: {key: string, namespace: string, sourceEntry: SourceCacheEntryAddress<AddressPathAbsolute>}) {
    const cacheEntry = await this.getCacheEntry({key, namespace})

    // meta
    await xfs.mkdirpPromise(addr.pathUtils.dirname(cacheEntry.meta.destinationPath).address)
    await xfs.writeFilePromise(cacheEntry.meta.destinationPath.address, sourceEntry.meta.destinationPath.address, {encoding: 'utf8'})
    // outputs
    await xfs.mkdirpPromise(addr.pathUtils.dirname(cacheEntry.outputs.stdout).address)
    await xfs.writeFilePromise(cacheEntry.outputs.stdout.address, sourceEntry.outputs.stdout, {encoding: 'utf8'})
    await xfs.mkdirpPromise(addr.pathUtils.dirname(cacheEntry.outputs.stderr).address)
    await xfs.writeFilePromise(cacheEntry.outputs.stderr.address, sourceEntry.outputs.stderr, {encoding: 'utf8'})

    // console.log(`sourceEntry, cacheEntry :>> `, sourceEntry, cacheEntry)

    if (sourceEntry.content) {
      await xfs.mkdirpPromise(cacheEntry.content.main.address)
      await xfs.copyPromise(
        cacheEntry.content.main.address,
        `${sourceEntry.content.address}/*` as PortablePath,
        {overwrite: true},
      )
      // await copyPromise({
      //   source: `${sourceEntry.content.address}/*` as PortablePath,
      //   destination: cacheEntry.content.main.address,
      //   options: {mode: 'overwriteIfExistent'},
      // })
    }

    return cacheEntry
  }

  async remove({key, namespace}: {key: string, namespace: string}) {
    const cacheEntry = await this.getCacheEntry({key, namespace})

    await xfs.removePromise(cacheEntry.outputs._base.address)
    await xfs.removePromise(cacheEntry.content._base.address)
    return this
  }
  async removeNamespace({namespace}: {namespace: string}) {
    const cacheEntry = await this.getCacheEntry({key: 'dummy', namespace})

    await xfs.removePromise(cacheEntry.outputs._namespaceBase.address)
    await xfs.removePromise(cacheEntry.content._namespaceBase.address)

    return this
  }

  async clearAll() {
    await xfs.removePromise(this.options.outputsBaseAddress.address)
    await xfs.removePromise(this.options.contentBaseAddress.address)
    return this
  }

  async getCacheEntry({key, namespace}: {key: string, namespace: string}) {
    /** for xfs, these locations are deterministic; i.e. they won't be the result of a save (like for a db) */
    return {
      outputs: {
        _base: addr.pathUtils.join(
          this.options.outputsBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
        ) as AddressPathAbsolute,
        _namespaceBase: addr.pathUtils.join(
          this.options.outputsBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
        ) as AddressPathAbsolute,
        stdout: addr.pathUtils.join(
          this.options.outputsBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
          addr.parseAsType('unformatted', 'portablePathFilename'),
        ) as AddressPathAbsolute,
        stderr: addr.pathUtils.join(
          this.options.outputsBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
          addr.parseAsType('formatted', 'portablePathFilename'),
        ) as AddressPathAbsolute,
      },
      meta: {
        _base: addr.pathUtils.join(
          this.options.metaBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
        ) as AddressPathAbsolute,
        _namespaceBase: addr.pathUtils.join(
          this.options.metaBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
        ) as AddressPathAbsolute,
        destinationPath: addr.pathUtils.join(
          this.options.metaBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
          addr.parseAsType('destinationPath', 'portablePathFilename'),
        ) as AddressPathAbsolute,
      },
      content: {
        _base: addr.pathUtils.join(
          this.options.contentBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
        ) as AddressPathAbsolute,
        _namespaceBase: addr.pathUtils.join(
          this.options.contentBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
        ) as AddressPathAbsolute,
        main: addr.pathUtils.join(
          this.options.contentBaseAddress,
          addr.parseAsType(namespace, 'portablePathFilename'),
          addr.parseAsType(key, 'portablePathFilename'),
          addr.parseAsType('main', 'portablePathFilename'),
        ) as AddressPathAbsolute,
      },
    }
  }
}
