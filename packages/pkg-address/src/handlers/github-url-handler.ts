import {AddressHandler} from '../__types__'
import {URL} from 'url'

declare module '../__types__' {
  interface AddressType {
    // schemedUrl: {
    //   scheme: string,
    // }
    githubUrl: [{
      url: URL,
      org?: string,
      owner?: string
    }, 'url', string]
  }
}

const GITHUB_REGEX = /.*github.com(\/[^/]+)?(\/.*\/).*/


export const handler: AddressHandler<'githubUrl'> = {
  name: 'githubUrl',
  group: 'url',
  parse({address}) {

    // if (!address.match(GITHUB_REPO_REGEX)) return
    const ghMatches = address.match(GITHUB_REGEX)

    if (!ghMatches) return

    const handled = handleGithubUrl(address)
    const url = new URL(handled)

    return {
      original: address,
      originalNormalized: address,
      address: handled,
      addressNormalized: handled,
      parts: {
        url,
        org: ghMatches[2],
        owner: ghMatches[1],
      },
      type: 'githubUrl',
    }
  },
}

function handleGithubUrl(url: string, {git = false}: {git?: boolean} = {}) {
  // "git+https://" isn't an actual Git protocol. It's just a way to
  // disambiguate that this URL points to a Git repository.
  url = url.replace(/^git\+https:/, `https:`)
  url = url.replace(/^http:/, `https:`)

  return url
}
