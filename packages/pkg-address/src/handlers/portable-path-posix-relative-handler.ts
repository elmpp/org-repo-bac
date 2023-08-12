import { PortablePath } from '@business-as-code/fslib'
import { AddressHandler } from '../__types__'
import { fromPortablePath, toPortablePath } from './portable-path-posix-absolute-handler'
import * as validateUtils from "../tools/validate-utils";
import path from 'path'

declare module '../__types__' {
  interface AddressType {
    portablePathPosixRelative: [{suffix?: string}, 'path', PortablePath]
  }
}

// const POSIX_PATH_RELATIVE_REGEX = /^(?!\/)(?:[.]{0,2}\/)+?(?:\.)?([^@:/]*\/+[^@:/]+)$/
// const POSIX_PATH_RELATIVE_REGEX = /^(?:(?!\/)(?:\.)?([^@:/]+\/+[^@:/]+))|(?:(?:[.]{1,2}\/)+([^@:]+))$/
// const POSIX_PATH_RELATIVE_REGEX = /^(?:(?:[.]{1,2}\/)+([^@:\n]+)\/?)$|^(?:(?!\/)((?:[^@:/\n]+\/)+[^@:/\n]+)\/?)$/
const POSIX_PATH_RELATIVE_REGEX = /^(?:(?:[.]{1,2}\/)+([^/:]+)\/?)$|^(?:(?!\/)(?!@)((?:[^:/]+\/)+[^:/]+)\/?)$/

export const handler: AddressHandler<'portablePathPosixRelative'> = {
  name: 'portablePathPosixRelative',
  group: 'path',
  parse({address, arch, pathType}) {
    if (arch !== 'win32') {
      if (!validateUtils.isValidPath(address, {})) return
      if (address.match(POSIX_PATH_RELATIVE_REGEX)) {
        const suffix = address.endsWith('/*') ? '/*' : undefined
        const original = (pathType === 'portable') ? fromPortablePath(address, arch) : address
        const handled = toPortablePath(address, arch)
        const normalized = path.posix.normalize(handled.replace(/\/\*$/, '')) as PortablePath
        // const originalNormalized = original.replace(/\/\*$/, '')

        return {
          original,
          originalNormalized: normalized,
          address: handled,
          addressNormalized: normalized,
          // address: toPortablePath(address, arch) + (suffix ?? ''),
          type: 'portablePathPosixRelative',
          parts: {suffix},
        }
      }
    }
  },
}
