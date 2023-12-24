import { URL } from 'url'
import { normalizeUrl } from '../tools/normalize-utils'
import { AddressHandler } from '../__types__'

declare module '../__types__' {
  interface AddressType {
    // url: {
    //   scheme: string,
    // }
    url: [
      {
        url: URL
        scheme: 'http' | 'https'
        host: string
        port?: number
      },
      'url',
      string
    ]
  }
}

export const REGEX =
  /(http|https?):\/\/((?:(?:[-a-zA-Z0-9@:%._\+~#=]{1,256}\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6})|(?:localhost))(?:\:([0-9]+))?([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ // SO - https://tinyurl.com/2jjo64u4
// export const URL_REGEX = /(https?):\/\/([-a-zA-Z0-9@:%._\+~#=]{1,256}\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ // SO - https://tinyurl.com/2jjo64u4

export const handler: AddressHandler<'url'> = {
  name: 'url',
  group: 'url',
  parse({ address }) {
    if (!address.match(REGEX)) return

    const matches = address.match(REGEX)
    // console.log(`matches :>> `, matches)

    if (!matches) return

    const [, scheme, host, port] = matches
    // console.log(`matches :>> `, matches)

    try {
      const url = new URL(address)
      if (url.protocol) {
        const parts = {
          url,
          scheme: scheme as 'http' | 'https',
          host,
          port: port ? parseInt(port, 10) : undefined
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
          type: 'url'
        }
      }
    } catch {}
  },
  format(options) {
    const { address } = options
    const url = address.parts.url
    normalizeUrl(url)
    return url.toString()
  }
  // normalize({address, addressIns}) {
  //   const url = address.parts.url
  //   normalizeUrl(url)
  //   return url.toString()
  // },
}
