import { PortablePath } from '@business-as-code/fslib'
import { AddressHandler } from '../__types__'
import path from 'path'

declare module '../__types__' {
  interface AddressType {
    portablePathPosixAbsolute: [{suffix?: string}, 'path', PortablePath]
  }
}

const POSIX_PATH_ABSOLUTE_REGEX = /^(:?\/([^/]+(\/)?)+)$|^\/$/

export const handler: AddressHandler<'portablePathPosixAbsolute'> = {
  name: 'portablePathPosixAbsolute',
  group: 'path',
  parse({address, arch, pathType}) {
    if (arch !== 'win32') {
      if (address.match(POSIX_PATH_ABSOLUTE_REGEX)) {
        const suffix = address.endsWith('/*') ? '/*' : undefined
        const original = (pathType === 'portable') ? fromPortablePath(address, arch) : address
        const handled = toPortablePath(address, arch)
        const normalized = path.posix.normalize(handled.replace(/\/\*$/, '')) as PortablePath
        const originalNormalized = original.replace(/\/\*$/, '')

        return {
          original,
          originalNormalized,
          address: handled,
          addressNormalized: normalized,
          // address: toPortablePath(address, arch) + (suffix ?? ''),
          type: 'portablePathPosixAbsolute',
          parts: {suffix},
        }
      }
    }
  },
}


const WINDOWS_PATH_REGEXP = /^[a-zA-Z]:.*$/;
const PORTABLE_PATH_REGEXP = /^\/[a-zA-Z]:.*$/;

// Path should look like "/N:/berry/scripts/plugin-pack.js"
// And transform to "N:\berry\scripts\plugin-pack.js"
export function fromPortablePath(p: string, platform: NodeJS.Platform): string {
  if (platform !== 'win32')
    return p

  return p.match(PORTABLE_PATH_REGEXP) ? p.substring(1).replace(/\//g, `\\`) : p;
}

// Path should look like "N:/berry/scripts/plugin-pack.js"
// And transform to "/N:/berry/scripts/plugin-pack.js"
export function toPortablePath(p: string, platform: NodeJS.Platform = process.platform): PortablePath {
  if (platform !== 'win32')
    return p as PortablePath;

  return (p.match(WINDOWS_PATH_REGEXP) ? `/${p}` : p).replace(/\\/g, `/`) as PortablePath
}
