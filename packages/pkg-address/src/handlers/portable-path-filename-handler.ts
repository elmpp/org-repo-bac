import { AddressHandler } from '../__types__'
import { fromPortablePath, toPortablePath } from './portable-path-posix-absolute-handler'
import path from 'path'
import { PortablePath } from '@business-as-code/fslib'

const POSIX_FILENAME = /^[^/:\*\?"<>\|]+(:?\/\*)?$/
declare module '../__types__' {
  interface AddressType {
    portablePathFilename: [{suffix?: string}, 'path', PortablePath]
  }
}

export const handler: AddressHandler<'portablePathFilename'> = {
  name: 'portablePathFilename',
  group: 'path',
  parse({address, arch, pathType}) {
    if (address.match(POSIX_FILENAME)) {
      const suffix = address.endsWith('/*') ? '/*' : undefined
      const original = (pathType === 'portable') ? fromPortablePath(address, arch) : address
      const handled = toPortablePath(address, arch)
      // also remove suffixes when normalizing
      const normalized = path.posix.normalize(handled.replace(/\/\*$/, '')) as PortablePath
      const originalNormalized = original.replace(/\/\*$/, '')

      return {
        original,
        originalNormalized,
        address: handled,
        addressNormalized: normalized,
        type: 'portablePathFilename',
        parts: {suffix},
      }
    }
  },
  format({address}) {
    return address.original
  },
}
