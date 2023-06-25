import {AddressHandler} from '../__types__'
import {URL} from 'url'
import { REGEX as URL_REGEX } from './url-handler'
import { arrayIntersection } from '../tools/string-utils'

declare module '../__types__' {
  interface AddressType {
    // schemedUrl: {
    //   scheme: string,
    // }
    gitHttpRepoUrl: [{
      url: URL,

      // user: string,
      scheme: 'http' | 'https'
      host: string,
      port?: number
      repo: string

      // path: string,
      // key?: string
      params: URLSearchParams
      paramsSorted: URLSearchParams

      // org: string,
      // owner: string
    }, 'url', string]
  }
}

// const GIT_REPO_REGEX = /.*github.com(?:\/|:).*(?:\.git|\/tarball)[#?]?.*/
// const URL_REGEX = /https?:\/\/([-a-zA-Z0-9@:%._\+~#=]{1,256}\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/ // SO - https://tinyurl.com/2jjo64u4
// const REGEX = /https?:\/\/.*github.com\/([^/]+)\/(.*)\.git(?:#([^#]+))?$/
// console.log(`${URL_REGEX}/([a-zA-Z0-9()\-]+\.git)(?:#([^#]+))?$`)

const REGEX = new RegExp(`${URL_REGEX.source}/([a-zA-Z0-9()\-]+\.git)(?:#([^#]+))?$`)
// const GITHUB_REPO_NORMALIZED_REGEX = /.*github.com\/([^/]+)\/(.*)\.git[#?]?.*/


/**
 e.g.:
  - http://localhost:8174/bare-repo1.git
  - http://localhost:8174/bare-repo1.git?tag=v0.24
  - http://localhost:8174/bare-repo1.git?commit=21c39617a9
 */
export const handler: AddressHandler<'gitHttpRepoUrl'> = {
  name: 'gitHttpRepoUrl',
  group: 'url',
  parse({address}) {

    // console.log(`githttprepourl address, address.match(REGEX) :>> `, address, address.match(REGEX), REGEX)
    if (!address.match(REGEX)) return

    // if (!address.match(GITHUB_REPO_REGEX)) return
    // const handled = handleGitRepoUrl(address)


    const matches = address.match(REGEX)
    // console.log(`matches :>> `, matches)

    if (!matches) return

    const [, scheme, host, port, _, repo, hashParamString] = matches

    const params = new URLSearchParams(hashParamString ?? '')
    const paramIntersection = arrayIntersection(Object.keys(params), ['head', 'tag', 'commit'])
    if (paramIntersection.unmatched.length) {
      throw new Error(`Address: unknown params has been supplied when url with 'git-http-repo-url-handler'. Allowed params are 'head, tag, commit'. Address: '${address}'`)
    }
    const paramsSorted = (() => {const params = new URLSearchParams(hashParamString); params.sort(); return params})()

    if (!['http', 'https'].includes(scheme)) {
      throw new Error(`Address: incorrect scheme with 'git-http-repo-url-handler'. Allowed params are 'http, https'. Address: '${address}'`)
    }

    const url = new URL(address)

    return {
      original: address,
      originalNormalized: address,
      address,
      addressNormalized: address,
      parts: {
        url,
        scheme: scheme as 'http' | 'https',
        host,
        port: port ? parseInt(port, 10) : undefined,
        repo,
        params,
        paramsSorted,
      },
      type: 'gitHttpRepoUrl',
    }
  },
}

// function handleGitRepoUrl(url: string, {git = false}: {git?: boolean} = {}) {
//   // "git+https://" isn't an actual Git protocol. It's just a way to
//   // disambiguate that this URL points to a Git repository.
//   url = url.replace(/^git\+https:/, `https:`)
//   url = url.replace(/^http:/, `https:`)

//   // // We support this as an alias to GitHub repositories
//   // url = url.replace(
//   //   /^(?:github:|https:\/\/github\.com\/)?(?!\.{1,2}\/)([a-zA-Z0-9._-]+)\/(?!\.{1,2}(?:#|$))([a-zA-Z0-9._-]+?)(?:\.git)?(#.*)?$/,
//   //   `https://github.com/$1/$2.git$3`
//   // )

//   // // We support GitHub `/tarball/` URLs e.g.
//   // url = url.replace(
//   //   /^https:\/\/github\.com\/(?!\.{1,2}\/)([a-zA-Z0-9._-]+)\/(?!\.{1,2}(?:#|$))([a-zA-Z0-9._-]+?)\/tarball\/(.+)?$/,
//   //   (_, username: string, repo: string, tarballTag: string) =>
//   //     `https://github.com/${username}/${repo}.git#${tarballTag.startsWith('v') ? 'tag' : 'head'}=${tarballTag}`
//   // )

//   // support for git url e.g. git@github.com:elmpp/org-repo.git
//   // url = url.replace(/^git@github\.com:([^\/]+)\/(.+)$/, `https://github.com/$1/$2`)

//   // The `git+` prefix doesn't mean anything at all for Git
//   if (git) url = url.replace(/^git\+([^:]+):/, `$1:`)

//   return url
// }
