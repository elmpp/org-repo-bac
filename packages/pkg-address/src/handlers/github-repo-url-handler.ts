import { AddressHandler } from '../__types__'
import { URL } from 'url'
import { arrayIntersection } from '../tools/string-utils'

declare module '../__types__' {
  interface AddressType {
    // schemedUrl: {
    //   scheme: string,
    // }
    githubRepoUrl: [
      {
        url: URL
        org: string
        user: string
        params: URLSearchParams
        paramsSorted: URLSearchParams
        // head?: string
        // tag?: string
        // commit?: string
      },
      'url',
      string
    ]
  }
}

const GITHUB_REPO_REGEX =
  /.*github.com(?:\/|:).*(?:\.git|\/tarball)?(?:#([^#]+))?$/
const GITHUB_REPO_NORMALIZED_REGEX =
  /.*github.com\/([^/]+)\/(.*)\.git(?:#([^#]+))?$/

export const handler: AddressHandler<'githubRepoUrl'> = {
  name: 'githubRepoUrl',
  group: 'url',
  parse({ address }) {
    // console.log(`address, address.match(GITHUB_REPO_REGEX) :>> `, address, address.match(GITHUB_REPO_REGEX))
    if (!address.match(GITHUB_REPO_REGEX)) return

    // if (!address.match(GITHUB_REPO_REGEX)) return
    const handled = handleGithubRepoUrl(address)

    const matches = handled.match(GITHUB_REPO_NORMALIZED_REGEX)
    // console.log(`handled :>> `, handled)
    // console.log(`matches :>> `, matches)
    if (!matches) return

    const [, user, org, hashParamString] = matches

    const params = new URLSearchParams(hashParamString ?? '')
    const paramIntersection = arrayIntersection(Object.keys(params), [
      'head',
      'tag',
      'commit'
    ])
    if (paramIntersection.unmatched.length) {
      throw new Error(
        `Address: unknown params has been supplied when url with 'github-repo-url-handler'. Allowed params are 'head, tag, commit'. Address: '${address}'`
      )
    }
    const paramsSorted = (() => {
      const params = new URLSearchParams(hashParamString)
      params.sort()
      return params
    })()

    const url = new URL(handled)

    return {
      original: address,
      originalNormalized: address,
      address: handled,
      addressNormalized: handled,
      parts: {
        org,
        user,
        url,
        params,
        paramsSorted
      },
      type: 'githubRepoUrl'
    }
  }
}

function handleGithubRepoUrl(
  url: string,
  { git = false }: { git?: boolean } = {}
) {
  // "git+https://" isn't an actual Git protocol. It's just a way to
  // disambiguate that this URL points to a Git repository.
  url = url.replace(/^git\+https:/, `https:`)
  url = url.replace(/^http:/, `https:`)

  // We support this as an alias to GitHub repositories
  url = url.replace(
    /^(?:github:|https:\/\/github\.com\/)?(?!\.{1,2}\/)([a-zA-Z0-9._-]+)\/(?!\.{1,2}(?:#|$))([a-zA-Z0-9._-]+?)(?:\.git)?(#.*)?$/,
    `https://github.com/$1/$2.git$3`
  )

  // We support GitHub `/tarball/` URLs e.g.
  url = url.replace(
    /^https:\/\/github\.com\/(?!\.{1,2}\/)([a-zA-Z0-9._-]+)\/(?!\.{1,2}(?:#|$))([a-zA-Z0-9._-]+?)\/tarball\/(.+)?$/,
    (_, username: string, repo: string, tarballTag: string) =>
      `https://github.com/${username}/${repo}.git#${tarballTag.startsWith('v') ? 'tag' : 'head'}=${tarballTag}`
  )

  // support for git url e.g. git@github.com:elmpp/org-repo.git
  url = url.replace(
    /^git@github\.com:([^\/]+)\/(.+)$/,
    `https://github.com/$1/$2`
  )

  // The `git+` prefix doesn't mean anything at all for Git
  if (git) url = url.replace(/^git\+([^:]+):/, `$1:`)

  return url
}
