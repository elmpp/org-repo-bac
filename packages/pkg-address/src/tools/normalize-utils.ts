import {URL} from 'url'
import {createHash} from 'crypto'
// @ts-ignore
import stringifyDeterministic from 'json-stringify-deterministic'


export const normalizeUrl = (url: URL): void => {

  if (url.hash) {
    url.hash = determinize(url.hash)
  }
  if (url.searchParams) {
    url.searchParams.sort()
  }
}

export function determinize(content: any): any {
  return JSON.parse(stringifyDeterministic(content))
}

export function makeHash(arg: any): string {

  const hash = createHash(`sha512`)
  if (typeof arg !== 'string') arg = stringifyDeterministic(arg)
  hash.update(arg)

  return hash.digest(`hex`)
}