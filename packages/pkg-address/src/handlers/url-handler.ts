import { URL } from 'url'
import { normalizeUrl } from '../tools/normalize-utils'
import { AddressHandler } from '../__types__'

declare module '../__types__' {
  interface AddressType {
    // url: {
    //   scheme: string,
    // }
    url: [{
      url: URL
    }, 'url', string]
  }
}


export const handler: AddressHandler<'url'> = {
  name: 'url',
  group: 'url',
  parse({address}) {
    try {
      const url = new URL(address)
      if (url.protocol) {
        const parts = {
          url,
        }
        const urlNormalized = new URL(address)
        normalizeUrl(urlNormalized)
        const normalized = urlNormalized.toString()

        return {
          original: address,
          originalNormalized: normalized,
          address,
          addressNormalized: normalized,
          parts,
          type: 'url',
        }
      }
    }
    catch {}
  },
  format(options) {
    const {address} = options
    const url = address.parts.url
    normalizeUrl(url)
    return url.toString()
  },
  // normalize({address, addressIns}) {
  //   const url = address.parts.url
  //   normalizeUrl(url)
  //   return url.toString()
  // },
}