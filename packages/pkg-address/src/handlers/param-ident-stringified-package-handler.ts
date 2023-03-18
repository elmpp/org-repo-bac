import { URLSearchParams } from 'url'
import { AddressPackageProtocols } from '../address-package'
import { makeHash } from '../tools/normalize-utils'
import { AddressHandler } from '../__types__'

declare module '../__types__' {
  interface AddressType {
    paramIdentStringifiedPackage: [{
      descriptor: {
        identHash: string
        scope?: string
        name: string
        identString: string
        protocol: AddressPackageProtocols // package manager dependent
        // subpath?: string
      },
      params?: URLSearchParams
      paramsSorted?: URLSearchParams
    }, 'package', string]
  }
}




// const PACKAGE_REGEX = /^(?:@([a-z0-9-~][a-z0-9-._~]*?)\/)?([a-z0-9-~][a-z0-9-._~]*)(?:@([a-z0-9-~][a-z0-9-._~]*))?(?:\/([^#]+))?(?:#([^#\/]+))?$/
const PACKAGE_REGEX = /^(?:@((?!___).*))?___([a-z0-9-~][a-z0-9-._~]*)(?:#([^#\/]+))?$/
// ((?:(?!___)).*|(?:(?!#)).*)
// const PACKAGE_REGEX = /^(?:@((?!___).*))?___([a-z0-9-~][a-z0-9-._~]*)(?:@([^#]+))(?:#([^#\/]+))?$/

/**
 Standard package format with optional hash params. Does not include range
 (can refer to multiple versions of given package). Suitable for use as file/folder name

 e.g. @org___balls___subdir___package.json#b=b&a=a
 */
export const handler: AddressHandler<'paramIdentStringifiedPackage'> = {
  name: 'paramIdentStringifiedPackage',
  group: 'package',
  parse({address}) {

    const matches = address.match(PACKAGE_REGEX)
    if (!matches) return

    let protocol: AddressPackageProtocols = 'npm'

    try {
      const [, scope, name, hashParamString] = matches
      const identHash = makeHash([scope, name])
      const params = hashParamString ? new URLSearchParams(hashParamString) : undefined
      const paramsSorted = hashParamString ? (() => {const params = new URLSearchParams(hashParamString); params.sort(); return params})() : undefined
      const parts = {
        descriptor: {
          identHash,
          scope,
          name,
          identString: `${scope ? `@${scope}/` : ''}${name}`,
          protocol,
        },
        ...(params ? {params, paramsSorted} : {}),
      }
      const handled = handle({descriptor: parts.descriptor, params: parts.paramsSorted})

      return {
        original: address,
        originalNormalized: handled,
        address: handled,
        addressNormalized: handled,
        parts,
        type: 'paramIdentStringifiedPackage',
      }
    }
    catch {}
  },
  format({address}) {
    return handle({descriptor: address.parts.descriptor, params: address.parts.params})
    // return handler.normalize!({address: options.address, addressIns: options.addressIns})
  },
}


function handle({descriptor, params}: {descriptor: PackageDescriptorLoose, params?: URLSearchParams}) {
  return serializePackageDescriptor(descriptor) + (params ? `#${params.toString()}` : ``)
}
// function handle({address, addressIns}) {
//   let serialized = serializePackageDescriptor(address.parts.descriptor)
//   if ((address.parts as any).params) {
//     const params = (address.parts as any).params as URLSearchParams
//     params.sort()
//     address.parts.params = params
//     serialized = `${serialized}#${params.toString()}`
//   }
//   return serialized
// }

// to include all permutations of all handlers
type PackageDescriptorLoose = {
  identHash: string
  scope?: string
  name: string
  identString: string
}

export const serializePackageDescriptor = (desc: PackageDescriptorLoose): string => {
  const {scope, name} = desc
  let ret = `${scope ? `@${scope}/` : ''}${name}`
  return ret
}