import { PortablePath } from '@business-as-code/fslib'
import { Address } from '../address'
import { AddressPathUtils } from '../address-path'
import { AddressTypeByGroup, AddressDescriptor, AddressPathAbsolute, AddressPathRelative } from '../__types__'


describe('addr.pathUtils', () => {

  let addr: Address
  let addressPathUtils: AddressPathUtils

  beforeEach(async () => {
    addr = Address.initialise({parseParams: {packageManager: 'workrootPackageManagerYarn2Pnp'}})
    addressPathUtils = addr.pathUtils
  })
  describe('static references', () => {
    it('references', () => {
      const realCwd = process.cwd()
      process.chdir('/')
      expect(addressPathUtils.root).toEqual(
        {
          original: '/',
          originalNormalized: '/',
          address: '/',
          addressNormalized: '/',
          group: 'path',
          type: 'portablePathPosixAbsolute',
          parts: {},
        }
      )
      expect(addressPathUtils.dot).toEqual(
        {
          original: '.',
          originalNormalized: '.',
          address: '.',
          addressNormalized: '.',
          group: 'path',
          type: 'portablePathPosixRelative',
          parts: {},
        }
      )
      expect(addressPathUtils.cwd).toEqual(
        {
          original: '/',
          originalNormalized: '/',
          address: '/',
          addressNormalized: '/',
          group: 'path',
          type: 'portablePathPosixAbsolute',
          parts: {},
        }
      )
      process.chdir(realCwd)
    })
  })
  describe('other methods', () => {
    // it('projectSubPath', () => {

    //   const projectCwd = addr.parsePath('/tmp') as AddressPathAbsolute
    //   // const worktree: import('@monotonous/core/src/database/entity/main/worktree-entity').WorktreeEntitySpec = {
    //   const worktree: any = {
    //     relativeCwd: 'orgs/org1' as PortablePath,
    //     type: 'worktree',
    //   }

    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workroot',
    //     absolute: true,
    //   })).toEqual(
    //     {
    //       original: '/tmp',
    //       originalNormalized: '/tmp',
    //       address: '/tmp',
    //       addressNormalized: '/tmp',
    //       group: 'path',
    //       type: 'portablePathPosixAbsolute',
    //       parts: {},
    //     }
    //   )
    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workroot',
    //     absolute: false,
    //   })).toEqual(
    //     {
    //       original: '.',
    //       originalNormalized: '.',
    //       address: '.',
    //       addressNormalized: '.',
    //       group: 'path',
    //       type: 'portablePathPosixRelative',
    //       parts: {},
    //     }
    //   )
    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workroot',
    //     absolute: true,
    //     relativeCwd: '.' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: '/tmp',
    //       originalNormalized: '/tmp',
    //       address: '/tmp',
    //       addressNormalized: '/tmp',
    //       group: 'path',
    //       type: 'portablePathPosixAbsolute',
    //       parts: {},
    //     }
    //   )
    //   expect(() => addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workroot',
    //     absolute: false,
    //     relativeCwd: './path-with-workroot-illogical' as PortablePath,
    //   })).toThrowError(/AddressPath#projectSubPath\(\): `relativeCwd` supplied for a workroot resolve that isn't '.'/)
    //   expect(() => addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workroot',
    //     absolute: false,
    //     worktree,
    //     // relativeCwd: './ILLOGICAL' as PortablePath
    //   })).toThrowError(/AddressPath#projectSubPath\(\): `worktree` only suppliable for a `workspace` type/)



    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workspace',
    //     absolute: true,
    //     relativeCwd: 'packages/new-package' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: '/tmp/packages/new-package',
    //       originalNormalized: '/tmp/packages/new-package',
    //       address: '/tmp/packages/new-package',
    //       addressNormalized: '/tmp/packages/new-package',
    //       group: 'path',
    //       type: 'portablePathPosixAbsolute',
    //       parts: {},
    //     }
    //   )
    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workspace',
    //     absolute: false,
    //     relativeCwd: 'packages/new-package' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: 'packages/new-package',
    //       originalNormalized: 'packages/new-package',
    //       address: 'packages/new-package',
    //       addressNormalized: 'packages/new-package',
    //       group: 'path',
    //       type: 'portablePathPosixRelative',
    //       parts: {},
    //     }
    //   )
    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workspace',
    //     absolute: true,
    //     worktree,
    //     relativeCwd: 'packages/new-package' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: '/tmp/orgs/org1/packages/new-package',
    //       originalNormalized: '/tmp/orgs/org1/packages/new-package',
    //       address: '/tmp/orgs/org1/packages/new-package',
    //       addressNormalized: '/tmp/orgs/org1/packages/new-package',
    //       group: 'path',
    //       type: 'portablePathPosixAbsolute',
    //       parts: {},
    //     }
    //     )
    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'workspace',
    //     absolute: false,
    //     worktree,
    //     relativeCwd: 'packages/new-package' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: 'orgs/org1/packages/new-package',
    //       originalNormalized: 'orgs/org1/packages/new-package',
    //       address: 'orgs/org1/packages/new-package',
    //       addressNormalized: 'orgs/org1/packages/new-package',
    //       group: 'path',
    //       type: 'portablePathPosixRelative',
    //       parts: {},
    //     }
    //   )



    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'worktree',
    //     absolute: true,
    //     relativeCwd: 'orgs/new-worktree' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: '/tmp/orgs/new-worktree',
    //       originalNormalized: '/tmp/orgs/new-worktree',
    //       address: '/tmp/orgs/new-worktree',
    //       addressNormalized: '/tmp/orgs/new-worktree',
    //       group: 'path',
    //       type: 'portablePathPosixAbsolute',
    //       parts: {},
    //     }
    //   )
    //   expect(addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'worktree',
    //     absolute: false,
    //     relativeCwd: 'orgs/new-worktree' as PortablePath,
    //   })).toEqual(
    //     {
    //       original: 'orgs/new-worktree',
    //       originalNormalized: 'orgs/new-worktree',
    //       address: 'orgs/new-worktree',
    //       addressNormalized: 'orgs/new-worktree',
    //       group: 'path',
    //       type: 'portablePathPosixRelative',
    //       parts: {},
    //     }
    //   )
    //   expect(() => addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'worktree',
    //     absolute: false,
    //     relativeCwd: 'non-orgs-path' as PortablePath
    //   })).toThrowError(new RegExp(`The worktree relativeCwd 'non-orgs-path' does not match expected`))
    //   expect(() => addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'worktree',
    //     absolute: false,
    //     relativeCwd: './orgs/new-worktree-with-leading-dot' as PortablePath
    //   })).toThrowError(new RegExp(`The worktree relativeCwd './orgs/new-worktree-with-leading-dot' does not match expected`))
    //   expect(() => addressPathUtils.projectSubPath({
    //     projectCwd,
    //     tier: 'worktree',
    //     absolute: false,
    //     worktree,
    //     relativeCwd: 'orgs/new-worktree' as PortablePath
    //   })).toThrowError(/AddressPath#projectSubPath\(\): `worktree` only suppliable for a `workspace` type/)
    // })
  })
  describe('parseAsType', () => {
    it.skip(`non-absolute paths may be parsed as relative, even if they could also be 'portablePathFilename'`, () => {
      expect(addr.parseAsType(addr.pathUtils.dot.address, 'portablePathPosixRelative')).toHaveProperty('original', '.') // currently not supported :(
    })
  })
  describe('posix path methods', () => {
    it('resolve', () => {
      const realCwd = process.cwd()
      process.chdir('/')

      expect(addressPathUtils.resolve(addressPathUtils.root, addr.parsePath('/tmp'))).toEqual(
        {
          original: '/tmp',
          originalNormalized: '/tmp',
          address: '/tmp',
          addressNormalized: '/tmp',
          group: 'path',
          type: 'portablePathPosixAbsolute',
          parts: {},
        }
      )
      expect(addressPathUtils.resolve(addr.parsePath('relative'))).toEqual(
        {
          original: '/relative',
          originalNormalized: '/relative',
          address: '/relative',
          addressNormalized: '/relative',
          group: 'path',
          type: 'portablePathPosixAbsolute',
          parts: {},
        }
      )
      expect(addressPathUtils.resolve(addr.parsePath('/Users/matt/dev/org-repo/orgs/monotonous/packages/mnt-pkg-database'), addr.parsePath('../../../..'))).toEqual(
        {
          original: '/Users/matt/dev/org-repo',
          originalNormalized: '/Users/matt/dev/org-repo',
          address: '/Users/matt/dev/org-repo',
          addressNormalized: '/Users/matt/dev/org-repo',
          group: 'path',
          type: 'portablePathPosixAbsolute',
          parts: {},
        }
      )
      process.chdir(realCwd)
    })
    it('join', () => {
      const testMap: [AddressDescriptor<AddressTypeByGroup<"path">>[], Partial<Pick<AddressDescriptor<AddressTypeByGroup<"path">>, 'original' | 'originalNormalized' | 'address' | 'addressNormalized' | 'type'>>, AddressDescriptor<AddressTypeByGroup<"path">>['parts']][] = [
        [[addressPathUtils.root, addr.parsePath('/tmp')], {original: '/tmp', originalNormalized: '/tmp', address: '/tmp' as PortablePath, addressNormalized: '/tmp' as PortablePath}, {suffix: undefined}],
        [[addr.parsePath('/tmp1'), addr.parsePath('/tmp2')], {original: '/tmp1/tmp2', originalNormalized: '/tmp1/tmp2', address: '/tmp1/tmp2' as PortablePath, addressNormalized: '/tmp1/tmp2' as PortablePath}, {suffix: undefined}],
        [[addr.parsePath('/tmp1/*'), addr.parsePath('/tmp2/*')], {original: '/tmp1/tmp2/*', originalNormalized: '/tmp1/tmp2', address: '/tmp1/tmp2/*' as PortablePath, addressNormalized: '/tmp1/tmp2' as PortablePath}, {suffix: '/*'}],
        [[addr.parsePath('./*'), addr.parsePath('.')], {original: '.', originalNormalized: '.', address: '.' as PortablePath, addressNormalized: '.' as PortablePath, type: 'portablePathFilename'}, {suffix: undefined}],
        [[addr.parsePath('.'), addr.parsePath('./*')], {original: './*', originalNormalized: '.', address: './*' as PortablePath, addressNormalized: '.' as PortablePath, type: 'portablePathPosixRelative'}, {suffix: '/*'}],
      ]

      for (const [segments, expectations, parts] of testMap) {
        const ret = addressPathUtils.join(...segments)
        expect(ret).toEqual(
          {
            type: 'portablePathPosixAbsolute',
            ...expectations,
            group: 'path',
            parts,
          }
        )
      }

    })
    it('isAbsolute', () => {
      expect(addressPathUtils.isAbsolute(addr.parsePath('/tmp'))).toBeTruthy()

      expect(addressPathUtils.isAbsolute(addressPathUtils.dot)).toBeFalsy()
      expect(addressPathUtils.isAbsolute(addr.parsePath('filename'))).toBeFalsy()
      expect(addressPathUtils.isAbsolute(addr.parsePath('filename'))).toBeFalsy()
      expect(addressPathUtils.isAbsolute(addr.parsePath('./relative'))).toBeFalsy()
    })
    it('overlap', () => {
      const srcAddress = addr.parseAsType('/tmp', 'portablePathPosixAbsolute') as AddressPathAbsolute

      expect(addressPathUtils.overlap(srcAddress, addr.parseAsType('/tmp', 'portablePathPosixAbsolute'))).toEqual(true)
      expect(addressPathUtils.overlap(srcAddress, addr.parseAsType('/tmp/', 'portablePathPosixAbsolute'))).toEqual(true)
      expect(addressPathUtils.overlap(srcAddress, addr.parseAsType('/tmp/somewhere', 'portablePathPosixAbsolute'))).toEqual(true)

      expect(addressPathUtils.overlap(srcAddress, addr.parseAsType('/tmp-not-matching/somewhere', 'portablePathPosixAbsolute'))).toEqual(false)
      expect(addressPathUtils.overlap(addr.parseAsType('/tmp-not-matching/somewhere', 'portablePathPosixAbsolute'), srcAddress)).toEqual(false)
    })
    it('dirname', () => {

      const testMap: [AddressDescriptor<AddressTypeByGroup<"path">>, Pick<AddressDescriptor<AddressTypeByGroup<"path">>, 'original' | 'originalNormalized' | 'address' | 'addressNormalized' | 'type'>, AddressDescriptor<AddressTypeByGroup<"path">>['parts']][] = [
        [addr.parsePath('/tmp/subdir'), {original: '/tmp', originalNormalized: '/tmp', address: '/tmp' as PortablePath, addressNormalized: '/tmp' as PortablePath, type: 'portablePathPosixAbsolute'}, {suffix: undefined}],
        [addr.parsePath('/tmp2'), {original: '/', originalNormalized: '/', address: '/' as PortablePath, addressNormalized: '/' as PortablePath, type: 'portablePathPosixAbsolute'}, {suffix: undefined}],
        [addr.parsePath('./tmp2'), {original: '.', originalNormalized: '.', address: '.' as PortablePath, addressNormalized: '.' as PortablePath, type: 'portablePathFilename'}, {suffix: undefined}],
        [addr.parsePath('../tmp2'), {original: '..', originalNormalized: '..', address: '..' as PortablePath, addressNormalized: '..' as PortablePath, type: 'portablePathFilename'}, {suffix: undefined}],
        [addr.parsePath('tmp2'), {original: '.', originalNormalized: '.', address: '.' as PortablePath, addressNormalized: '.' as PortablePath, type: 'portablePathFilename'}, {suffix: undefined}],
      ]

      for (const [anAddr, expectations, parts] of testMap) {
        const ret = addressPathUtils.dirname(anAddr)
        expect(ret).toEqual(
          {
            ...expectations,
            group: 'path',
            parts,
          }
        )
      }
    })
    it('basename', () => {
      const ret = addressPathUtils.basename(addr.parsePath('/tmp/mnt'))
      expect(ret).toEqual(
        {
          original: 'mnt',
          originalNormalized: 'mnt',
          address: 'mnt',
          addressNormalized: 'mnt',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )

      expect(addressPathUtils.basename(addr.parsePath('./relative'))).toEqual(
        {
          original: 'relative',
          originalNormalized: 'relative',
          address: 'relative',
          addressNormalized: 'relative',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )
      expect(addressPathUtils.basename(addr.parsePath('filename'))).toEqual(
        {
          original: 'filename',
          originalNormalized: 'filename',
          address: 'filename',
          addressNormalized: 'filename',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )
      expect(addressPathUtils.basename(addressPathUtils.dot)).toEqual(
        {
          original: '.',
          originalNormalized: '.',
          address: '.',
          addressNormalized: '.',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )
    })
    it('extname', () => {
      expect(addressPathUtils.extname(addr.parsePath('/tmp/mnt.ts'))).toEqual(
        {
          original: '.ts',
          originalNormalized: '.ts',
          address: '.ts',
          addressNormalized: '.ts',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )
      expect(addressPathUtils.extname(addr.parsePath('./relative/mnt.ts'))).toEqual(
        {
          original: '.ts',
          originalNormalized: '.ts',
          address: '.ts',
          addressNormalized: '.ts',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )
      expect(addressPathUtils.extname(addr.parsePath('mnt.ts'))).toEqual(
        {
          original: '.ts',
          originalNormalized: '.ts',
          address: '.ts',
          addressNormalized: '.ts',
          group: 'path',
          type: 'portablePathFilename',
          parts: {},
        }
      )
      expect(() => addressPathUtils.extname(addressPathUtils.dot)).toThrowError(/AddressPath: extname\(\) called on extensionless path.*/)
      expect(() => addressPathUtils.extname(addr.parsePath('something'))).toThrowError(/AddressPath: extname\(\) called on extensionless path.*/)
    })
  })
  describe('integrity checks', () => {
    it('throws errors with non-path like descriptors', () => {
      const urlDesc = addr.parseUrl('http://www.bbc.com')

      // @ts-expect-error:
      expect(() => addressPathUtils.isAbsolute(urlDesc)).toThrowError(/AddressPath: non path descriptor supplied .*/)
      // @ts-expect-error:
      expect(() => addressPathUtils.dirname(urlDesc)).toThrowError(/AddressPath: non path descriptor supplied .*/)
      // @ts-expect-error:
      expect(() => addressPathUtils.basename(urlDesc)).toThrowError(/AddressPath: non path descriptor supplied .*/)
      // @ts-expect-error:
      expect(() => addressPathUtils.extname(urlDesc)).toThrowError(/AddressPath: non path descriptor supplied .*/)
    })
  })

})
