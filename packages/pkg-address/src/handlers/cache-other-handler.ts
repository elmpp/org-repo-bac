import { AddressHandler } from "../__types__";
import { arrayIntersection } from "../tools/string-utils";

const CACHE_REGEX = /^cache:([^/]+)\/([^/#]+)(?:#([^#\/]+))?$/;
declare module "../__types__" {
  interface AddressType {
    cacheOther: [
      {
        namespace: string;
        key: string;
        params?: URLSearchParams;
        paramsSorted?: URLSearchParams;
      },
      "other",
      string
    ];
  }
}

/**
 Allows addressing of cache locations

 e.g.:
  cache:aNamespace/aKey
  cache:aNamespace/aKey#checksum=blah
 */
export const handler: AddressHandler<"cacheOther"> = {
  name: "cacheOther",
  group: "other",
  parse({ address, arch, pathType }) {
    // if (!validateUtils.isValidPath(address, { file: true })) return;

    const matches = address.match(CACHE_REGEX)
    if (!matches) return

    const [, namespace, key, hashParamString] = matches
    const params = new URLSearchParams(hashParamString ?? '')
    const paramIntersection = arrayIntersection(Array.from(params.keys()), ['checksum'])
    if (paramIntersection.unmatched.length) {
      throw new Error(`Address: unknown params has been supplied with cache address inside 'cache-other-handler'. Allowed params are 'checksum'. Address: '${address}'`)
    }
    const paramsSorted = (() => {const params = new URLSearchParams(hashParamString ?? ''); params.sort(); return params})()
    const parts = {
      namespace,
      key,
      ...(Array.from(params).length ? {params, paramsSorted} : {}),
    }
    const handled = handle({namespace, key, params: paramsSorted})

    return {
      original: address,
      originalNormalized: handled,
      address: handled,
      addressNormalized: handled,
      group: 'other',
      parts,
      type: 'cacheOther',
    }
  },
  format({ address }) {
    return address.original;
  },
};

function handle({namespace, key, params}: {namespace: string, key: string, params: URLSearchParams}) {
  return `cache:${namespace}/${key}` + (Array.from(params).length ? `#${params.toString()}` : ``)
}
