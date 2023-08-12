import { PortablePath } from '@business-as-code/fslib'
import { AddressHandler } from '../__types__'
import { fromPortablePath, toPortablePath } from './portable-path-posix-absolute-handler'
import * as validateUtils from "../tools/validate-utils";
import path from 'path'

declare module '../__types__' {
  interface AddressType {
    portablePathWindowsAbsolute: [{suffix?: string}, 'path', PortablePath]
  }
}

const WINDOWS_PATH_ABSOLUTE_REGEX = /^([a-zA-Z]:\\)(.+(\\)?)+|\/([a-zA-Z]:\/)(.+(\/)?)+/

export const handler: AddressHandler<'portablePathWindowsAbsolute'> = {
  name: 'portablePathWindowsAbsolute',
  group: 'path',
  parse({address, arch, pathType}) {
    if (arch === 'win32') {
      if (!validateUtils.isValidPath(address, {windows: true})) return
      if (address.match(WINDOWS_PATH_ABSOLUTE_REGEX)) {
        const suffix = address.endsWith('/*') || address.endsWith('\*') ? '/*' : undefined
        const original = (pathType === 'portable') ? fromPortablePath(address, arch) : address
        const originalNormalized = original.replace(/\/\*$/, '').replace(/[\\\/]\*?$/, '')
        const handled = toPortablePath(address, arch)
        const normalized = path.posix.normalize(handled.replace(/\/\*$/, '').replace(/[\\\/]\*?$/, '')) as PortablePath

        return {
          original,
          originalNormalized,
          address: handled,
          addressNormalized: normalized,
          type: 'portablePathWindowsAbsolute',
          parts: {suffix},
        }
      }
    }
  },
}
