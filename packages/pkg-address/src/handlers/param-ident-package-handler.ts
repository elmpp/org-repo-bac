import { URLSearchParams } from 'url'
import { AddressPackageProtocols } from '../address-package'
import { makeHash } from '../tools/normalize-utils'
import { AddressHandler } from '../__types__'

declare module '../__types__' {
  interface AddressType {
    paramIdentPackage: [
      {
        descriptor: {
          identHash: string
          scope?: string
          name: string
          identString: string
          protocol: AddressPackageProtocols // package manager dependent
          subpath?: string
        }
        params?: URLSearchParams
        paramsSorted?: URLSearchParams
      },
      'package',
      string
    ]
  }
}

// const PACKAGE_REGEX = /^(?:@([a-z0-9-~][a-z0-9-._~]*?)\/)?([a-z0-9-~][a-z0-9-._~]*)(?:@([a-z0-9-~][a-z0-9-._~]*))?(?:\/([^#]+))?(?:#([^#\/]+))?$/
const PACKAGE_REGEX =
  /^(?:@([a-z0-9-~][a-z0-9-._~]*?)\/)?([a-z0-9-~][a-z0-9-._~]*)(?:@([^#\/]+))?(?:\/([^#]+))?(?:#([^#\/]+))?$/

/**
 Standard package format with optional hash params. Does not include range
 (can refer to multiple versions of given package)

 e.g. @org/name#param=value&param2=value2
 */
export const handler: AddressHandler<'paramIdentPackage'> = {
  name: 'paramIdentPackage',
  group: 'package',
  parse({ address }) {
    const matches = address.match(PACKAGE_REGEX)
    if (!matches) return

    let protocol: AddressPackageProtocols = 'npm'

    const [, scope, name, range, subpath, hashParamString] = matches
    if (range) {
      throw new Error(
        `Address: package descriptor has been encountered in this default package handler 'param-ident-package-handler'. Descriptors (i.e. having a range) should be handled before this. Address: '${address}'`
      )
    }
    const identHash = makeHash([scope, name])
    const params = hashParamString
      ? new URLSearchParams(hashParamString)
      : undefined
    const paramsSorted = hashParamString
      ? (() => {
          const params = new URLSearchParams(hashParamString)
          params.sort()
          return params
        })()
      : undefined
    const parts = {
      descriptor: {
        identHash,
        scope,
        name,
        identString: `${scope ? `@${scope}/` : ''}${name}`,
        protocol,
        ...(subpath ? { subpath } : {})
      },
      ...(params ? { params, paramsSorted } : {})
    }
    const handled = handle({
      descriptor: parts.descriptor,
      params: parts.paramsSorted
    })

    return {
      original: address,
      originalNormalized: handled,
      address: handled,
      addressNormalized: handled,
      group: 'package',
      parts,
      type: 'paramIdentPackage'
    }
  },
  format({ address }) {
    return handle({
      descriptor: address.parts.descriptor,
      params: address.parts.paramsSorted
    })
    // return handler.normalize!({address: options.address, addressIns: options.addressIns})
  }
}

// to include all permutations of all handlers
type PackageDescriptorLoose = {
  identHash: string
  scope?: string
  name: string
  identString: string
  range?: string
  protocol?: AddressPackageProtocols
  subpath?: string
}

function handle({
  descriptor,
  params
}: {
  descriptor: PackageDescriptorLoose
  params?: URLSearchParams
}) {
  return (
    serializePackageDescriptor(descriptor) +
    (params ? `#${params.toString()}` : ``)
  )
}
// function normalize({address, addressIns}) {
//   let serialized = serializePackageDescriptor(address.parts.descriptor)
//   if ((address.parts as any).params) {
//     const params = (address.parts as any).params as URLSearchParams
//     params.sort()
//     address.parts.params = params
//     serialized = `${serialized}#${params.toString()}`
//   }
//   return serialized
// }

export const serializePackageDescriptor = (
  desc: PackageDescriptorLoose
): string => {
  const { scope, name } = desc
  let ret = `${scope ? `@${scope}/` : ''}${name}`
  if (desc.range) ret = `${ret}@${desc.range}`
  if (desc.subpath) ret = `${ret}/${desc.subpath}`
  return ret
}
