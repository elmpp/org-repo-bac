import { URLSearchParams } from 'url'
import { makeHash } from '../tools/normalize-utils'
import { AddressHandler } from '../__types__'

declare module '../__types__' {
  interface AddressType {
    paramDescriptorStringifiedPackage: [
      {
        descriptor: {
          identHash: string
          scope?: string
          name: string
          identString: string
          range: string
          protocol: string // package manager dependent
        }
        params?: URLSearchParams
        paramsSorted?: URLSearchParams
      },
      'package',
      string
    ]
  }
}

const PACKAGE_REGEX =
  /^(?:@((?!___).*))?___([a-z0-9-~][a-z0-9-._~]*)(?:@([^#]+))(?:#([^#\/]+))?$/

/**
 Standard package format with optional hash params. Must include range
 (refers to only 1 version of a package). Suitable for use as filename/foldername

 Supports only standards npm protocol

 e.g. @org___balls@v1.0.0#b=b&a=a
 */
export const handler: AddressHandler<'paramDescriptorStringifiedPackage'> = {
  name: 'paramDescriptorStringifiedPackage',
  group: 'package',
  parse({ address }) {
    const matches = address.match(PACKAGE_REGEX)
    if (!matches) return

    const [, scope, name, range, hashParamString] = matches
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
        range,
        protocol: 'npm'
      },
      ...(params ? { params, paramsSorted } : {})
    }
    const handled = handle({
      descriptor: parts.descriptor,
      params: parts.params
    })
    const handledSorted = handle({
      descriptor: parts.descriptor,
      params: parts.paramsSorted
    })
    const addressSorted =
      address.replace(hashParamString, '') + (params ? params.toString() : '')

    return {
      original: address,
      originalNormalized: addressSorted,
      address: handled,
      addressNormalized: handledSorted,
      parts,
      type: 'paramDescriptorStringifiedPackage'
    }
  }
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
// export const serializePackageDescriptor = (desc: PackageDescriptorLoose): string => {
//   const {scope, name} = desc
//   let ret = `${scope ? `@${scope}/` : ''}${name}`
//   return ret
// }
export const serializePackageDescriptor = (
  desc: PackageDescriptorLoose
): string => {
  const { scope, name, range } = desc
  let ret = `${scope ? `@${scope}/` : ''}${name}`
  if (desc.subpath) ret = `${ret}/${desc.subpath}`
  return range ? `${ret}@${range}` : ret
}
