import { URLSearchParams } from 'url'
import { makeHash } from '../tools/normalize-utils'
import { AddressHandler } from '../__types__'

declare module '../__types__' {
  interface AddressType {
    paramDescriptorPackage: [{
      descriptor: {
        identHash: string
        scope?: string
        name: string
        identString: string
        range: string
        protocol: string // package manager dependent
      },
      params?: URLSearchParams
      paramsSorted?: URLSearchParams
    }, 'package', string]
  }
}


// const PACKAGE_IDENT_REGEX = /^(?:@([a-z0-9-~][a-z0-9-._~]*?)\/)?([a-z0-9-~][a-z0-9-._~]*)$/
const PACKAGE_REGEX = /^(?:@([a-z0-9-~][a-z0-9-._~]*)\/)?([a-z0-9-~][a-z0-9-._~]*)(?:@([^#]+))(?:#([^#\/]+))?$/

/**
 Standard package format with optional hash params. Must include range
 (refers to only 1 version of a package)

 e.g. @org/balls@v1.0.0#b=b&a=a
 */
export const handler: AddressHandler<'paramDescriptorPackage'> = {
  name: 'paramDescriptorPackage',
  group: 'package',
  parse({address}) {

    const matches = address.match(PACKAGE_REGEX)
    if (!matches) return

    const [, scope, name, range, hashParamString] = matches
    const identHash = makeHash([scope, name])
    const params = hashParamString ? new URLSearchParams(hashParamString) : undefined
    const paramsSorted = hashParamString ? (() => {const params = new URLSearchParams(hashParamString); params.sort(); return params})() : undefined
    const parts = {
      descriptor: {
        identHash,
        scope,
        name,
        identString: `${scope ? `@${scope}/` : ''}${name}`,
        range,
        protocol: classifyProtocol(range),
      },
      ...(params ? {params, paramsSorted} : {}),
    }
    const handled = handle({descriptor: parts.descriptor, params: parts.params})
    const handledSorted = handle({descriptor: parts.descriptor, params: parts.paramsSorted})

    return {
      original: address,
      originalNormalized: handledSorted,
      address: handled,
      addressNormalized: handledSorted,
      parts,
      type: 'paramDescriptorPackage',
    }
  },
  // format(options) {
  //   return handler.normalize!({address: options.address, addressIns: options.addressIns})
  // },
  // normalize({address, addressIns}) {
  //   let serialized = serializePackageDescriptor(address.parts.descriptor)
  //   if ((address.parts as any).params) {
  //     const params = (address.parts as any).params as URLSearchParams
  //     params.sort()
  //     address.parts.params = params
  //     serialized = `${serialized}#${params.toString()}`
  //   }
  //   return serialized
  // }
}


function handle({descriptor, params}: {descriptor: PackageDescriptorLoose, params?: URLSearchParams}) {
  return serializePackageDescriptor(descriptor) + (params ? `#${params.toString()}` : ``)
}
// export const serializePackageDescriptor = (desc: PackageDescriptorLoose): string => {
//   const {scope, name} = desc
//   let ret = `${scope ? `@${scope}/` : ''}${name}`
//   return ret
// }

/**
 Yarn2: https://yarnpkg.com/features/protocols/#table

 @param packageManager  To be used as a hint, other pm packages may be imported
 */
function classifyProtocol(range: string): string {
// function classifyProtocol(range: string, packageManager: PackageManagerUnion): string { // build problems `mnt:build-and-clean`
  // switch (packageManager) {
  //   case 'workrootPackageManagerYarn2Nm':
  //   case 'workrootPackageManagerYarn2Pnp':
  const parts = range.match(/^([a-z]+):/i)
  return range.includes('/') ? 'github' : parts?.[1] ?? 'npm'
    // default:
      // throw new Error(`Package manager type not handled: ${packageManager}`)
      // assertUnreachable(packageManager)
}

type PackageDescriptorLoose = {
  identHash: string
  scope?: string
  name: string
  identString: string
  range?: string
  protocol?: string
  subpath?: string
}

export const serializePackageDescriptor = (desc: PackageDescriptorLoose): string => {
  const {scope, name, range} = desc
  let ret = `${scope ? `@${scope}/` : ''}${name}`
  if (desc.subpath) ret = `${ret}/${desc.subpath}`
  return range ? `${ret}@${range}` : ret
}