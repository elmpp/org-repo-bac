import { PortablePath } from '@business-as-code/fslib'
import { AddressHandler } from '../__types__'
import * as validateUtils from "../tools/validate-utils";
import { fromPortablePath, toPortablePath } from './portable-path-posix-absolute-handler'
import path from 'path'

declare module '../__types__' {
  interface AddressType {
    portablePathWindowsRelative: [{suffix?: string}, 'path', PortablePath]
  }
}

const WINDOWS_PATH_RELATIVE_REGEX = /^(?![a-zA-Z]:\\)(.+\\)+/

export const handler: AddressHandler<'portablePathWindowsRelative'> = {
  name: 'portablePathWindowsRelative',
  group: 'path',
  parse({address, arch, pathType}) {
    if (arch === 'win32') {
      if (!validateUtils.isValidPath(address, {})) return
      if (address.match(WINDOWS_PATH_RELATIVE_REGEX)) {
        const suffix = address.endsWith('/*') || address.endsWith('\*') ? '/*' : undefined
        const original = (pathType === 'portable') ? fromPortablePath(address, arch) : address
        const originalNormalized = path.win32.normalize(original.replace(/\/\*$/, '').replace(/[\\\/]\*?$/, ''))
        const handled = toPortablePath(address, arch)
        const normalized = path.posix.normalize(handled.replace(/\/\*$/, '').replace(/[\\\/]\*?$/, '')) as PortablePath

        return {
          original,
          originalNormalized,
          address: handled,
          addressNormalized: normalized,
          type: 'portablePathWindowsRelative',
          parts: {suffix},
        }
      }
    }
  },
}
