// import {assertUnreachable, constants} from '@monotonous/common'
// import type {TierUnion} from '@monotonous/database'
// import {WorktreeEntity, WorktreeEntitySpec} from '@monotonous/database'
import {PortablePath} from '@business-as-code/fslib'
// import {typanionUtils} from '@monotonous/validation'
// import * as t from 'typanion'
import os from 'os'
import path from 'path'
import type {Address, InitialiseOptions} from './address'
import type {
  AddressDescriptor,
  AddressGroupUnion,
  AddressPath,
  AddressPathAbsolute,
  AddressPathRelative,
  AddressType,
} from './__types__'
import type {AddressTypeByGroup} from './__types__/util'
import {addr} from '.'

export type AddressPathUtils = ReturnType<typeof createAddressPath>

export const createAddressPath = (addressIns: Address, parseParams: InitialiseOptions['parseParams']) => {
  // /**
  //  note that the relativeCwd here is from the project root and is as kept within package entities etc
  //  */
  // function projectSubPath(options: {
  //   projectCwd: AddressPathAbsolute
  //   tier: TierUnion
  //   relativeCwd?: PortablePath
  //   worktree?: {relativeCwd: PortablePath}
  //   absolute: true
  // }): AddressPathAbsolute
  // function projectSubPath(options: {
  //   projectCwd: AddressPathAbsolute
  //   tier: TierUnion
  //   relativeCwd?: PortablePath
  //   worktree?: {relativeCwd: PortablePath}
  //   absolute?: boolean
  // }): AddressPathRelative
  // function projectSubPath(options: {
  //   projectCwd: AddressPathAbsolute
  //   tier: TierUnion
  //   relativeCwd?: PortablePath
  //   worktree?: {relativeCwd: PortablePath}
  //   absolute?: boolean
  // }) {
  //   const {projectCwd, tier, relativeCwd: relativeCwdPortable, worktree, absolute = false} = options

  //   // validate
  //   // let relativeCwd: AddressPathRelative
  //   // t.assert(relativeCwd, typanionUtils.isRelativeCwd({tier}))

  //   // let relativeCwd = relativeCwdPortable ? addressIns.parseAsType(relativeCwdPortable, 'portablePathPosixRelative') as AddressPathRelative : addr.pathUtils.dot
  //   // let ret = addressIns.parsePPath(relativeCwd) as AddressPathRelative
  //   // console.log(`ret :>> `, relativeCwd)

  //   let relativeCwd: AddressPathRelative

  //   switch (tier) {
  //     case 'workroot':
  //       if (worktree) {
  //         throw new Error(`AddressPath#projectSubPath(): \`worktree\` only suppliable for a \`workspace\` types`)
  //       }
  //       if (relativeCwdPortable && relativeCwdPortable !== '.') {
  //         throw new Error(
  //           `AddressPath#projectSubPath(): \`relativeCwd\` supplied for a workroot resolve that isn't '.'`
  //         )
  //       }
  //       relativeCwd = addressIns.pathUtils.dot
  //       break
  //     case 'worktree':
  //       if (worktree) {
  //         throw new Error(`AddressPath#projectSubPath(): \`worktree\` only suppliable for a \`workspace\` types`)
  //       }
  //     case 'workspace':
  //       t.assertWithErrors(relativeCwdPortable, typanionUtils.isRelativeCwd({tier}))
  //       relativeCwd = (
  //         worktree
  //           ? addressIns.pathUtils.join(
  //               addressIns.parsePPath(worktree.relativeCwd),
  //               addr.parsePPath(relativeCwdPortable)
  //             )
  //           : addr.parsePPath(relativeCwdPortable)
  //       ) as AddressPathRelative
  //       break
  //     default:
  //       assertUnreachable(tier)
  //   }

  //   return absolute ? addressIns.pathUtils.join(projectCwd!, relativeCwd) : relativeCwd
  // }

  // function projectSubPath(options: {projectCwd: AddressPathAbsolute, tier: TierUnion, relativeCwd?: string, folderName?: string, worktree?: {relativeCwd: PortablePath}, absolute: true}): AddressPathAbsolute
  // function projectSubPath(options: {projectCwd: AddressPathAbsolute, tier: TierUnion, relativeCwd?: string, folderName?: string, worktree?: {relativeCwd: PortablePath}, absolute?: boolean}): AddressPathRelative
  // function projectSubPath(options: {projectCwd: AddressPathAbsolute, tier: TierUnion, relativeCwd?: string, folderName?: string, worktree?: {relativeCwd: PortablePath}, absolute?: boolean}) {

  //   const {
  //     projectCwd,
  //     tier,
  //     folderName,
  //     relativeCwd,
  //     worktree,
  //     absolute = false,
  //   } = options

  //   let ret: AddressPathRelative
  //   switch (tier) {
  //     case 'workspace':
  //       ret = worktree
  //         ? (ret = addressIns.pathUtils.join(...[
  //             addressIns.parsePPath(worktree.relativeCwd),
  //             addressIns.parseAsType(constants.PROJECT_PATHS_WORKTREE_WORKSPACES, 'portablePathFilename'),
  //             ...(folderName ? [addressIns.parseAsType(folderName, 'portablePathFilename')] : [])
  //         ]) as AddressPathRelative)
  //         : addressIns.pathUtils.join(...[addressIns.parseAsType(constants.PROJECT_PATHS_WORKSPACES, 'portablePathFilename'), ...(folderName ? [addressIns.parseAsType(folderName, 'portablePathFilename')] : [])]) as AddressPathRelative
  //       break
  //     case 'worktree':
  //       if (worktree) {
  //         throw new Error(`AddressPath#projectSubPath(): \`worktree\` only supplyable for a \`workspace\` types`)
  //       }
  //       ret = addressIns.pathUtils.join(...[addressIns.parseAsType(constants.PROJECT_PATHS_WORKTREE, 'portablePathFilename'), ...(folderName? [addressIns.parseAsType(folderName, 'portablePathFilename')] : [])]) as AddressPathRelative
  //       break
  //     case 'workroot':
  //       if (worktree) {
  //         throw new Error(`AddressPath#projectSubPath(): \`worktree\` only supplyable for a \`workspace\` types`)
  //       }
  //       if (folderName){
  //         throw new Error(`AddressPath#projectSubPath(): \`folderName\` supplied for a workroot resolve`)
  //       }
  //       ret = addressIns.pathUtils.dot
  //       break
  //   }
  //   return absolute ? addressIns.pathUtils.join(projectCwd!, ret) : ret
  // }

  return {
    root: {
      original: '/',
      originalNormalized: '/',
      address: '/',
      addressNormalized: '/',
      group: 'path',
      type: 'portablePathPosixAbsolute',
      parts: {},
    } as AddressDescriptor<'portablePathPosixAbsolute'>,
    dot: {
      original: '.',
      originalNormalized: '.',
      address: '.',
      addressNormalized: '.',
      group: 'path' as AddressGroupUnion,
      type: 'portablePathPosixRelative' as AddressTypeByGroup<'path'>,
      parts: {},
    } as AddressPathRelative,
    get cwd(): AddressPathAbsolute {
      return addressIns.parsePath(process.cwd()) as AddressPathAbsolute
    },
    get tmpFilepath(): AddressPathAbsolute {
      const tmpdir = os.tmpdir()
      const hash = Math.ceil(Math.random() * 0x100000000)
        .toString(16)
        .padStart(8, `0`)

      return addressIns.parsePath(path.join(tmpdir, hash)) as AddressPathAbsolute
    },

    // projectSubPath,

    // posix path methods
    resolve(...pathSegments: AddressPath[]): AddressPathAbsolute {
      return addressIns.parsePath(path.posix.resolve(...pathSegments.map((p) => p.address))) as AddressPathAbsolute
    },
    join(...pathSegments: AddressPath[]): AddressPath {
      const normal = pathSegments.pop()
      let posixJoin = path.posix.join(...pathSegments.map((p) => p.addressNormalized), normal!.address)
      if (posixJoin === '*') posixJoin = './*'
      return addressIns.parsePath(posixJoin)
    },
    relative(options: {
      srcAddress: AddressPathAbsolute
      destAddress: AddressPathAbsolute
      options?: {}
    }): AddressPathRelative {
      const {srcAddress, destAddress, options: parseOptions} = options
      checkGroup(srcAddress, addressIns)
      checkGroup(destAddress, addressIns)
      const relativePath = path.posix.relative(srcAddress.address, destAddress.address)
      return addressIns.parsePath(relativePath, parseOptions) as AddressPathRelative
    },
    isAbsolute(address: AddressPath) {
      checkGroup(address, addressIns)
      return (['portablePathPosixAbsolute', 'portablePathWindowsAbsolute'] as (keyof AddressType)[]).includes(
        address.type
      )
    },
    dirname<Addr extends AddressPath>(address: Addr): Addr {
      checkGroup(address, addressIns)
      // if (!this.isAbsolute(address)) {
      //   throw new Error(`AddressPath: dirname() called on non-absolute path '${addressIns.format(address)}' (parsed as type '${address.type}')`)
      // }
      return addressIns.parsePath(path.posix.dirname(address.addressNormalized)) as Addr
    },
    basename(address: AddressPath): AddressDescriptor<'portablePathFilename'> {
      checkGroup(address, addressIns)
      return addressIns.parseAsType(path.posix.basename(address.address), 'portablePathFilename')
    },
    overlap(srcAddress: AddressPath, destAddress: AddressPath): boolean {
      checkGroup(srcAddress, addressIns)
      checkGroup(destAddress, addressIns)

      // otherwise /tmp matches /tmp-another-dir
      const suffixedSrcAddress = `${srcAddress.address}/`.replace(/\/+$/, `/`)
      const suffixedDestAddress = `${destAddress.address}/`.replace(/\/+$/, `/`)

      const res = !!suffixedDestAddress.match(new RegExp(`^${suffixedSrcAddress}`))
      return res
    },
    extname(address: AddressPath) {
      checkGroup(address, addressIns)
      const ext = path.posix.extname(address.address)
      if (ext === '') {
        throw new Error(`AddressPath: extname() called on extensionless path '${addressIns.format(address)}'`)
      }
      return addressIns.parsePath(ext)
    },
  }
}

const checkGroup = (address: AddressDescriptor, addressIns: Address) => {
  if (address.group !== 'path')
    throw new Error(`AddressPath: non path descriptor supplied '${addressIns.format(address)}'`)
}

// export const ppath: PathUtils<PortablePath> = Object.create(path.posix) as any
