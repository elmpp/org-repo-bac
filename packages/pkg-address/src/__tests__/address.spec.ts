// import { createMockContext } from '@monotonous/tests-core'
import { URL, URLSearchParams } from 'url'
import { Address, assertIsAddressPackage, assertIsAddressPath, assertIsAddressUrl } from '../address'
import { AddressDescriptor, AddressHandler, AddressType } from '../__types__'

// import {createMockContext} from '@monotonous/tests-core'
import {npath, PortablePath} from '@business-as-code/fslib'


type TestMapEntry<AddName extends keyof AddressType> = AddressDescriptor<AddName> & {
  arch: NodeJS.Platform
  pathType?: 'portable' | 'native'
  normalize?: boolean
  // matchAddress?: string
}

export type UnwrapPromise<T> = T extends PromiseLike<infer U> ? UnwrapPromise<U> : T;

// export const buildRecipe = <FSName extends Mnt.MapUtil.StackKeys>(recipe: RecipeStateInputScalar<FSName>): RecipeStateInput<FSName> => {
//   return recipe
// }

declare module '../__types__' {
  interface AddressType {
    // schemedUrl: {
    //   scheme: string,
    // }
    bespokeUrl: [{
      bespokePartProp: string,
      url: URL
    }, 'url', string]
  }
}
const bespokeHandler: AddressHandler<'bespokeUrl'> = {
  name: 'bespokeUrl',
  group: 'url',
  parse({address}) {
    try {
      const url = new URL(address)
      return {
        address: address,
        addressNormalized: address,
        original: address,
        originalNormalized: address,
        parts: {
          bespokePartProp: 'whatever',
          url,
        },
        type: 'bespokeUrl',
      }
    }
    catch {}
  },
  format({address}) {
    return 'FORMATTED'
  },
}



describe('Address', () => {

  const buildEntry = <AddName extends keyof AddressType>(entry: TestMapEntry<AddName>) => entry

  const testMapPath = [
    // // normalized
    buildEntry<'portablePathWindowsAbsolute'>({
      original: 'C:\\Users\\user\\proj',
      originalNormalized: 'C:\\Users\\user\\proj' as PortablePath,
      address: '/C:/Users/user/proj' as PortablePath,
      addressNormalized: '/C:/Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsAbsolute',
      parts: {suffix: undefined},
      arch: 'win32',
      pathType: 'portable',
    }),
    buildEntry<'portablePathWindowsAbsolute'>({
      original: 'C:\\Users\\user\\proj\\*',
      originalNormalized: 'C:\\Users\\user\\proj' as PortablePath,
      address: '/C:/Users/user/proj/*' as PortablePath,
      addressNormalized: '/C:/Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsAbsolute',
      parts: {suffix: '/*'},
      arch: 'win32',
      pathType: 'portable',
    }),
    buildEntry<'portablePathWindowsAbsolute'>({
      original: '/C:/Users/user/proj',
      originalNormalized: '/C:/Users/user/proj' as PortablePath,
      address: '/C:/Users/user/proj' as PortablePath,
      addressNormalized: '/C:/Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsAbsolute',
      parts: {suffix: undefined},
      arch: 'win32',
      pathType: 'native', // triggers addr.parsePath() which does not remove portable posix for prop 'original' (i.e. native path)
    }),
    buildEntry<'portablePathWindowsAbsolute'>({
      original: '/C:/Users/user/proj',
      originalNormalized: '/C:/Users/user/proj' as PortablePath,
      address: '/C:/Users/user/proj' as PortablePath,
      addressNormalized: '/C:/Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsAbsolute',
      parts: {suffix: undefined},
      arch: 'win32',
    }),
    buildEntry<'portablePathWindowsAbsolute'>({
      original: '/C:/Users/user/proj/*',
      originalNormalized: '/C:/Users/user/proj' as PortablePath,
      address: '/C:/Users/user/proj/*' as PortablePath,
      addressNormalized: '/C:/Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsAbsolute',
      parts: {suffix: '/*'},
      arch: 'win32',
    }),
    buildEntry<'portablePathWindowsAbsolute'>({
      original: '/C:/Users/user/proj/',
      originalNormalized: '/C:/Users/user/proj' as PortablePath,
      address: '/C:/Users/user/proj/' as PortablePath,
      addressNormalized: '/C:/Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsAbsolute',
      parts: {suffix: undefined},
      arch: 'win32',
    }),
    buildEntry<'portablePathWindowsRelative'>({
      original: '..\\Users\\user/proj',
      originalNormalized: '..\\Users\\user\\proj' as PortablePath,
      address: '../Users/user/proj' as PortablePath,
      addressNormalized: '../Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsRelative',
      arch: 'win32',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathWindowsRelative'>({
      original: '.\\Users\\user/proj',
      originalNormalized: 'Users\\user\\proj' as PortablePath,
      address: './Users/user/proj' as PortablePath,
      addressNormalized: 'Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsRelative',
      arch: 'win32',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathWindowsRelative'>({
      original: '.\\Users\\user/proj/*',
      originalNormalized: 'Users\\user\\proj' as PortablePath,
      address: './Users/user/proj/*' as PortablePath,
      addressNormalized: 'Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsRelative',
      arch: 'win32',
      parts: {suffix: '/*'},
    }),
    buildEntry<'portablePathWindowsRelative'>({
      original: '.\\Users\\user/proj/',
      originalNormalized: 'Users\\user\\proj' as PortablePath,
      address: './Users/user/proj/' as PortablePath,
      addressNormalized: 'Users/user/proj' as PortablePath,
      group: 'path',
      type: 'portablePathWindowsRelative',
      arch: 'win32',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathFilename'>({
      original: '.ext',
      originalNormalized: '.ext' as PortablePath,
      address: '.ext' as PortablePath,
      addressNormalized: '.ext' as PortablePath,
      group: 'path',
      type: 'portablePathFilename',
      arch: 'win32',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathFilename'>({
      original: '.ext/*',
      originalNormalized: '.ext' as PortablePath,
      address: '.ext/*' as PortablePath,
      addressNormalized: '.ext' as PortablePath,
      group: 'path',
      type: 'portablePathFilename',
      arch: 'win32',
      parts: {suffix: '/*'},
    }),
    buildEntry<'portablePathPosixAbsolute'>({
      original: '/Users/repositories/workspace-multiple-commits.git',
      originalNormalized: '/Users/repositories/workspace-multiple-commits.git' as PortablePath,
      address: '/Users/repositories/workspace-multiple-commits.git' as PortablePath,
      addressNormalized: '/Users/repositories/workspace-multiple-commits.git' as PortablePath,
      group: 'path',
      type: 'portablePathPosixAbsolute',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixAbsolute'>({
      original: '/Users/repositories/workspace-multiple-commits',
      originalNormalized: '/Users/repositories/workspace-multiple-commits' as PortablePath,
      address: '/Users/repositories/workspace-multiple-commits' as PortablePath,
      addressNormalized: '/Users/repositories/workspace-multiple-commits' as PortablePath,
      group: 'path',
      type: 'portablePathPosixAbsolute',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixAbsolute'>({
      original: '/Users/repositories/.workspace-multiple-commits',
      originalNormalized: '/Users/repositories/.workspace-multiple-commits' as PortablePath,
      address: '/Users/repositories/.workspace-multiple-commits' as PortablePath,
      addressNormalized: '/Users/repositories/.workspace-multiple-commits' as PortablePath,
      group: 'path',
      type: 'portablePathPosixAbsolute',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixAbsolute'>({
      original: '/Users/repositories/workspace-multiple-commits.git/*',
      originalNormalized: '/Users/repositories/workspace-multiple-commits.git' as PortablePath,
      address: '/Users/repositories/workspace-multiple-commits.git/*' as PortablePath,
      addressNormalized: '/Users/repositories/workspace-multiple-commits.git' as PortablePath,
      group: 'path',
      type: 'portablePathPosixAbsolute',
      arch: 'darwin',
      parts: {suffix: '/*'},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: './workspace-multiple-commits',
      originalNormalized: 'workspace-multiple-commits' as PortablePath,
      address: './workspace-multiple-commits' as PortablePath,
      addressNormalized: 'workspace-multiple-commits' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '../.workspace-multiple-commits',
      originalNormalized: '../.workspace-multiple-commits' as PortablePath,
      address: '../.workspace-multiple-commits' as PortablePath,
      addressNormalized: '../.workspace-multiple-commits' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: 'packages/new-package',
      originalNormalized: 'packages/new-package' as PortablePath,
      address: 'packages/new-package' as PortablePath,
      addressNormalized: 'packages/new-package' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '../packages/new-package',
      originalNormalized: '../packages/new-package' as PortablePath,
      address: '../packages/new-package' as PortablePath,
      addressNormalized: '../packages/new-package' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: './packages/new-package',
      originalNormalized: 'packages/new-package' as PortablePath,
      address: './packages/new-package' as PortablePath,
      addressNormalized: 'packages/new-package' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '../../packages/new-package',
      originalNormalized: '../../packages/new-package' as PortablePath,
      address: '../../packages/new-package' as PortablePath,
      addressNormalized: '../../packages/new-package' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '.././packages/new-package',
      originalNormalized: '../packages/new-package' as PortablePath,
      address: '.././packages/new-package' as PortablePath,
      addressNormalized: '../packages/new-package' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '.././packages/new-package/',
      originalNormalized: '../packages/new-package/' as PortablePath,
      address: '.././packages/new-package/' as PortablePath,
      addressNormalized: '../packages/new-package/' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '.././packages/new-package/another/',
      originalNormalized: '../packages/new-package/another/' as PortablePath,
      address: '.././packages/new-package/another/' as PortablePath,
      addressNormalized: '../packages/new-package/another/' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: 'packages/new-package/another/',
      originalNormalized: 'packages/new-package/another/' as PortablePath,
      address: 'packages/new-package/another/' as PortablePath,
      addressNormalized: 'packages/new-package/another/' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: 'packages/new-package/another',
      originalNormalized: 'packages/new-package/another' as PortablePath,
      address: 'packages/new-package/another' as PortablePath,
      addressNormalized: 'packages/new-package/another' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: '../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts',
      originalNormalized: '../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts' as PortablePath,
      address: '../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts' as PortablePath,
      addressNormalized: '../../Users/matt/dev/org-repo/.yarn/__virtual__/@monotonous-mnt-plugin-essentials-virtual-9720553b9b/1/orgs/monotonous/packages/mnt-plugin-essentials/src/index.ts' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: undefined},
    }),
    buildEntry<'portablePathPosixRelative'>({
      original: 'packages/new-package/another/*',
      originalNormalized: 'packages/new-package/another' as PortablePath,
      address: 'packages/new-package/another/*' as PortablePath,
      addressNormalized: 'packages/new-package/another' as PortablePath,
      group: 'path',
      type: 'portablePathPosixRelative',
      arch: 'darwin',
      parts: {suffix: '/*'},
    }),
    buildEntry<'portablePathFilename'>({
      original: '.workspace-multiple-commits',
      originalNormalized: '.workspace-multiple-commits' as PortablePath,
      address: '.workspace-multiple-commits' as PortablePath,
      addressNormalized: '.workspace-multiple-commits' as PortablePath,
      group: 'path',
      type: 'portablePathFilename',
      arch: 'darwin',
      parts: {},
    }),
    buildEntry<'portablePathFilename'>({
      original: 'workspace-multiple-commits',
      originalNormalized: 'workspace-multiple-commits' as PortablePath,
      address: 'workspace-multiple-commits' as PortablePath,
      addressNormalized: 'workspace-multiple-commits' as PortablePath,
      group: 'path',
      type: 'portablePathFilename',
      arch: 'darwin',
      parts: {},
    }),
    buildEntry<'portablePathFilename'>({
      original: 'workspace-multiple-commits.git',
      originalNormalized: 'workspace-multiple-commits.git' as PortablePath,
      address: 'workspace-multiple-commits.git' as PortablePath,
      addressNormalized: 'workspace-multiple-commits.git' as PortablePath,
      group: 'path',
      type: 'portablePathFilename',
      arch: 'darwin',
      parts: {},
    }),
  ]

  const testMapUrl = [
    buildEntry<'githubRepoUrl'>({
      original: 'https://github.com/elmpp/org-repo.git#head=master',
      originalNormalized: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#head=master'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'https://github.com/elmpp/org-repo.git#head=develop',
      originalNormalized: 'https://github.com/elmpp/org-repo.git#head=develop' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#head=develop' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#head=develop' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#head=develop'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
      originalNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#commit=21c39617a9'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'https://github.com/elmpp/org-repo.git',
      originalNormalized: 'https://github.com/elmpp/org-repo.git' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'https://github.com/elmpp/org-repo/tarball/master',
      originalNormalized: 'https://github.com/elmpp/org-repo/tarball/master' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#head=master'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'https://github.com/elmpp/org-repo/tarball/v0.24',
      originalNormalized: 'https://github.com/elmpp/org-repo/tarball/v0.24' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#tag=v0.24' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#tag=v0.24' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#tag=v0.24'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'http://github.com/elmpp/org-repo/tarball/master',
      originalNormalized: 'http://github.com/elmpp/org-repo/tarball/master' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#head=master' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#head=master'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'git@github.com:elmpp/org-repo.git',
      originalNormalized: 'git@github.com:elmpp/org-repo.git' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git'),
      },
      arch: 'darwin',
    }),
    buildEntry<'githubRepoUrl'>({
      original: 'git@github.com:elmpp/org-repo.git#commit=21c39617a9',
      originalNormalized: 'git@github.com:elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
      address: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
      addressNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
      group: 'url',
      type: 'githubRepoUrl',
      parts: {
        owner: 'elmpp',
        org: 'org-repo',
        url: new URL('https://github.com/elmpp/org-repo.git#commit=21c39617a9'),
        // url: new URL('git@github.com:elmpp/org-repo.git#commit=21c39617a9'),
      },
      arch: 'darwin',
    }),
    buildEntry<'url'>({
      original: 'http://bbc.com/elmpp/org-repo.git',
      originalNormalized: 'http://bbc.com/elmpp/org-repo.git' as PortablePath,
      address: 'http://bbc.com/elmpp/org-repo.git' as PortablePath,
      addressNormalized: 'http://bbc.com/elmpp/org-repo.git' as PortablePath,
      group: 'url',
      type: 'url',
      arch: 'darwin',
      parts: {
        url: new URL('http://bbc.com/elmpp/org-repo.git'),
      },
    }),
    buildEntry<'url'>({
      original: 'http://bbc.com/elmpp/org-repo/tarball',
      originalNormalized: 'http://bbc.com/elmpp/org-repo/tarball' as PortablePath,
      address: 'http://bbc.com/elmpp/org-repo/tarball' as PortablePath,
      addressNormalized: 'http://bbc.com/elmpp/org-repo/tarball' as PortablePath,
      group: 'url',
      type: 'url',
      arch: 'darwin',
      parts: {
        url: new URL('http://bbc.com/elmpp/org-repo/tarball'),
      },
    }),
  ]

  const testMapPackage = [
    buildEntry<'paramIdentPackage'>({
      original: '@monotonous/mnt-plugin-balls#a=b',
      originalNormalized: '@monotonous/mnt-plugin-balls#a=b' as PortablePath,
      address: '@monotonous/mnt-plugin-balls#a=b' as PortablePath,
      addressNormalized: '@monotonous/mnt-plugin-balls#a=b' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: '7c14e38ebd7bd83518270d010b1292e8d582bda586c276d5d3109db9a5f33e39dce7c13a98366cb3ad0198111c4e8588de8017df6e3f90884cdd86d3f207b77e',
          scope: 'monotonous',
          name: 'mnt-plugin-balls',
          identString: '@monotonous/mnt-plugin-balls',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          a: 'b',
        }),
        paramsSorted: new URLSearchParams({
          a: 'b',
        }),
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: '@monotonous/mnt-plugin-balls',
      originalNormalized: '@monotonous/mnt-plugin-balls' as PortablePath,
      address: '@monotonous/mnt-plugin-balls' as PortablePath,
      addressNormalized: '@monotonous/mnt-plugin-balls' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: '7c14e38ebd7bd83518270d010b1292e8d582bda586c276d5d3109db9a5f33e39dce7c13a98366cb3ad0198111c4e8588de8017df6e3f90884cdd86d3f207b77e',
          scope: 'monotonous',
          name: 'mnt-plugin-balls',
          identString: '@monotonous/mnt-plugin-balls',
          protocol: 'npm',
        },
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'mnt-plugin-balls#a=b',
      originalNormalized: 'mnt-plugin-balls#a=b' as PortablePath,
      address: 'mnt-plugin-balls#a=b' as PortablePath,
      addressNormalized: 'mnt-plugin-balls#a=b' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: '66e604be9c5e7bef9711ce02495400e6afde1862cb878be9aea80a6ba656d8740201794b93d3583458e0d27ac4b284b1db94c57264919178ecf346e8c90f9c91',
          name: 'mnt-plugin-balls',
          identString: 'mnt-plugin-balls',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          a: 'b',
        }),
        paramsSorted: new URLSearchParams({
          a: 'b',
        }),
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'mnt-plugin-balls',
      originalNormalized: 'mnt-plugin-balls' as PortablePath,
      address: 'mnt-plugin-balls' as PortablePath,
      addressNormalized: 'mnt-plugin-balls' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: '66e604be9c5e7bef9711ce02495400e6afde1862cb878be9aea80a6ba656d8740201794b93d3583458e0d27ac4b284b1db94c57264919178ecf346e8c90f9c91',
          name: 'mnt-plugin-balls',
          identString: 'mnt-plugin-balls',
          protocol: 'npm',
        },
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'balls',
      originalNormalized: 'balls' as PortablePath,
      address: 'balls' as PortablePath,
      addressNormalized: 'balls' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          protocol: 'npm',
        },
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'balls/subpath',
      originalNormalized: 'balls/subpath' as PortablePath,
      address: 'balls/subpath' as PortablePath,
      addressNormalized: 'balls/subpath' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          protocol: 'npm',
          subpath: 'subpath',
        },
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'balls/package.json',
      originalNormalized: 'balls/package.json' as PortablePath,
      address: 'balls/package.json' as PortablePath,
      addressNormalized: 'balls/package.json' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          protocol: 'npm',
          subpath: 'package.json',
        },
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'balls/subdir/package.json',
      originalNormalized: 'balls/subdir/package.json' as PortablePath,
      address: 'balls/subdir/package.json' as PortablePath,
      addressNormalized: 'balls/subdir/package.json' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          protocol: 'npm',
          subpath: 'subdir/package.json',
        },
      },
    }),
    buildEntry<'paramIdentPackage'>({
      original: 'balls/subdir/package.json#b=b&a=a',
      originalNormalized: 'balls/subdir/package.json#a=a&b=b' as PortablePath,
      address: 'balls/subdir/package.json#a=a&b=b' as PortablePath,
      addressNormalized: 'balls/subdir/package.json#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          protocol: 'npm',
          subpath: 'subdir/package.json',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    // buildEntry<'templateIdentPackage'>({
    //   original: 'balls/subdir/package.json#b=b&a=a',
    //   originalNormalized: 'balls/subdir/package.json#a=a&b=b' as PortablePath,
    //   address: 'balls/subdir/package.json#a=a&b=b' as PortablePath,
    //   addressNormalized: 'balls/subdir/package.json#a=a&b=b' as PortablePath,
    //   group: 'package',
    //   type: 'templateIdentPackage',
    //   arch: 'darwin',
    //   parts: {
    //     descriptor: {
    //       identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
    //       name: 'balls',
    //       identString: 'balls',
    //       protocol: 'npm',
    //       subpath: 'subdir/package.json',
    //     },
    //     params: new URLSearchParams({
    //       b: 'b',
    //       a: 'a',
    //     }),
    //     paramsSorted: new URLSearchParams({
    //       a: 'a',
    //       b: 'b',
    //     }),
    //   },
    // }),
    buildEntry<'paramIdentStringifiedPackage'>({
      original: '___balls#b=b&a=a',
      originalNormalized: 'balls#a=a&b=b' as PortablePath,
      address: 'balls#a=a&b=b' as PortablePath,
      addressNormalized: 'balls#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramIdentStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          scope: undefined,
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          protocol: 'npm',
          // subpath: 'subdir/package.json',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramIdentStringifiedPackage'>({
      original: '@org___balls#b=b&a=a',
      originalNormalized: '@org/balls#a=a&b=b' as PortablePath,
      address: '@org/balls#a=a&b=b' as PortablePath,
      addressNormalized: '@org/balls#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramIdentStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          scope: 'org',
          identHash: 'c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5',
          name: 'balls',
          identString: '@org/balls',
          protocol: 'npm',
          // subpath: 'subdir/package.json',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramIdentStringifiedPackage'>({
      original: '@or__g___balls#b=b&a=a',
      originalNormalized: '@or__g/balls#a=a&b=b' as PortablePath,
      address: '@or__g/balls#a=a&b=b' as PortablePath,
      addressNormalized: '@or__g/balls#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramIdentStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          scope: 'or__g',
          identHash: 'e0b96ddc15135afa309230ca21dec1a180290fe8f3f86e86f53b7deb3bdf24b095bc285e095fadd6a535c79a265ef382859b5528052fea91e6cd571588b86f55',
          name: 'balls',
          identString: '@or__g/balls',
          protocol: 'npm',
          // subpath: 'subdir/package.json',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'templateIdentPackage'>({
      original: 'root#namespace=/',
      originalNormalized: 'root#namespace=%2F',
      address: 'root#namespace=/',
      addressNormalized: 'root#namespace=%2F',
      group: 'package',
      type: 'templateIdentPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: '8b15a3825a289656c6cc85d269570688a8cd7fb111fb6884c3114eccb4c2a645043b052b63b37ec212f88e63ab9e93dabfedee9eea5c0f2250139009a155606c',
          name: 'root',
          identString: 'root',
          protocol: 'npm',
          scope: undefined,
        },
        params: new URLSearchParams({
          namespace: '/',
        }),
        paramsSorted: new URLSearchParams({
          namespace: '/',
        }),
      },
    }),
    buildEntry<'paramDescriptorPackage'>({
      original: 'balls@v1.0.0#b=b&a=a',
      originalNormalized: 'balls@v1.0.0#a=a&b=b' as PortablePath,
      address: 'balls@v1.0.0#b=b&a=a' as PortablePath,
      addressNormalized: 'balls@v1.0.0#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          range: 'v1.0.0',
          protocol: 'npm',
          scope: undefined,
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorPackage'>({
      original: 'balls@1.0.0#b=b&a=a',
      originalNormalized: 'balls@1.0.0#a=a&b=b' as PortablePath,
      address: 'balls@1.0.0#b=b&a=a' as PortablePath,
      addressNormalized: 'balls@1.0.0#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          range: '1.0.0',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorPackage'>({
      original: 'balls@>=2#b=b&a=a',
      originalNormalized: 'balls@>=2#a=a&b=b' as PortablePath,
      address: 'balls@>=2#b=b&a=a' as PortablePath,
      addressNormalized: 'balls@>=2#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          name: 'balls',
          identString: 'balls',
          range: '>=2',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorPackage'>({
      original: '@org/balls@v1.0.0#b=b&a=a',
      originalNormalized: '@org/balls@v1.0.0#a=a&b=b' as PortablePath,
      address: '@org/balls@v1.0.0#b=b&a=a' as PortablePath,
      addressNormalized: '@org/balls@v1.0.0#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5',
          scope: 'org',
          name: 'balls',
          identString: '@org/balls',
          range: 'v1.0.0',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorPackage'>({
      original: '@org/balls@>=2#b=b&a=a',
      originalNormalized: '@org/balls@>=2#a=a&b=b' as PortablePath,
      address: '@org/balls@>=2#b=b&a=a' as PortablePath,
      addressNormalized: '@org/balls@>=2#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5',
          scope: 'org',
          name: 'balls',
          identString: '@org/balls',
          range: '>=2',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorStringifiedPackage'>({
      original: '@org___balls@>=2#b=b&a=a',
      originalNormalized: '@org___balls@>=2#b=b&a=a' as PortablePath,
      address: '@org/balls@>=2#b=b&a=a' as PortablePath,
      addressNormalized: '@org/balls@>=2#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'c4e908e191a712b3b3da9da9f79bff547bc1022c6dfd7715db2df00e203e29c18c47f0f4ea8bbab1b5b35bcc18da139900903e8843144d5875a5593b9c0741c5',
          scope: 'org',
          name: 'balls',
          identString: '@org/balls',
          range: '>=2',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorStringifiedPackage'>({
      original: '@or__g___balls@>=2#b=b&a=a',
      originalNormalized: '@or__g___balls@>=2#b=b&a=a' as PortablePath,
      address: '@or__g/balls@>=2#b=b&a=a' as PortablePath,
      addressNormalized: '@or__g/balls@>=2#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'e0b96ddc15135afa309230ca21dec1a180290fe8f3f86e86f53b7deb3bdf24b095bc285e095fadd6a535c79a265ef382859b5528052fea91e6cd571588b86f55',
          scope: 'or__g',
          name: 'balls',
          identString: '@or__g/balls',
          range: '>=2',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorStringifiedPackage'>({
      original: '@or_g___balls@>=2#b=b&a=a',
      originalNormalized: '@or_g___balls@>=2#b=b&a=a' as PortablePath,
      address: '@or_g/balls@>=2#b=b&a=a' as PortablePath,
      addressNormalized: '@or_g/balls@>=2#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: '9ed19bb4d15672abba663444d6bfdda7f27867de5b6be730e7b9b7532b08359ba6d4191b442e0ad21d347036144e465afe83b373363a4ee528f6bdf9f2769679',
          scope: 'or_g',
          name: 'balls',
          identString: '@or_g/balls',
          range: '>=2',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
    buildEntry<'paramDescriptorStringifiedPackage'>({
      original: '___balls@>=2#b=b&a=a',
      originalNormalized: '___balls@>=2#b=b&a=a' as PortablePath,
      address: 'balls@>=2#b=b&a=a' as PortablePath,
      addressNormalized: 'balls@>=2#a=a&b=b' as PortablePath,
      group: 'package',
      type: 'paramDescriptorStringifiedPackage',
      arch: 'darwin',
      parts: {
        descriptor: {
          identHash: 'aa82d56823a3a97a24d18e9483a16d0dfa22a28528a47dd03552bf4ec8e446979c53b7bb52562390ef9544d12d76b6ceb10ca72bc36bd8d6609863c3fd04c66a',
          scope: undefined,
          name: 'balls',
          identString: 'balls',
          range: '>=2',
          protocol: 'npm',
        },
        params: new URLSearchParams({
          b: 'b',
          a: 'a',
        }),
        paramsSorted: new URLSearchParams({
          a: 'a',
          b: 'b',
        }),
      },
    }),
  ]

  const testMap = [
    ...testMapPath,
    ...testMapUrl,
    ...testMapPackage,
  ]



  // const initWorkrootRecipe: RecipeStateMinimal<'workrootInit'> = {
  // const initWorkrootRecipe = buildRecipe({
  //   "meta": {
  //     // "phaseMode": "allStopOnError",
  //     // "workrootStackName": "workrootInit",
  //     // "recipeMode": "initialValue"
  //   },
  //   "workroot": [{
  //     "meta": {
  //       // "stackName":"workrootInit",
  //       "pkg": {
  //         "relativeCwd": npath.toPortablePath('/')
  //       },
  //     },
  //     'state': {
  //       // "workrootMeta":{"workrootMetaLocation":{"_fName":"workrootMetaLocation","_fcName":"workrootMeta","_fsName":"workrootInit","_version":1}},
  //       // "workrootLanguage":{"workrootLanguageTsc":{"tsconfigPath":"tsconfig.json","type":"shell","command":"tsc","_fName":"workrootLanguageTsc","_fcName":"workrootLanguage","_fsName":"workrootInit","_version":1}},
  //       "workrootPackageManager":{"workrootPackageManagerYarn2Pnp":{"nodeLinker":"pnp","enableColors":true,"npmRegistry":"http://registry.yarnpkg.com","_fName":"workrootPackageManagerYarn2Pnp","_fcName":"workrootPackageManager","_fsName":"workrootInit","_version":1}},
  //       "workrootUser":{"workrootUserAdmin":{"name":"wefwef","email":"wefwef@wewefw.wefwf","_fName":"workrootUserAdmin","_fcName":"workrootUser","_fsName":"workrootInit","_version":1}},
  //       "workrootScs":{"workrootScsGithub":{"username":"elmpp","token":"9f72b4dc6fa73136c05cec1546d186fe69eb81db","_fName":"workrootScsGithub","_fcName":"workrootScs","_fsName":"workrootInit","_version":1}}
  //     } as any,
  //   }]
  // })

  let addr: Address
  // let context: UnwrapPromise<ReturnType<typeof createMockContext>>
  // let context: UnwrapPromise<ReturnType<typeof createContext>>
  beforeAll(async () => {
    // context = await createMockContext({
    // context = await createContext({
    //   // recipe: initWorkrootRecipe,
    //   projectCwd: {
    //     original: '/tmp/mnt',
    //     originalNormalized: '/tmp/mnt',
    //     address: '/tmp/mnt' as PortablePath,
    //     addressNormalized: '/tmp/mnt' as PortablePath,
    //     parts: {},
    //     group: 'path',
    //     type: 'portablePathPosixAbsolute',
    //   },
    // })
    // context = await createContext({
    //   recipe: initWorkrootRecipe,
    //   projectCwd: npath.toPortablePath('/tmp/mnt'),
    // })
  })
  beforeEach(async () => {
    addr = Address.initialise({parseParams: {}})
  })

  describe('parse all groups', () => {
    it('recognises various formats without group hint', () => {
      // const realPlatform: NodeJS.Platform = process.platform
      testMap.forEach(({arch, pathType = 'native', ...entry}) => {

        // if (entry.address !== 'root#namespace=/') return

        Object.defineProperty(process, `platform`, {
          configurable: true,
          value: arch,
        })

        let parsed: any
        try {
          parsed = addr.parse({
            address: `${entry.group}:${entry.original}` as PortablePath,
            arch,
            pathType,
            options: {},
          })
          expect(parsed).toEqual(entry)
        }
        catch (err) {
          console.log(`failed at parseStr, entry, parsed :>> `, `${entry.group}:${entry.original}`, entry, parsed)
          throw err
        }
      })
    })
  })
  describe('group accessors', () => {
    it('path', () => {
      expect(addr.parsePath('/Users/repositories/workspace-multiple-commits')).toEqual(
        {
          original: '/Users/repositories/workspace-multiple-commits',
          originalNormalized: '/Users/repositories/workspace-multiple-commits',
          address: '/Users/repositories/workspace-multiple-commits' as PortablePath,
          addressNormalized: '/Users/repositories/workspace-multiple-commits' as PortablePath,
          group: 'path',
          type: 'portablePathPosixAbsolute',
          parts: {
            suffix: undefined,
          },
        }
      )

      expect(() => addr.parsePackage('/Users/repositories/workspace-multiple-commits')).toThrowError(/Address: unable to parse '\/Users\/repositories\/workspace-multiple-commits'/)
    })
    it('url', () => {
      expect(addr.parseUrl('https://github.com/elmpp/org-repo.git#commit=21c39617a9')).toEqual(
        {
          original: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
          originalNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
          address: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
          addressNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9' as PortablePath,
          type: 'githubRepoUrl',
          group: 'url',
          parts: {
            org: 'org-repo',
            owner: 'elmpp',
            url: new URL('https://github.com/elmpp/org-repo.git#commit=21c39617a9'),
          },
        }
      )

      expect(() => addr.parsePath('http://bbc.com/elmpp/org-repo/tarball')).toThrowError(/Address: unable to parse 'http:\/\/bbc.com\/elmpp\/org-repo\/tarball'/)
    })
    it('package', () => {
      expect(addr.parsePackage('mnt-plugin-balls')).toEqual(
        {
          original: 'mnt-plugin-balls',
          originalNormalized: 'mnt-plugin-balls',
          address: 'mnt-plugin-balls',
          addressNormalized: 'mnt-plugin-balls',
          group: 'package',
          type: 'paramIdentPackage',
          parts: {
            descriptor: {
              identHash: '66e604be9c5e7bef9711ce02495400e6afde1862cb878be9aea80a6ba656d8740201794b93d3583458e0d27ac4b284b1db94c57264919178ecf346e8c90f9c91',
              name: 'mnt-plugin-balls',
              identString: 'mnt-plugin-balls',
              protocol: 'npm',
            },
          },
        }
      )

      expect(() => addr.parsePath('@monotonous/mnt-plugin-balls')).toThrowError(/Address: unable to parse '@monotonous\/mnt-plugin-balls'/)
    })
  })

  describe('specific parsing validation', () => {
    describe('path', () => {
    })
    describe('url', () => {
    })
    describe('package', () => {
      it(`templateIdentPackage requires a 'namespace' param`, () => {
        expect(() => addr.parseAsType('@monotonous/mnt-plugin-balls', 'templateIdentPackage', {strict: true})).toThrowError(/Address: a namespace param is required when defining package paths with 'template-ident-package-handler'. e.g. my-package#namespace=my-template-folder. Address: '@monotonous\/mnt-plugin-balls'/)
      })
      it(`parseAsType throws error with default strict`, () => {
        expect(() => addr.parseAsType('this-is-a-path-filename-not-a-templateIdentPackage', 'templateIdentPackage', {}))
        .toThrowError(`Address: unable to parse 'this-is-a-path-filename-not-a-templateIdentPackage' as group/type: '-/templateIdentPackage'. Error: 'Address: unable to parse 'this-is-a-path-filename-not-a-templateIdentPackage' as group/type: '-/templateIdentPackage'`)
      })
    })
  })

  // the api we want to make common across the groups
  describe('common api', () => {
    describe('format', () => {
      it('path: default handler', () => {
        Object.defineProperty(process, `platform`, {
          configurable: true,
          value: 'win32',
        })
        const ret = addr.parsePath('C:\\Users\\user\\proj')

        expect(addr.format(ret)).toEqual(`C:\\Users\\user\\proj`) // shows original
      })
      it('url: default handler', () => {
        const ret = addr.parseUrl('http://www.bbc.com?b=b&a=a')

        expect(addr.format(ret)).toEqual(`http://www.bbc.com/?a=a&b=b`) // applied normalization
      })
      it('url: handler format', () => {
        addr.registerHandler(bespokeHandler)
        const ret = addr.parseUrl('http://www.bbc.com')

        expect(addr.format(ret)).toEqual(`FORMATTED`)
      })
      it('package: default handler', () => {
        const ret = addr.parsePackage('@monotonous/mnt-plugin-mine#b=b&a=a')

        expect(addr.format(ret)).toEqual(`@monotonous/mnt-plugin-mine#a=a&b=b`) // applied normalization
      })
    })
  })
  describe('handlers', () => {
    it('adding a handler to a group makes it firstly considered', () => {
      addr.registerHandler(bespokeHandler)
      expect(addr.parse({
        address: 'url:https://github.com/elmpp/org-repo.git#commit=21c39617a9',
      })).toEqual(
        {
          original: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
          originalNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
          address: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
          addressNormalized: 'https://github.com/elmpp/org-repo.git#commit=21c39617a9',
          type: 'bespokeUrl',
          group: 'url',
          parts: {
            bespokePartProp: 'whatever',
            url: new URL('https://github.com/elmpp/org-repo.git#commit=21c39617a9'),
          },
        }
      )
    })
  })
  describe('utility', () => {
    it('typeguards', () => {
      const realPlatform: NodeJS.Platform = process.platform
      testMap.forEach(({arch, ...entry}) => {
        Object.defineProperty(process, `platform`, {
          configurable: true,
          value: arch,
        })

        const res = addr.parse({
          address: `${entry.group}:${entry.original}`,
          arch,
        })

        switch (res?.group) {
          case 'url':
            expect(assertIsAddressUrl(res)).toBeTruthy()
            expect(assertIsAddressPath(res)).toBeFalsy()
            expect(assertIsAddressPackage(res)).toBeFalsy()
            break
          case 'path':
            expect(assertIsAddressUrl(res)).toBeFalsy()
            expect(assertIsAddressPath(res)).toBeTruthy()
            expect(assertIsAddressPackage(res)).toBeFalsy()
            break
          case 'package':
            expect(assertIsAddressUrl(res)).toBeFalsy()
            expect(assertIsAddressPath(res)).toBeFalsy()
            expect(assertIsAddressPackage(res)).toBeTruthy()
            break
        }
      })
    })
  })
})

//  NEED TO CLEAR OUT THE OTHER ADDRESS IMPLEMENTATION AFTER THIS
// THIS IS ALL TO ALLOW STACK REFERENCE AND REPLACE THE SCAFFOLD NAMESPACE OBJECT