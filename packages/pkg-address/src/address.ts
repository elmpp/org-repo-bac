/**
  An extension of the venerable PortablePath to include other addressables such as Urls.
  Extendable to allow parsing of bespoke formats such as Github urls

  @packageDocumentation
  */

import './handlers' // force interface merging in declaration files
import { AddressPathUtils, createAddressPath } from './address-path'
import { AddressPackageUtils, createAddressPackage } from './address-package'
import { handlers as defaultHandlers } from './handlers'
import {
  AddressDescriptor,
  AddressGroupUnion,
  AddressHandler,
  AddressPackage,
  AddressPackageDescriptor,
  AddressPackageIdent,
  AddressPath,
  AddressPathAbsolute,
  AddressPathRelative,
  AddressType,
  AddressUrl
} from './__types__'
import { AddressTypeByGroup } from './__types__/util'
import { AddressUrlUtils, createAddressUrl } from './address-url'

// export const address = {
//   parseAsType() {}  // <!---- used to replace struct-utils#parsePackageDescriptor etc
// }

export function assertIsAddress(address: any): address is AddressDescriptor {
  // @todo - look at a Portable Path style __path
  return !!(
    ['path', 'url', 'package'].includes(address?.group) &&
    address?.original &&
    address?.type
  )
}
export function assertIsAddressPath(address: any): address is AddressPath {
  return address?.group === 'path'
}
export function assertIsAddressUrl(address: any): address is AddressUrl {
  return address?.group === 'url'
}
export function assertIsAddressPackage(
  address: any
): address is AddressPackage {
  return address?.group === 'package'
}
export function assertIsAddressPackageDescriptor(
  address: any
): address is AddressPackageDescriptor {
  return (
    [
      'paramDescriptorStringifiedPackage',
      'paramDescriptorPackage'
    ] as (keyof AddressType)[]
  ).includes(address?.type)
}
export function assertIsAddressPackageIdent(
  address: any
): address is AddressPackageIdent {
  return (
    [
      'paramIdentStringifiedPackage',
      'paramIdentPackage'
    ] as (keyof AddressType)[]
  ).includes(address?.type)
}
export function assertIsAddressPathRelative(
  address: any
): address is AddressPathRelative {
  return (
    [
      'portablePathPosixRelative',
      'portablePathWindowsRelative',
      'portablePathFilename'
    ] as (keyof AddressType)[]
  ).includes(address?.type)
}
export function assertIsAddressPathAbsolute(
  address: any
): address is AddressPathAbsolute {
  return (
    [
      'portablePathPosixAbsolute',
      'portablePathWindowsAbsolute'
    ] as (keyof AddressType)[]
  ).includes(address.type)
}

const ADDRESS_SCHEME_REGEX = /^(path|url|package|other):(.+)$/
// export type AddressSchemed = `${AddressGroupUnion}:${string}`

// type PackageManagerUnion = FeatureKeysByLabel<'packageManager', 'workroot'>

export type InitialiseOptions = {
  handlers?: AddressHandler[]

  /** NB these params must be persistent values (e.g. architecture and NOT based on ephemeral/FS) */
  parseParams: {
    // packageManager: string,
    // packageManager: PackageManagerUnion, // build problems `mnt:build-and-clean`
    arch?: NodeJS.Platform
  }
}

export class Address {
  options: Omit<InitialiseOptions, 'handlers'>
  handlers = {
    path: new Map<keyof AddressType, AddressHandler>(),
    url: new Map<keyof AddressType, AddressHandler>(),
    package: new Map<keyof AddressType, AddressHandler>(),
    other: new Map<keyof AddressType, AddressHandler>()
  }
  readonly pathUtils: AddressPathUtils
  readonly packageUtils: AddressPackageUtils
  readonly urlUtils: AddressUrlUtils

  constructor({ handlers = [], ...options }: InitialiseOptions) {
    this.options = options
    for (const handler of handlers.reverse()) {
      this.registerHandler(handler)
    }

    this.pathUtils = createAddressPath(this, this.options.parseParams)
    this.packageUtils = createAddressPackage(this, this.options.parseParams)
    this.urlUtils = createAddressUrl(this, this.options.parseParams)
  }

  static initialise(options: InitialiseOptions): Address {
    const { handlers = [], ...otherOptions } = options
    return new Address({
      handlers: [...defaultHandlers, ...handlers] as any,
      ...otherOptions
    })
  }

  /**
   Parses our schemed address format. Allows multi-channel textual input from users

    @example
   ```ts
   const addressStrings = [
     'path:./some-relative-path.ts',
     'path:/some-posix-windows-path.ts',
     'path:C:\\some-absolute-windows-path.ts',
     'path:some-filename.ts',
     'path:file://some-schemed-filepath.ts',
     'package:@pkgScope/pkgName',
     'url:https://domain.com/somewhere
   ]
   const address = Address.find({context})
   addr.parse({address: addressStrings[x]})
   ```
   */
  parse(options: {
    address: string
    strict: true
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
    options?: { normalize?: boolean }
  }): AddressDescriptor
  parse(options: {
    address: string
    strict?: boolean
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
    options?: { normalize?: boolean }
  }): AddressDescriptor | undefined
  parse(options: {
    address: string
    strict?: boolean
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
    options?: { normalize?: boolean }
  }): AddressDescriptor | undefined {
    const { address, pathType } = options
    const matches = address.match(ADDRESS_SCHEME_REGEX)
    if (!matches) {
      throw new Error(
        `Invalid address provided '${address}'. See docs about format: https://monotonous.org/docs/address-formats`
      )
    }
    const [_, matchGroup, matchAddress] = matches

    return this.doParse({
      ...options,
      address: matchAddress,
      group: matchGroup as AddressGroupUnion,
      pathType
    })
  }

  /**
   Attempts to parse given address. Runs registered handlers of each group in succession and
   returns on first non void response.

   @param [group] Some address formats are unavoidably indistinguishable (e.g. a package and a relative path).
   Addresses should be distinguishable however within a group so use this as a hint to use only that group's handlers
   @param [type]  Runs only a specific handler and therefore useful as a test
   */
  private doParse<TType extends keyof AddressType>(options: {
    address: string
    group?: AddressGroupUnion
    type: TType
    strict: true
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor<TType>
  private doParse<TGroup extends AddressGroupUnion>(options: {
    address: string
    group: TGroup
    type?: keyof AddressType
    strict: true
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor<AddressTypeByGroup<TGroup>>
  private doParse<TGroup extends AddressGroupUnion>(options: {
    address: string
    group: TGroup
    type?: keyof AddressType
    strict?: boolean
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor<AddressTypeByGroup<TGroup>> | undefined
  private doParse<TType extends keyof AddressType>(options: {
    address: string
    group?: AddressGroupUnion
    type?: TType
    strict: true
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor
  private doParse<TType extends keyof AddressType>(options: {
    address: string
    group?: AddressGroupUnion
    type: TType
    strict?: boolean
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor<TType> | undefined
  private doParse(options: {
    address: string
    group?: AddressGroupUnion
    type?: keyof AddressType
    strict?: boolean
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor | undefined
  private doParse(options: {
    address: string
    group?: AddressGroupUnion
    type?: keyof AddressType
    strict?: boolean
    arch?: NodeJS.Platform
    pathType?: 'native' | 'portable'
  }): AddressDescriptor | undefined {
    const {
      arch = process.platform,
      address,
      group,
      strict,
      type,
      pathType
    } = options

    // let ret: AddressDescriptor | undefined = undefined

    // const doNormalize = (address: AddressDescriptor): void => {
    //   // need to recanvas for handler as doHandler may have changed its type
    //   let handler = this.getHandlerForType(address.type)
    //   if (!handler.normalize) {
    //     handler = this.getDefaultHandlerForGroup(address.group)
    //   }
    //   if (!handler.normalize) throw new Error(`Address: default handler '${handler.name}' does not implement normalize(). Ensure correct handler order is maintained`)

    //   const normalized = handler.normalize!({address, addressIns: this})
    //   address.addressNormalized = normalized
    // }
    // const doNormalize = (handler: AddressHandler, address: string): string => {
    //   // let handler = this.getHandlerForType(address.type)
    //   if (!handler.normalize) {
    //     handler = this.getDefaultHandlerForGroup(handler.group)
    //   }
    //   if (!handler.normalize) throw new Error(`Address: default handler '${handler.name}' does not implement normalize(). Ensure correct handler order is maintained`)
    //   const ret = handler.normalize!({address: address, addressIns: this})
    //   return ret
    // }

    const doHandler = (
      handler: AddressHandler,
      strict: boolean
    ): AddressDescriptor | undefined => {
      let res: AddressDescriptor | undefined = undefined

      try {
        res = handler.parse({
          address,
          arch,
          ...this.options.parseParams,
          pathType
        }) as AddressDescriptor
        if (res) res.group = handler.group
      } catch (err) {
        if (strict) throw err
      }

      return res
    }

    const doReturn = (
      descriptor: AddressDescriptor | undefined,
      error?: Error
    ) => {
      if (!descriptor && strict) {
        throw new Error(
          `Address: unable to parse '${address}' as group/type: '${
            group ?? '-'
          }/${type ?? '-'}'${error ? `. Error: '${error.message}'` : ``}`
        )
      }
      return descriptor
    }

    const doGroup = (group: AddressGroupUnion) => {
      for (const [_handlerName, handler] of this.handlers[group].entries()) {
        const res = doHandler(handler, false)
        if (res) return res
      }
    }
    try {
      if (type) {
        return doReturn(doHandler(this.getHandlerForType(type), true))
      }
      if (group) {
        return doReturn(doGroup(group))
      }

      for (const aGroup of Object.keys(this.handlers)) {
        const res = doGroup(aGroup as AddressGroupUnion)
        if (res) return doReturn(res)
      }
    } catch (err) {
      return doReturn(undefined, err as Error)
    }
  }

  /**
   Registers a handler against a group. The handler will be added to the top of the stack
   for the group therefore should be highly specific
   */
  registerHandler(handler: AddressHandler) {
    const handlerArrMap = [[handler.name, handler] as const].concat(
      Array.from(this.handlers[handler.group])
    )
    this.handlers[handler.group] = new Map(handlerArrMap)
  }

  /** parses a path string with assumption it is in the platform's format (i.e. NativePath) */
  parsePath(
    address: string,
    options: { strict: false }
  ): AddressDescriptor<AddressTypeByGroup<'path'>> | undefined
  parsePath(
    address: string,
    options?: { strict?: true }
  ): AddressDescriptor<AddressTypeByGroup<'path'>>
  parsePath(
    address: string,
    { strict = true }: { strict?: boolean } = {}
  ): AddressDescriptor<AddressTypeByGroup<'path'>> | undefined {
    const desc = this.doParse({ address, group: 'path', strict })
    // if (assertIsAddressPathRelative(desc) && resolveFromCwd) {
    //   return addressPath.
    // }
    return desc
  }
  /** parses a path string with assumption it is in the posix format regardless of platform (i.e. PortablePath) */
  parsePPath(
    address: string,
    options?: {}
  ): AddressDescriptor<AddressTypeByGroup<'path'>>
  parsePPath(
    address: string,
    options: {} = {}
  ): AddressDescriptor<AddressTypeByGroup<'path'>> {
    return this.doParse({ address, group: 'path', strict: true })
  }
  parseUrl(
    address: string,
    options: {} = {}
  ): AddressDescriptor<AddressTypeByGroup<'url'>> {
    return this.doParse({ address, group: 'url', strict: true })
  }
  parsePackage(
    address: string,
    options: {} = {}
  ): AddressDescriptor<AddressTypeByGroup<'package'>> {
    return this.doParse({ address, group: 'package', strict: true })
  }
  parseAsType<TType extends keyof AddressType>(
    address: string,
    type: TType,
    options: { strict: false }
  ): AddressDescriptor<TType> | undefined
  parseAsType<TType extends keyof AddressType>(
    address: string,
    type: TType,
    options?: { strict?: true }
  ): AddressDescriptor<TType>
  parseAsType<TType extends keyof AddressType>(
    address: string,
    type: TType,
    options: { strict?: boolean } = {}
  ): AddressDescriptor<TType> | undefined {
    const { strict = true } = options
    return this.doParse({ address, type, strict })
  }
  // fromPortableAddress(address: AddressDescriptor): string {
  //   if (!['portablePathPosixAbsolute', 'portablePathPosixRelative', 'portablePathWindowsAbsolute', 'portablePathWindowsRelative'].includes(address.type)) {
  //     throw new Error(`Address: Supplied descriptor '${address.type}' is not a portable address descriptor`)
  //   }
  //   return npath.fromPortablePath(address.address)
  // }

  format(address: AddressDescriptor): string {
    let handler = this.getHandlerForType(address.type)
    if (!handler.format) {
      handler = this.getDefaultHandlerForGroup(address.group)
    }
    if (!handler.format)
      throw new Error(
        `Address: default handler '${handler.name}' does not implement format(). Ensure correct handler order is maintained`
      )
    return handler.format
      ? handler.format({ address, addressIns: this })
      : JSON.stringify(address)
  }

  // private normalize<Desc extends AddressDescriptor>(address: Desc): string {
  //   let handler = this.getHandlerForType(address.type)
  //   if (!handler.normalize) {
  //     handler = this.getDefaultHandlerForGroup(address.group)
  //   }
  //   if (!handler.normalize) throw new Error(`Address: default handler '${handler.name}' does not implement normalize(). Ensure correct handler order is maintained`)
  //   const ret = handler.normalize!({address: address.original, addressIns: this})
  //   return ret
  // }
  // private normalize<Desc extends AddressDescriptor>(address: Desc): Desc {
  //   let handler = this.getHandlerForType(address.type)
  //   if (!handler.normalize) {
  //     handler = this.getDefaultHandlerForGroup(address.group)
  //   }
  //   if (!handler.normalize) throw new Error(`Address: default handler '${handler.name}' does not implement normalize(). Ensure correct handler order is maintained`)
  //   const ret = handler.normalize!({address, addressIns: this})
  //   ret.original = address.original
  //   return ret
  // }

  // relative(options: {srcAddress: AddressPath, destAddress: AddressPath}): AddressPath
  // relative(options: {srcAddress: AddressDescriptor, destAddress: AddressDescriptor}): never
  // relative(options: {srcAddress: AddressDescriptor, destAddress: AddressDescriptor}): AddressDescriptor {
  //   const {srcAddress, destAddress} = options
  //   if (assertIsAddressPath(srcAddress)) {
  //     return this.getDefaultHandlerForGroup('path').relative(options)
  //   }
  //   assertUnreachable(srcAddress)
  // }
  // resolve(options: {srcAddress: AddressPath, destAddress: AddressPath}): AddressPath
  // resolve(options: {srcAddress: AddressDescriptor, destAddress: AddressDescriptor}): never
  // resolve(options: {srcAddress: AddressDescriptor, destAddress: AddressDescriptor}): AddressDescriptor {
  //   const {srcAddress, destAddress} = options
  //   if (assertIsAddressPath(srcAddress)) {
  //     return this.getDefaultHandlerForGroup('path').relative(options)
  //   }
  //   assertUnreachable(srcAddress)
  // }

  private getHandlerForType<TType extends keyof AddressType>(
    type: TType
  ): AddressHandler<TType> {
    const handler = Array.from([
      ...this.handlers.path.values(),
      ...this.handlers.url.values(),
      ...this.handlers.package.values(),
      ...this.handlers.other.values()
    ]).find((h) => h.name === type) as unknown as AddressHandler<TType>
    if (!handler)
      throw new Error(
        `Address: Handler '${type}' not found. Ensure it is registered early enough in the lifecycle before usage`
      )
    return handler
  }
  private getDefaultHandlerForGroup<TGroup extends AddressGroupUnion>(
    group: TGroup
  ): AddressHandler<AddressTypeByGroup<TGroup>> {
    if (!this.handlers[group]) {
      throw new Error(`Handlers not found for group '${group}'`)
    }
    const groupHandlers = Array.from(this.handlers[group].values())
    return groupHandlers[groupHandlers.length - 1] as unknown as AddressHandler<
      AddressTypeByGroup<TGroup>
    >
  }
}
